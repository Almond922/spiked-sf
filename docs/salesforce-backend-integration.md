Salesforce backend integration (copy to your backend)

Goal: Implement server-side OAuth + CRM wrappers so the frontend (this repo) can call the same endpoints as HubSpot:
- GET /integrations/salesforce/auth/initiate  -> returns { auth_url }
- GET /auth/salesforce/login                  -> redirects to Salesforce (compat)
- GET /auth/salesforce/callback               -> OAuth callback; exchanges code for tokens; redirects back to frontend dashboard
- GET /integrations/salesforce/connection     -> { connected: true|false }
- GET /integrations/salesforce/deals          -> { deals: [...] }
- GET /integrations/salesforce/deals/:id/tasks -> { tasks: [...] }
- POST /integrations/salesforce/deals/:id/tasks -> create a Task on the Opportunity. Accepts { subject, activityDateTime } and returns the created task.

Notes:
- Keep all client secrets and token exchanges on the server side (do NOT put them in the browser).
- Set env variables: SF_CLIENT_ID, SF_CLIENT_SECRET, SF_CALLBACK, SF_LOGIN_URL (https://login.salesforce.com or test.salesforce.com), FRONTEND_URL (e.g., https://app.example.com or http://localhost:5173)

Example server implementation (Express):

```js
import express from "express";
import crypto from "crypto";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

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

const pkceStore = new Map();
let tokenStore = null; // For dev only — persist in DB for prod

app.get('/integrations/salesforce/auth/initiate', (req, res) => {
  if (!process.env.SF_CLIENT_ID || !process.env.SF_CALLBACK) {
    return res.status(500).json({ error: 'Salesforce not configured' });
  }

  const pkceVerifier = base64URLEncode(crypto.randomBytes(32));
  const challenge = base64URLEncode(sha256(pkceVerifier));
  const state = crypto.randomBytes(16).toString('hex');

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

  res.json({ auth_url: authUrl });
});

app.get('/auth/salesforce/login', (req, res) => {
  // Backwards-compatible endpoint (optional)
  const pkceVerifier = base64URLEncode(crypto.randomBytes(32));
  const challenge = base64URLEncode(sha256(pkceVerifier));
  const state = crypto.randomBytes(16).toString('hex');
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

app.get('/auth/salesforce/callback', async (req, res) => {
  const { code, state, error } = req.query;
  // IMPORTANT: redirect OAuth errors back to the frontend so the UI can show friendly guidance
  if (error) {
    const redirectUrl = `${process.env.FRONTEND_URL.replace(/\/$/, '')}/integrations/salesforce?connected=false&error=${encodeURIComponent(error)}&error_description=${encodeURIComponent(req.query.error_description || '')}&state=${encodeURIComponent(state || '')}`;
    return res.redirect(redirectUrl);
  }

  if (!code || !state) return res.status(400).send('Missing code/state');

  const verifier = pkceStore.get(state);
  pkceStore.delete(state);
  if (!verifier) return res.status(400).send('Invalid state');

  const response = await fetch(`${process.env.SF_LOGIN_URL}/services/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: process.env.SF_CLIENT_ID,
      client_secret: process.env.SF_CLIENT_SECRET,
      redirect_uri: process.env.SF_CALLBACK,
      code,
      code_verifier: verifier
    })
  });

  const tokens = await response.json();
  if (!tokens.access_token) return res.status(500).json(tokens);

  tokenStore = tokens; // persist for production

  // Redirect back to frontend salesforce dashboard
  const redirectUrl = `${process.env.FRONTEND_URL.replace(/\/$/, '')}/salesforce?connected=true`;
  return res.redirect(redirectUrl);
});

app.get('/integrations/salesforce/connection', (req, res) => {
  res.json({ connected: !!tokenStore });
});

app.get('/integrations/salesforce/deals', async (req, res) => {
  if (!tokenStore) return res.status(401).json({ error: 'Not authenticated' });
  const q = `SELECT Id, Name, StageName, Amount, CloseDate FROM Opportunity ORDER BY CloseDate DESC LIMIT 50`;
  const r = await fetch(`${tokenStore.instance_url}/services/data/v59.0/query?q=${encodeURIComponent(q)}`, {
    headers: { Authorization: `Bearer ${tokenStore.access_token}` }
  });
  const data = await r.json();
  res.json({ deals: data.records || [] });
});

app.get('/integrations/salesforce/deals/:dealId/tasks', async (req, res) => {
  if (!tokenStore) return res.status(401).json({ error: 'Not authenticated' });
  const { dealId } = req.params;
  const q = `SELECT Id, Subject, Status, ActivityDate FROM Task WHERE WhatId = '${dealId}' ORDER BY ActivityDate DESC LIMIT 100`;
  const r = await fetch(`${tokenStore.instance_url}/services/data/v59.0/query?q=${encodeURIComponent(q)}`, {
    headers: { Authorization: `Bearer ${tokenStore.access_token}` }
  });
  const data = await r.json();
  res.json({ tasks: data.records || [] });
});

app.listen(process.env.PORT || 4000, () => console.log('Salesforce integration running'));
```

Deployment notes:
- Add these endpoints to your existing production backend instead of keeping a standalone folder in the frontend repo.
- Update the frontend `VITE_API_URL` to point to the backend host (e.g., https://recall-backend.example.com) so the frontend calls the production endpoints.
- Ensure the connected app callback matches `SF_CALLBACK` and your backend's SF env vars are in a secure store.

If you'd like, I can prepare a small PR/patch that contains only the docs/snippet and removes the local `server/` folder so the repo matches your desired structure.