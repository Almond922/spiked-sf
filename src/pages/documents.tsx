import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  memo,
  useMemo, // Added useMemo
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
  Users, // Added for Answer Config
  Bot, // Added for Answer Config
  Tag, // Added for Business Rules
  Target, // Added for Business Rules
  SlidersHorizontal, // Added for Vector Config
  Filter, // Added for Retrieval
  LayoutGrid, // Added for Search Results
  Info, // Added for prompts
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import HelpChatWidget from "./HelpChatWidget";
import { useAuth } from "../AuthContext"; // --- CORRECTED IMPORT ---
import { saveAs } from "file-saver";

// --- CONFIGURATION ---
const API_BASE_URL =
  "https://spikedai-production-application-409019309412.us-central1.run.app";
// const BEARER_TOKEN = ""; // This was already commented out, which is good practice.

// --- MOCK AUTH HOOK ---
// REMOVED MOCK useAuth HOOK
// --- END MOCK AUTH HOOK ---

// --- TYPESCRIPT INTERFACES ---
type IngestionStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

interface Source {
  id: string;
  filename: string;
  url: string;
  created_at: string;
  description: string | null;
  spaces: string[] | null;
  status: IngestionStatus;
}

interface Chunk {
  id: string;
  source_id: string;
  content: string;
  created_at: string;
}

// --- NEW ---
// Model for settings, based on settings.tsx
interface SettingsModel {
  botName: string;
  selectedPersona: string;
  selectedAnswerStyles: string[];
  customPrompt: string;
  meetingDomains: string[];
  questionPrompt: string;
}

// Interfaces from settings.tsx
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
// --- END NEW ---

// --- API HELPER MODULE (Corrected for Authentication) ---
const api = {
  getHeaders: (token: string | undefined) => {
    const headers: HeadersInit = { "Content-Type": "application/json" };
    // Use the dynamic token from the user's session
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

    // Create headers but remove Content-Type for FormData
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

  // --- NEW ---
  // API functions from settings.tsx
  fetchSettings: async (token: string | undefined): Promise<SettingsModel> => {
    const response = await fetch(`${API_BASE_URL}/settings`, {
      headers: api.getHeaders(token),
    });
    if (!response.ok) {
      // Handle 404/initial setup by returning a default object
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
    // Ensure new field has a default if missing from backend
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
  // --- END NEW ---
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

// --- NEW TOAST COMPONENT ---
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
type SectionKey = "content" | "index" | "responses"; // Removed "devTools"

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
      // devTools: true, // Removed
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
          // { id: "connectors", label: "Connectors", icon: Link2 }, //
        ],
      },
      {
        section: "index" as SectionKey,
        title: "INDEX",
        items: [
          { id: "browse", label: "Browse Chunks", icon: FileSearch },
          { id: "vectorconfig", label: "Vector Configuration", icon: SlidersHorizontal }, // Changed icon
        ],
      },
      {
        section: "responses" as SectionKey,
        title: "RESPONSES",
        items: [
          { id: "retrieval", label: "Retrieval", icon: Filter }, // Changed icon
          { id: "businessrules", label: "Business Rules", icon: Target }, // Changed icon
          {
            id: "answerconfig",
            label: "Answer Configuration",
            icon: MessageSquare,
          },
          // { id: "searchresults", label: "Search Results", icon: LayoutGrid }, // Changed icon
        ],
      },
      // { // SECTION REMOVED
      //   section: "devTools" as SectionKey,
      //   title: "DEV TOOLS",
      //   items: [{ id: "toolkit", label: "Toolkit", icon: Wrench }],
      // },
    ];

    return (

      <div
        className={`bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 flex flex-col h-screen transition-all duration-300 ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
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

// --- MODALS ---
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
  const { session } = useAuth(); // Get session for token
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

const DocumentUploadModal = ({
  onClose,
  onUploadComplete,
}: {
  onClose: () => void;
  onUploadComplete: () => void;
}) => {
  const { session } = useAuth(); // Get session for token
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [spaces, setSpaces] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- MODIFIED ---
  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (selectedFiles && selectedFiles.length > 0) {
      const selectedFile = selectedFiles[0];
      const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

      if (selectedFile.size > MAX_FILE_SIZE) {
        setError("File size cannot exceed 20 MB.");
        setFile(null);
        // Clear the file input so the user can re-select
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        setFile(selectedFile);
        setError(null);
      }
    }
  };
  // --- END MODIFIED ---

  const handleSubmit = async () => {
    if (!file) {
      // Error state is already set by handleFileSelect if it was a size issue
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
              error // --- NEW ---
                ? "border-red-400 bg-red-50/50 dark:border-red-500 dark:bg-red-900/20"
                : "border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/20"
            } cursor-pointer`} // --- END NEW ---
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
              PDF, DOC, TXT, etc. (Max 20 MB) {/* --- MODIFIED --- */}
            </p>
            <input
              ref={fileInputRef}
              type="file"
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
            />
            {file && ( // --- MODIFIED (show file info even if error, to show what was rejected) ---
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

// --- REUSABLE EDITABLE COMPONENTS ---
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
      // Optionally: show a toast or error message to the user
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
      setSpaces(source.spaces || []); // Revert on error
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing, spaces]); // Added spaces to deps to ensure handleSave has latest state

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

// --- REUSABLE PAGE & CARD COMPONENTS ---
const SourceCard = ({
  source,
  onUpdate,
  onDelete,
  onRecrawl,
  token,
}: {
  source: Source;
  onUpdate: (updatedSource: Source) => void;
  onDelete: (source: Source) => void;
  onRecrawl?: (source: Source) => void;
  token?: string;
}) => {
  const isWebsite = !source.url.startsWith("gcs:");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
      // Use a non-blocking notification if possible, but alert is a fallback
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

      // --- PDF logic ---
      if (filename.toLowerCase().endsWith(".pdf") && blob.type === "application/pdf") {
        const pdfUrl = URL.createObjectURL(blob);
        window.open(pdfUrl, "_blank");
        // Optionally revoke after some time
        setTimeout(() => URL.revokeObjectURL(pdfUrl), 60000);
      } else {
        saveAs(blob, filename);
      }
    } catch (error: any) {
      console.error("Error downloading file:", error);
      alert(`Download Error: ${error.message}`);
    }
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
              className={`absolute top-full right-0 mt-2 w-40 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg shadow-xl z-10 transition-all duration-200 ${
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

              {isWebsite && onRecrawl && (
                <button
                  onClick={() => handleMenuAction(() => onRecrawl(source))}
                  className="flex items-center w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <RefreshCw className="w-4 h-4 mr-2" /> Recrawl
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
  onRecrawl,
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
  onRecrawl?: (source: Source) => void;
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

  // --- NEW ---
  const SOURCE_LIMIT = 10;
  const limitReached = sources.length >= SOURCE_LIMIT;
  const countLabel = type === "document" ? "Documents" : "Web Crawls";
  // --- END NEW ---

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        {/* --- MODIFIED (wrapped search and count) --- */}
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
          {/* --- NEW (count display) --- */}
          <div className="font-medium text-sm text-gray-600 dark:text-gray-400">
            {countLabel}:{" "}
            <span className="font-bold text-gray-800 dark:text-gray-200">
              {sources.length}
            </span>
            <span className="text-gray-500"> / {SOURCE_LIMIT}</span>
          </div>
          {/* --- END NEW --- */}
        </div>
        {/* --- END MODIFIED --- */}

        <button
          onClick={onAdd}
          // --- MODIFIED (added disabled logic) ---
          disabled={limitReached}
          className="inline-flex items-center px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md font-medium text-sm disabled:bg-gray-400 dark:disabled:bg-gray-500 disabled:cursor-not-allowed"
          // --- END MODIFIED ---
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
                onRecrawl={onRecrawl}
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

// --- PAGE COMPONENTS ---
const useSources = (
  fetcher: (token: string | undefined) => Promise<Source[]>,
  pollInterval: number
) => {
  const { session } = useAuth();
  const [sources, setSources] = useState<Source[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    // Don't fetch if there's no active session
    if (!session) {
      setIsLoading(false);
      setSources([]);
      return;
    }
    // Don't set loading to true if it's just a background refresh
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchData]); // Only run on mount (fetchData is memoized)


  useEffect(() => {
    if (pollInterval === 0) return; // Allow disabling polling

    const interval = setInterval(async () => {
      const sourcesToUpdate = sources.filter(
        (s) => s.status === "PENDING" || s.status === "PROCESSING"
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
    // A non-blocking confirm would be better, but this is functional
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

  const handleRecrawl = async (siteToRecrawl: Source) => {
    // This feature seems to have been removed from the backend,
    // so we'll just log it for now.
    console.log("Recrawl functionality not currently implemented in backend.");
    alert("Recrawl functionality is not currently available.");
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
        onRecrawl={handleRecrawl}
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

// --- NEW COMPONENT FOR CONNECTORS PAGE ---
// --- DUMMY ICONS for Connectors Page ---
// Using simple paths and colors to represent logos.

const ConfluenceIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-7 h-7"
  >
    <path
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.11 15.36V6.64c4.69 0 4.69 8.72 0 8.72z"
      fill="#2684FF"
    ></path>
  </svg>
);

const GoogleDriveIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-7 h-7"
  >
    <path
      d="M7.71 1L1 12.43l3.29 5.57h15.42l3.29-5.57L16.29 1H7.71z"
      fill="#4285F4"
    ></path>
    <path d="M23 18l-3.29-5.57-4.28 7.37H23z" fill="#0F9D58"></path>
    <path d="M9.57 19.8l-4.28-7.37L1 18h8.57z" fill="#F4B400"></path>
  </svg>
);

const ServiceNowIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-7 h-7"
  >
    <path
      d="M12 2a10 10 0 100 20 10 10 0 000-20zm-2 14.5a1.5 1.5 0 113 0v-2h-3v2zm3-3.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 113 0v6z"
      fill="#81B532"
    ></path>
  </svg>
);

const OracleIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-7 h-7"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM9.01 7h5.98c.55 0 1 .45 1 1v8c0 .55-.45 1-1 1H9.01c-.55 0-1-.45-1-1V8c0-.55.45-1 1-1z"
      fill="#F80000"
    ></path>
  </svg>
);

const SalesforceIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-8 h-8"
  >
    <path
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.62 14.31c-.53.51-1.28.8-2.12.8-1.72 0-3.11-1.39-3.11-3.11s1.39-3.11 3.11-3.11c.84 0 1.59.29 2.12.8l1.41-1.41c-1.02-1.02-2.41-1.64-3.95-1.64-3.03 0-5.49 2.46-5.49 5.49s2.46 5.49 5.49 5.49c1.54 0 2.93-.62 3.95-1.64l-1.41-1.41z"
      fill="#00A1E0"
    ></path>
  </svg>
);

const HubspotIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-7 h-7"
  >
    <path
      d="M12 2a10 10 0 100 20 10 10 0 000-20zm-2.5 13.5a1.5 1.5 0 113 0v-4h-3v4zm3-5.5a1.5 1.5 0 11-3 0v-2a1.5 1.5 0 113 0v2z"
      fill="#FF7A59"
    ></path>
  </svg>
);

const DropboxIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-7 h-7"
  >
    <path
      d="M12 2L6 6.5l6 4.5 6-4.5L12 2zm-6 9l6 4.5 6-4.5-6 4.5-6-4.5zM6 15.5l6 4.5 6-4.5-6-4.5-6 4.5z"
      fill="#0061FE"
    ></path>
  </svg>
);

const AWSIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-8 h-8"
  >
    <path
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.5 14h-2l-1-4h4l-1 4zm4 0h-2l1-4h-4l1 4zm1.5-5H7l1-4h8l1 4z"
      fill="#FF9900"
    ></path>
  </svg>
);

const AzureIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-7 h-7"
  >
    <path
      d="M5.5 11l-4 4 11 7 10-7-5.5-3.5L12 15zM12 2L2 9l10 7 10-7L12 2z"
      fill="#0072C6"
    ></path>
  </svg>
);

const AirtableIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-7 h-7"
  >
    <path
      d="M12 2l10 6.5v9L12 22 2 17.5v-9L12 2zm0 2.31L4.89 9 12 13.69 19.11 9 12 4.31zM4 10.36v5.28L11 20v-5.5L4 10.36zm16 0L13 14.5V20l7-4.36v-5.28z"
      fill="#F7B500"
    ></path>
  </svg>
);

const JiraIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-7 h-7"
  >
    <path
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.04 15.5L2.5 9.04l8.46-1.54 1.54 8.46-2.54 2.54z"
      fill="#2684FF"
    ></path>
  </svg>
);

const MondayIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-7 h-7"
  >
    <rect x="6" y="10" width="3" height="8" rx="1.5" fill="#5D68E2"></rect>
    <rect x="10.5" y="6" width="3" height="12" rx="1.5" fill="#5D68E2"></rect>
    <rect x="15" y="12" width="3" height="6" rx="1.5" fill="#5D68E2"></rect>
  </svg>
);

const AsanaIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-7 h-7"
  >
    <circle cx="8.5" cy="14" r="2.5" fill="#F06A6A"></circle>
    <circle cx="15.5" cy="14" r="2.5" fill="#F06A6A"></circle>
    <circle cx="12" cy="8" r="2.5" fill="#F06A6A"></circle>
  </svg>
);

const ConnectorsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const connectorCategories = [
    {
      name: "Knowledge Base",
      connectors: [
        {
          name: "Confluence Cloud",
          logo: <ConfluenceIcon />,
          status: "Not Connected",
          description: "Sync documents and knowledge base articles.",
        },
        {
          name: "Google Drive",
          logo: <GoogleDriveIcon />,
          status: "Connected",
          description: "Connect files and folders from your Drive.",
        },
      ],
    },
    {
      name: "Customer Support (CRS)",
      connectors: [
        {
          name: "ServiceNow",
          logo: <ServiceNowIcon />,
          status: "Not Connected",
          description: "Integrate with your ServiceNow instances.",
        },
        {
          name: "Oracle Knowledge",
          logo: <OracleIcon />,
          status: "Not Connected",
          description: "Pull in articles from Oracle Knowledge.",
        },
      ],
    },
    {
      name: "CRM",
      connectors: [
        {
          name: "Salesforce",
          logo: <SalesforceIcon />,
          status: "Connected",
          description: "Sync data from your Salesforce objects.",
        },
        {
          name: "Hubspot",
          logo: <HubspotIcon />,
          status: "Not Connected",
          description: "Connect with your Hubspot CRM data.",
        },
      ],
    },
    {
      name: "Cloud Storage",
      connectors: [
        {
          name: "Dropbox",
          logo: <DropboxIcon />,
          status: "Not Connected",
          description: "Access and index files from Dropbox.",
        },
        {
          name: "AWS S3",
          logo: <AWSIcon />,
          status: "Not Connected",
          description: "Connect to your Amazon S3 buckets.",
        },
        {
          name: "Azure Storage",
          logo: <AzureIcon />,
          status: "Not Connected",
          description: "Sync with Azure Blob Storage containers.",
        },
      ],
    },
    {
      name: "Productivity",
      connectors: [
        {
          name: "Airtable",
          logo: <AirtableIcon />,
          status: "Not Connected",
          description: "Integrate with your Airtable bases.",
        },
        {
          name: "Jira Cloud",
          logo: <JiraIcon />,
          status: "Connected",
          description: "Sync issues and projects from Jira.",
        },
        {
          name: "Monday.com",
          logo: <MondayIcon />,
          status: "Not Connected",
          description: "Sync your team's boards and tasks.",
        },
        {
          name: "Asana",
          logo: <AsanaIcon />,
          status: "Not Connected",
          description: "Connect your projects and tasks from Asana.",
        },
      ],
    },
  ];

  const filteredCategories = connectorCategories
    .map((category) => ({
      ...category,
      connectors: category.connectors.filter(
        (c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.description.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((category) => category.connectors.length > 0);

  const ConnectorCard = ({
    name,
    logo,
    status,
    description,
  }: {
    name: string;
    logo: React.ReactNode;
    status: string;
    description: string;
  }) => (
    <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-sm border border-gray-200/80 dark:border-gray-700/80 rounded-2xl p-6 flex flex-col transition-all duration-300 hover:shadow-xl hover:border-blue-400/50 dark:hover:border-blue-500/50 group">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-white dark:bg-gray-700 rounded-xl border dark:border-gray-600 shadow-sm">
          {logo}
        </div>
        <div>
          <h3 className="font-bold text-gray-900 dark:text-gray-100 text-md">
            {name}
          </h3>
          <span
            className={`text-xs font-semibold px-2.5 py-1 mt-1.5 inline-block rounded-full ${
              status === "Connected"
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300"
                : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
            }`}
          >
            {status}
          </span>
        </div>
      </div>
      <p className="text-gray-500 dark:text-gray-400 text-sm mt-4 flex-grow">
        {description}
      </p>
      <button
        className={`w-full mt-5 px-4 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 shadow-sm ${
          status === "Connected"
            ? "bg-white text-gray-800 border hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
            : "bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transform hover:-translate-y-0.5"
        }`}
      >
        {status === "Connected" ? "Manage Connection" : "Connect"}
      </button>
    </div>
  );

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

      {filteredCategories.length > 0 ? (
        filteredCategories.map((category) => (
          <div key={category.name}>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                {category.name}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {category.connectors.map((connector) => (
                <ConnectorCard key={connector.name} {...connector} />
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-16">
          <FileSearch className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            No Connectors Found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Your search for "{searchQuery}" did not match any connectors.
          </p>
        </div>
      )}
    </div>
  );
};


// --- ================================================= ---
// --- NEW SETTINGS PAGES START HERE ---
// --- ================================================= ---

// --- REUSABLE SETTINGS COMPONENTS ---

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

// --- NEW PAGE: VectorConfigPage ---
const VectorConfigPage = () => {
  const [topK, setTopK] = useState(5);
  const [chunkSize, setChunkSize] = useState(512);
  const [model, setModel] = useState("text-embedding-3-small");
  const [overlap, setOverlap] = useState("small");

  // In a real app, you'd fetch initial state and set 'isDirty'
  // const [isDirty, setIsDirty] = useState(false);
  // const [isSaving, setIsSaving] = useState(false);
  // const handleSave = () => { setIsSaving(true); ... }

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

// --- NEW PAGE: RetrievalPage ---
const RetrievalPage = () => {
  const [retrievalMode, setRetrievalMode] = useState("hybrid");
  const [threshold, setThreshold] = useState(0.75);
  const [filtering, setFiltering] = useState(["enable"]);

  // In a real app, you'd fetch initial state and set 'isDirty'
  // const [isDirty, setIsDirty] = useState(false);
  // const [isSaving, setIsSaving] = useState(false);
  // const handleSave = () => { setIsSaving(true); ... }

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

// --- NEW PAGE: BusinessRulesPage ---

// Copied from settings.tsx
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


// --- REPLACEMENT FOR DUMMY BusinessRulesPage ---
// --- This component is now fully controlled by props ---
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

// --- NEW PAGE: AnswerConfigPage ---
// --- REPLACEMENT FOR DUMMY AnswerConfigPage ---
// --- This component is now fully controlled by props ---
const AnswerConfigPage = ({
  settings,
  setSettings,
}: {
  settings: SettingsModel | null;
  setSettings: React.Dispatch<React.SetStateAction<SettingsModel | null>>;
}) => {
  // Data copied from settings.tsx
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
    // When persona changes, auto-generate the new prompt
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

    // Auto-generate new prompt based on new style list
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
    // When manually editing, just update the prompt
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
              value={settings.customPrompt} // Read from prop
              onChange={handleCustomPromptChange} // Call prop handler
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


// --- NEW PAGE: SearchResultsPage ---
const SearchResultsPage = () => {
  const [showOptions, setShowOptions] = useState(["snippet", "score", "filename"]);
  const [sortOrder, setSortOrder] = useState("relevance");
  const [highlighting, setHighlighting] = useState(true);

  // In a real app, you'd fetch initial state and set 'isDirty'
  // const [isDirty, setIsDirty] = useState(false);
  // const [isSaving, setIsSaving] = useState(false);
  // const handleSave = () => { setIsSaving(true); ... }
  
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

// --- ================================================= ---
// --- END OF NEW SETTINGS PAGES ---
// --- ================================================= ---


// --- MAIN APP COMPONENT ---
const App: React.FC = () => {
  const { session } = useAuth(); // Use the REAL auth hook
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentPage, setCurrentPage] = useState(
    () => localStorage.getItem("currentPage") || "documents"
  );
  
  // --- NEW SETTINGS STATE ---
  const [settings, setSettings] = useState<SettingsModel | null>(null);
  const [initialSettings, setInitialSettings] = useState<SettingsModel | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
  };
  
  // Fetch settings on mount
  useEffect(() => {
    const fetchInitialSettings = async () => {
      if (!session) return;
      try {
        // Use the REAL session token
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

  // Calculate isDirty
  useEffect(() => {
    if (!settings || !initialSettings) {
      setIsDirty(false);
      return;
    }
    const hasChanged = JSON.stringify(settings) !== JSON.stringify(initialSettings);
    setIsDirty(hasChanged);
  }, [settings, initialSettings]);

  // Save settings
  const handleSaveSettings = async () => {
    if (!settings || !isDirty) return;
    setIsSaving(true);
    try {
      // Use the REAL session token
      await api.saveSettings(settings, session?.access_token);
      setInitialSettings(settings); // Set new baseline
      setIsSaving(false);
      showToast("Settings saved successfully!");
    } catch (error) {
      console.error("Failed to save settings:", error);
      showToast("Error saving settings", "error");
      setIsSaving(false);
    }
  };
  // --- END NEW SETTINGS STATE ---


  useEffect(() => {
    localStorage.setItem("currentPage", currentPage);
  }, [currentPage]);

  const handleBack = () => {
    if (location.state?.from) {
      navigate(location.state.from);
    } else {
      navigate(-1); // Go back to the previous page in history
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

  // Helper to create the component with props
  const renderPage = (Component: React.FC<any>) => {
    // These pages are self-contained
    const contentPages = ["documents", "websites", "connectors", "browse"];
    if (contentPages.includes(currentPage)) {
      return <Component />;
    }
    
    // These pages are dummy/local state only
    const dummyPages = ["vectorconfig", "retrieval", "searchresults"];
    if (dummyPages.includes(currentPage)) {
      return <Component />;
    }

    // These pages need settings
    const settingsPages = ["businessrules", "answerconfig"];
    if (settingsPages.includes(currentPage)) {
      return <Component settings={settings} setSettings={setSettings} />;
    }
    
    // Default fallback
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
        showSave={usesSharedSave.includes(currentPage)} // Show save button for these pages
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