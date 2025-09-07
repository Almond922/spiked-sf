import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  memo,
  useContext,
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
} from "lucide-react";
import { useAuth } from "../AuthContext";

// --- CONFIGURATION ---
const API_BASE_URL =
  "https://spikedai-production-application-822359826336.us-central1.run.app";
const BEARER_TOKEN = "";

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
};

// --- UI HELPER ---
const getSpaceColor = (space: string) => {
  const colors = [
    "bg-blue-100 text-blue-800 border-blue-200",
    "bg-emerald-100 text-emerald-800 border-emerald-200",
    "bg-purple-100 text-purple-800 border-purple-200",
    "bg-orange-100 text-orange-800 border-orange-200",
    "bg-pink-100 text-pink-800 border-pink-200",
    "bg-indigo-100 text-indigo-800 border-indigo-200",
    "bg-teal-100 text-teal-800 border-teal-200",
    "bg-red-100 text-red-800 border-red-200",
  ];
  let hash = 0;
  for (let i = 0; i < space.length; i++) {
    hash = ((hash << 5) - hash + space.charCodeAt(i)) & 0xffffffff;
  }
  return colors[Math.abs(hash) % colors.length];
};

// --- CHILD COMPONENTS ---
type SectionKey = "content" | "index" | "responses" | "devTools";

const Sidebar = memo(
  ({
    currentPage,
    onPageChange,
    isCollapsed,
    onToggleCollapse,
  }: {
    currentPage: string;
    onPageChange: (page: string) => void;
    isCollapsed: boolean;
    onToggleCollapse: () => void;
  }) => {
    const [expandedSections, setExpandedSections] = useState<
      Record<SectionKey, boolean>
    >({
      content: true,
      index: true,
      responses: true,
      devTools: true,
    });

    const toggleSection = (section: SectionKey) =>
      setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));

    const menuItems = [
      {
        section: "content" as SectionKey,
        title: "CONTENT",
        items: [
          { id: "documents", label: "Documents", icon: FileText },
          { id: "websites", label: "Websites", icon: Globe },
          { id: "connectors", label: "Connectors", icon: Link2 },
        ],
      },
      {
        section: "index" as SectionKey,
        title: "INDEX",
        items: [
          { id: "browse", label: "Browse Chunks", icon: FileSearch },
          { id: "vectorconfig", label: "Vector Configuration", icon: Settings },
        ],
      },
      {
        section: "responses" as SectionKey,
        title: "RESPONSES",
        items: [
          { id: "retrieval", label: "Retrieval", icon: Database },
          { id: "businessrules", label: "Business Rules", icon: Settings },
          {
            id: "answerconfig",
            label: "Answer Configuration",
            icon: MessageSquare,
          },
          { id: "searchresults", label: "Search Results", icon: BarChart3 },
        ],
      },
      {
        section: "devTools" as SectionKey,
        title: "DEV TOOLS",
        items: [{ id: "toolkit", label: "Toolkit", icon: Wrench }],
      },
    ];

    return (
      <div
        className={`bg-white border-r border-gray-100 flex flex-col h-screen transition-all duration-300 ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        <div className="p-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0 h-20">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <button
                onClick={() => (window.location.href = "/")}
                className="flex items-center space-x-2 text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors p-2 rounded-lg hover:bg-gray-100 -ml-2"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <span className="font-semibold text-lg text-gray-800">
                Content Hub
              </span>
            </div>
          )}
          <button
            onClick={onToggleCollapse}
            className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-600" />
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
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
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
                  className="w-full px-2 py-2 text-left text-xs font-semibold text-gray-400 hover:text-gray-600 flex items-center justify-between transition-colors"
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
                            ? "bg-blue-50 text-blue-600 font-medium"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
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
  }: {
    children: React.ReactNode;
    title: string;
    description?: string;
  }) => (
    <div className="flex-1 flex flex-col overflow-hidden">
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-6 py-5 flex-shrink-0 h-20 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
            <Search className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            {description && (
              <p className="text-sm text-gray-500 mt-1">{description}</p>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1 p-6 overflow-y-auto bg-gray-50/50">
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
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Spaces (Optional)
      </label>
      <div className="p-2 border border-gray-200 rounded-lg min-h-[44px]">
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
            className="flex-grow p-1 border-none focus:ring-0 text-sm"
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
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg transform transition-all">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">Add Website</h2>
          <button
            onClick={onClose}
            disabled={status === "crawling"}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <label
              htmlFor="url-input"
              className="block text-sm font-medium text-gray-700 mb-2"
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
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 transition-all"
            />
          </div>
          <div>
            <label
              htmlFor="desc-input"
              className="block text-sm font-medium text-gray-700 mb-2"
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
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 transition-all"
            />
          </div>
          <SpacesInput spaces={spaces} setSpaces={setSpaces} allSpaces={[]} />
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
        </div>
        <div className="p-5 flex justify-end items-center space-x-3 bg-gray-50 border-t border-gray-100 rounded-b-xl">
          <button
            onClick={onClose}
            disabled={status === "crawling"}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 transition-colors"
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

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (selectedFiles && selectedFiles.length > 0) {
      setFile(selectedFiles[0]);
      setError(null);
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      setError("Please select a file.");
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
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg transform transition-all">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">
            Upload Document
          </h2>
          <button
            onClick={onClose}
            disabled={isUploading}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 space-y-5">
          <div
            className="border-2 border-dashed rounded-xl p-8 text-center transition-colors border-gray-300 hover:border-blue-400 hover:bg-blue-50/50 cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-6 h-6 text-gray-500" />
            </div>
            <p className="text-gray-700 mb-2">
              <span className="font-medium text-blue-600 hover:text-blue-700">
                Click to upload
              </span>{" "}
              or drag and drop
            </p>
            <p className="text-xs text-gray-500">PDF, DOC, TXT, etc.</p>
            <input
              ref={fileInputRef}
              type="file"
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
            />
            {file && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg border text-left">
                <div className="text-sm text-gray-800 font-medium">
                  {file.name}
                </div>
                <div className="text-xs text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </div>
              </div>
            )}
          </div>
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Description (Optional)
            </label>
            <textarea
              id="description"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isUploading}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 transition-all"
              placeholder="Add a brief description..."
            />
          </div>
          <SpacesInput spaces={spaces} setSpaces={setSpaces} allSpaces={[]} />
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
        </div>
        <div className="p-5 flex justify-end items-center space-x-3 bg-gray-50 border-t border-gray-100 rounded-b-xl">
          <button
            onClick={onClose}
            disabled={isUploading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 transition-colors"
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
    }
  };

  return (
    <div
      className="group"
      onDoubleClick={() => !isEditing && setIsEditing(true)}
    >
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
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
              className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p className="mt-1 p-2 rounded-lg group-hover:bg-gray-50/80 cursor-pointer min-h-[24px] transition-colors text-sm text-gray-700">
          {value || <span className="text-gray-400 italic">{placeholder}</span>}
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
          className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
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
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
        Spaces
      </label>
      <div
        className="mt-1 flex flex-wrap gap-2 items-center p-2 rounded-lg group-hover:bg-gray-50/80 cursor-pointer transition-colors min-h-[24px]"
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
          <span className="text-gray-400 italic text-sm">
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
            className="text-xs p-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
}: {
  source: Source;
  onUpdate: (updatedSource: Source) => void;
  onDelete: (source: Source) => void;
  onRecrawl?: (source: Source) => void;
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

  const handleMenuAction = (action: () => void) => {
    action();
    setIsMenuOpen(false);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg p-5 flex flex-col space-y-4 transition-all duration-300 hover:border-blue-300">
      <div className="flex justify-between items-start">
        <div className="flex items-center space-x-4 flex-1 min-w-0">
          <div
            className={`w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 ${
              isWebsite ? "bg-emerald-50" : "bg-blue-50"
            }`}
          >
            {isWebsite ? (
              <Globe className="w-6 h-6 text-emerald-600" />
            ) : (
              <FileText className="w-6 h-6 text-blue-600" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3
              className="font-semibold text-gray-800 truncate text-base"
              title={source.filename}
            >
              {source.filename}
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Added on {new Date(source.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
          <StatusIndicator status={source.status} />
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="p-2 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-all"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            <div
              className={`absolute top-full right-0 mt-2 w-40 bg-white border rounded-lg shadow-xl z-10 transition-all duration-200 ${
                isMenuOpen
                  ? "opacity-100 pointer-events-auto"
                  : "opacity-0 pointer-events-none"
              }`}
            >
              <a
                href={
                  isWebsite
                    ? source.url
                    : `${API_BASE_URL}/download/${source.id}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                title={isWebsite ? "Open URL" : "Download File"}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                {isWebsite ? "Open URL" : "Open/Download"}
              </a>
              {isWebsite && onRecrawl && (
                <button
                  onClick={() => handleMenuAction(() => onRecrawl(source))}
                  className="flex items-center w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <RefreshCw className="w-4 h-4 mr-2" /> Recrawl
                </button>
              )}
              <button
                onClick={() => handleMenuAction(() => onDelete(source))}
                className="flex items-center w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
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
}) => {
  const filteredSources = sources.filter(
    (s) =>
      s.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.spaces || []).some((space) =>
        space.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={`Search ${type}s...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg w-80 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
          />
        </div>
        <button
          onClick={onAdd}
          className="inline-flex items-center px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md font-medium text-sm"
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
        <div className="text-center p-6 bg-red-50 border border-red-200 text-red-700 rounded-xl">
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
              />
            ))
          ) : (
            <div className="col-span-full text-center py-16 bg-gray-100/50 rounded-xl">
              <div className="w-16 h-16 bg-white border rounded-full flex items-center justify-center mx-auto mb-4">
                {type === "document" ? (
                  <FileText className="w-8 h-8 text-gray-400" />
                ) : (
                  <Globe className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <p className="text-gray-600 font-medium text-lg">
                No {type}s found
              </p>
              <p className="text-gray-500 text-sm mt-1">
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
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetcher(session.access_token);
      setSources(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [fetcher, session]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
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
    if (
      !window.confirm(
        `Are you sure you want to delete "${docToDelete.filename}"?`
      )
    )
      return;
    try {
      await api.deleteSource(docToDelete.id, session?.access_token);
      deleteSource(docToDelete.id);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <>
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
      !window.confirm(
        `Are you sure you want to delete "${siteToDelete.filename}"?`
      )
    )
      return;
    try {
      await api.deleteSource(siteToDelete.id, session?.access_token);
      deleteSource(siteToDelete.id);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleRecrawl = async (siteToRecrawl: Source) => {
    // This feature seems to have been removed from the backend,
    // so we'll just log it for now.
    console.log("Recrawl functionality not currently implemented in backend.");
  };

  return (
    <>
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
    <div className="p-6 bg-gray-50/50">
      <div className="space-y-4 max-h-96 overflow-y-auto pr-4">
        {chunks.map((chunk, index) => (
          <div
            key={chunk.id}
            className="p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                Chunk #{index + 1}
              </p>
              <p className="text-xs text-gray-400">
                ID: ...{chunk.id.slice(-8)}
              </p>
            </div>
            <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
              {chunk.content}
            </p>
          </div>
        ))}
      </div>

      {error && (
        <div className="text-center p-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg mt-4">
          {error}
        </div>
      )}

      {hasMore && !isLoading && (
        <div className="mt-6 text-center">
          <button
            onClick={() => loadChunks(page + 1)}
            className="px-5 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
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
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <FileSearch className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium">No chunks found</p>
          <p className="text-gray-400 text-sm mt-1">
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
      <div className="text-center p-6 bg-red-50 border border-red-200 text-red-700 rounded-xl">
        <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-500" />
        <p className="font-medium">Error loading sources</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sources.map((source) => (
        <div
          key={source.id}
          className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
        >
          <button
            className="w-full p-5 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
            onClick={() => toggleSource(source.id)}
          >
            <div className="flex items-center space-x-4">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  source.url.startsWith("gcs:") ? "bg-blue-50" : "bg-emerald-50"
                }`}
              >
                {source.url.startsWith("gcs:") ? (
                  <FileText className="w-5 h-5 text-blue-600" />
                ) : (
                  <Globe className="w-5 h-5 text-emerald-600" />
                )}
              </div>
              <div>
                <h2
                  className="text-lg font-semibold text-gray-800 truncate"
                  title={source.filename}
                >
                  {source.filename}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
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
        <div className="text-center py-16 bg-gray-100/50 rounded-xl">
          <div className="w-16 h-16 bg-white border rounded-full flex items-center justify-center mx-auto mb-4">
            <FileSearch className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600 font-medium text-lg">No sources found</p>
          <p className="text-gray-500 text-sm mt-1">
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
    <div className="bg-white/60 backdrop-blur-sm border border-gray-200/80 rounded-2xl p-6 flex flex-col transition-all duration-300 hover:shadow-xl hover:border-blue-400/50 group">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-white rounded-xl border shadow-sm">
          {logo}
        </div>
        <div>
          <h3 className="font-bold text-gray-900 text-md">{name}</h3>
          <span
            className={`text-xs font-semibold px-2.5 py-1 mt-1.5 inline-block rounded-full ${
              status === "Connected"
                ? "bg-emerald-100 text-emerald-800"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {status}
          </span>
        </div>
      </div>
      <p className="text-gray-500 text-sm mt-4 flex-grow">{description}</p>
      <button
        className={`w-full mt-5 px-4 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 shadow-sm ${
          status === "Connected"
            ? "bg-white text-gray-800 border hover:bg-gray-50"
            : "bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transform hover:-translate-y-0.5"
        }`}
      >
        {status === "Connected" ? "Manage Connection" : "Connect"}
      </button>
    </div>
  );

  return (
    <div className="space-y-12">
      <div className="relative max-w-md mx-auto">
        <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search for a connector..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white shadow-sm"
        />
      </div>

      {filteredCategories.length > 0 ? (
        filteredCategories.map((category) => (
          <div key={category.name}>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
              <h2 className="text-2xl font-bold text-gray-800">
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
          <FileSearch className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-800">
            No Connectors Found
          </h3>
          <p className="text-gray-500 mt-2">
            Your search for "{searchQuery}" did not match any connectors.
          </p>
        </div>
      )}
    </div>
  );
};

// --- MAIN APP COMPONENT ---
const App: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentPage, setCurrentPage] = useState(
    () => localStorage.getItem("currentPage") || "documents"
  );

  useEffect(() => {
    localStorage.setItem("currentPage", currentPage);
  }, [currentPage]);

  const handleToggleSidebar = useCallback(
    () => setSidebarCollapsed((p) => !p),
    []
  );
  const handlePageChange = useCallback(
    (page: string) => setCurrentPage(page),
    []
  );

  const ComingSoonPage = memo(({ title }: { title: string }) => (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <Wrench className="w-10 h-10 text-gray-400" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
      <p className="text-gray-600 mb-4">
        This feature is under development and coming soon!
      </p>
    </div>
  ));

  const pageConfig: {
    [key: string]: {
      title: string;
      description: string;
      Component: React.FC<any>;
    };
  } = {
    documents: {
      title: "Documents",
      description: "Upload and manage your document library",
      Component: DocumentsPage,
    },
    websites: {
      title: "Websites",
      description: "Crawl and index website content",
      Component: WebsitesPage,
    },
    connectors: {
      title: "Connectors",
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
      Component: () => <ComingSoonPage title="Vector Configuration" />,
    },
    retrieval: {
      title: "Retrieval",
      description: "Customize content retrieval settings",
      Component: () => <ComingSoonPage title="Retrieval" />,
    },
    businessrules: {
      title: "Business Rules",
      description: "Set up conditional processing rules",
      Component: () => <ComingSoonPage title="Business Rules" />,
    },
    answerconfig: {
      title: "Answer Configuration",
      description: "Fine-tune response generation",
      Component: () => <ComingSoonPage title="Answer Configuration" />,
    },
    searchresults: {
      title: "Search Results",
      description: "Configure search result presentation",
      Component: () => <ComingSoonPage title="Search Results" />,
    },
    toolkit: {
      title: "Developer Toolkit",
      description: "Advanced tools for development",
      Component: () => <ComingSoonPage title="Developer Toolkit" />,
    },
  };

  const { Component, title, description } =
    pageConfig[currentPage] || pageConfig.documents;

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-800">
      <Sidebar
        currentPage={currentPage}
        onPageChange={handlePageChange}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
      />
      <Layout title={title} description={description}>
        <Component />
      </Layout>
    </div>
  );
};

export default App;
