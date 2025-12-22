import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  memo,
  useMemo,
} from "react";
import {
  Search,
  FileText,
  Plus,
  X,
  Globe,
  Settings,
  Database,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Menu,
  Loader,
  Trash2,
  FileSearch,
  ArrowLeft,
  MoreHorizontal,
  CheckCircle,
  AlertCircle,
  Clock,
  Link2,
  BarChart3,
  Wrench,
  RefreshCw,
  ExternalLink,
  Users,
  Bot,
  Tag,
  Target,
  SlidersHorizontal,
  Filter,
  LayoutGrid,
  Info,
  User,
  Shield,
  Zap,
  Briefcase,
  Lightbulb,
  TrendingUp,
  ListChecks,
  Globe2,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import HelpChatWidget from "./HelpChatWidget";
import { useAuth } from "../AuthContext";
import { saveAs } from "file-saver";
import ReactMarkdown from 'react-markdown';

// --- CONFIGURATION ---
const API_BASE_URL =
  "https://spikedai-production-application-409019309412.us-central1.run.app";
const PROFILES_API_BASE_URL = `https://spikedai-old-backend-409019309412.us-central1.run.app/api/profiles`;

// --- TYPESCRIPT INTERFACES ---
type RecrawlSchedule = "NONE" | "DAILY" | "WEEKLY" | "MONTHLY" | "ONCE";
type IngestionStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "SCHEDULED";

interface Source {
  id: string;
  filename: string;
  url: string;
  created_at: string;
  description: string | null;
  spaces: string[] | null;
  status: IngestionStatus;
  recrawl_schedule: RecrawlSchedule;
}

interface Chunk {
  id: string;
  source_id: string;
  content: string;
  created_at: string;
}

interface SettingsModel {
  botName: string;
  selectedPersona: string;
  selectedAnswerStyles: string[];
  customPrompt: string;
  meetingDomains: string[];
  questionPrompt: string;
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

// --- KYC V2 INTERFACES ---
interface ProfileRequestV2 {
  // Seller Fields
  seller_name: string;
  seller_company: string;
  seller_linkedin_url?: string | null;
  seller_website?: string | null;
  seller_job_profile?: string | null;
  seller_target_solution?: string | null;
  seller_brochure?: string | null;

  // Buyer Fields
  buyer_name: string;
  buyer_company: string;
  buyer_linkedin_url?: string | null;
  buyer_website?: string | null;
  buyer_industry?: string | null;
  buyer_job_profile?: string | null;
  buyer_interest?: string | null;

  // Model
  prompt_type: string;
}

interface JobResponse {
  job_id: string;
  status: string;
}

interface SectionStatus {
  status: string; // "pending", "running", "completed", "failed", "skipped"
  content: string;
  name?: string;
}

interface JobProgress {
  [key: string]: string; // "pending", "running", "completed", "failed", "skipped"
}

interface JobStatusResponseV2 {
  job_id: string;
  status: string; // "running", "completed", "failed"
  progress: JobProgress;
  sections: {
    buyer_persona: SectionStatus;
    seller_persona: SectionStatus;
    seller_knowledge_base: SectionStatus;
    company_mapping: SectionStatus;
    company_mapping_manus: SectionStatus;
    competitor_analysis: SectionStatus;
    customer_challenges: SectionStatus;
    objection_handling: SectionStatus;
    seller_help_company_level: SectionStatus;
    seller_help_solution_level: SectionStatus;
    seller_use_cases: SectionStatus;
    strategy: SectionStatus;
  };
  errors: string[];
  is_summarized?: boolean;
}

// --- API HELPER MODULE ---
const api = {
  getHeaders: (token: string | undefined) => {
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  },

  fetchDocuments: async (token: string | undefined): Promise<Source[]> => {
    const response = await fetch(`${API_BASE_URL}/documents`, {
      headers: api.getHeaders(token),
    });
    if (!response.ok) throw new Error("Failed to fetch documents.");
    return response.json();
  },

  fetchWebsites: async (token: string | undefined): Promise<Source[]> => {
    const response = await fetch(`${API_BASE_URL}/websites`, {
      headers: api.getHeaders(token),
    });
    if (!response.ok) throw new Error("Failed to fetch websites.");
    return response.json();
  },

  updateSource: async (
    sourceId: string,
    data: { description?: string; spaces?: string[] },
    token: string | undefined
  ): Promise<Source> => {
    const response = await fetch(`${API_BASE_URL}/sources/${sourceId}`, {
      method: "PATCH",
      headers: api.getHeaders(token),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail || "Failed to update source.");
    }
    return response.json();
  },

  uploadDocument: async (
    file: File,
    description: string | null,
    spaces: string[],
    token: string | undefined
  ): Promise<any> => {
    const formData = new FormData();
    formData.append("file", file);
    if (description) formData.append("description", description);
    if (spaces.length > 0) formData.append("spaces", spaces.join(","));

    const headers = api.getHeaders(token);
    delete (headers as any)["Content-Type"];

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: "POST",
      headers: headers as HeadersInit,
      body: formData,
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail || "Upload failed");
    }
    return response.json();
  },

  crawlWebsite: async (
    url: string,
    description: string | null,
    spaces: string[],
    token: string | undefined
  ): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/crawl`, {
      method: "POST",
      headers: api.getHeaders(token),
      body: JSON.stringify({ url, description, spaces }),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail || "Crawl failed");
    }
    return response.json();
  },

  recrawlSource: async (
    sourceId: string,
    schedule: RecrawlSchedule,
    token: string | undefined
  ): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/sources/${sourceId}/recrawl`, {
      method: "PATCH",
      headers: api.getHeaders(token),
      body: JSON.stringify({ schedule }),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail || "Failed to initiate recrawl.");
    }
    return response.json();
  },

  deleteSource: async (
    sourceId: string,
    token: string | undefined
  ): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/documents/${sourceId}`, {
      method: "DELETE",
      headers: api.getHeaders(token),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail || "Failed to delete source.");
    }
  },

  fetchChunksForSource: async (
    sourceId: string,
    page: number,
    pageSize: number,
    token: string | undefined
  ): Promise<Chunk[]> => {
    const response = await fetch(
      `${API_BASE_URL}/sources/${sourceId}/chunks?page=${page}&page_size=${pageSize}`,
      {
        headers: api.getHeaders(token),
      }
    );
    if (!response.ok) throw new Error("Failed to fetch chunks for source.");
    return response.json();
  },

  fetchSettings: async (token: string | undefined): Promise<SettingsModel> => {
    const response = await fetch(`${API_BASE_URL}/settings`, {
      headers: api.getHeaders(token),
    });
    if (!response.ok) {
      if (response.status === 404) {
        return {
          botName: "SpikedAI",
          selectedPersona: "balanced",
          selectedAnswerStyles: [],
          customPrompt: "",
          meetingDomains: [],
          questionPrompt: "Analyze the user's message. If it is a direct question, a request for information, or implies a lack of knowledge, classify it as 'QUESTION'. Otherwise, classify it as 'STATEMENT'.",
        };
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    if (!data.questionPrompt) {
        data.questionPrompt = "Analyze the user's message. If it is a direct question, a request for information, or implies a lack of knowledge, classify it as 'QUESTION'. Otherwise, classify it as 'STATEMENT'.";
    }
    return data;
  },

  saveSettings: async (settings: SettingsModel, token: string | undefined) => {
    const response = await fetch(`${API_BASE_URL}/settings`, {
      method: "POST",
      headers: api.getHeaders(token),
      body: JSON.stringify(settings),
    });
    if (!response.ok)
      throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  },

  // --- KYC V2 API FUNCTIONS ---
  startProfileGenerationV2: async (request: ProfileRequestV2, token: string | undefined): Promise<JobResponse> => {
      const response = await fetch(`${PROFILES_API_BASE_URL}/v2/start`, {
          method: "POST",
          headers: api.getHeaders(token),
          body: JSON.stringify(request),
      });
      if (!response.ok) {
          const err = await response.json();
          throw new Error(err.detail || "Failed to start V2 profile generation job.");
      }
      return response.json();
  },

  getProfileJobStatusV2: async (jobId: string, token: string | undefined): Promise<JobStatusResponseV2> => {
      const response = await fetch(`${PROFILES_API_BASE_URL}/v2/status/${jobId}`, {
        headers: api.getHeaders(token),
      });
      if (!response.ok) {
          const err = await response.json();
          throw new Error(err.detail || "Failed to fetch job status.");
      }
      return response.json();
  },

  summarizeJobV2: async (jobId: string, token: string | undefined): Promise<JobStatusResponseV2> => {
    const response = await fetch(`${PROFILES_API_BASE_URL}/v2/summarize/${jobId}`, {
        method: "POST",
        headers: api.getHeaders(token),
    });
    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Failed to summarize job.");
    }
    return response.json();
  },
};

// --- UI HELPER ---
const getSpaceColor = (space: string) => {
  const colors = [
    "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-800",
    "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-300 dark:border-emerald-800",
    "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-800",
    "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/50 dark:text-orange-300 dark:border-orange-800",
    "bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/50 dark:text-pink-300 dark:border-pink-800",
    "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-300 dark:border-indigo-800",
    "bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-900/50 dark:text-teal-300 dark:border-teal-800",
    "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-800",
  ];
  let hash = 0;
  for (let i = 0; i < space.length; i++) {
    hash = ((hash << 5) - hash + space.charCodeAt(i)) & 0xffffffff;
  }
  return colors[Math.abs(hash) % colors.length];
};

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
  const Icon = isSuccess ? CheckCircle : AlertCircle;

  return (
    <div
      className={`fixed top-24 right-6 z-50 flex items-center p-4 rounded-lg text-white shadow-lg animate-fade-in-down ${bgColor}`}
    >
      <Icon className="w-5 h-5 mr-3" />
      <span>{message}</span>
    </div>
  );
};

// --- CHILD COMPONENTS ---
type SectionKey = "content" | "index" | "responses" | "advanced";

const Sidebar = memo(
  ({
    currentPage,
    onPageChange,
    isCollapsed,
    onToggleCollapse,
    onBack,
  }: {
    currentPage: string;
    onPageChange: (page: string) => void;
    isCollapsed: boolean;
    onBack: () => void;
    onToggleCollapse: () => void;
  }) => {
    const [expandedSections, setExpandedSections] = useState<
      Record<SectionKey, boolean>
    >({
      content: true,
      index: true,
      responses: true,
      advanced: true,
    });

    const toggleSection = (section: SectionKey) =>
      setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));

    const menuItems = [
      {
        section: "content" as SectionKey,
        title: "CONTENT",
        items: [
          { id: "documents", label: "KnowledgeHub AI", icon: FileText },
          { id: "websites", label: "WebAgent AI", icon: Globe },
          // { id: "connectors", label: "Connect-Assist", icon: Link2 },
        ],
      },
      {
        section: "index" as SectionKey,
        title: "INDEX",
        items: [
          { id: "browse", label: "Browse Chunks", icon: FileSearch },
          { id: "vectorconfig", label: "Vector Configuration", icon: SlidersHorizontal },
        ],
      },
      {
        section: "responses" as SectionKey,
        title: "RESPONSES",
        items: [
          { id: "retrieval", label: "Retrieval", icon: Filter },
          { id: "businessrules", label: "Business Rules", icon: Tag },
          { id: "answerconfig", label: "Answer Configuration", icon: MessageSquare },
          // { id: "searchresults", label: "Search Results", icon: LayoutGrid },
        ],
      },
      {
        section: "advanced" as SectionKey,
        title: "ADVANCED",
        items: [
          { id: "kyc", label: "Know Your Customer", icon: Users },
          { id: "understandproduct", label: "Understand Product", icon: Wrench },
        ],
      },
    ];

    return (
      <div className={`bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 flex flex-col h-screen transition-all duration-300 ${isCollapsed ? "w-20" : "w-64"}`}>
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between flex-shrink-0 h-20">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 text-sm font-medium text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 -ml-2"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <span className="font-semibold text-lg text-gray-800 dark:text-gray-200">
                Content Hub
              </span>
            </div>
          )}
          <button
            onClick={onToggleCollapse}
            className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto p-3">
          {isCollapsed ? (
            <div className="space-y-2">
              {menuItems.flatMap((section) =>
                section.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onPageChange(item.id)}
                    className={`w-full p-3 flex items-center justify-center rounded-lg transition-all duration-200 ${
                      currentPage === item.id
                        ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300"
                        : "text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
                    }`}
                    title={item.label}
                  >
                    <item.icon className="w-5 h-5" />
                  </button>
                ))
              )}
            </div>
          ) : (
            menuItems.map((section) => (
              <div key={section.section} className="mb-4">
                <button
                  onClick={() => toggleSection(section.section)}
                  className="w-full px-2 py-2 text-left text-xs font-semibold text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 flex items-center justify-between transition-colors"
                >
                  <span>{section.title}</span>
                  <ChevronDown
                    className={`w-4 h-4 transform transition-transform ${
                      expandedSections[section.section] ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {expandedSections[section.section] && (
                  <div className="space-y-1 mt-2">
                    {section.items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => onPageChange(item.id)}
                        className={`w-full px-3 py-2.5 text-left text-sm flex items-center space-x-3 rounded-lg transition-all duration-200 ${
                          currentPage === item.id
                            ? "bg-blue-50 text-blue-600 font-medium dark:bg-blue-900/30 dark:text-blue-300"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700/50 dark:hover:text-gray-200"
                        }`}
                      >
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </nav>
      </div>
    );
  }
);

const Layout = memo(
  ({
    children,
    title,
    description,
    showSave = false,
    onSave,
    isSaving,
    isDirty,
  }: {
    children: React.ReactNode;
    title: string;
    description?: string;
    showSave?: boolean;
    onSave?: () => void;
    isSaving?: boolean;
    isDirty?: boolean;
  }) => (
    <div className="flex-1 flex flex-col overflow-hidden">
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 px-6 py-5 flex-shrink-0 h-20 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
            <Search className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {title}
            </h1>
            {description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {description}
              </p>
            )}
          </div>
        </div>
        {showSave && (
          <button
            onClick={onSave}
            disabled={isSaving || !isDirty}
            className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-gray-500 flex items-center transition-colors shadow-sm disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <Loader className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4 mr-2" />
            )}
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        )}
      </header>
      <main className="flex-1 p-6 overflow-y-auto bg-gray-50/50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  )
);

const StatusIndicator = ({
  status,
  error,
}: {
  status: IngestionStatus;
  error?: string | null;
}) => {
  const config = {
    COMPLETED: {
      icon: CheckCircle,
      color: "text-green-500",
      label: "Completed",
    },
    PROCESSING: { icon: Loader, color: "text-blue-500", label: "Processing" },
    PENDING: { icon: Clock, color: "text-yellow-500", label: "Pending" },
    FAILED: { icon: AlertCircle, color: "text-red-500", label: "Failed" },
    SCHEDULED: { icon: RefreshCw, color: "text-purple-500", label: "Scheduled Recrawl" },
  }[status];

  const tooltipText = error ? `${config.label}: ${error}` : config.label;

  return (
    <div className="relative group flex items-center">
      <config.icon
        className={`w-4 h-4 ${config.color} ${
          status === "PROCESSING" ? "animate-spin" : ""
        }`}
      />
      <div className="absolute bottom-full mb-2 w-max max-w-xs bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        {tooltipText}
      </div>
    </div>
  );
};

// --- MODALS & HELPER COMPONENTS ---

const SpacesInput = ({
  spaces,
  setSpaces,
  allSpaces,
}: {
  spaces: string[];
  setSpaces: (spaces: string[]) => void;
  allSpaces: string[];
}) => {
  const [inputValue, setInputValue] = useState("");
  const handleAddSpace = (space: string) => {
    const newSpace = space.trim();
    if (newSpace && !spaces.includes(newSpace))
      setSpaces([...spaces, newSpace]);
    setInputValue("");
  };
  const handleRemoveSpace = (spaceToRemove: string) =>
    setSpaces(spaces.filter((s) => s !== spaceToRemove));

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Spaces (Optional)
      </label>
      <div className="p-2 border border-gray-200 dark:border-gray-600 rounded-lg min-h-[44px]">
        <div className="flex flex-wrap gap-2 items-center">
          {spaces.map((space) => (
            <span
              key={space}
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getSpaceColor(
                space
              )}`}
            >
              {space}
              <button
                onClick={() => handleRemoveSpace(space)}
                className="ml-1.5 text-current hover:text-red-600 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddSpace(inputValue)}
            placeholder="Add a space..."
            className="flex-grow p-1 border-none focus:ring-0 text-sm bg-transparent"
          />
        </div>
      </div>
    </div>
  );
};

const WebsiteCrawlModal = ({
  onClose,
  onCrawlComplete,
}: {
  onClose: () => void;
  onCrawlComplete: () => void;
}) => {
  const { session } = useAuth();
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [spaces, setSpaces] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "crawling" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!url.trim()) {
      setError("Please enter a valid website URL.");
      return;
    }
    setStatus("crawling");
    setError(null);
    try {
      await api.crawlWebsite(url, description, spaces, session?.access_token);
      onCrawlComplete();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to crawl website.");
      setStatus("error");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg transform transition-all">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Add Website
          </h2>
          <button
            onClick={onClose}
            disabled={status === "crawling"}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <label
              htmlFor="url-input"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Website URL
            </label>
            <input
              id="url-input"
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={status === "crawling"}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-gray-700 transition-all"
            />
          </div>
          <div>
            <label
              htmlFor="desc-input"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Description (Optional)
            </label>
            <input
              id="desc-input"
              type="text"
              placeholder="A brief description of the site"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={status === "crawling"}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-gray-700 transition-all"
            />
          </div>
          <SpacesInput spaces={spaces} setSpaces={setSpaces} allSpaces={[]} />
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50 rounded-lg">
              <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
            </div>
          )}
        </div>
        <div className="p-5 flex justify-end items-center space-x-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 rounded-b-xl">
          <button
            onClick={onClose}
            disabled={status === "crawling"}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 transition-colors dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 dark:disabled:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={status === "crawling" || !url}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 flex items-center transition-colors shadow-sm"
          >
            {status === "crawling" && (
              <Loader className="w-4 h-4 mr-2 animate-spin" />
            )}{" "}
            Add Website
          </button>
        </div>
      </div>
    </div>
  );
};

const RecrawlModal = ({ 
  source,
  onClose,
  onRecrawlInitiated,
}: {
  source: Source;
  onClose: () => void;
  onRecrawlInitiated: (updatedSource: Source) => void;
}) => {
  const { session } = useAuth();
  const [schedule, setSchedule] = useState<RecrawlSchedule>(source.recrawl_schedule || "NONE");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scheduleOptions: { value: RecrawlSchedule; label: string }[] = [
    { value: "NONE", label: "No Automatic Recrawl" },
    { value: "DAILY", label: "Daily" },
    { value: "WEEKLY", label: "Weekly" },
    { value: "MONTHLY", label: "Monthly" },
  ];

  const handleRecrawlNow = async () => await handleSubmit("ONCE");
  const handleSubmitSchedule = async () => await handleSubmit(schedule);

  const handleSubmit = async (selectedSchedule: RecrawlSchedule) => {
    setIsSubmitting(true);
    setError(null);

    try {
      await api.recrawlSource(source.id, selectedSchedule, session?.access_token);

      const newStatus =
        selectedSchedule === "ONCE"
          ? "PENDING"
          : selectedSchedule === "NONE"
          ? "COMPLETED"
          : "SCHEDULED";

      onRecrawlInitiated({
        ...source,
        recrawl_schedule: selectedSchedule !== "ONCE" ? selectedSchedule : source.recrawl_schedule, 
        status: newStatus,
      });

      onClose();
    } catch (err: any) {
      setError(err.message || "Recrawl failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const RecrawlRadioGroup = ({
    label,
    options,
    selectedValue,
    onChange,
  }: {
    label: string;
    options: { value: RecrawlSchedule; label: string }[];
    selectedValue: RecrawlSchedule;
    onChange: (value: RecrawlSchedule) => void;
  }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>

      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            disabled={isSubmitting}
            className={`px-3 py-1.5 rounded-lg text-sm border font-medium transition-colors shadow-sm ${
              selectedValue === option.value
                ? "bg-gray-800 text-white border-gray-800 shadow-sm dark:bg-gray-200 dark:text-gray-900 dark:border-gray-200"
                : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
            } focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 dark:focus:ring-offset-gray-800`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );

  const savedScheduleLabel = scheduleOptions.find(o => o.value === source.recrawl_schedule)?.label || "N/A (None)";
  const selectedScheduleLabel = scheduleOptions.find(o => o.value === schedule)?.label || "N/A";


  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md transform transition-all">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Manage Recrawl for "<span className="font-bold">{source.filename}</span>"
          </h2>

          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-6">
          <section className="space-y-3 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-md font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
              <RefreshCw className="w-4 h-4 text-blue-600" />
              <span>Schedule Automatic Recrawl</span>
            </h3>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              Set a recurring schedule for the system to fetch and re-index content automatically.
            </p>

            <RecrawlRadioGroup
              label="Recrawl Frequency"
              options={scheduleOptions}
              selectedValue={schedule}
              onChange={setSchedule}
            />

            <button
              onClick={handleSubmitSchedule}
              disabled={isSubmitting || schedule === source.recrawl_schedule}
              className="w-full px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 flex items-center justify-center transition-colors shadow-md mt-3"
            >
              {isSubmitting && schedule !== "ONCE" && (
                <Loader className="w-4 h-4 mr-2 animate-spin" />
              )}
              Save Schedule ({selectedScheduleLabel})
            </button>
          </section>

          <div className="flex items-center">
            <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
            <span className="px-2 text-sm text-gray-500">OR</span>
            <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
          </div>

          <section className="space-y-3">
            <h3 className="text-md font-semibold text-gray-900 dark:text-white">Recrawl Now (One-time)</h3>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              Initiates an immediate re-index. This action will not change your recurring schedule:
              <span className="font-semibold text-gray-800 dark:text-gray-200">
                {" "}
                {savedScheduleLabel}
              </span>
            </p>

            <button
              onClick={handleRecrawlNow}
              disabled={isSubmitting}
              className="w-full px-4 py-2.5 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 disabled:bg-gray-100 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800/50 dark:hover:bg-blue-900/50 flex items-center justify-center transition-colors"
            >
              {isSubmitting && schedule === "ONCE" && (
                <Loader className="w-4 h-4 mr-2 animate-spin" />
              )}
              Recrawl Website Now
            </button>
          </section>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 text-sm rounded-lg">
              <div className="font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Error:
              </div>
              <p>{error}</p>
            </div>
          )}
        </div>

        <div className="p-3 flex justify-end bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 rounded-b-xl">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const DocumentUploadModal = ({
  onClose,
  onUploadComplete,
}: {
  onClose: () => void;
  onUploadComplete: () => void;
}) => {
  const { session } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [spaces, setSpaces] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (selectedFiles && selectedFiles.length > 0) {
      const selectedFile = selectedFiles[0];
      const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

      if (selectedFile.size > MAX_FILE_SIZE) {
        setError("File size cannot exceed 50 MB.");
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        setFile(selectedFile);
        setError(null);
      }
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      if (!error) {
        setError("Please select a file.");
      }
      return;
    }
    setIsUploading(true);
    setError(null);
    try {
      await api.uploadDocument(
        file,
        description,
        spaces,
        session?.access_token
      );
      onUploadComplete();
      onClose();
    } catch (err: any) {
      setError(err.message || "Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg transform transition-all">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Upload Document
          </h2>
          <button
            onClick={onClose}
            disabled={isUploading}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 space-y-5">
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              error
                ? "border-red-400 bg-red-50/50 dark:border-red-500 dark:bg-red-900/20"
                : "border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/20"
            } cursor-pointer`}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-6 h-6 text-gray-500 dark:text-gray-400" />
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              <span className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                Click to upload
              </span>{" "}
              or drag and drop
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              PDF, DOC, TXT, etc. (Max 50 MB)
            </p>
            <input
              ref={fileInputRef}
              type="file"
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
            />
            {file && (
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border dark:border-gray-600 text-left">
                <div className="text-sm text-gray-800 dark:text-gray-200 font-medium">
                  {file.name}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </div>
              </div>
            )}
          </div>
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Description (Optional)
            </label>
            <textarea
              id="description"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isUploading}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 dark:disabled:bg-gray-700 transition-all"
              placeholder="Add a brief description..."
            />
          </div>
          <SpacesInput spaces={spaces} setSpaces={setSpaces} allSpaces={[]} />
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50 rounded-lg">
              <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
            </div>
          )}
        </div>
        <div className="p-5 flex justify-end items-center space-x-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 rounded-b-xl">
          <button
            onClick={onClose}
            disabled={isUploading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 transition-colors dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 dark:disabled:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isUploading || !file} 
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 flex items-center transition-colors shadow-sm"
          >
            {isUploading && <Loader className="w-4 h-4 mr-2 animate-spin" />}{" "}
            Upload Document
          </button>
        </div>
      </div>
    </div>
  );
};

const EditableField = ({
  label,
  value,
  onSave,
  placeholder,
  children,
}: {
  label: string;
  value: string;
  onSave: (newValue: string) => Promise<void>;
  placeholder: string;
  children: (
    isEditing: boolean,
    text: string,
    setText: (t: string) => void,
    ref: React.RefObject<any>
  ) => React.ReactNode;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(value);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing) inputRef.current?.focus();
  }, [isEditing]);

  const handleSave = async () => {
    if (text === value) {
      setIsEditing(false);
      return;
    }
    try {
      await onSave(text);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save:", error);
    }
  };

  return (
    <div
      className="group"
      onDoubleClick={() => !isEditing && setIsEditing(true)}
    >
      <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        {label}
      </label>
      {isEditing ? (
        <div className="mt-1">
          {children(isEditing, text, setText, inputRef)}
          <div className="flex space-x-2 mt-2">
            <button
              onClick={handleSave}
              className="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Save
            </button>
            <button
              onClick={() => {
                setText(value);
                setIsEditing(false);
              }}
              className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p className="mt-1 p-2 rounded-lg group-hover:bg-gray-50/80 dark:group-hover:bg-white/5 cursor-pointer min-h-[24px] transition-colors text-sm text-gray-700 dark:text-gray-300">
          {value || (
            <span className="text-gray-400 dark:text-gray-500 italic">
              {placeholder}
            </span>
          )}
        </p>
      )}
    </div>
  );
};

const EditableDescription = ({
  source,
  onUpdate,
}: {
  source: Source;
  onUpdate: (updatedSource: Source) => void;
}) => {
  const { session } = useAuth();
  return (
    <EditableField
      label="Description"
      value={source.description || ""}
      placeholder="Double-click to add description..."
      onSave={async (newDesc) => {
        await api.updateSource(
          source.id,
          { description: newDesc },
          session?.access_token
        );
        onUpdate({ ...source, description: newDesc });
      }}
    >
      {(isEditing, text, setText, ref) => (
        <textarea
          ref={ref}
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          rows={3}
        />
      )}
    </EditableField>
  );
};

const EditableSpaces = ({
  source,
  onUpdate,
}: {
  source: Source;
  onUpdate: (updatedSource: Source) => void;
}) => {
  const { session } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [spaces, setSpaces] = useState<string[]>(source.spaces || []);
  const [inputValue, setInputValue] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const handleAddSpace = (space: string) => {
    const newSpace = space.trim();
    if (newSpace && !spaces.includes(newSpace))
      setSpaces([...spaces, newSpace]);
    setInputValue("");
  };
  const handleRemoveSpace = (spaceToRemove: string) =>
    setSpaces(spaces.filter((s) => s !== spaceToRemove));

  const handleSave = async () => {
    setIsEditing(false);
    const originalSpaces = source.spaces || [];
    if (JSON.stringify(spaces.sort()) === JSON.stringify(originalSpaces.sort()))
      return;
    try {
      await api.updateSource(source.id, { spaces }, session?.access_token);
      onUpdate({ ...source, spaces });
    } catch (error) {
      console.error("Failed to save spaces:", error);
      setSpaces(source.spaces || []);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        isEditing
      )
        handleSave();
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isEditing, spaces]);

  return (
    <div ref={containerRef} className="group">
      <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        Spaces
      </label>
      <div
        className="mt-1 flex flex-wrap gap-2 items-center p-2 rounded-lg group-hover:bg-gray-50/80 dark:group-hover:bg-white/5 cursor-pointer transition-colors min-h-[24px]"
        onDoubleClick={() => !isEditing && setIsEditing(true)}
      >
        {spaces.map((space) => (
          <span
            key={space}
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getSpaceColor(
              space
            )}`}
          >
            {space}
            {isEditing && (
              <button
                onClick={() => handleRemoveSpace(space)}
                className="ml-1.5 text-current hover:text-red-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </span>
        ))}
        {!isEditing && spaces.length === 0 && (
          <span className="text-gray-400 dark:text-gray-500 italic text-sm">
            Double-click to add spaces...
          </span>
        )}
        {isEditing && (
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddSpace(inputValue)}
            placeholder="Add space..."
            className="text-xs p-1 border border-gray-300 dark:bg-gray-700 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        )}
      </div>
    </div>
  );
};

const SourceCard = ({
  source,
  onUpdate,
  onDelete,
  token,
}: {
  source: Source;
  onUpdate: (updatedSource: Source) => void;
  onDelete: (source: Source) => void;
  token?: string;
}) => {
  const isWebsite = !source.url.startsWith("gcs:");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showRecrawlModal, setShowRecrawlModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleDownload = async () => {
    if (!token) {
      console.error("No auth token provided for download.");
      alert("Authentication error. Cannot download file.");
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/download/${source.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || "Download failed. Please try again.");
      }

      const blob = await response.blob();
      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = source.filename;

      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/);
        if (match?.[1]) {
          filename = match[1];
        }
      }

      if (filename.toLowerCase().endsWith(".pdf") && blob.type === "application/pdf") {
        const pdfUrl = URL.createObjectURL(blob);
        window.open(pdfUrl, "_blank");
        setTimeout(() => URL.revokeObjectURL(pdfUrl), 60000);
      } else {
        saveAs(blob, filename);
      }
    } catch (error: any) {
      console.error("Error downloading file:", error);
      alert(`Download Error: ${error.message}`);
    }
  };
  
  const handleRecrawl = () => {
    setShowRecrawlModal(true);
  };


  const handleMenuAction = (action: () => void) => {
    action();
    setIsMenuOpen(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-lg p-5 flex flex-col space-y-4 transition-all duration-300 hover:border-blue-300 dark:hover:border-blue-500">
      <div className="flex justify-between items-start">
        <div className="flex items-center space-x-4 flex-1 min-w-0">
          <div
            className={`w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 ${
              isWebsite
                ? "bg-emerald-50 dark:bg-emerald-900/40"
                : "bg-blue-50 dark:bg-blue-900/40"
            }`}
          >
            {isWebsite ? (
              <Globe className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3
              className="font-semibold text-gray-800 dark:text-gray-200 truncate text-base"
              title={source.filename}
            >
              {source.filename}
            </h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Added on {new Date(source.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
          <StatusIndicator status={source.status} />
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            <div
              className={`absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg shadow-xl z-10 transition-all duration-200 ${
                isMenuOpen
                  ? "opacity-100 pointer-events-auto"
                  : "opacity-0 pointer-events-none"
              }`}
            >
              {isWebsite ? (
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  title="Open URL"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open URL
                </a>
              ) : (
                <button
                  onClick={() => handleMenuAction(handleDownload)}
                  className="flex items-center w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  title="Download File"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open/Download
                </button>
              )}

              {isWebsite && (
                <button
                  onClick={() => handleMenuAction(handleRecrawl)}
                  className="flex items-center w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <RefreshCw className="w-4 h-4 mr-2" /> Recrawl/Schedule
                </button>
              )}
              <button
                onClick={() => handleMenuAction(() => onDelete(source))}
                className="flex items-center w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
              >
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <EditableDescription source={source} onUpdate={onUpdate} />
        <EditableSpaces source={source} onUpdate={onUpdate} />
      </div>
      
      {showRecrawlModal && (
        <RecrawlModal
          source={source}
          onClose={() => setShowRecrawlModal(false)}
          onRecrawlInitiated={onUpdate}
        />
      )}
    </div>
  );
};

const SourcesListPage = ({
  sources,
  type,
  isLoading,
  error,
  onUpdate,
  onDelete,
  onAdd,
  searchQuery,
  setSearchQuery,
  token,
}: {
  sources: Source[];
  type: "document" | "website";
  isLoading: boolean;
  error: string | null;
  onUpdate: (updatedSource: Source) => void;
  onDelete: (source: Source) => void;
  onAdd: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  token?: string;
}) => {
  const filteredSources = sources.filter(
    (s) =>
      s.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.spaces || []).some((space) =>
        space.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  const SOURCE_LIMIT = 20;
  const limitReached = sources.length >= SOURCE_LIMIT;
  const countLabel = type === "document" ? "Documents" : "Web Crawls";

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${type}s...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg w-80 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white dark:bg-gray-800 dark:text-gray-200"
            />
          </div>
          <div className="font-medium text-sm text-gray-600 dark:text-gray-400">
            {countLabel}:{" "}
            <span className="font-bold text-gray-800 dark:text-gray-200">
              {sources.length}
            </span>
            <span className="text-gray-500"> / {SOURCE_LIMIT}</span>
          </div>  {countLabel === "Documents" && (
              <span className="text-gray-500"> (Max size 50MB per document)</span>
            )}
           
        </div>

        <button
          onClick={onAdd}
          disabled={limitReached}
          className="inline-flex items-center px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md font-medium text-sm disabled:bg-gray-400 dark:disabled:bg-gray-500 disabled:cursor-not-allowed"
        >
          <Plus className="w-5 h-5 mr-2 -ml-1" />
          {type === "document" ? "Upload Document" : "Add Website"}
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : error ? (
        <div className="text-center p-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 rounded-xl">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-500" />
          <p className="font-medium">Error loading {type}s</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredSources.length > 0 ? (
            filteredSources.map((source) => (
              <SourceCard
                key={source.id}
                source={source}
                onUpdate={onUpdate}
                onDelete={onDelete}
                token={token}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-16 bg-gray-100/50 dark:bg-gray-800/50 rounded-xl">
              <div className="w-16 h-16 bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                {type === "document" ? (
                  <FileText className="w-8 h-8 text-gray-400" />
                ) : (
                  <Globe className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <p className="text-gray-600 dark:text-gray-300 font-medium text-lg">
                No {type}s found
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                {searchQuery
                  ? `Try adjusting your search terms`
                  : `Click 'Add ${type}' to get started`}
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
};

// --- SETTINGS HELPER COMPONENTS ---

const FormLabel = ({
  htmlFor,
  children,
}: {
  htmlFor?: string;
  children: React.ReactNode;
}) => (
  <label
    htmlFor={htmlFor}
    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
  >
    {children}
  </label>
);

const CustomInput = ({ id, value, onChange, placeholder, required = false, type = "text", className = "", disabled=false }: any) => (
    <input 
        type={type} 
        id={id} 
        value={value} 
        onChange={onChange} 
        placeholder={placeholder} 
        className={`w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-500 ${className}`} 
        required={required}
        disabled={disabled}
    />
);

const CustomTextArea = ({ id, value, onChange, placeholder, rows=3, disabled=false }: any) => (
    <textarea
        id={id}
        value={value}
        onChange={onChange}
        rows={rows}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-500"
        disabled={disabled}
    />
);

const Select = ({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
}) => (
  <div>
    <FormLabel htmlFor={label}>{label}</FormLabel>
    <select
      id={label}
      value={value}
      onChange={onChange}
      className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
    >
      {children}
    </select>
  </div>
);

const SettingsCard = ({
  title,
  description,
  icon: Icon,
  children,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) => (
  <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm">
    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/40 rounded-lg flex items-center justify-center">
          <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {description}
          </p>
        </div>
      </div>
    </div>
    <div className="p-6">{children}</div>
  </section>
);

const Slider = ({
  label,
  value,
  onChange,
  min,
  max,
  step,
}: {
  label: string;
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  min: number;
  max: number;
  step: number;
}) => (
  <div>
    <div className="flex justify-between items-center mb-1">
      <FormLabel>{label}</FormLabel>
      <span className="text-sm font-medium text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 px-2.5 py-0.5 rounded-md">
        {value}
      </span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={onChange}
      className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
    />
  </div>
);

const RadioGroup = ({
  label,
  options,
  selectedValue,
  onChange,
}: {
  label: string;
  options: { value: string; label: string }[];
  selectedValue: string;
  onChange: (value: string) => void;
}) => (
  <div>
    <FormLabel>{label}</FormLabel>
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedValue === option.value
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  </div>
);

const CheckboxGroup = ({
  label,
  options,
  selectedValues,
  onChange,
}: {
  label: string;
  options: { value: string; label: string }[];
  selectedValues: string[];
  onChange: (value: string) => void;
}) => (
  <div>
    <FormLabel>{label}</FormLabel>
    <div className="space-y-3">
      {options.map((option) => (
        <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={selectedValues.includes(option.value)}
            onChange={() => onChange(option.value)}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">{option.label}</span>
        </label>
      ))}
    </div>
  </div>
);

// --- NEW ADVANCED PAGES ---

const UserProfileModal = ({
    isVisible,
    onClose,
    profile,
    onSave,
}: {
    isVisible: boolean;
    onClose: () => void;
    profile: {
        sellerName: string;
        sellerCompany: string;
        sellerLinkedinUrl: string;
        sellerWebsite: string;
        sellerJobProfile: string;
        sellerTargetSolution: string;
        sellerBrochure: string;
    };
    onSave: (newProfile: typeof profile) => void;
}) => {
    const [localProfile, setLocalProfile] = useState(profile);

    useEffect(() => {
        if (isVisible) {
            setLocalProfile(profile);
        }
    }, [isVisible, profile]);

    const handleChange = (key: keyof typeof profile, value: string) => {
        setLocalProfile(prev => ({ ...prev, [key]: value }));
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl transform transition-all my-8">
                <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                        <User className="w-5 h-5 text-blue-500" />
                        <span>My User Profile (Deal Strategy Info)</span>
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                    <p className="text-sm text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800">
                        This information is used by the AI to generate a personalized deal strategy based on your role, company, and specific solution focus.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2 border-b pb-1 border-gray-100 dark:border-gray-700">Identity</h3>
                        </div>
                        <div>
                            <FormLabel htmlFor="seller-name">Your Name *</FormLabel>
                            <CustomInput id="seller-name" value={localProfile.sellerName} onChange={(e: any) => handleChange('sellerName', e.target.value)} placeholder="Jane Smith" />
                        </div>
                        <div>
                            <FormLabel htmlFor="seller-job">Your Job Profile</FormLabel>
                            <CustomInput id="seller-job" value={localProfile.sellerJobProfile} onChange={(e: any) => handleChange('sellerJobProfile', e.target.value)} placeholder="Account Executive" />
                        </div>
                        <div>
                            <FormLabel htmlFor="seller-company">Your Company *</FormLabel>
                            <CustomInput id="seller-company" value={localProfile.sellerCompany} onChange={(e: any) => handleChange('sellerCompany', e.target.value)} placeholder="SpikedAI" />
                        </div>
                         <div>
                            <FormLabel htmlFor="seller-website">Company Website</FormLabel>
                            <CustomInput id="seller-website" value={localProfile.sellerWebsite} onChange={(e: any) => handleChange('sellerWebsite', e.target.value)} placeholder="https://company.com" />
                        </div>
                        <div className="md:col-span-2">
                             <FormLabel htmlFor="seller-linkedin">Your LinkedIn URL (Optional)</FormLabel>
                             <CustomInput id="seller-linkedin" value={localProfile.sellerLinkedinUrl} onChange={(e: any) => handleChange('sellerLinkedinUrl', e.target.value)} placeholder="https://linkedin.com/in/..." />
                        </div>

                        <div className="md:col-span-2 mt-2">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2 border-b pb-1 border-gray-100 dark:border-gray-700">Product & Strategy</h3>
                        </div>
                        <div className="md:col-span-2">
                            <FormLabel htmlFor="target-solution">Target Solution / Product Focus</FormLabel>
                            <CustomInput id="target-solution" value={localProfile.sellerTargetSolution} onChange={(e: any) => handleChange('sellerTargetSolution', e.target.value)} placeholder="e.g., Enterprise Cloud Platform" />
                        </div>
                        <div className="md:col-span-2">
                            <FormLabel htmlFor="seller-brochure">Product Brochure / Value Prop (Plain Text)</FormLabel>
                            <CustomTextArea 
                                id="seller-brochure" 
                                value={localProfile.sellerBrochure} 
                                onChange={(e: any) => handleChange('sellerBrochure', e.target.value)} 
                                rows={5}
                                placeholder="Paste your product description, key benefits, pricing model, and value proposition here..." 
                            />
                        </div>
                    </div>
                </div>
                <div className="p-5 flex justify-end items-center space-x-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 rounded-b-xl">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600">Cancel</button>
                    <button onClick={() => onSave(localProfile)} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm">Save Profile</button>
                </div>
            </div>
        </div>
    );
};

const EmptyProfileNotification = ({ onOpenProfile }: { onOpenProfile: () => void }) => (
    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800/50 rounded-lg flex items-start space-x-3">
        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                Seller Profile is Incomplete
            </p>
            <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                For a complete **Deal Strategy** analysis, please update your User Profile with your Name, Company, and Product details.
            </p>
        </div>
        <button 
            onClick={onOpenProfile} 
            className="flex-shrink-0 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:hover:bg-blue-900"
        >
            Update Profile
        </button>
    </div>
);

const JobProgressTracker = ({ progress, sections, errors }: { progress: JobProgress, sections: JobStatusResponseV2['sections'], errors: string[] }) => {
    
    // Group 20 steps into 3 logic phases
    const phases = [
        {
            name: "Phase 1: Data Collection & Research",
            steps: [
                { key: "buyer_person_research", label: "Buyer Web Research" },
                { key: "seller_person_research", label: "Seller Web Research" },
                { key: "buyer_linkedin_search", label: "Buyer LinkedIn Search" },
                { key: "seller_linkedin_search", label: "Seller LinkedIn Search" },
                { key: "buyer_linkedin_scraping", label: "Buyer LinkedIn Scraping" },
                { key: "seller_linkedin_scraping", label: "Seller LinkedIn Scraping" },
                { key: "buyer_company_research", label: "Buyer Company Research" },
                { key: "seller_company_research", label: "Seller Company Research" },
            ]
        },
        {
            name: "Phase 2: Base Analysis & Profiling",
            steps: [
                 { key: "buyer_persona_generation", label: "Buyer Persona Generation" },
                 { key: "seller_persona_generation", label: "Seller Persona Generation" },
                 { key: "seller_knowledge_base_generation", label: "Knowledge Base Construction" },
                 { key: "company_mapping_generation", label: "Strategic Mapping (LLM)" },
                 { key: "company_mapping_manus_generation", label: "Strategic Mapping (Manus)" },
            ]
        },
        {
            name: "Phase 3: Advanced Strategy",
            steps: [
                { key: "competitor_analysis_generation", label: "Competitor Analysis" },
                { key: "customer_challenges_generation", label: "Customer Challenges" },
                { key: "seller_help_company_generation", label: "Value Prop (Company Level)" },
                { key: "seller_help_solution_generation", label: "Value Prop (Solution Level)" },
                { key: "seller_use_cases_generation", label: "Use Cases & Scenarios" },
                { key: "strategy_generation", label: "Deal Strategy Formulation" },
                { key: "objection_handling_generation", label: "Objection Handling" },
            ]
        }
    ];

    const getStatusConfig = (status: string) => {
        switch(status) {
            case 'completed': return { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-100 text-green-700' };
            case 'running': return { icon: Loader, color: 'text-blue-500 animate-spin', bg: 'bg-blue-100 text-blue-700' }; 
            case 'failed': case 'error': return { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-100 text-red-700' };
            case 'skipped': return { icon: X, color: 'text-gray-400', bg: 'bg-gray-100 text-gray-500' }; 
            default: return { icon: Clock, color: 'text-gray-300', bg: 'bg-gray-100 text-gray-400' };
        }
    };
    
    // Calculate progress
    const totalSteps = phases.reduce((acc, phase) => acc + phase.steps.length, 0);
    const completedSteps = Object.values(progress).filter(s => s === 'completed').length;
    const percentage = Math.round((completedSteps / totalSteps) * 100);

    return (
        <div className="p-5 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-4 border dark:border-gray-600">
            <div className="flex justify-between items-center mb-2">
                 <h4 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center space-x-2">
                    <ListChecks className="w-5 h-5 text-blue-600" />
                    <span>Processing Pipeline</span>
                </h4>
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{percentage}%</span>
            </div>
            
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5 mb-6">
                <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out" style={{ width: `${percentage}%` }}></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {phases.map((phase, idx) => (
                    <div key={idx} className="space-y-3">
                        <h5 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-600 pb-1">
                            {phase.name}
                        </h5>
                        <ul className="space-y-2">
                            {phase.steps.map((step) => {
                                const status = progress[step.key] || 'pending';
                                const { icon: Icon, color, bg } = getStatusConfig(status);
                                return (
                                  <li key={step.key} className="flex items-center justify-between text-xs">
                                    <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                                        <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${color}`} />
                                        <span>{step.label}</span>
                                    </div>
                                    {status !== 'pending' && (
                                        <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold ${bg}`}>
                                            {status}
                                        </span>
                                    )}
                                  </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </div>

            {errors.length > 0 && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 text-sm rounded-lg">
                    <div className="font-medium flex items-center gap-2 mb-1">
                        <AlertCircle className="w-4 h-4" />
                        Processing Errors:
                    </div>
                    <ul className="list-disc list-inside space-y-1">
                        {errors.map((err, index) => <li key={index} className="text-xs">{err}</li>)}
                    </ul>
                </div>
            )}
        </div>
    );
};

const FinalReportDisplay = ({ sections, errors, jobId, isSummarized, onSummarize }: { sections: JobStatusResponseV2['sections'], errors: string[], jobId: string, isSummarized: boolean, onSummarize: (jobId: string) => void }) => {
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

    const toggleSection = (key: string) => {
        setExpandedSections(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const expandAll = () => {
        const allKeys = orderedSections.map(s => s.key).reduce((acc, key) => ({ ...acc, [key]: true }), {});
        setExpandedSections(allKeys);
    };

    const collapseAll = () => {
        setExpandedSections({});
    };
    
    const SkippedSection = ({ reason }: { reason: string }) => (
        <div className="p-3 my-2 bg-gray-100 dark:bg-gray-700/50 rounded-lg text-sm italic text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600">
            <Info className="w-4 h-4 inline mr-2 text-gray-400"/>
            {reason}
        </div>
    );
    
    const orderedSections = [
        { key: 'strategy', title: "Deal Strategy & Playbook", icon: Target, color: "text-red-600" },
        { key: 'buyer_persona', title: "Buyer Persona (Deep Dive)", icon: User, color: "text-blue-600" },
        { key: 'customer_challenges', title: "Customer Challenges", icon: AlertCircle, color: "text-orange-600" },
        { key: 'objection_handling', title: "Objection Handling", icon: Shield, color: "text-purple-600" },
        { key: 'competitor_analysis', title: "Competitor Analysis", icon: TrendingUp, color: "text-indigo-600" },
        { key: 'seller_use_cases', title: "Use Cases", icon: Zap, color: "text-yellow-600" },
        { key: 'seller_help_solution_level', title: "Solution Mapping", icon: Lightbulb, color: "text-teal-600" },
        { key: 'seller_help_company_level', title: "Strategic Alignment", icon: Briefcase, color: "text-cyan-600" },
        { key: 'company_mapping', title: "Company Mapping (LLM)", icon: Globe, color: "text-gray-600" },
        { key: 'company_mapping_manus', title: "Company Mapping (Manus Research)", icon: Globe2, color: "text-gray-600" },
        { key: 'seller_knowledge_base', title: "Seller Knowledge Base", icon: Database, color: "text-gray-600" },
        { key: 'seller_persona', title: "Seller Persona", icon: User, color: "text-gray-600" },
    ];

    let fullReportMarkdown = '';
    const sectionComponents = [];

    for (const item of orderedSections) {
        const section = sections[item.key as keyof typeof sections];
        const isCompleted = section && section.status === 'completed' && section.content;
        
        if (!section || (section.status === 'pending' && !section.content)) continue;

        const isExpanded = expandedSections[item.key];

        sectionComponents.push(
            <div key={item.key} className="mb-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300">
                <button 
                    onClick={() => toggleSection(item.key)}
                    className={`w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${isExpanded ? 'bg-gray-50/80 dark:bg-gray-700/30 border-b border-gray-100 dark:border-gray-700' : ''}`}
                >
                    <div className="flex items-center space-x-4">
                        <div className={`p-2.5 rounded-lg bg-opacity-10 ${item.color.replace('text-', 'bg-')} ring-1 ring-inset ring-black/5 dark:ring-white/5`}>
                             <item.icon className={`w-5 h-5 ${item.color}`}/>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                            {item.title}
                        </h3>
                        {isSummarized && isCompleted && <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 border border-purple-200 dark:border-purple-800">Summary</span>}
                    </div>
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400"/> : <ChevronDown className="w-5 h-5 text-gray-400"/>}
                </button>
                
                {isExpanded && (
                    <div className="p-6 md:p-8 animate-fade-in-down bg-white dark:bg-gray-800">
                        {isCompleted ? (
                             <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-h2:text-xl prose-h2:mt-6 prose-h2:mb-4 prose-h2:text-gray-800 dark:prose-h2:text-gray-100 prose-h3:text-lg prose-h3:text-gray-700 dark:prose-h3:text-gray-200 prose-p:text-gray-600 dark:prose-p:text-gray-300 prose-p:leading-relaxed prose-li:text-gray-600 dark:prose-li:text-gray-300 prose-strong:text-gray-900 dark:prose-strong:text-white prose-a:text-blue-600 dark:prose-a:text-blue-400 hover:prose-a:underline">
                                <ReactMarkdown>{section.content}</ReactMarkdown>
                             </div>
                        ) : (
                             <SkippedSection reason={section.content || `Content unavailable. Status: ${section.status}`} />
                        )}
                    </div>
                )}
            </div>
        );
        
        if (isCompleted) {
            fullReportMarkdown += `## ${item.title} ${isSummarized ? '(Summary)' : ''}\n\n${section.content}\n\n---\n\n`;
        }
    }

    if (!fullReportMarkdown.trim() && errors.length > 0) {
        return (
            <div className="space-y-6">
                <div className="p-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 rounded-xl">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-500" />
                    <h3 className="font-bold text-lg mb-2 text-center">Generation Failed</h3>
                    <p className="text-center mb-4">The job completed, but no content was generated due to the following errors:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm bg-white dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700 shadow-sm">
                        {errors.map((err, index) => <li key={index}>{err}</li>)}
                    </ul>
                </div>
            </div>
        );
    }

    if (!fullReportMarkdown.trim() && errors.length === 0) {
        return (
            <div className="text-center p-6 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800/50 text-yellow-700 dark:text-yellow-300 rounded-xl">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                <p className="font-medium">No results to display</p>
                <p className="text-sm mt-1">The AI finished processing but returned empty content.</p>
            </div>
        );
    }
    
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 sticky top-0 z-10 backdrop-blur-xl bg-white/90 dark:bg-gray-800/90 transition-all">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 md:mb-0 flex items-center">
                    <BarChart3 className="w-6 h-6 mr-2 text-blue-600"/>
                    {isSummarized ? "Executive Summary Report" : "Full Deep Analysis Report"}
                </h2>
                
                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 mr-2">
                        <button 
                            onClick={expandAll}
                            className="p-1.5 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-gray-600 rounded-md transition-all"
                            title="Expand All"
                        >
                            <Maximize2 className="w-4 h-4" />
                        </button>
                        <div className="w-px bg-gray-300 dark:bg-gray-600 mx-1 my-1"></div>
                        <button 
                            onClick={collapseAll}
                            className="p-1.5 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-gray-600 rounded-md transition-all"
                            title="Collapse All"
                        >
                            <Minimize2 className="w-4 h-4" />
                        </button>
                    </div>

                    <button 
                        onClick={() => onSummarize(jobId)}
                        disabled={isSummarized}
                        className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 dark:disabled:bg-gray-500 flex items-center transition-colors shadow-sm"
                    >
                        {isSummarized ? 'Summarized' : 'Generate Summaries'}
                        <Bot className="w-4 h-4 ml-2" />
                    </button>
                    <button
                        onClick={() => saveAs(new Blob([fullReportMarkdown], { type: "text/markdown;charset=utf-8" }), `KYC_Report_${jobId}.md`)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 transition-colors shadow-sm flex items-center"
                    >
                        <FileText className="w-4 h-4 mr-2" />
                        Download
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                {sectionComponents}
            </div>
        </div>
    );
};

const KnowYourCustomerPage = () => {
  const { session } = useAuth();
  
  const [buyerName, setBuyerName] = useState("");
  const [buyerCompany, setBuyerCompany] = useState("");
  const [buyerJobProfile, setBuyerJobProfile] = useState(""); 
  const [buyerLinkedin, setBuyerLinkedin] = useState("");
  const [buyerWebsite, setBuyerWebsite] = useState("");
  const [buyerIndustry, setBuyerIndustry] = useState("");
  const [buyerInterest, setBuyerInterest] = useState("");

  const [aiModel, setAiModel] = useState("anthropic"); 
  
  const [userProfile, setUserProfile] = useState({
      sellerName: "",
      sellerCompany: "",
      sellerLinkedinUrl: "",
      sellerWebsite: "",
      sellerJobProfile: "",
      sellerTargetSolution: "",
      sellerBrochure: "",
  });

  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<JobStatusResponseV2 | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false); 
  const [showProfileModal, setShowProfileModal] = useState(false);
  
  const PROFILE_STORAGE_KEY = "kycUserProfileV2";
  const POLLING_INTERVAL = 5000;

  useEffect(() => {
    const savedProfile = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (savedProfile) {
        setUserProfile(JSON.parse(savedProfile));
    }
  }, []);

  const isProfileEmpty = !userProfile.sellerName || !userProfile.sellerCompany;
  
  const aiModels = [
    { value: "anthropic", label: "Anthropic (Claude Sonnet 3.5)" },
    { value: "openai", label: "OpenAI (GPT-4o)" },
  ];

  const handleProfileSave = (newProfile: typeof userProfile) => {
    setUserProfile(newProfile);
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(newProfile));
    setShowProfileModal(false);
  };

  const handleGenerate = async () => {
    if (isProfileEmpty) {
        setShowProfileModal(true);
        return; 
    }
    
    if (!buyerName.trim() || !buyerCompany.trim()) {
      alert("Please enter both Buyer Name and Buyer Company.");
      return;
    }

    setIsGenerating(true);
    setJobStatus(null);
    setJobId(null);

    const request: ProfileRequestV2 = {
        seller_name: userProfile.sellerName.trim(),
        seller_company: userProfile.sellerCompany.trim(),
        seller_linkedin_url: userProfile.sellerLinkedinUrl.trim() || null,
        seller_website: userProfile.sellerWebsite.trim() || null,
        seller_job_profile: userProfile.sellerJobProfile.trim() || null,
        seller_target_solution: userProfile.sellerTargetSolution.trim() || null,
        seller_brochure: userProfile.sellerBrochure.trim() || null,

        buyer_name: buyerName.trim(),
        buyer_company: buyerCompany.trim(),
        buyer_linkedin_url: buyerLinkedin.trim() || null,
        buyer_website: buyerWebsite.trim() || null,
        buyer_industry: buyerIndustry.trim() || null,
        buyer_job_profile: buyerJobProfile.trim() || null,
        buyer_interest: buyerInterest.trim() || null,

        prompt_type: aiModel,
    };
    
    try {
        const response = await api.startProfileGenerationV2(request, session?.access_token);
        setJobId(response.job_id);
        setJobStatus({
            job_id: response.job_id,
            status: response.status,
            progress: {} as JobProgress,
            sections: {} as JobStatusResponseV2['sections'],
            errors: [],
            is_summarized: false,
        });
    } catch (error: any) {
        alert(`Error starting job: ${error.message}`);
        setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (!jobId || jobStatus?.status === 'completed' || jobStatus?.status === 'failed') {
        if (jobStatus?.status === 'completed' || jobStatus?.status === 'failed') {
          setIsGenerating(false);
        }
        return;
    }

    const fetchStatus = async () => {
        try {
            const statusResponse = await api.getProfileJobStatusV2(jobId, session?.access_token);
            setJobStatus(statusResponse);
            if (statusResponse.status === 'completed' || statusResponse.status === 'failed') {
                setIsGenerating(false);
            }
        } catch (error) {
            console.error("Polling error:", error);
        }
    };

    const interval = setInterval(fetchStatus, POLLING_INTERVAL);
    fetchStatus();

    return () => clearInterval(interval);
  }, [jobId, jobStatus?.status, session]);

  const handleSummarize = async (jobId: string) => {
        if (!jobId || jobStatus?.status !== 'completed') {
            alert("Job must be completed to generate summaries.");
            return;
        }

        setIsSummarizing(true);
        try {
            const summarizeResponse = await api.summarizeJobV2(jobId, session?.access_token);
            setJobStatus(prev => {
                if (prev) {
                    return {
                        ...prev,
                        sections: summarizeResponse.sections,
                        is_summarized: true, 
                    };
                }
                return null;
            });

        } catch (error: any) {
            alert(`Summarization Error: ${error.message}`);
        } finally {
            setIsSummarizing(false);
        }
  };

  const isFormValid = buyerName.trim() && buyerCompany.trim() && aiModel;
  const isJobRunning = isGenerating && jobId && jobStatus?.status === 'running';

  return (
    <div className="space-y-6">
      <HelpChatWidget />
      <SettingsCard
        title="Know Your Customer (V2)"
        description="Generate deep, strategic sales intelligence using AI-powered web and social analysis."
        icon={Users}
      >

        <div className="flex flex-col space-y-4 mb-6">
          <div className="flex justify-start">
            <button
                onClick={() => setShowProfileModal(true)}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 transition-colors shadow-sm"
            >
                <User className="w-4 h-4 text-blue-500" />
                <div className="text-left">
                    <div className="text-xs text-gray-500">Sales Profile</div>
                    <div className="font-semibold">{userProfile.sellerName || "Click to Configure"}</div>
                </div>
            </button>
          </div>
          {isProfileEmpty && (
            <EmptyProfileNotification onOpenProfile={() => setShowProfileModal(true)} />
          )}
        </div>

        <div className="space-y-6" style={{ opacity: (isJobRunning || isSummarizing) ? 0.6 : 1, pointerEvents: (isJobRunning || isSummarizing) ? 'none' : 'auto' }}>
            
            <div>
                 <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 border-b pb-1 border-gray-100 dark:border-gray-700 flex items-center">
                    <User className="w-4 h-4 mr-2"/> Buyer Identity
                 </h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <FormLabel htmlFor="buyer-name">Buyer Name <span className="text-red-500">*</span></FormLabel>
                        <CustomInput id="buyer-name" value={buyerName} onChange={(e: any) => setBuyerName(e.target.value)} placeholder="Satya Nadella" required />
                    </div>
                    <div>
                        <FormLabel htmlFor="buyer-company">Buyer Company <span className="text-red-500">*</span></FormLabel>
                        <CustomInput id="buyer-company" value={buyerCompany} onChange={(e: any) => setBuyerCompany(e.target.value)} placeholder="Microsoft" required />
                    </div>
                    <div>
                        <FormLabel htmlFor="buyer-job-profile">Job Title</FormLabel>
                        <CustomInput id="buyer-job-profile" value={buyerJobProfile} onChange={(e: any) => setBuyerJobProfile(e.target.value)} placeholder="CEO" />
                    </div>
                     <div>
                        <FormLabel htmlFor="buyer-industry">Industry</FormLabel>
                        <CustomInput id="buyer-industry" value={buyerIndustry} onChange={(e: any) => setBuyerIndustry(e.target.value)} placeholder="Technology / SaaS" />
                    </div>
                 </div>
            </div>

            <div>
                 <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 border-b pb-1 border-gray-100 dark:border-gray-700 flex items-center">
                    <Globe className="w-4 h-4 mr-2"/> Digital Footprint (Optional - Improves Accuracy)
                 </h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <FormLabel htmlFor="buyer-linkedin">Buyer LinkedIn URL</FormLabel>
                        <CustomInput id="buyer-linkedin" value={buyerLinkedin} onChange={(e: any) => setBuyerLinkedin(e.target.value)} placeholder="https://linkedin.com/in/satyanadella" />
                    </div>
                    <div>
                        <FormLabel htmlFor="buyer-website">Company Website</FormLabel>
                        <CustomInput id="buyer-website" value={buyerWebsite} onChange={(e: any) => setBuyerWebsite(e.target.value)} placeholder="https://microsoft.com" />
                    </div>
                 </div>
            </div>

            <div>
                 <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 border-b pb-1 border-gray-100 dark:border-gray-700 flex items-center">
                    <Target className="w-4 h-4 mr-2"/> Context & Strategy
                 </h3>
                 <div className="grid grid-cols-1 gap-4">
                    <div>
                        <FormLabel htmlFor="buyer-interest">Specific Buyer Interests / Pain Points</FormLabel>
                        <CustomTextArea 
                            id="buyer-interest" 
                            value={buyerInterest} 
                            onChange={(e: any) => setBuyerInterest(e.target.value)} 
                            rows={2}
                            placeholder="e.g., Interested in reducing cloud infrastructure costs and AI adoption." 
                        />
                    </div>
                 </div>
            </div>

            <div className="pt-2">
                <Select
                    label="AI Model for Analysis"
                    value={aiModel}
                    onChange={(e: any) => setAiModel(e.target.value)}
                >
                    {aiModels.map(model => <option key={model.value} value={model.value}>{model.label}</option>)}
                </Select>
            </div>
        </div>
        
        <button
          onClick={handleGenerate}
          disabled={!isFormValid || isGenerating || isSummarizing}
          className="w-full px-5 py-3 text-lg font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-gray-500 flex items-center justify-center transition-colors shadow-sm disabled:cursor-not-allowed mt-8"
        >
          {isGenerating ? (
            <Loader className="w-5 h-5 mr-3 animate-spin" />
          ) : (
            <BarChart3 className="w-5 h-5 mr-3" />
          )}
          {isGenerating ? "Running V2 Analysis..." : "Start Deep Analysis (V2)"}
        </button>
      </SettingsCard>
      
      {jobStatus && (isJobRunning || isSummarizing) && (
        <SettingsCard
          title={isSummarizing ? "Generating Summaries..." : "Live V2 Analysis Status"}
          description={`Job ID: ${jobId}`}
          icon={isSummarizing ? Loader : Clock}
        >
          <JobProgressTracker 
              progress={jobStatus.progress || {} as JobProgress} 
              sections={jobStatus.sections || {} as JobStatusResponseV2['sections']} 
              errors={jobStatus.errors || []}
          />
        </SettingsCard>
      )}

      {jobStatus?.status === 'completed' && jobStatus.sections && (
        <FinalReportDisplay 
            jobId={jobId!}
            sections={jobStatus.sections} 
            errors={jobStatus.errors || []}
            isSummarized={jobStatus.is_summarized || false} 
            onSummarize={handleSummarize}
        />
      )}
      
      {jobStatus?.status === 'failed' && (
        <div className="p-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 rounded-xl">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-500" />
          <p className="font-medium">Analysis Failed</p>
          <p className="text-sm mt-1">The job encountered a fatal error.</p>
          {jobStatus.errors.length > 0 && (
              <ul className="list-disc list-inside mt-2 text-xs">
                  {jobStatus.errors.map((err, index) => <li key={index}>{err}</li>)}
              </ul>
          )}
        </div>
      )}

      <UserProfileModal 
          isVisible={showProfileModal} 
          onClose={() => setShowProfileModal(false)}
          profile={userProfile}
          onSave={handleProfileSave}
      />
    </div>
  );
};

const FileDropZone = ({ 
  onFileSelect, 
  files, 
  isUploading,
  setFiles,
}: { 
  onFileSelect: (files: FileList | null) => void;
  files: File[];
  isUploading: boolean;
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFileSelect(e.target.files);
  };
  
  const handleRemoveFile = (fileName: string) => {
    setFiles(prev => prev.filter(f => f.name !== fileName));
  };

  return (
    <div className="space-y-3">
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 cursor-pointer ${isUploading ? 'opacity-50' : ''}`}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragOver}
      >
        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-6 h-6 text-gray-500 dark:text-gray-400" />
        </div>
        <p className="text-gray-700 dark:text-gray-300 mb-2">
          <span className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
            Click to upload files
          </span>{" "}
          or drag and drop
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Upload product documentation, specs, etc. (Max 5 files)
        </p>
        <input ref={fileInputRef} type="file" multiple onChange={handleFileChange} className="hidden" disabled={isUploading} />
      </div>
      
      {files.length > 0 && (
        <ul className="space-y-1">
          {files.map((file, index) => (
            <li key={index} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-sm text-gray-800 dark:text-gray-200">
              <span className="flex-1 truncate">{file.name}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 mx-3">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </span>
              <button 
                onClick={(e) => { e.stopPropagation(); handleRemoveFile(file.name); }}
                className="text-gray-400 hover:text-red-500 p-1 rounded-full transition-colors"
                disabled={isUploading}
              >
                <X className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const UnderstandProductPage = () => {
  const [productDescription, setProductDescription] = useState("");
  const [targetCustomer, setTargetCustomer] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [strategyResult, setStrategyResult] = useState("");

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (selectedFiles) {
      const selectedArray = Array.from(selectedFiles).slice(0, 5); 
      setFiles(selectedArray);
    }
  };

  const handleProcess = () => {
    setIsProcessing(true);
    setStrategyResult("");
    
    setTimeout(() => {
      const fileNames = files.map(f => f.name).join(", ") || "No files uploaded.";
      
      setStrategyResult(`
        ## Generated Sales Strategy Report

        **Core Product Summary (AI-Extracted):** ${productDescription.substring(0, 150)}... (Full extraction processed from: ${fileNames})

        **Target Customer Persona:** ${targetCustomer || "General Enterprise"}

        **AI-Recommended Sales Strategy:**
        * **Value Proposition:** Focus on *Efficiency and Cost Reduction*. The product features (from description and files) suggest a high degree of automation and resource optimization.
        * **Key Talking Points:** 1.  **Metric:** Estimated 30% reduction in manual effort (extrapolated from data in documentation).
            2.  **Feature Focus:** Seamless, low-friction integration with existing CRM/ERP systems.
            3.  **Differentiator:** Proprietary AI-Core for superior data processing accuracy and speed.
        * **Next Steps for Seller:** Prepare a detailed comparison chart against the top 3 competitors to establish clear product superiority in key areas.
      `);
      setIsProcessing(false);
    }, 3000);
  };
  
  const isFormValid = productDescription.length >= 50;

  return (
    <div className="space-y-6">
      <HelpChatWidget />
      <SettingsCard
        title="Understand Product"
        description="Analyze your product and documentation to generate a tailored sales strategy."
        icon={Wrench}
      >
        <div className="space-y-6">
          <FormLabel htmlFor="product-description">Product Description (Min 50 chars) <span className="text-red-500">*</span></FormLabel>
          <CustomTextArea
            id="product-description"
            value={productDescription}
            onChange={(e: any) => setProductDescription(e.target.value)}
            rows={4}
            placeholder="Describe the product you want to sell, including its key benefits and target users."
            disabled={isProcessing}
          />
          
          <div>
            <FormLabel htmlFor="target-customer">Target Customer/Job Profile</FormLabel>
            <CustomInput id="target-customer" value={targetCustomer} onChange={(e: any) => setTargetCustomer(e.target.value)} placeholder="e.g., CFO of a mid-market SaaS company" disabled={isProcessing} />
          </div>

          <FormLabel>Product Documentation (Files)</FormLabel>
          <FileDropZone 
            onFileSelect={handleFileSelect} 
            files={files} 
            setFiles={setFiles}
            isUploading={isProcessing}
          />

          <button
            onClick={handleProcess}
            disabled={!isFormValid || isProcessing}
            className="w-full px-5 py-3 text-lg font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-gray-400 dark:disabled:bg-gray-500 flex items-center justify-center transition-colors shadow-sm disabled:cursor-not-allowed mt-6"
          >
            {isProcessing ? (
              <Loader className="w-5 h-5 mr-3 animate-spin" />
            ) : (
              <Target className="w-5 h-5 mr-3" />
            )}
            {isProcessing ? "Analyzing Product..." : "Generate Sales Strategy"}
          </button>
        </div>
      </SettingsCard>
      
      {strategyResult && (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Sales Strategy Report</h3>
          <div className="prose dark:prose-invert max-w-none text-sm whitespace-pre-wrap p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border dark:border-gray-600">
            <ReactMarkdown>
                {strategyResult}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};

// --- SETTINGS PAGES ---

const VectorConfigPage = () => {
  const [topK, setTopK] = useState(5);
  const [chunkSize, setChunkSize] = useState(512);
  const [model, setModel] = useState("text-embedding-3-small");
  const [overlap, setOverlap] = useState("small");

  return (
    <div className="space-y-6">
      <HelpChatWidget />
      <SettingsCard
        title="Vector Configuration"
        description="Settings for how content is chunked and vectorized."
        icon={SlidersHorizontal}
      >
        <div className="space-y-6">
          <Slider
            label="Top K Results"
            value={topK}
            onChange={(e) => setTopK(Number(e.target.value))}
            min={1}
            max={20}
            step={1}
          />
          <Slider
            label="Chunk Size (Tokens)"
            value={chunkSize}
            onChange={(e) => setChunkSize(Number(e.target.value))}
            min={128}
            max={2048}
            step={128}
          />
          <Select
            label="Vector Embedding Model"
            value={model}
            onChange={(e) => setModel(e.target.value)}
          >
            <option value="intfloat/en5-large-v2">intfloat/en5-large-v2 (Default)</option>
          </Select>
          <RadioGroup
            label="Chunk Overlap"
            options={[
              { value: "none", label: "None" },
              { value: "small", label: "Small (10%)" },
              { value: "medium", label: "Medium (20%)" },
            ]}
            selectedValue={overlap}
            onChange={setOverlap}
          />
        </div>
      </SettingsCard>
    </div>
  );
};

const RetrievalPage = () => {
  const [retrievalMode, setRetrievalMode] = useState("hybrid");
  const [threshold, setThreshold] = useState(0.75);
  const [filtering, setFiltering] = useState(["enable"]);

  const handleFilterChange = (value: string) => {
    setFiltering(prev =>
      prev.includes(value)
        ? prev.filter(v => v !== value)
        : [...prev, value]
    );
  };

  return (
    <div className="space-y-6">
      <HelpChatWidget />
      <SettingsCard
        title="Retrieval Settings"
        description="Customize how the system fetches relevant information."
        icon={Filter}
      >
        <div className="space-y-6">
          <RadioGroup
            label="Retrieval Mode"
            options={[
              { value: "vector", label: "Vector Search" },
              { value: "hybrid", label: "Hybrid Search (Default)" },
              { value: "keyword", label: "Keyword Search" },
            ]}
            selectedValue={retrievalMode}
            onChange={setRetrievalMode}
          />
          <Slider
            label="Similarity Threshold"
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            min={0.5}
            max={1.0}
            step={0.01}
          />
          <CheckboxGroup
            label="Data Source Filtering"
            options={[
              { value: "enable", label: "Enable Data Source Filtering" },
              { value: "use_spaces", label: "Use 'Spaces' for fine-grained filtering" },
            ]}
            selectedValues={filtering}
            onChange={handleFilterChange}
          />
        </div>
      </SettingsCard>
    </div>
  );
};

const MeetingDomainInput = ({
  meetingDomains,
  setMeetingDomains,
} : {
  meetingDomains: string[];
  setMeetingDomains: (domains: string[]) => void;
}) => {
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
      <div className={`flex flex-wrap gap-2 rounded-xl p-2 min-h-[48px] border focus-within:border-blue-500 focus-within:ring-2 transition-all duration-200 bg-gray-50 border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:focus-within:ring-blue-800 focus-within:ring-blue-200`}>
        {meetingDomains.map((domain, index) => (
          <div key={index} className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm font-medium bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-100`}>
            {domain}
            <button onClick={() => removeDomain(domain)} className={`p-0.5 rounded-full hover:bg-gray-300 dark:hover:bg-gray-500`}><X className="w-3.5 h-3.5" /></button>
          </div>
        ))}
        <input type="text" value={inputValue} onChange={handleInputChange} onKeyDown={handleKeyDown} className="flex-grow bg-transparent p-1 focus:outline-none min-w-[120px]" placeholder="Add a topic..." />
      </div>
      {suggestions.length > 0 && (
        <div className={`absolute z-10 w-full mt-2 rounded-lg shadow-lg border overflow-hidden bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-600`}>
          <ul className="max-h-40 overflow-y-auto">
            {suggestions.map((suggestion, index) => (<li key={index} onClick={() => addDomain(suggestion)} className={`px-4 py-2 cursor-pointer text-sm hover:bg-gray-100 dark:hover:bg-gray-700`}>{suggestion}</li>))}
          </ul>
        </div>
      )}
    </div>
  );
};

const BusinessRulesPage = ({
  settings,
  setSettings,
}: {
  settings: SettingsModel | null;
  setSettings: React.Dispatch<React.SetStateAction<SettingsModel | null>>;
}) => {

  const handleDomainsChange = (domains: string[]) => {
    setSettings(prev => prev ? { ...prev, meetingDomains: domains } : null);
  };
  
  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newPrompt = e.target.value;
    setSettings(prev => prev ? { ...prev, questionPrompt: newPrompt } : null);
  };

  if (!settings) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <HelpChatWidget />
      <SettingsCard
        title="Meeting Focus"
        description="Add topics to focus the AI Question detection"
        icon={Tag}
      >
        <MeetingDomainInput 
          meetingDomains={settings.meetingDomains}
          setMeetingDomains={handleDomainsChange}
        />
      </SettingsCard>

      <SettingsCard
        title="Question Detection Logic"
        description="Customize the system prompt used to identify questions during meetings."
        icon={Bot}
      >
        <FormLabel htmlFor="question-prompt">System Prompt for Question Detection</FormLabel>
        <textarea
          id="question-prompt"
          value={settings.questionPrompt}
          onChange={handlePromptChange}
          rows={6}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm leading-relaxed"
          placeholder="Enter prompt logic..."
        />
      </SettingsCard>
    </div>
  );
};

const AnswerConfigPage = ({
  settings,
  setSettings,
}: {
  settings: SettingsModel | null;
  setSettings: React.Dispatch<React.SetStateAction<SettingsModel | null>>;
}) => {
  const customerPersonas: CustomerPersona[] = [
    { id: "balanced", name: "Balanced (Default)", description: "Versatile profile for general business users in B2B settings", prompt: "" },
    { id: "technical", name: "Technical", description: "Deep technical, jargon-friendly (CTO, VP Engineering, Tech Lead, Solution Architect)", prompt: "You are speaking to a technical decision maker — such as a CTO, VP Engineering, Tech Lead, or Solution Architect. Use deep technical language and industry-specific terminology where appropriate. Focus on topics like backend architecture, API/SDK availability, developer documentation, scalability, latency benchmarks, data residency, encryption standards, CI/CD compatibility, and how the solution fits into their existing stack. Provide detailed, technically sound answers, and be prepared to back claims with architecture diagrams or benchmarks." },
    { id: "finance", name: "Financial", description: "ROI-driven, cost-benefit analysis (CFO, Financial Controller, Budget Owner)", prompt: "You are speaking to a finance executive — such as a CFO, Controller, or Procurement Lead. Your tone should be ROI-driven, concise, and focused on financial impact. Emphasize cost-efficiency, pricing model clarity, return on investment (ROI), total cost of ownership (TCO), and how the investment aligns with budget cycles. Support claims with financial data, comparisons, or break-even analysis. Avoid fluff — every point should speak to value and resource optimization." },
    { id: "executive", name: "Business Executives", description: "Layman, operational clarity, Strategic, high-level impact (CEO, Managing Director, Founder, Business Head)", prompt: "You are speaking to a senior business executive — such as a CEO, Founder, or Managing Director. Use a strategic, visionary tone. Focus on long-term business impact, market differentiation, competitive positioning, growth enablement, and leadership alignment. Emphasize how the solution supports strategic goals, future scalability, and innovation. Speak in terms of outcomes, high-level KPIs, and category leadership. Avoid deep technical or operational detail unless asked." },
  ];

  const answerStyles: AnswerStyle[] = [
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
  ];

  const handlePersonaSelect = (personaId: string) => {
    const personaPrompt = customerPersonas.find((p) => p.id === personaId)?.prompt || "";
    const stylePrompts = settings?.selectedAnswerStyles
      .map((id) => answerStyles.find((s) => s.id === id)?.prompt)
      .filter(Boolean)
      .join("\n\n") || "";
    const newPrompt = [personaPrompt, stylePrompts].filter(Boolean).join("\n\n").trim();

    setSettings(prev => prev ? { 
      ...prev, 
      selectedPersona: personaId, 
      customPrompt: newPrompt 
    } : null);
  };

  const handleAnswerStyleToggle = (styleId: string) => {
    if (!settings) return;
    
    const newStyles = settings.selectedAnswerStyles.includes(styleId) 
      ? settings.selectedAnswerStyles.filter((id) => id !== styleId) 
      : [...settings.selectedAnswerStyles, styleId];

    const personaPrompt = customerPersonas.find((p) => p.id === settings.selectedPersona)?.prompt || "";
    const stylePrompts = newStyles
      .map((id) => answerStyles.find((s) => s.id === id)?.prompt)
      .filter(Boolean)
      .join("\n\n");
    const newPrompt = [personaPrompt, stylePrompts].filter(Boolean).join("\n\n").trim();

    setSettings(prev => prev ? { 
      ...prev, 
      selectedAnswerStyles: newStyles, 
      customPrompt: newPrompt 
    } : null);
  };
  
  const handleCustomPromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newPrompt = e.target.value;
    setSettings(prev => prev ? { ...prev, customPrompt: newPrompt } : null);
  };
  
  if (!settings) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <HelpChatWidget />
      <div className="lg:col-span-2 space-y-6">
        <SettingsCard
          title="Customer Persona"
          description="Choose one persona to affect the AI's tone, depth, and focus."
          icon={Users}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {customerPersonas.map((persona) => (
              <button 
                key={persona.id} 
                onClick={() => handlePersonaSelect(persona.id)} 
                className={`p-5 rounded-xl border-2 text-left transition-all duration-200 hover:shadow-md ${
                  settings.selectedPersona === persona.id
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-500"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
              >
                <h3 className="font-semibold mb-1 text-gray-900 dark:text-gray-100">{persona.name}</h3>
                <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">{persona.description}</p>
              </button>
            ))}
          </div>
        </SettingsCard>

        <SettingsCard
          title="Answer Styles"
          description="Select multiple styles to customize responses."
          icon={MessageSquare}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {answerStyles.map((style) => (
              <button 
                key={style.id} 
                onClick={() => handleAnswerStyleToggle(style.id)} 
                className={`p-5 rounded-xl border-2 text-left transition-all duration-200 hover:shadow-md ${
                  settings.selectedAnswerStyles.includes(style.id)
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-500"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
              >
                <h3 className="font-semibold mb-1 text-gray-900 dark:text-gray-100">{style.name}</h3>
                <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">{style.description}</p>
              </button>
            ))}
          </div>
        </SettingsCard>
      </div>

      <div className="lg:col-span-1">
        <div className="sticky top-6 space-y-6">
          <SettingsCard
            title="System Prompt"
            description="Customize your AI Copilot."
            icon={Bot}
          >
            <div className="flex items-center justify-between mb-2">
              <FormLabel htmlFor="system-prompt">Generated System Prompt</FormLabel>
              <div className="relative group">
                <Info className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-60 p-2 bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  The system prompt is auto-generated, but you can edit it directly.
                </div>
              </div>
            </div>
            <textarea
              id="system-prompt"
              value={settings.customPrompt}
              onChange={handleCustomPromptChange}
              rows={20}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm leading-relaxed"
              placeholder="Select a persona or style to generate a prompt..."
            />
          </SettingsCard>
        </div>
      </div>
    </div>
  );
};

const SearchResultsPage = () => {
  const [showOptions, setShowOptions] = useState(["snippet", "score", "filename"]);
  const [sortOrder, setSortOrder] = useState("relevance");
  const [highlighting, setHighlighting] = useState(true);

  const handleShowOptionsChange = (value: string) => {
    setShowOptions(prev =>
      prev.includes(value)
        ? prev.filter(v => v !== value)
        : [...prev, value]
    );
  };

  return (
    <div className="space-y-6">
      <SettingsCard
        title="Search Result Presentation"
        description="Configure how search results are displayed to the user."
        icon={LayoutGrid}
      >
        <div className="space-y-6">
          <CheckboxGroup
            label="Visible Result Components"
            options={[
              { value: "snippet", label: "Show Content Snippet" },
              { value: "score", label: "Show Relevance Score" },
              { value: "filename", label: "Show Source Filename" },
              { value: "url", label: "Show Source URL (if available)" },
            ]}
            selectedValues={showOptions}
            onChange={handleShowOptionsChange}
          />
          <RadioGroup
            label="Default Sort Order"
            options={[
              { value: "relevance", label: "Relevance" },
              { value: "date_desc", label: "Date Added (Newest First)" },
              { value: "date_asc", label: "Date Added (Oldest First)" },
            ]}
            selectedValue={sortOrder}
            onChange={setSortOrder}
          />
          <div>
            <FormLabel>Search Term Highlighting</FormLabel>
            <button
              onClick={() => setHighlighting(!highlighting)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${
                highlighting ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-700"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white dark:bg-gray-300 shadow ring-0 transition duration-200 ease-in-out ${
                  highlighting ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>
      </SettingsCard>
    </div>
  );
};

// --- DATA FETCHING & APP LOGIC ---

const useSources = (
  fetcher: (token: string | undefined) => Promise<Source[]>,
  pollInterval: number
) => {
  const { session } = useAuth();
  const [sources, setSources] = useState<Source[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!session) {
      setIsLoading(false);
      setSources([]);
      return;
    }
    if (sources.length === 0) {
      setIsLoading(true);
    }
    setError(null);
    try {
      const data = await fetcher(session.access_token);
      setSources(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [fetcher, session, sources.length]);


  useEffect(() => {
    fetchData();
  }, [fetchData]);


  useEffect(() => {
    if (pollInterval === 0) return;

    const interval = setInterval(async () => {
      const sourcesToUpdate = sources.filter(
        (s) => s.status === "PENDING" || s.status === "PROCESSING" || s.status === "SCHEDULED"
      );
      if (sourcesToUpdate.length > 0 && session) {
        try {
          const updatedSources = await fetcher(session.access_token);
          setSources((currentSources) =>
            currentSources.map(
              (cs) => updatedSources.find((us) => us.id === cs.id) || cs
            )
          );
        } catch (err) {
          console.error("Polling failed:", err);
        }
      }
    }, pollInterval);
    return () => clearInterval(interval);
  }, [sources, fetcher, pollInterval, session]);

  const updateSource = (updatedSource: Source) => {
    setSources((prev) =>
      prev.map((s) => (s.id === updatedSource.id ? updatedSource : s))
    );
  };

  const deleteSource = (sourceId: string) => {
    setSources((prev) => prev.filter((s) => s.id !== sourceId));
  };

  return { sources, isLoading, error, fetchData, updateSource, deleteSource };
};

const DocumentsPage = () => {
  const { session } = useAuth();
  const {
    sources: documents,
    isLoading,
    error,
    fetchData,
    updateSource,
    deleteSource,
  } = useSources(api.fetchDocuments, 5000);
  const [searchQuery, setSearchQuery] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);

  const handleDelete = async (docToDelete: Source) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${docToDelete.filename}"?`
      )
    ) {
        try {
          await api.deleteSource(docToDelete.id, session?.access_token);
          deleteSource(docToDelete.id);
        } catch (err: any) {
          alert(`Error: ${err.message}`);
        }
    }
  };

  return (
    <>
      <HelpChatWidget />
      <SourcesListPage
        sources={documents}
        type="document"
        isLoading={isLoading}
        error={error}
        onUpdate={updateSource}
        onDelete={handleDelete}
        onAdd={() => setShowUploadModal(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        token={session?.access_token}
      />
      {showUploadModal && (
        <DocumentUploadModal
          onClose={() => setShowUploadModal(false)}
          onUploadComplete={fetchData}
        />
      )}
    </>
  );
};

const WebsitesPage = () => {
  const { session } = useAuth();
  const {
    sources: websites,
    isLoading,
    error,
    fetchData,
    updateSource,
    deleteSource,
  } = useSources(api.fetchWebsites, 3000);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCrawlModal, setShowCrawlModal] = useState(false);

  const handleDelete = async (siteToDelete: Source) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${siteToDelete.filename}"?`
      )
    ) {
      try {
        await api.deleteSource(siteToDelete.id, session?.access_token);
        deleteSource(siteToDelete.id);
      } catch (err: any) {
        alert(`Error: ${err.message}`);
      }
    }
  };

  return (
    <>
      <HelpChatWidget />
      <SourcesListPage
        sources={websites}
        type="website"
        isLoading={isLoading}
        error={error}
        onUpdate={updateSource}
        onDelete={handleDelete}
        onAdd={() => setShowCrawlModal(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        token={session?.access_token}
      />
      {showCrawlModal && (
        <WebsiteCrawlModal
          onClose={() => setShowCrawlModal(false)}
          onCrawlComplete={fetchData}
        />
      )}
    </>
  );
};

const SourceChunksViewer = ({ sourceId }: { sourceId: string }) => {
  const { session } = useAuth();
  const [chunks, setChunks] = useState<Chunk[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const CHUNKS_PER_PAGE = 10;

  const loadChunks = useCallback(
    async (pageNum: number) => {
      setIsLoading(true);
      setError(null);
      try {
        const newChunks = await api.fetchChunksForSource(
          sourceId,
          pageNum,
          CHUNKS_PER_PAGE,
          session?.access_token
        );
        if (newChunks.length < CHUNKS_PER_PAGE) {
          setHasMore(false);
        }
        setChunks((prev) =>
          pageNum === 1 ? newChunks : [...prev, ...newChunks]
        );
        setPage(pageNum);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    },
    [sourceId, session?.access_token]
  );

  useEffect(() => {
    if (session) {
      loadChunks(1);
    }
  }, [loadChunks, session]);

  return (
    <div className="p-6 bg-gray-50/50 dark:bg-gray-900/50">
      <div className="space-y-4 max-h-96 overflow-y-auto pr-4">
        {chunks.map((chunk, index) => (
          <div
            key={chunk.id}
            className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-mono text-gray-500 bg-gray-100 dark:bg-gray-700 dark:text-gray-400 px-2 py-1 rounded">
                Chunk #{index + 1}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                ID: ...{chunk.id.slice(-8)}
              </p>
            </div>
            <p className="text-sm text-gray-800 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
              {chunk.content}
            </p>
          </div>
        ))}
      </div>

      {error && (
        <div className="text-center p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-300 text-sm rounded-lg mt-4">
          {error}
        </div>
      )}

      {hasMore && !isLoading && (
        <div className="mt-6 text-center">
          <button
            onClick={() => loadChunks(page + 1)}
            className="px-5 py-2 text-sm font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
          >
            Load More Chunks
          </button>
        </div>
      )}
      {isLoading && (
        <div className="flex justify-center items-center h-20">
          <Loader className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      )}

      {!isLoading && chunks.length === 0 && !error && (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-3">
            <FileSearch className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            No chunks found
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
            This source may not have been processed yet.
          </p>
        </div>
      )}
    </div>
  );
};

const BrowsePage = () => {
  const { session } = useAuth();
  const [sources, setSources] = useState<Source[]>([]);
  const [isLoadingSources, setIsLoadingSources] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSourceId, setExpandedSourceId] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllSources = async () => {
      if (!session) return;
      setIsLoadingSources(true);
      setError(null);
      try {
        const docsPromise = api.fetchDocuments(session.access_token);
        const sitesPromise = api.fetchWebsites(session.access_token);
        const [docs, sites] = await Promise.all([docsPromise, sitesPromise]);
        setSources(
          [...docs, ...sites].sort((a, b) =>
            a.filename.localeCompare(b.filename)
          )
        );
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoadingSources(false);
      }
    };
    fetchAllSources();
  }, [session]);

  const toggleSource = (sourceId: string) => {
    setExpandedSourceId((prevId) => (prevId === sourceId ? null : sourceId));
  };

  if (isLoadingSources) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 rounded-xl">
        <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-500" />
        <p className="font-medium">Error loading sources</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <HelpChatWidget />
      {sources.map((source) => (
        <div
          key={source.id}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
        >
          <button
            className="w-full p-5 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            onClick={() => toggleSource(source.id)}
          >
            <div className="flex items-center space-x-4">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  source.url.startsWith("gcs:")
                    ? "bg-blue-50 dark:bg-blue-900/40"
                    : "bg-emerald-50 dark:bg-emerald-900/40"
                }`}
              >
                {source.url.startsWith("gcs:") ? (
                  <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                ) : (
                  <Globe className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                )}
              </div>
              <div>
                <h2
                  className="text-lg font-semibold text-gray-800 dark:text-gray-200 truncate"
                  title={source.filename}
                >
                  {source.filename}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Created {new Date(source.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <ChevronDown
              className={`w-5 h-5 text-gray-400 transition-transform transform ${
                expandedSourceId === source.id ? "rotate-180" : ""
              }`}
            />
          </button>
          {expandedSourceId === source.id && (
            <SourceChunksViewer sourceId={source.id} />
          )}
        </div>
      ))}

      {sources.length === 0 && (
        <div className="text-center py-16 bg-gray-100/50 dark:bg-gray-800/50 rounded-xl">
          <div className="w-16 h-16 bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileSearch className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600 dark:text-gray-300 font-medium text-lg">
            No sources found
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Upload documents or add websites to browse their chunks.
          </p>
        </div>
      )}
    </div>
  );
};

const ConnectorsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  return (
    <div className="space-y-12">
      <HelpChatWidget />
      <div className="relative max-w-md mx-auto">
        <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search for a connector..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white dark:bg-gray-800 dark:text-gray-200 shadow-sm"
        />
      </div>
      <div className="text-center py-16">
          <FileSearch className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            Connectors
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Coming soon...
          </p>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentPage, setCurrentPage] = useState(
    () => localStorage.getItem("currentPage") || "documents"
  );
  
  const [settings, setSettings] = useState<SettingsModel | null>(null);
  const [initialSettings, setInitialSettings] = useState<SettingsModel | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
  };
  
  useEffect(() => {
    const fetchInitialSettings = async () => {
      if (!session) return;
      try {
        const data = await api.fetchSettings(session.access_token);
        setSettings(data);
        setInitialSettings(data);
      } catch (error) {
        console.error("Failed to fetch settings:", error);
        showToast("Could not load saved settings", "error");
      }
    };
    fetchInitialSettings();
  }, [session]);

  useEffect(() => {
    if (!settings || !initialSettings) {
      setIsDirty(false);
      return;
    }
    const hasChanged = JSON.stringify(settings) !== JSON.stringify(initialSettings);
    setIsDirty(hasChanged);
  }, [settings, initialSettings]);

  const handleSaveSettings = async () => {
    if (!settings || !isDirty) return;
    setIsSaving(true);
    try {
      await api.saveSettings(settings, session?.access_token);
      setInitialSettings(settings);
      setIsSaving(false);
      showToast("Settings saved successfully!");
    } catch (error) {
      console.error("Failed to save settings:", error);
      showToast("Error saving settings", "error");
      setIsSaving(false);
    }
  };

  useEffect(() => {
    localStorage.setItem("currentPage", currentPage);
  }, [currentPage]);

  const handleBack = () => {
    if (location.state?.from) {
      navigate(location.state.from);
    } else {
      navigate(-1);
    }
  };

  const handleToggleSidebar = useCallback(
    () => setSidebarCollapsed((p) => !p),
    []
  );
  const handlePageChange = useCallback(
    (page: string) => setCurrentPage(page),
    []
  );

  const renderPage = (Component: React.FC<any>) => {
    const contentPages = ["documents", "websites", "connectors", "browse"];
    const advancedPages = ["kyc", "understandproduct"];
    if (contentPages.includes(currentPage) || advancedPages.includes(currentPage)) {
      return <Component />;
    }
    
    const dummyPages = ["vectorconfig", "retrieval", "searchresults"];
    if (dummyPages.includes(currentPage)) {
      return <Component />;
    }

    const settingsPages = ["businessrules", "answerconfig"];
    if (settingsPages.includes(currentPage)) {
      return <Component settings={settings} setSettings={setSettings} />;
    }
    
    return <Component />;
  };

  const pageConfig: {
    [key: string]: {
      title: string;
      description: string;
      Component: React.FC<any>;
    };
  } = {
    documents: {
      title: "KnowledgeHub AI",
      description: "Upload and manage your document library",
      Component: DocumentsPage,
    },
    websites: {
      title: "WebAgent AI",
      description: "Crawl and index website content",
      Component: WebsitesPage,
    },
    connectors: {
      title: "Connect-Assist",
      description: "Integrate with external data sources",
      Component: ConnectorsPage,
    },
    browse: {
      title: "Browse Chunks",
      description: "Review extracted text chunks from all sources",
      Component: BrowsePage,
    },
    vectorconfig: {
      title: "Vector Configuration",
      description: "Configure your knowledge base indexing",
      Component: VectorConfigPage, // Replaced
    },
    retrieval: {
      title: "Retrieval",
      description: "Customize content retrieval settings",
      Component: RetrievalPage, // Replaced
    },
    businessrules: {
      title: "Business Rules",
      description: "Set up conditional processing rules",
      Component: BusinessRulesPage, // Replaced
    },
    answerconfig: {
      title: "Answer Configuration",
      description: "Fine-tune response generation",
      Component: AnswerConfigPage, // Replaced
    },
    searchresults: {
      title: "Search Results",
      description: "Configure search result presentation",
      Component: SearchResultsPage, // Replaced
    },
    kyc: {
      title: "Know Your Customer",
      description: "Generate AI-powered customer and deal-specific analysis.",
      Component: KnowYourCustomerPage,
    },
    understandproduct: {
      title: "Understand Product",
      description: "Analyze product documentation to create a core sales strategy.",
      Component: UnderstandProductPage,
    },
    // toolkit: { // Removed
    //   title: "Developer Toolkit",
    //   description: "Advanced tools for development",
    //   Component: () => <ComingSoonPage title="Developer Toolkit" />,
    // },
  };

  const { Component, title, description } =
    pageConfig[currentPage] || pageConfig.documents;

  // Check if the current page is one of the new settings pages
  const isSettingsPage = [
    "vectorconfig",
    "retrieval",
    "businessrules",
    "answerconfig",
    "searchresults",
  ].includes(currentPage);
  
  // Specifically, which pages should use the main save button?
  const usesSharedSave = ["businessrules", "answerconfig"];

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-800 dark:bg-gray-900 dark:text-gray-200">
      {toast && (<Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />)}
      <Sidebar
        currentPage={currentPage}
        onPageChange={handlePageChange}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
        onBack={handleBack}
      />
      <Layout 
        title={title} 
        description={description}
        showSave={usesSharedSave.includes(currentPage)} 
        onSave={handleSaveSettings}
        isSaving={isSaving}
        isDirty={isDirty}
      >
        {renderPage(Component)}
      </Layout>
    </div>
  );
};

export default App;
