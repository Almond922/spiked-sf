import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from '../AuthContext';

interface Opportunity {
  Id: string;
  Name: string;
  StageName?: string;
  Amount?: number;
  CloseDate?: string;
}

interface Task {
  Id: string;
  Subject: string;
  Status: string;
  ActivityDate?: string;
}

const BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://recall-backend-production-409019309412.us-central1.run.app";

export default function SalesforceDashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { session } = useAuth();

  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [opps, setOpps] = useState<Opportunity[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [expandedOpp, setExpandedOpp] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch deals from integrations endpoint
  const fetchOpps = async () => {
    try {
      const res = await fetch(`${BASE_URL}/integrations/salesforce/deals`);
      if (!res.ok) throw new Error('Failed to fetch opportunities');
      const data = await res.json();
      setOpps(data.deals || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch opportunities');
    }
  };

  /* ---------------- CHECK CONNECTION ---------------- */
  useEffect(() => {
    const oauthError = searchParams.get('error');
    if (oauthError) {
      const desc = searchParams.get('error_description') || '';
      if (oauthError === 'OAUTH_APP_ACCESS_DENIED') {
        setError('Connection failed: your Salesforce admin must approve this Connected App or allow self-authorization.');
      } else {
        setError(`OAuth failed: ${oauthError}${desc ? ' — ' + decodeURIComponent(desc) : ''}`);
      }
      setLoading(false);
      return;
    }

    const check = async () => {
      try {
        const res = await fetch(`${BASE_URL}/integrations/salesforce/connection`);
        if (!res.ok) throw new Error('Not connected');
        const data = await res.json();
        setConnected(data.connected === true);
        if (data.connected) {
          await fetchOpps();
        }
      } catch (err) {
        setConnected(false);
      } finally {
        setLoading(false);
      }
    };

    check();
  }, [searchParams]);

  // If OAuth callback landed with ?connected=true, re-check connection and fetch deals
  useEffect(() => {
    if (searchParams.get('connected') === 'true') {
      (async () => {
        setLoading(true);
        try {
          const res = await fetch(`${BASE_URL}/integrations/salesforce/connection`);
          if (res.ok) {
            const data = await res.json();
            if (data.connected) {
              setConnected(true);
              await fetchOpps();
            }
          }
        } catch (err) {
          console.error('Error checking connection after OAuth', err);
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [searchParams]);

  /* ---------------- LOAD TASKS ---------------- */
  const loadTasks = async (oppId: string) => {
    if (expandedOpp === oppId) {
      setExpandedOpp(null);
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/integrations/salesforce/deals/${oppId}/tasks`);
      if (!res.ok) throw new Error('Failed to fetch tasks');
      const data = await res.json();
      setTasks(data.tasks || []);
      setExpandedOpp(oppId);
    } catch (err: any) {
      setError(err.message);
    }
  };

  /* ---------------- OAUTH CONNECT ---------------- */
  const connectSalesforce = async () => {
    try {
      const res = await fetch(`${BASE_URL}/integrations/salesforce/auth/initiate`, {
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });
      if (res.ok) {
        const data = await res.json();      try {
        const parsed = new URL(data.auth_url);
        const host = parsed.hostname.toLowerCase();
        if (!/salesforce\.com$/.test(host) && !host.includes('salesforce.com')) {
          console.error('Rejecting non-salesforce auth_url', host, data.auth_url);
          setError('Salesforce backend misconfigured (SF_LOGIN_URL). Please contact your admin.');
          return;
        }
      } catch (err) {
        console.error('Invalid auth_url returned from server', err, data);
        setError('Invalid auth URL returned by backend');
        return;
      }
        window.location.href = data.auth_url;
        return;
      }

      // If initiate isn't available, fallback to redirect endpoint
      console.warn('Initiate endpoint failed, falling back to redirect');
      window.location.href = `${BASE_URL}/auth/salesforce/login`;
    } catch (err: any) {
      console.error('Error initiating Salesforce OAuth', err);
      // final fallback: redirect
      window.location.href = `${BASE_URL}/auth/salesforce/login`;
    }
  };

  /* ---------------- UI STATES ---------------- */
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0f1a] text-gray-400">
        Loading Salesforce…
      </div>
    );

  if (!connected)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0f1a]">
        <div className="bg-[#11162a] border border-white/10 rounded-xl p-8 text-center w-[360px]">
          <img
            src="https://cdn.worldvectorlogo.com/logos/salesforce-2.svg"
            className="w-16 mx-auto mb-6"
          />
          <h2 className="text-2xl font-bold text-white mb-3">
            Connect Salesforce
          </h2>
          <p className="text-gray-400 mb-6">
            Sync opportunities and tasks from Salesforce
          </p>

          {error && (
            <div className="bg-red-500/10 text-red-400 p-3 rounded mb-4 text-sm text-left">
              <div>{error}</div>
              {error.includes('admin must approve') && (
                <div className="mt-2 text-xs text-gray-300">
                  Ask your Salesforce admin to either set the Connected App's <strong>Permitted Users</strong> to "All users may self-authorize" or pre-authorize this app for your Profile/Permission Set.
                  See the integration docs in the repo for exact steps.
                </div>
              )}
            </div>
          )}

          <button
            onClick={connectSalesforce}
            className="w-full py-3 rounded-lg bg-orange-600 hover:bg-orange-700 transition text-white font-semibold"
          >
            Connect Now
          </button>

          <button
            onClick={() => navigate("/integrations")}
            className="mt-4 text-gray-400 hover:text-white text-sm"
          >
            ← Back
          </button>
        </div>
      </div>
    );

  /* ---------------- MAIN DASHBOARD ---------------- */
  return (
    <div className="min-h-screen bg-[#0b0f1a] text-white p-8">
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold">Salesforce Opportunities</h1>
        <button
          onClick={() => navigate("/integrations")}
          className="px-4 py-2 bg-[#11162a] rounded border border-white/10 hover:bg-[#1a1f38]"
        >
          ← Back
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 text-red-400 p-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {opps.map((opp) => (
            <motion.div
              key={opp.Id}
              layout
              className="bg-[#11162a] border border-white/10 rounded-xl p-5 cursor-pointer"
              onClick={() => loadTasks(opp.Id)}
            >
              <h2 className="text-xl font-semibold">{opp.Name}</h2>
              <p className="text-sm text-gray-400">
                Stage: {opp.StageName || "N/A"}
              </p>
              <p className="text-green-400 font-bold">
                ${opp.Amount?.toLocaleString() || "0"}
              </p>
              <p className="text-gray-500 text-sm">
                Close: {opp.CloseDate || "N/A"}
              </p>

              <AnimatePresence>
                {expandedOpp === opp.Id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 border-t border-white/10 pt-3"
                  >
                    {tasks.length ? (
                      tasks.map((t) => (
                        <div
                          key={t.Id}
                          className="bg-[#0b1024] p-2 rounded mb-2"
                        >
                          <p className="font-medium">{t.Subject}</p>
                          <p className="text-xs text-gray-400">
                            {t.Status} • {t.ActivityDate || ""}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-400 text-sm">
                        No tasks found
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
