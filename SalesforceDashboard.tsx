import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  RefreshCw,
  ChevronDown,
  Plus,
  CheckCircle
} from "lucide-react";
import { motion } from "framer-motion";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useTheme } from "../ThemeContext";

/* ---------------- TYPES ---------------- */
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
  AssignedTo?: string;
  Priority?: string;
}

const BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:4000";

const SalesforceDashboard = () => {
  const [searchParams] = useSearchParams();
  const { isDarkMode } = useTheme();

  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  const [opps, setOpps] = useState<Opportunity[]>([]);

  /* ---------------- TASK STATE ---------------- */
  const [tasksByDeal, setTasksByDeal] = useState<Record<string, Task[]>>({});
  const [expandedDeal, setExpandedDeal] = useState<string | null>(null);

  /* ---------------- DEAL TRACKING ---------------- */
  const [selectedDealIds, setSelectedDealIds] = useState<string[]>([]);
  const [trackingDeals, setTrackingDeals] = useState(false);

  /* ---------------- ADD TASK MODAL ---------------- */
  const [showAddTaskFor, setShowAddTaskFor] = useState<string | null>(null);
  const [taskSubject, setTaskSubject] = useState("");
  const [taskDate, setTaskDate] = useState<Date | null>(new Date());
  const [creatingTask, setCreatingTask] = useState(false);

  /* ---------------- FETCH ---------------- */
  const fetchOpps = async () => {
    const res = await fetch(`${BASE_URL}/integrations/salesforce/deals`);
    const data = await res.json();
    setOpps(data.deals || []);
  };

  const checkConnection = async () => {
    try {
      const res = await fetch(
        `${BASE_URL}/integrations/salesforce/connection`
      );
      const data = await res.json();
      setConnected(data.connected);
      if (data.connected) await fetchOpps();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkConnection();
  }, [searchParams]);

  /* ---------------- TASKS (ACCORDION LOGIC) ---------------- */
  const toggleTasks = async (dealId: string) => {
    if (expandedDeal === dealId) {
      setExpandedDeal(null);
      return;
    }

    if (!tasksByDeal[dealId]) {
      const res = await fetch(
        `${BASE_URL}/integrations/salesforce/deals/${dealId}/tasks`
      );
      const data = await res.json();

      setTasksByDeal(prev => ({
        ...prev,
        [dealId]: data.tasks || [],
      }));
    }

    setExpandedDeal(dealId);
  };

  /* ---------------- DEAL SELECTION ---------------- */
  const toggleDealSelection = (dealId: string) => {
    setSelectedDealIds(prev => {
      const newSelected = prev.includes(dealId)
        ? prev.filter(id => id !== dealId)
        : [...prev, dealId];
      // Log updated selection with deal details for easier debugging
      console.log("Salesforce selected deals changed:", newSelected.map(id => {
        const deal = opps.find(o => o.Id === id);
        return { id, name: deal?.Name, stage: deal?.StageName, amount: deal?.Amount };
      }));
      return newSelected;
    });
  };

  const trackSelectedDeals = async () => {
    try {
      setTrackingDeals(true);

      const dealsToLog = selectedDealIds.map(id => {
        const d = opps.find(o => o.Id === id);
        return { id, name: d?.Name, stage: d?.StageName, amount: d?.Amount };
      });
      console.log("Tracking Salesforce deals:", dealsToLog);

      const response = await fetch(`${BASE_URL}/integrations/salesforce/deals/select`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deal_ids: selectedDealIds })
      });

      // Log backend response for visibility and only proceed on success
      try {
        const respData = await response.json();
        console.log("Track selected deals response:", respData);
      } catch (err) {
        console.warn("Could not parse tracking response:", err);
      }

      if (response.ok) {
        alert(`✓ ${selectedDealIds.length} deals selected for tracking`);
        // Notify other components (e.g., SpikedAI) to refresh tracked deals immediately
        try {
          window.dispatchEvent(new Event('salesforceTrackedDealsUpdated'));
        } catch (err) {
          console.warn('Could not dispatch salesforceTrackedDealsUpdated event', err);
        }
        // Refresh dashboard list so tracked flag updates in UI
        try {
          await fetchOpps();
        } catch (err) {
          console.warn('Failed to refresh opportunities after tracking:', err);
        }
        setSelectedDealIds([]);
      } else {
        alert('Failed to select deals for tracking');
      }
    } finally {
      setTrackingDeals(false);
    }
  };

  const clearDealSelection = () => {
    setSelectedDealIds([]);
  };

  /* ---------------- CREATE TASK ---------------- */
  const createTask = async () => {
    if (!showAddTaskFor || !taskSubject) return;

    try {
      setCreatingTask(true);

      const res = await fetch(
        `${BASE_URL}/integrations/salesforce/deals/${showAddTaskFor}/tasks`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subject: taskSubject,
            activityDateTime: taskDate?.toISOString()
          }),
        }
      );

      const data = await res.json();

      setTasksByDeal(prev => ({
        ...prev,
        [showAddTaskFor]: [
          {
            Id: data.id || Math.random().toString(),
            Subject: taskSubject,
            Status: "Not Started",
            ActivityDate: taskDate?.toISOString().split("T")[0],
            AssignedTo: "You",
            Priority: "Normal"
          },
          ...(prev[showAddTaskFor] || [])
        ]
      }));

      setTaskSubject("");
      setTaskDate(new Date());
      setShowAddTaskFor(null);
    } finally {
      setCreatingTask(false);
    }
  };

  /* ---------------- UI STATES ---------------- */
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900 text-gray-400">
        Loading Salesforce…
      </div>
    );
  }

  if (!connected) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <button
          onClick={() =>
            (window.location.href = `${BASE_URL}/auth/salesforce/login`)
          }
          className="px-6 py-3 bg-blue-500 text-white rounded-lg"
        >
          Connect Salesforce
        </button>
      </div>
    );
  }

  /* ---------------- DASHBOARD ---------------- */
  return (
    <div className={`min-h-screen ${isDarkMode ? "bg-slate-900" : "bg-gray-50"} pb-8`}>
      {/* Top Bar */}
      <div className={`sticky top-0 z-10 backdrop-blur-sm border-b ${
        isDarkMode ? "bg-slate-900/95 border-slate-800" : "bg-white/95 border-gray-200"
      }`}>
        <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              Salesforce Opportunities
            </h1>
            <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
              {opps.length} opportunities
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchOpps}
              className={`p-2 rounded-lg ${
                isDarkMode
                  ? "bg-slate-800 text-white hover:bg-slate-700"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {selectedDealIds.length > 0 && (
              <>
                <button
                  onClick={trackSelectedDeals}
                  disabled={trackingDeals}
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  {trackingDeals ? "Saving..." : `Track ${selectedDealIds.length}`}
                </button>

                <button
                  onClick={clearDealSelection}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg"
                >
                  Clear
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Opportunity Cards */}
      <div className="max-w-7xl mx-auto px-8 mt-6 
                      grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 
                      gap-5 items-start">
        {opps.map((opp) => {
          const tasks = tasksByDeal[opp.Id] || [];
          const isSelected = selectedDealIds.includes(opp.Id);

          return (
            <motion.div
              key={opp.Id}
              onClick={() => toggleDealSelection(opp.Id)}
              className={`relative p-5 rounded-xl border cursor-pointer transition-all ${
                isSelected
                  ? "border-blue-500 ring-2 ring-blue-500/40"
                  : isDarkMode
                  ? "border-slate-700 bg-slate-800"
                  : "border-gray-200 bg-white"
              }`}
            >
              {isSelected && (
                <div className="absolute top-3 right-3">
                  <CheckCircle className="w-6 h-6 text-blue-500 drop-shadow-lg" />
                </div>
              )}

              <h3 className={`font-semibold text-lg ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                {opp.Name}
              </h3>

              <p className="text-sm text-gray-400">Stage: {opp.StageName}</p>
              <p className="text-emerald-400 font-bold text-lg">
                ${opp.Amount?.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">Close: {opp.CloseDate}</p>

              <div className="flex justify-between items-center mt-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleTasks(opp.Id);
                  }}
                  className="flex items-center gap-1 text-sm text-blue-400"
                >
                  Tasks <ChevronDown className="w-4 h-4" />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAddTaskFor(opp.Id);
                  }}
                  className="flex items-center gap-1 text-sm text-green-400 hover:text-green-300"
                >
                  <Plus className="w-4 h-4" />
                  Add Task
                </button>
              </div>

              {expandedDeal === opp.Id && (
                <div className="mt-3 pt-3 border-t border-white/10">
                  {tasks.length ? (
                    tasks.map((t) => (
                      <div key={t.Id} className="bg-black/30 rounded-md px-3 py-2 mb-2">
                        <p className="text-sm font-medium text-white">{t.Subject}</p>
                        <p className="text-xs text-gray-400">
                          {t.Status} • {t.ActivityDate}
                        </p>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>👤 {t.AssignedTo}</span>
                          <span>⚡ {t.Priority}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-500">No tasks</p>
                  )}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* ADD TASK MODAL */}
      {showAddTaskFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-slate-900 rounded-xl p-6 w-[420px]">
            <h3 className="text-lg font-semibold text-white mb-4">Add Task</h3>

            <input
              className="w-full mb-3 p-2 rounded bg-black/30 text-white"
              placeholder="Task subject"
              value={taskSubject}
              onChange={(e) => setTaskSubject(e.target.value)}
            />

            <DatePicker
              selected={taskDate}
              onChange={(d: Date | null) => setTaskDate(d)}
              showTimeSelect
              dateFormat="dd MMM yyyy h:mm aa"
              className="w-full p-2 rounded bg-black/30 text-white"
            />

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowAddTaskFor(null)}
                className="px-4 py-2 bg-gray-700 text-white rounded"
              >
                Cancel
              </button>
              <button
                onClick={createTask}
                disabled={creatingTask}
                className="px-4 py-2 bg-orange-600 text-white rounded"
              >
                {creatingTask ? "Adding…" : "Add Task"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesforceDashboard;







