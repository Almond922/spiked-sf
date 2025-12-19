import express from "express";
import crypto from "crypto";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

/* ================= PKCE HELPERS ================= */

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

/* ================= TEMP STORAGE ================= */
/* (OK for dev; use DB/session in prod) */

let pkceVerifier = null;
let tokenStore = null;

/* ================= ROUTES ================= */

/**
 * STEP 1: Start Salesforce OAuth
 * OPEN THIS IN BROWSER
 */
app.get("/auth/salesforce/login", (req, res) => {
  pkceVerifier = base64URLEncode(crypto.randomBytes(32));
  const challenge = base64URLEncode(sha256(pkceVerifier));

  const authUrl =
    `${process.env.SF_LOGIN_URL}/services/oauth2/authorize` +
    `?response_type=code` +
    `&client_id=${process.env.SF_CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(process.env.SF_CALLBACK)}` +
    `&scope=openid api refresh_token` +
    `&code_challenge=${challenge}` +
    `&code_challenge_method=S256`;

  res.redirect(authUrl);
});

/**
 * STEP 2: Salesforce redirects here
 */
app.get("/auth/salesforce/callback", async (req, res) => {
  const code = req.query.code;

  if (!code) {
    console.error("OAuth error:", req.query);
    return res.status(400).send("Missing authorization code");
  }

  try {
    const response = await fetch(
      `${process.env.SF_LOGIN_URL}/services/oauth2/token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          client_id: process.env.SF_CLIENT_ID,
          client_secret: process.env.SF_CLIENT_SECRET, // 🔑 REQUIRED (Option A)
          redirect_uri: process.env.SF_CALLBACK,
          code,
          code_verifier: pkceVerifier
        })
      }
    );

    const tokens = await response.json();

    if (!tokens.access_token) {
      console.error("Token error:", tokens);
      return res.status(500).json(tokens);
    }

    tokenStore = tokens;

    // Redirect back to frontend
    res.redirect(`${process.env.FRONTEND_URL}/salesforce-connected`);

  } catch (err) {
    console.error("OAuth failed:", err);
    res.status(500).send("OAuth failed");
  }
});

/**
 * STEP 3: Test endpoint
 */
app.get("/api/sf/test", (req, res) => {
  if (!tokenStore) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  res.json({
    success: true,
    instance_url: tokenStore.instance_url,
    has_access_token: true
  });
});

/**
 * Health check
 */
app.get("/", (req, res) => {
  res.send("Spiked Backend running (Salesforce Option A OAuth)");
});

/* ================= SERVER ================= */

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});





