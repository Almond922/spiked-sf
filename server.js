import express from "express";
import crypto from "crypto";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

/* ================= HELPERS ================= */

function base64URLEncode(buffer) {
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

function sha256(buffer) {
  return crypto.createHash("sha256").update(buffer).digest();
}

/* ================= IN-MEMORY STORE (DEV ONLY) ================= */

const pkceStore = new Map();
let tokenStore = null;

/* ================= AUTH ROUTES ================= */

/**
 * STEP 1: Start Salesforce OAuth
 */
app.get("/auth/salesforce/login", (req, res) => {
  const pkceVerifier = base64URLEncode(crypto.randomBytes(32));
  const challenge = base64URLEncode(sha256(pkceVerifier));
  const state = crypto.randomBytes(16).toString("hex");

  pkceStore.set(state, pkceVerifier);

  const authUrl =
    `${process.env.SF_LOGIN_URL}/services/oauth2/authorize` +
    `?response_type=code` +
    `&client_id=${process.env.SF_CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(process.env.SF_CALLBACK)}` +
    `&scope=openid api refresh_token` +
    `&code_challenge=${challenge}` +
    `&code_challenge_method=S256` +
    `&state=${state}`;

  res.redirect(authUrl);
});

/**
 * STEP 2: OAuth Callback
 */
app.get("/auth/salesforce/callback", async (req, res) => {
  const { code, state, error } = req.query;

  if (error) return res.status(400).json(req.query);
  if (!code || !state) return res.status(400).send("Missing code/state");

  const verifier = pkceStore.get(state);
  pkceStore.delete(state);

  if (!verifier) return res.status(400).send("Invalid state");

  try {
    const response = await fetch(
      `${process.env.SF_LOGIN_URL}/services/oauth2/token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          client_id: process.env.SF_CLIENT_ID,
          client_secret: process.env.SF_CLIENT_SECRET,
          redirect_uri: process.env.SF_CALLBACK,
          code,
          code_verifier: verifier
        })
      }
    );

    const tokens = await response.json();
    if (!tokens.access_token) return res.status(500).json(tokens);

    tokenStore = tokens;

    res.redirect(process.env.FRONTEND_URL);
  } catch (err) {
    console.error(err);
    res.status(500).send("OAuth failed");
  }
});

/* ================= CORE CHECK ================= */

app.get("/api/sf/test", (req, res) => {
  if (!tokenStore) return res.status(401).json({ error: "Not authenticated" });
  res.json({ success: true, instance_url: tokenStore.instance_url });
});

/* ================= IDENTITY ================= */

app.get("/api/sf/whoami", async (req, res) => {
  if (!tokenStore) return res.status(401).json({ error: "Not authenticated" });

  const r = await fetch(tokenStore.id, {
    headers: { Authorization: `Bearer ${tokenStore.access_token}` }
  });

  res.json(await r.json());
});

/* ================= CRM DATA ================= */

/**
 * ACCOUNTS
 */
app.get("/api/sf/accounts", async (req, res) => {
  if (!tokenStore) return res.status(401).json({ error: "Not authenticated" });

  const q = `
    SELECT Id, Name, Industry, Type
    FROM Account
    ORDER BY CreatedDate DESC
    LIMIT 10
  `;

  const r = await fetch(
    `${tokenStore.instance_url}/services/data/v59.0/query?q=${encodeURIComponent(q)}`,
    { headers: { Authorization: `Bearer ${tokenStore.access_token}` } }
  );

  res.json(await r.json());
});

/**
 * LEADS
 */
app.get("/api/sf/leads", async (req, res) => {
  if (!tokenStore) return res.status(401).json({ error: "Not authenticated" });

  const q = `
    SELECT Id, Name, Company, Status
    FROM Lead
    ORDER BY CreatedDate DESC
    LIMIT 10
  `;

  const r = await fetch(
    `${tokenStore.instance_url}/services/data/v59.0/query?q=${encodeURIComponent(q)}`,
    { headers: { Authorization: `Bearer ${tokenStore.access_token}` } }
  );

  res.json(await r.json());
});

/**
 * OPPORTUNITIES (DEALS)
 */
app.get("/api/sf/opportunities", async (req, res) => {
  if (!tokenStore) return res.status(401).json({ error: "Not authenticated" });

  const q = `
    SELECT Id, Name, StageName, Amount, CloseDate
    FROM Opportunity
    ORDER BY CloseDate DESC
    LIMIT 10
  `;

  const r = await fetch(
    `${tokenStore.instance_url}/services/data/v59.0/query?q=${encodeURIComponent(q)}`,
    { headers: { Authorization: `Bearer ${tokenStore.access_token}` } }
  );

  res.json(await r.json());
});

/**
 * TASKS
 */
app.get("/api/sf/tasks", async (req, res) => {
  if (!tokenStore) return res.status(401).json({ error: "Not authenticated" });

  const q = `
    SELECT Id, Subject, Status, ActivityDate
    FROM Task
    ORDER BY ActivityDate DESC
    LIMIT 10
  `;

  const r = await fetch(
    `${tokenStore.instance_url}/services/data/v59.0/query?q=${encodeURIComponent(q)}`,
    { headers: { Authorization: `Bearer ${tokenStore.access_token}` } }
  );

  res.json(await r.json());
});

/* ================= HEALTH ================= */

app.get("/", (req, res) => {
  res.send("Spiked Backend running (Salesforce OAuth + CRM)");
});

/* ================= SERVER ================= */

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});






