import express from "express";
import crypto from "crypto";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

/**
 * PKCE helpers
 */
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

// Simple in-memory store (OK for demo)
let pkceStore = {};
let tokenStore = {};

/**
 * STEP 1: Redirect user to Salesforce login
 */
app.get("/auth/salesforce/login", (req, res) => {
  const verifier = base64URLEncode(crypto.randomBytes(32));
  const challenge = base64URLEncode(sha256(Buffer.from(verifier)));

  pkceStore.verifier = verifier;

  const authUrl =
    `${process.env.SF_LOGIN_URL}/services/oauth2/authorize` +
    `?response_type=code` +
    `&client_id=${process.env.SF_CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(process.env.SF_CALLBACK)}` +
    `&scope=api refresh_token offline_access` +
    `&code_challenge=${challenge}` +
    `&code_challenge_method=S256`;

  res.redirect(authUrl);
});

/**
 * STEP 2: Salesforce redirects back here
 */
app.get("/auth/salesforce/callback", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send("Missing authorization code");

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
          code_verifier: pkceStore.verifier
        })
      }
    );

    const tokens = await response.json();

    if (!tokens.access_token) {
      console.error(tokens);
      return res.status(500).json(tokens);
    }

    // Store tokens (demo only)
    tokenStore.user = tokens;

    // Redirect back to frontend
    res.redirect(
      `${process.env.FRONTEND_URL}/salesforce-connected`
    );

  } catch (err) {
    console.error(err);
    res.status(500).send("OAuth failed");
  }
});

/**
 * STEP 3: Test endpoint (verify connection)
 */
app.get("/api/sf/test", async (req, res) => {
  if (!tokenStore.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  res.json({
    success: true,
    instance_url: tokenStore.user.instance_url,
    access_token_present: true
  });
});

/**
 * Health check
 */
app.get("/", (req, res) => {
  res.send("Spiked Backend running (External Client App PKCE)");
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});

