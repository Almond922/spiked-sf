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
app.get("/integrations/salesforce/auth/initiate", (req, res) => {
  const pkceVerifier = base64URLEncode(crypto.randomBytes(32));
  const challenge = base64URLEncode(sha256(pkceVerifier));
  const state = crypto.randomBytes(16).toString("hex");

  pkceStore.set(state, pkceVerifier);

  let authUrl =
    `${process.env.SF_LOGIN_URL}/services/oauth2/authorize` +
    `?response_type=code` +
    `&client_id=${process.env.SF_CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(process.env.SF_CALLBACK)}` +
    `&scope=openid api refresh_token` +
    `&code_challenge=${challenge}` +
    `&code_challenge_method=S256` +
    `&state=${state}`;

  // Optionally force login/consent via SF_PROMPT env var (e.g., 'login' or 'consent')
  if (process.env.SF_PROMPT) {
    authUrl += `&prompt=${encodeURIComponent(process.env.SF_PROMPT)}`;
  }

  // Validate the generated auth URL so misconfigured envs don't redirect users back to our app
  try {
    const parsed = new URL(authUrl);
    const hostname = parsed.hostname.toLowerCase();
    if (!hostname.includes('salesforce.com')) {
      console.error('Invalid Salesforce auth URL host', hostname, authUrl);
      return res.status(500).json({ error: 'misconfigured_salesforce_host', message: `SF_LOGIN_URL resolves to ${hostname}. Expected login.salesforce.com or test.salesforce.com` });
    }
  } catch (err) {
    console.error('Failed to parse authUrl', authUrl, err);
    return res.status(500).json({ error: 'invalid_auth_url', message: 'Failed to build Salesforce auth URL' });
  }

  console.log("Initiate requested, returning auth_url", authUrl);
  res.json({ auth_url: authUrl });
});

app.get("/auth/salesforce/login", (req, res) => {
  const pkceVerifier = base64URLEncode(crypto.randomBytes(32));
  const challenge = base64URLEncode(sha256(pkceVerifier));
  const state = crypto.randomBytes(16).toString("hex");

  pkceStore.set(state, pkceVerifier);

  let authUrl =
    `${process.env.SF_LOGIN_URL}/services/oauth2/authorize` +
    `?response_type=code` +
    `&client_id=${process.env.SF_CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(process.env.SF_CALLBACK)}` +
    `&scope=openid api refresh_token` +
    `&code_challenge=${challenge}` +
    `&code_challenge_method=S256` +
    `&state=${state}`;

  // Allow forcing login/consent for testing via SF_PROMPT
  if (process.env.SF_PROMPT) {
    authUrl += `&prompt=${encodeURIComponent(process.env.SF_PROMPT)}`;
  }

  // Validate redirect host before redirecting
  try {
    const parsed = new URL(authUrl);
    const hostname = parsed.hostname.toLowerCase();
    if (!hostname.includes('salesforce.com')) {
      console.error('Invalid Salesforce redirect host', hostname, authUrl);
      return res.status(500).send('Salesforce login misconfigured on server.');
    }
  } catch (err) {
    console.error('Failed to build Salesforce redirect URL', err);
    return res.status(500).send('Failed to build Salesforce redirect URL');
  }

  res.redirect(authUrl);
});

app.get("/auth/salesforce/callback", async (req, res) => {
  const { code, state, error } = req.query;
  console.log('Salesforce callback received:', req.query); // debug log to inspect code/state/error

  if (error) {
    console.error("OAuth error", req.query);
    // Redirect back to frontend with the error details so the UI can show a helpful message
    const redirectUrl =
      `${process.env.FRONTEND_URL.replace(/\/$/, '')}/integrations/salesforce?connected=false` +
      `&error=${encodeURIComponent(error)}` +
      `&error_description=${encodeURIComponent(req.query.error_description || '')}` +
      `&state=${encodeURIComponent(state || '')}`;
    return res.redirect(redirectUrl);
  }

  if (!code || !state) return res.status(400).send("Missing code/state");

  const verifier = pkceStore.get(state);
  pkceStore.delete(state);

  if (!verifier) return res.status(400).send("Invalid state");

  try {
    const response = await fetch(`${process.env.SF_LOGIN_URL}/services/oauth2/token`, {
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
    });

    const tokens = await response.json();
    if (!tokens.access_token) {
      console.error("Token exchange failed", tokens);
      return res.status(500).json(tokens);
    }

    tokenStore = tokens;

    // Redirect to frontend salesforce dashboard with connected flag
    const redirectUrl = `${process.env.FRONTEND_URL.replace(/\/$/, '')}/integrations/salesforce?connected=true`;
    console.log('OAuth successful — redirecting to', redirectUrl);
    res.redirect(redirectUrl);
  } catch (err) {
    console.error("OAuth exchange failed", err);
    res.status(500).send("OAuth failed");
  }
});


/* ================= INTEGRATIONS (FRONTEND COMPAT) ================= */
// Simple in-memory tracking for selected deals/tasks (dev only)
const selectedDeals = new Set();
const selectedTasks = [];

// Check connection status used by the frontend
app.get('/integrations/salesforce/connection', (req, res) => {
  res.json({ connected: !!tokenStore });
});

// Return a list of opportunities (deals) formatted for the frontend
app.get('/integrations/salesforce/deals', async (req, res) => {
  if (!tokenStore) return res.status(200).json({ deals: [] });

  const q = `
    SELECT Id, Name, StageName, Amount, CloseDate
    FROM Opportunity
    ORDER BY CloseDate DESC
    LIMIT 200
  `;

  try {
    const r = await fetch(`${tokenStore.instance_url}/services/data/v59.0/query?q=${encodeURIComponent(q)}`, {
      headers: { Authorization: `Bearer ${tokenStore.access_token}` }
    });
    const data = await r.json();

    // Map Salesforce records to the fields the frontend expects
    const deals = (data.records || []).map((rec) => ({
  Id: rec.Id,
  Name: rec.Name,
  StageName: rec.StageName || null,
  Amount: rec.Amount || 0,
  CloseDate: rec.CloseDate || null
}));


    res.json({ deals });
  } catch (err) {
    console.error('Error fetching Salesforce opportunities', err);
    res.status(500).json({ error: 'failed_to_fetch_deals' });
  }
});

// CREATE TASK FOR OPPORTUNITY (TAGGED TO THIS APP)
app.post('/integrations/salesforce/deals/:dealId/tasks', async (req, res) => {
  if (!tokenStore) {
    return res.status(401).json({ error: 'Not authenticated with Salesforce' });
  }

  const { dealId } = req.params;
  const { subject, activityDateTime } = req.body;

  try {
    const payload = {
      Subject: subject,
      Status: 'Not Started',
      WhatId: dealId,
      ActivityDate: activityDateTime
        ? activityDateTime.split('T')[0]
        : undefined,

      // 🔥 TAG USED FOR FILTERING
      Description: '[RECALL_WEBAPP] Created from Recall WebApp'
    };

    const r = await fetch(
      `${tokenStore.instance_url}/services/data/v59.0/sobjects/Task`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tokenStore.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      }
    );

    const data = await r.json();
    if (!r.ok) return res.status(400).json(data);

    res.json({
  Id: data.id,
  Subject: subject,
  Status: 'Not Started',
  ActivityDate: payload.ActivityDate
});

  } catch (err) {
    console.error('Create task error:', err);
    res.status(500).json({ error: 'failed_to_create_task' });
  }
});


// FETCH TASKS FOR OPPORTUNITY (ONLY THIS APP)
app.get('/integrations/salesforce/deals/:dealId/tasks', async (req, res) => {
  if (!tokenStore) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const { dealId } = req.params;

  try {
    const soql = `
      SELECT Id, Subject, Status, ActivityDate, Description
      FROM Task
      WHERE WhatId = '${dealId}'
      ORDER BY CreatedDate DESC
      LIMIT 20
    `;

    const r = await fetch(
      `${tokenStore.instance_url}/services/data/v59.0/query?q=${encodeURIComponent(soql)}`,
      {
        headers: {
          Authorization: `Bearer ${tokenStore.access_token}`
        }
      }
    );

    const data = await r.json();

    // 🔥 FILTER ONLY RECALL TASKS
    const tasks = (data.records || []).filter(
      t => t.Description && t.Description.includes('[RECALL_WEBAPP]')
    );

   const formattedTasks = tasks.map(t => ({
  Id: t.Id,
  Subject: t.Subject,
  Status: t.Status,
  ActivityDate: t.ActivityDate || null
}));

res.json({ tasks: formattedTasks });

  } catch (err) {
    console.error('Fetch tasks error:', err);
    res.status(500).json({ error: 'failed_to_fetch_tasks' });
  }
});


// Create a task for a Salesforce deal (TAGGED to this app)
app.post('/integrations/salesforce/tasks/create', async (req, res) => {
  if (!tokenStore) return res.status(401).json({ error: 'Not authenticated' });

  const { subject, due_date, deal_id } = req.body;

  try {
    const payload = {
      Subject: subject,
      ActivityDate: due_date,
      Status: "Not Started",
      WhatId: deal_id,

      // 🔥 KEY LINE — THIS IS THE MAGIC
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

    const data = await r.json();
    res.json(data);

  } catch (err) {
    console.error("Error creating Salesforce task", err);
    res.status(500).json({ error: 'failed_to_create_task' });
  }
});


// Mark a list of deals as selected/tracked (dev: stores in-memory)
app.post('/integrations/salesforce/deals/select', (req, res) => {
  const { deal_ids } = req.body || {};
  if (!Array.isArray(deal_ids)) return res.status(400).json({ error: 'invalid_payload' });

  deal_ids.forEach((id) => selectedDeals.add(id));
  res.json({ success: true, tracked: deal_ids.length });
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
app.get("/api/sf/accounts", async (req, res) => {
  if (!tokenStore) return res.status(401).json({ error: "Not authenticated" });

  const q = `
    SELECT Id, Name, Industry, Type
    FROM Account
    ORDER BY CreatedDate DESC
    LIMIT 10
  `;

  const r = await fetch(`${tokenStore.instance_url}/services/data/v59.0/query?q=${encodeURIComponent(q)}`,
    { headers: { Authorization: `Bearer ${tokenStore.access_token}` } }
  );

  res.json(await r.json());
});

app.get("/api/sf/leads", async (req, res) => {
  if (!tokenStore) return res.status(401).json({ error: "Not authenticated" });

  const q = `
    SELECT Id, Name, Company, Status
    FROM Lead
    ORDER BY CreatedDate DESC
    LIMIT 10
  `;

  const r = await fetch(`${tokenStore.instance_url}/services/data/v59.0/query?q=${encodeURIComponent(q)}`,
    { headers: { Authorization: `Bearer ${tokenStore.access_token}` } }
  );

  res.json(await r.json());
});

app.get("/api/sf/opportunities", async (req, res) => {
  if (!tokenStore) return res.status(401).json({ error: "Not authenticated" });

  const q = `
    SELECT Id, Name, StageName, Amount, CloseDate
    FROM Opportunity
    ORDER BY CloseDate DESC
    LIMIT 10
  `;

  const r = await fetch(`${tokenStore.instance_url}/services/data/v59.0/query?q=${encodeURIComponent(q)}`,
    { headers: { Authorization: `Bearer ${tokenStore.access_token}` } }
  );

  res.json(await r.json());
});

app.get("/api/sf/tasks", async (req, res) => {
  if (!tokenStore) return res.status(401).json({ error: "Not authenticated" });

  const q = `
    SELECT Id, Subject, Status, ActivityDate
    FROM Task
    ORDER BY ActivityDate DESC
    LIMIT 10
  `;

  const r = await fetch(`${tokenStore.instance_url}/services/data/v59.0/query?q=${encodeURIComponent(q)}`,
    { headers: { Authorization: `Bearer ${tokenStore.access_token}` } }
  );

  res.json(await r.json());
});

app.get('/', (req, res) => res.send('Spiked Salesforce wrapper running'));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
