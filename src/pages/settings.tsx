import React, { useState, useEffect, useMemo } from "react";
import {
  ArrowLeft,
  Save,
  Users,
  MessageSquare,
  Bot,
  FileText,
  RotateCcw,
  Info,
  Loader2,
  CheckCircle,
  X,
  Tag,
  Target,
  PlusCircle,
  Edit,
} from "lucide-react";
import { useAuth } from "../AuthContext";
import HelpChatWidget from "./HelpChatWidget";
import { useTheme } from "../ThemeContext"; 

const API_BASE_URL =
  "https://spikedai-production-application-409019309412.us-central1.run.app";

// Main settings model, goals are now handled separately
interface SettingsModel {
  botName: string;
  selectedPersona: string;
  selectedAnswerStyles: string[];
  customPrompt: string;
  meetingDomains: string[];
}

interface CustomerPersona {
  id: string;
  name: string;
  description: string;
  prompt: string;
}

interface AnswerStyle {
  id: string;
  name: string;
  description: string;
  prompt: string;
}

interface MeetingGoal {
  id: string;
  goal_description: string;
  emoji_icon: string | null;
  evaluation_criteria: string;
}

const Toast: React.FC<{
  message: string;
  type: "success" | "error";
  onDismiss: () => void;
}> = ({ message, type, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const isSuccess = type === "success";
  const bgColor = isSuccess ? "bg-green-600" : "bg-red-600";
  const Icon = isSuccess ? CheckCircle : X;

  return (
    <div
      className={`fixed top-6 right-6 z-50 flex items-center p-4 rounded-lg text-white shadow-lg animate-fade-in-down ${bgColor}`}
    >
      <Icon className="w-5 h-5 mr-3" />
      <span>{message}</span>
    </div>
  );
};

// Modal Component for Adding/Editing Goals
const GoalModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (goal: MeetingGoal) => void;
  goal: MeetingGoal | null;
  isDarkMode: boolean;
}> = ({ isOpen, onClose, onSave, goal, isDarkMode }) => {
  const [description, setDescription] = useState("");
  const [criteria, setCriteria] = useState("");
  const [emoji, setEmoji] = useState("🎯");

  useEffect(() => {
    if (goal) {
      setDescription(goal.goal_description);
      setCriteria(goal.evaluation_criteria);
      setEmoji(goal.emoji_icon || "🎯");
    } else {
      setDescription("");
      setCriteria("");
      setEmoji("🎯");
    }
  }, [goal]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (description.trim() && criteria.trim()) {
      onSave({
        id: goal?.id || `temp-${Date.now()}`,
        goal_description: description,
        evaluation_criteria: criteria,
        emoji_icon: emoji,
      });
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
      <div className={`rounded-2xl border shadow-2xl w-full max-w-lg p-8 m-4 animate-fade-in-down ${isDarkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-200 text-gray-900"}`}>
        <h2 className="text-2xl font-bold mb-6">{goal ? "Edit Goal" : "Add New Goal"}</h2>
        <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1.5">Emoji</label>
              <input type="text" value={emoji} onChange={(e) => setEmoji(e.target.value)} maxLength={2}
                className={`w-20 text-center px-3 py-2 border rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 text-xl ${ isDarkMode ? "bg-gray-700 border-gray-600 focus:ring-blue-800" : "bg-gray-50 border-gray-300 focus:ring-blue-200"}`} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Goal Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
                placeholder="e.g., Secure a follow-up meeting with the CTO"
                className={`w-full px-3 py-2 border rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 resize-none ${ isDarkMode ? "bg-gray-700 border-gray-600 focus:ring-blue-800" : "bg-gray-50 border-gray-300 focus:ring-blue-200"}`} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Evaluation Criteria</label>
              <textarea value={criteria} onChange={(e) => setCriteria(e.target.value)} rows={3}
                placeholder="e.g., A calendar invitation is sent and accepted."
                className={`w-full px-3 py-2 border rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 resize-none ${ isDarkMode ? "bg-gray-700 border-gray-600 focus:ring-blue-800" : "bg-gray-50 border-gray-300 focus:ring-blue-200"}`} />
            </div>
        </div>
        <div className="flex justify-end gap-4 mt-8">
            <button onClick={onClose} className={`px-5 py-2.5 rounded-lg font-medium transition-colors ${ isDarkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-200 hover:bg-gray-300"}`}>
                Cancel
            </button>
            <button onClick={handleSave} disabled={!description.trim() || !criteria.trim()}
              className="px-6 py-2.5 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors">
                Save Goal
            </button>
        </div>
      </div>
    </div>
  );
};

const SpikedAISettings: React.FC = () => {
  const { session } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  
  const [selectedPersona, setSelectedPersona] = useState<string>("balanced");
  const [customPrompt, setCustomPrompt] = useState("");
  const [selectedAnswerStyles, setSelectedAnswerStyles] = useState<string[]>([]);
  const [botName, setBotName] = useState("SpikedAI");
  const [meetingDomains, setMeetingDomains] = useState<string[]>([]);
  const [meetingGoals, setMeetingGoals] = useState<MeetingGoal[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<MeetingGoal | null>(null);
  const [initialSettings, setInitialSettings] = useState<SettingsModel | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "loading" | "saved">("idle");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
  };

  const api = useMemo(() => {
    const getHeaders = () => {
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }
      return headers;
    };

    return {
      fetchSettings: async (): Promise<SettingsModel> => {
        const response = await fetch(`${API_BASE_URL}/settings`, {
          headers: getHeaders(),
        });
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
      },
      saveSettings: async (settings: SettingsModel) => {
        const response = await fetch(`${API_BASE_URL}/settings`, {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify(settings),
        });
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
      },
      // New dedicated functions for Meeting Goals
      fetchMeetingGoals: async (): Promise<MeetingGoal[]> => {
        const response = await fetch(`${API_BASE_URL}/meetingGoals`, {
          headers: getHeaders(),
        });
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
      },
      addMeetingGoal: async (goal: Omit<MeetingGoal, 'id'>): Promise<MeetingGoal> => {
        const response = await fetch(`${API_BASE_URL}/meetingGoals`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(goal),
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
      },
      updateMeetingGoal: async (goal: MeetingGoal): Promise<MeetingGoal> => {
        const response = await fetch(`${API_BASE_URL}/meetingGoals/${goal.id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(goal),
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
      },
      deleteMeetingGoal: async (goalId: string): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/meetingGoals/${goalId}`, {
            method: 'DELETE',
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      }
    };
  }, [session]);

  useEffect(() => {
    const fetchInitialSettings = async () => {
      if (!session) return;
      try {
        const data = await api.fetchSettings();
        setBotName(data.botName || "SpikedAI");
        setSelectedPersona(data.selectedPersona || "balanced");
        setSelectedAnswerStyles(data.selectedAnswerStyles || []);
        setCustomPrompt(data.customPrompt || "");
        setMeetingDomains(data.meetingDomains || []);
        setInitialSettings(data);
      } catch (error) {
        console.error("Failed to fetch settings:", error);
        showToast("Could not load saved settings", "error");
      }
    };

    const fetchInitialGoals = async () => {
        if (!session) return;
        try {
            const goals = await api.fetchMeetingGoals();
            setMeetingGoals(goals || []);
        } catch (error) {
            console.error("Failed to fetch meeting goals:", error);
            showToast("Could not load meeting goals", "error");
        }
    }

    fetchInitialSettings();
    fetchInitialGoals();
  }, [session, api]);

  useEffect(() => {
    if (!initialSettings) return;
    const currentSettings: SettingsModel = {
      botName,
      selectedPersona,
      selectedAnswerStyles,
      customPrompt,
      meetingDomains,
    };
    const hasChanged =
      JSON.stringify(currentSettings) !== JSON.stringify(initialSettings);
    setIsDirty(hasChanged);
  }, [
    botName,
    selectedPersona,
    selectedAnswerStyles,
    customPrompt,
    meetingDomains,
    initialSettings,
  ]);

  const customerPersonas: CustomerPersona[] = [
    { id: "balanced", name: "Balanced (Default)", description: "Versatile profile for general business users in B2B settings", prompt: "" },
    { id: "technical", name: "Technical", description: "Deep technical, jargon-friendly (CTO, VP Engineering, Tech Lead, Solution Architect)", prompt: "You are speaking to a technical decision maker — such as a CTO, VP Engineering, Tech Lead, or Solution Architect. Use deep technical language and industry-specific terminology where appropriate. Focus on topics like backend architecture, API/SDK availability, developer documentation, scalability, latency benchmarks, data residency, encryption standards, CI/CD compatibility, and how the solution fits into their existing stack. Provide detailed, technically sound answers, and be prepared to back claims with architecture diagrams or benchmarks." },
    { id: "finance", name: "Financial", description: "ROI-driven, cost-benefit analysis (CFO, Financial Controller, Budget Owner)", prompt: "You are speaking to a finance executive — such as a CFO, Controller, or Procurement Lead. Your tone should be ROI-driven, concise, and focused on financial impact. Emphasize cost-efficiency, pricing model clarity, return on investment (ROI), total cost of ownership (TCO), and how the investment aligns with budget cycles. Support claims with financial data, comparisons, or break-even analysis. Avoid fluff — every point should speak to value and resource optimization." },
    { id: "executive", name: "Business Executives", description: "Layman, operational clarity, Strategic, high-level impact (CEO, Managing Director, Founder, Business Head)", prompt: "You are speaking to a senior business executive — such as a CEO, Founder, or Managing Director. Use a strategic, visionary tone. Focus on long-term business impact, market differentiation, competitive positioning, growth enablement, and leadership alignment. Emphasize how the solution supports strategic goals, future scalability, and innovation. Speak in terms of outcomes, high-level KPIs, and category leadership. Avoid deep technical or operational detail unless asked." },
  ];

  const answerStyles: AnswerStyle[] = useMemo(() => [
      { id: "concise", name: "Concise Answer", description: "Give a short, high-level answer suitable for quick consumption or alerts", prompt: "Provide a quick summary or one-sentence insight. Avoid depth. Designed for immediate clarity without elaboration."},
      { id: "in_depth", name: "In-Depth Response", description: "Comprehensive, structured answer with examples, comparisons, and rich detail", prompt: "Offer a full breakdown of the topic. Include contextual background, examples, benefits, challenges, and comparisons. Prioritize clarity, completeness, and readability."},
      { id: "points_format", name: "Answer in Points", description: "Structure responses as bullet points", prompt: "Structure all responses as clear, concise bullet points. Use numbered lists or bullet points to organize information. Make each point actionable and easy to scan. Avoid long paragraphs and break down complex information into digestible points."},
      { id: "with_analogy", name: "Use Analogy", description: "Use real-world analogies or metaphors to explain technical concepts", prompt: "Explain the topic using a familiar metaphor or analogy. Ensure the analogy simplifies the concept without distorting the meaning. Clarify both the analogy and its real-world mapping."},
      { id: "technical_terms", name: "Define Technical Terms", description: "Include brief, clear definitions of key technical concepts used in the answer", prompt: "Where relevant, define technical terms in plain language. Format as 'Term: Definition'. Keep explanations short and understandable."},
      { id: "sales_points", name: "Sales Points", description: "Present benefits as persuasive selling points", prompt: "Highlight key advantages of the product/service in a way that resonates with buyer pain points. Focus on ROI, usability, efficiency, and ease of integration."},
      { id: "key_statistics", name: "Key Statistics", description: "Include impactful, quantitative data points", prompt: "Insert 3-7 high-impact stats or KPIs that reinforce the argument. Format cleanly. Prioritize relevance and credibility."},
      { id: "case_study", name: "Case Study Summary", description: "Use a real or hypothetical success story to illustrate impact", prompt: "Summarize a real-world scenario using SPSR: Situation, Problem, Solution, Result. Keep each section concise but informative."},
      { id: "competitive_comparison", name: "Competitive Comparison", description: "Provide a side-by-side comparison of your solution and others", prompt: "Use a table or bullets to compare your solution with alternatives across multiple criteria (features, integration, pricing, support, etc.). Highlight clear advantages."},
      { id: "customer_queries", name: "Anticipated Customer Questions", description: "Predict what the customer might ask next", prompt: "List common follow-up questions a customer or stakeholder might ask. Use these to guide future responses or FAQs."},
      { id: "information_gap", name: "Information Gap", description: "Call out missing or unclear information the user should consider", prompt: "Identify what is *not* yet known or shared and what further information could enhance the analysis or decision-making."},
      { id: "pricing_summary", name: "Pricing Overview", description: "Offer an overview of pricing models, tiers, or TCO", prompt: "Summarize the pricing structure, customization options, and overall value proposition. Highlight flexibility or TCO advantages where relevant."},
    ], []);

  const updateCustomPrompt = (personaId: string, styleIds: string[]) => {
    const personaPrompt = customerPersonas.find((p) => p.id === personaId)?.prompt || "";
    const stylePrompts = styleIds.map((id) => answerStyles.find((s) => s.id === id)?.prompt).filter(Boolean).join("\n\n");
    setCustomPrompt([personaPrompt, stylePrompts].filter(Boolean).join("\n\n").trim());
  };

  const handlePersonaSelect = (personaId: string) => {
    setSelectedPersona(personaId);
    updateCustomPrompt(personaId, selectedAnswerStyles);
  };

  // --- CHANGED FUNCTION START ---
  const handleAnswerStyleToggle = (styleId: string) => {
    // Define pairs that cannot coexist
    const conflicts: Record<string, string> = {
      concise: "in_depth",
      in_depth: "concise",
    };

    let newStyles: string[];

    if (selectedAnswerStyles.includes(styleId)) {
      // If already selected, just remove it (toggle off)
      newStyles = selectedAnswerStyles.filter((id) => id !== styleId);
    } else {
      // If selecting a new style:
      // 1. Identify if this style has a conflict (e.g. concise vs in_depth)
      const conflictingStyle = conflicts[styleId];
      
      // 2. Filter out the conflicting style if it exists in the current list
      const stylesWithoutConflict = selectedAnswerStyles.filter(
        (id) => id !== conflictingStyle
      );
      
      // 3. Add the new style
      newStyles = [...stylesWithoutConflict, styleId];
    }

    setSelectedAnswerStyles(newStyles);
    updateCustomPrompt(selectedPersona, newStyles);
  };
  // --- CHANGED FUNCTION END ---

  const handleSave = async () => {
    if (!isDirty) return;
    setSaveState("loading");
    const settingsToSave: SettingsModel = {
      botName,
      selectedPersona,
      selectedAnswerStyles,
      customPrompt,
      meetingDomains,
    };
    try {
      await api.saveSettings(settingsToSave);
      setInitialSettings(settingsToSave);
      setSaveState("saved");
      showToast("Settings saved successfully!");
      setTimeout(() => setSaveState("idle"), 2000);
    } catch (error) {
      console.error("Failed to save settings:", error);
      showToast("Error saving settings", "error");
      setSaveState("idle");
    }
  };

  const handleReset = () => {
    if (initialSettings) {
      setBotName(initialSettings.botName || "SpikedAI");
      setSelectedPersona(initialSettings.selectedPersona || "balanced");
      setSelectedAnswerStyles(initialSettings.selectedAnswerStyles || []);
      setCustomPrompt(initialSettings.customPrompt || "");
      setMeetingDomains(initialSettings.meetingDomains || []);
      showToast("Changes have been reset");
    }
  };

  const handleBack = () => {
    window.location.href = "/";
  };

  const handleSaveGoal = async (goalToSave: MeetingGoal) => {
    const isEditing = !!editingGoal;
    try {
      if (isEditing) {
        const updatedGoal = await api.updateMeetingGoal(goalToSave);
        setMeetingGoals(goals => goals.map(g => (g.id === updatedGoal.id ? updatedGoal : g)));
        showToast("Goal updated successfully!");
      } else {
        const { id, ...newGoalPayload } = goalToSave;
        const addedGoal = await api.addMeetingGoal(newGoalPayload);
        setMeetingGoals(goals => [...goals, addedGoal]);
        showToast("Goal added successfully!");
      }
    } catch (error) {
      console.error("Failed to save goal:", error);
      showToast(`Error: Could not ${isEditing ? 'update' : 'add'} goal`, "error");
    } finally {
      setIsModalOpen(false);
      setEditingGoal(null);
    }
  };
  
  const removeMeetingGoal = async (goalId: string) => {
    try {
      await api.deleteMeetingGoal(goalId);
      setMeetingGoals(goals => goals.filter((goal) => goal.id !== goalId));
      showToast("Goal removed successfully.");
    } catch (error) {
      console.error("Failed to delete goal:", error);
      showToast("Error: Could not remove goal", "error");
    }
  };
  
  const handleOpenAddModal = () => {
    setEditingGoal(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (goal: MeetingGoal) => {
    setEditingGoal(goal);
    setIsModalOpen(true);
  };

  const renderSaveButtonContent = () => {
    switch (saveState) {
      case "loading": return (<><Loader2 className="w-4 h-4 animate-spin" /><span>Saving...</span></>);
      case "saved": return (<><CheckCircle className="w-4 h-4" /><span>Saved!</span></>);
      default: return (<><Save className="w-4 h-4" /><span>Save Changes</span></>);
    }
  };

  const MeetingDomainInput = () => {
    const [inputValue, setInputValue] = useState("");
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const allSuggestions = useMemo(() => ["SaaS Pricing Models", "Cloud Security", "AWS Services", "Enterprise Software", "B2B Marketing", "Financial Projections", "Technical Due Diligence", "API Integration", "Supply Chain Logistics"], []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setInputValue(value);
      if (value) {
        const filtered = allSuggestions.filter((suggestion) => suggestion.toLowerCase().includes(value.toLowerCase()) && !meetingDomains.includes(suggestion));
        setSuggestions(filtered);
      } else {
        setSuggestions([]);
      }
    };

    const addDomain = (domain: string) => {
      const trimmedDomain = domain.trim();
      if (trimmedDomain && !meetingDomains.includes(trimmedDomain)) {
        setMeetingDomains([...meetingDomains, trimmedDomain]);
      }
      setInputValue("");
      setSuggestions([]);
    };

    const removeDomain = (domainToRemove: string) => {
      setMeetingDomains(meetingDomains.filter((domain) => domain !== domainToRemove));
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        addDomain(inputValue);
      }
    };

    return (
      <div className="relative">
        <div className={`flex flex-wrap gap-2 rounded-xl p-2 min-h-[48px] border focus-within:border-blue-500 focus-within:ring-2 transition-all duration-200 ${isDarkMode ? "bg-gray-700 border-gray-600 focus-within:ring-blue-800" : "bg-gray-50 border-gray-300 focus-within:ring-blue-200"}`}>
          {meetingDomains.map((domain, index) => (
            <div key={index} className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm font-medium ${isDarkMode ? "bg-gray-600 text-gray-100" : "bg-gray-200 text-gray-800"}`}>
              {domain}
              <button onClick={() => removeDomain(domain)} className={`p-0.5 rounded-full ${isDarkMode ? "hover:bg-gray-500" : "hover:bg-gray-300"}`}><X className="w-3.5 h-3.5" /></button>
            </div>
          ))}
          <input type="text" value={inputValue} onChange={handleInputChange} onKeyDown={handleKeyDown} className="flex-grow bg-transparent p-1 focus:outline-none min-w-[120px]" placeholder="Add a domain..." />
        </div>
        {suggestions.length > 0 && (
          <div className={`absolute z-10 w-full mt-2 rounded-lg shadow-lg border overflow-hidden ${isDarkMode ? "bg-gray-800 border-gray-600" : "bg-white border-gray-200"}`}>
            <ul className="max-h-40 overflow-y-auto">
              {suggestions.map((suggestion, index) => (<li key={index} onClick={() => addDomain(suggestion)} className={`px-4 py-2 cursor-pointer text-sm ${isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}>{suggestion}</li>))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}>
      <HelpChatWidget />
      {toast && (<Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />)}
      
      <GoalModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveGoal}
        goal={editingGoal}
        isDarkMode={isDarkMode}
      />

      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center space-x-5">
            <button onClick={handleBack} className={`p-2.5 rounded-xl transition-all duration-200 ${isDarkMode ? "hover:bg-gray-800 text-gray-400 hover:text-white" : "hover:bg-gray-200 text-gray-600 hover:text-gray-900"}`}>
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Personalisation</h1>
              <p className={`text-sm mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Configure your AI sales copilot</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={handleReset} disabled={!isDirty} className={`px-5 py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed ${isDarkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-200 hover:bg-gray-300"}`}>
              <RotateCcw className="w-4 h-4" />
            </button>
            <button onClick={handleSave} disabled={!isDirty || saveState !== "idle"} className={`w-40 text-center bg-gradient-to-r text-white px-5 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none ${saveState === "saved" ? "from-green-500 to-green-600" : "from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"}`}>
              {renderSaveButtonContent()}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section className={`rounded-2xl p-8 shadow-sm border transition-colors duration-200 ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
              <div className="flex items-center space-x-4 mb-6">
                <div className={`p-2 rounded-lg ${isDarkMode ? "bg-blue-900/20" : "bg-blue-100"}`}><Bot className={`w-5 h-5 ${isDarkMode ? "text-blue-400" : "text-blue-600"}`} /></div>
                <h2 className="text-xl font-semibold">Bot Configuration</h2>
              </div>
              <input type="text" value={botName} onChange={(e) => setBotName(e.target.value)} className={`w-full max-w-md px-4 py-3 border rounded-xl focus:border-blue-500 focus:outline-none focus:ring-2 transition-all duration-200 ${isDarkMode ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-800" : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-200"}`} placeholder="Enter bot name" />
            </section>
            
            <section className={`rounded-2xl p-8 shadow-sm border transition-colors duration-200 ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
              <div className="flex items-center space-x-4 mb-8">
                <div className={`p-2 rounded-lg ${isDarkMode ? "bg-purple-900/20" : "bg-purple-100"}`}><Users className={`w-5 h-5 ${isDarkMode ? "text-purple-400" : "text-purple-600"}`} /></div>
                <div>
                  <h2 className="text-xl font-semibold">Customer Persona</h2>
                  <p className={`text-sm mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Choose one persona to affect the AI's tone, depth, and focus.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {customerPersonas.map((persona) => (
                  <button key={persona.id} onClick={() => handlePersonaSelect(persona.id)} className={`p-5 rounded-xl border-2 text-left transition-all duration-200 hover:scale-[1.02] ${selectedPersona === persona.id ? (isDarkMode ? "border-purple-500 bg-purple-900/20 shadow-md" : "border-purple-500 bg-purple-50 shadow-md") : (isDarkMode ? "border-gray-600 hover:border-gray-500 hover:bg-gray-700" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50")}`}>
                    <h3 className={`font-semibold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>{persona.name}</h3>
                    <p className={`text-sm leading-relaxed ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>{persona.description}</p>
                  </button>
                ))}
              </div>
            </section>

            <section className={`rounded-2xl p-8 shadow-sm border transition-colors duration-200 ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
              <div className="flex items-center space-x-4 mb-8">
                <div className={`p-2 rounded-lg ${isDarkMode ? "bg-green-900/20" : "bg-green-100"}`}><MessageSquare className={`w-5 h-5 ${isDarkMode ? "text-green-400" : "text-green-600"}`} /></div>
                <div>
                  <h2 className="text-xl font-semibold">Answer Styles</h2>
                  <p className={`text-sm mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Select multiple styles to customize responses.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {answerStyles.map((style) => (
                  <button key={style.id} onClick={() => handleAnswerStyleToggle(style.id)} className={`p-4 rounded-lg border-2 text-left transition-all duration-200 hover:scale-[1.02] ${selectedAnswerStyles.includes(style.id) ? (isDarkMode ? "border-green-500 bg-green-900/20 shadow-md" : "border-green-500 bg-green-50 shadow-md") : (isDarkMode ? "border-gray-600 hover:border-gray-500 hover:bg-gray-700" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50")}`}>
                    <h3 className={`font-semibold text-sm mb-1.5 ${isDarkMode ? "text-white" : "text-gray-900"}`}>{style.name}</h3>
                    <p className={`text-xs leading-relaxed ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>{style.description}</p>
                    {selectedAnswerStyles.includes(style.id) && (<div className="mt-2 flex items-center justify-end"><div className="w-2 h-2 bg-green-500 rounded-full"></div></div>)}
                  </button>
                ))}
              </div>
            </section>
            
            <section className={`rounded-2xl p-8 shadow-sm border transition-colors duration-200 ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-lg ${isDarkMode ? "bg-red-900/20" : "bg-red-100"}`}><Target className={`w-5 h-5 ${isDarkMode ? "text-red-400" : "text-red-600"}`} /></div>
                  <div>
                    <h2 className="text-xl font-semibold">Custom Goals</h2>
                    <p className={`text-sm mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Define key objectives for your meetings to track success.</p>
                  </div>
                </div>
                <button onClick={handleOpenAddModal} className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${isDarkMode ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-blue-500 text-white hover:bg-blue-600"}`}>
                    <PlusCircle className="w-4 h-4" />
                    Add New Goal
                </button>
              </div>
              <div className="space-y-3">
                {meetingGoals.length > 0 ? (
                  meetingGoals.map((goal) => (
                    <div key={goal.id} className={`group p-4 rounded-lg border transition-all duration-200 ${isDarkMode ? "bg-gray-700/50 border-gray-600 hover:border-gray-500" : "bg-gray-50 border-gray-200 hover:border-gray-300"}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <span className="text-2xl mt-1">{goal.emoji_icon}</span>
                          <div>
                            <p className="font-semibold leading-snug">{goal.goal_description}</p>
                            <div className="mt-2">
                              <p className="text-xs font-semibold mb-1 uppercase tracking-wider text-gray-500 dark:text-gray-400">Evaluation Criteria</p>
                              <p className="text-sm text-gray-600 dark:text-gray-300">{goal.evaluation_criteria}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleOpenEditModal(goal)} className={`p-1.5 rounded-full ${isDarkMode ? "hover:bg-gray-600" : "hover:bg-gray-200"}`} title="Edit goal"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => removeMeetingGoal(goal.id)} className={`p-1.5 rounded-full ${isDarkMode ? "hover:bg-gray-600" : "hover:bg-gray-200"}`} title="Remove goal"><X className="w-4 h-4" /></button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={`text-center py-10 px-6 rounded-lg border-2 border-dashed ${isDarkMode ? "border-gray-700" : "border-gray-300"}`}>
                    <Target className="mx-auto w-10 h-10 text-gray-400 dark:text-gray-500" />
                    <h3 className="mt-4 text-lg font-semibold">No goals defined yet</h3>
                    <p className={`mt-1 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Click "Add New Goal" to get started.</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          <div className="lg:col-span-1 space-y-10">
            <section className={`rounded-2xl p-8 shadow-sm border transition-colors duration-200 ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-lg ${isDarkMode ? "bg-orange-900/20" : "bg-orange-100"}`}><FileText className={`w-6 h-6 ${isDarkMode ? "text-orange-400" : "text-orange-600"}`} /></div>
                  <div>
                    <h2 className="text-2xl font-semibold">System Prompt</h2>
                    <p className={`text-sm mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Customize your AI Copilot</p>
                  </div>
                </div>
                <div className="relative group">
                  <Info className="w-5 h-5 text-gray-500" />
                  <div className={`absolute bottom-full right-0 mb-2 w-64 p-3 rounded-lg text-sm text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none ${isDarkMode ? "bg-gray-700" : "bg-gray-800"}`}>
                    The system prompt is auto-generated, but you can edit it directly.
                  </div>
                </div>
              </div>
              <div className="relative">
                <textarea value={customPrompt} onChange={(e) => setCustomPrompt(e.target.value)} rows={12} className={`w-full px-4 py-4 border rounded-xl focus:border-blue-500 focus:outline-none focus:ring-2 transition-all duration-200 resize-none text-sm leading-relaxed ${isDarkMode ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-800" : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-200"}`} placeholder="Select a persona or style..." />
              </div>
            </section>

            <section className={`rounded-2xl p-8 shadow-sm border transition-colors duration-200 ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-lg ${isDarkMode ? "bg-indigo-900/20" : "bg-indigo-100"}`}><Tag className={`w-6 h-6 ${isDarkMode ? "text-indigo-400" : "text-indigo-600"}`} /></div>
                  <div>
                    <h2 className="text-2xl font-semibold">Meeting Focus</h2>
                    <p className={`text-sm mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Add topics to focus the AI</p>
                    <p className={`text-xs mt-1 ${isDarkMode ? "text-red-400" : "text-red-600"}`}>Note: Only focuses set before the meeting will be used.</p>
                  </div>
                </div>
                <div className="relative group">
                  <Info className="w-5 h-5 text-gray-500" />
                  <div className={`absolute bottom-full right-0 mb-2 w-64 p-3 rounded-lg text-sm text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none ${isDarkMode ? "bg-gray-700" : "bg-gray-800"}`}>
                    Specify meeting topics like 'AWS' or 'SaaS Pricing' to improve question detection accuracy.
                  </div>
                </div>
              </div>
              <MeetingDomainInput />
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpikedAISettings;