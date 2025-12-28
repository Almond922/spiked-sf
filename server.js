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

// demo-only tracked deals
const trackedDeals = new Set();

/* ================= AUTH ================= */
app.get("/integrations/salesforce/auth/initiate", (req, res) => {
  const verifier = base64URLEncode(crypto.randomBytes(32));
  const challenge = base64URLEncode(sha256(verifier));
  const state = crypto.randomBytes(16).toString("hex");

  pkceStore.set(state, verifier);

  const authUrl =
    `${process.env.SF_LOGIN_URL}/services/oauth2/authorize` +
    `?response_type=code` +
    `&client_id=${process.env.SF_CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(process.env.SF_CALLBACK)}` +
    `&scope=openid api refresh_token` +
    `&code_challenge=${challenge}` +
    `&code_challenge_method=S256` +
    `&state=${state}`;

  res.json({ auth_url: authUrl });
});

app.get("/auth/salesforce/login", (req, res) => {
  res.redirect("/integrations/salesforce/auth/initiate");
});

app.get("/auth/salesforce/callback", async (req, res) => {
  const { code, state, error } = req.query;
  if (error) return res.redirect(`${process.env.FRONTEND_URL}/integrations/salesforce?connected=false`);

  const verifier = pkceStore.get(state);
  pkceStore.delete(state);
  if (!verifier) return res.status(400).send("Invalid state");

  const tokenRes = await fetch(
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

  const tokens = await tokenRes.json();
  if (!tokens.access_token) return res.status(500).json(tokens);

  // ✅ EXTRACT USER ID
  const userId = tokens.id.split("/").pop();

  tokenStore = {
    ...tokens,
    user_id: userId
  };

  console.log("✅ Salesforce User ID:", userId);

  res.redirect(`${process.env.FRONTEND_URL}/integrations/salesforce?connected=true`);
});

/* ================= CONNECTION ================= */
app.get("/integrations/salesforce/connection", (req, res) => {
  res.json({ connected: !!tokenStore });
});

/* ================= DEALS ================= */
app.get("/integrations/salesforce/deals", async (req, res) => {
  if (!tokenStore) return res.json({ deals: [] });

  const soql = `
    SELECT Id, Name, StageName, Amount, CloseDate
    FROM Opportunity
    WHERE Name LIKE 'Spiked%'
    ORDER BY CloseDate DESC
    LIMIT 200
  `;

  const r = await fetch(
    `${tokenStore.instance_url}/services/data/v59.0/query?q=${encodeURIComponent(soql)}`,
    { headers: { Authorization: `Bearer ${tokenStore.access_token}` } }
  );

  const data = await r.json();

  res.json({
    deals: (data.records || []).map(o => ({
      Id: o.Id,
      Name: o.Name,
      StageName: o.StageName,
      Amount: o.Amount,
      CloseDate: o.CloseDate,
      tracked: trackedDeals.has(o.Id)
    }))
  });
});

/* ================= TRACK DEALS ================= */
app.post("/integrations/salesforce/deals/select", (req, res) => {
  req.body.deal_ids?.forEach(id => trackedDeals.add(id));
  res.json({ success: true });
});

/* ================= CREATE TASK (FIXED) ================= */
app.post("/integrations/salesforce/deals/:dealId/tasks", async (req, res) => {
  if (!tokenStore) return res.status(401).json({ error: "Not authenticated" });

  const { dealId } = req.params;
  const { subject, activityDateTime, priority = "Normal" } = req.body;

  const payload = {
    Subject: subject,
    Status: "Not Started",
    WhatId: dealId,
    OwnerId: tokenStore.user_id, // ✅ FIX
    Priority: priority,
    ActivityDate: activityDateTime?.split("T")[0],
    Description: "[RECALL_WEBAPP] Created from Recall WebApp"
  };

  const r = await fetch(
    `${tokenStore.instance_url}/services/data/v59.0/sobjects/Task`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokenStore.access_token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    }
  );

  res.json(await r.json());
});

/* ================= FETCH TASKS ================= */
app.get("/integrations/salesforce/deals/:dealId/tasks", async (req, res) => {
  if (!tokenStore) return res.status(401).json({ error: "Not authenticated" });

  const soql = `
    SELECT Id, Subject, Status, ActivityDate, Priority, Owner.Name, Description
    FROM Task
    WHERE WhatId='${req.params.dealId}'
    ORDER BY CreatedDate DESC
    LIMIT 20
  `;

  const r = await fetch(
    `${tokenStore.instance_url}/services/data/v59.0/query?q=${encodeURIComponent(soql)}`,
    { headers: { Authorization: `Bearer ${tokenStore.access_token}` } }
  );

  const data = await r.json();

  res.json({
    tasks: (data.records || []).map(t => ({
      Id: t.Id,
      Subject: t.Subject,
      Status: t.Status,
      ActivityDate: t.ActivityDate,
      Priority: t.Priority,
      AssignedTo: t.Owner?.Name
    }))
  });
});

/* ================= HEALTH ================= */
app.get("/", (_, res) => res.send("Spiked Salesforce wrapper running"));

app.listen(process.env.PORT || 4000, () =>
  console.log("🚀 Server running")
);




