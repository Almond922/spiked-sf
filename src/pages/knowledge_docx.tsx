/**
 * ## 🚀 SpikedAI - Walkthrough Layout Component
 *
 * This high-level component manages the entire **User Walkthrough and Guide Experience**.
 * It is responsible for synchronizing the instructional content (steps on the left)
 * with the interactive application simulation (`AppConsole` on the right).
 *
 * It manages the global state for the guide:
 * 1.  **`currentStepId`**: Tracks the user's progress through the 8-step journey
 * (Upload Document to Connect Meeting Bot).
 * 2.  **`isDocumentsPanelOpen`**: Controls the dynamic sizing of the main
 * application and the left guide panel based on user interaction.
 *
 * This file serves as the core wrapper that ties the instruction flow to the
 * simulated user interface.
 */
import React, {
  useState,
  useCallback,
  FC,
  DragEvent,
  ChangeEvent,
  useEffect,
  useRef,
} from "react";
import {
  FileText,
  Download,
  Trash2,
  UploadCloud,
  Clock,
  Mic,
  Zap,
  Settings,
  Minimize2,
  X,
  CheckCircle,
  Paperclip,
  Calendar,
  Headphones,
  Brain,
  Target,
  Star,
  TrendingUp,
  Pen,
  Folder,
  User,
  MessageCircle,
  RotateCcw,
  Send,
  DollarSign,
  ChevronRight,
  Volume2,
  RefreshCw,
  MessageSquare,
} from "lucide-react";

// --- INTERFACES ---

interface KnowledgeDocument {
  id: string;
  name: string;
  sizeKB: number;
  uploadDate: Date;
  status: "indexed" | "processing";
}

// --- MOCK DATA ---

const MOCK_DOCS: KnowledgeDocument[] = [
  {
    id: "d1",
    name: "Week - 04.pdf",
    sizeKB: 3200,
    uploadDate: new Date(Date.now() - 86400000),
    status: "indexed",
  },
  {
    id: "d2",
    name: "Resume_(3)[1].pdf",
    sizeKB: 850,
    uploadDate: new Date(Date.now() - 172800000),
    status: "indexed",
  },
];

// --- GUIDE STEPS (UPLOAD + MEET BOT) ---

interface GuideStep {
  id: number;
  title: string;
}

const FULL_GUIDE_STEPS: GuideStep[] = [
  { id: 1, title: "Click the Documents button in the console" },
  { id: 2, title: "Click Choose File or drag and drop your file" },
  { id: 3, title: "Click the Connect Meet button" },
  { id: 4, title: "Your bot is connected and ready to assist" },
];

// --- INTERACTIVE GUIDE ---

interface InteractiveGuideProps {
  currentStepId: number;
}

const InteractiveGuide: FC<InteractiveGuideProps> = ({ currentStepId }) => {
  return (
    <div className="space-y-2">
      {FULL_GUIDE_STEPS.map((step) => {
        const done = step.id < currentStepId;
        const isCurrent = step.id === currentStepId;
        return (
          <div
            key={step.id}
            className={`
              flex items-center justify-between w-full text-[11px] rounded-full px-3 py-2
              ${done
                ? 'bg-[#ECFDF5] border border-[#22C55E] text-[#16A34A] line-through'
                : isCurrent
                ? 'bg-[#020617] border-2 border-indigo-500 text-[#E5E7EB]'
                : 'bg-[#020617] border border-[#1F2937] text-[#E5E7EB]'}
            `}
          >
            <div className="flex items-center gap-1">
              <span
                className={`
                  w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-semibold
                  ${done ? 'bg-[#22C55E] text-white' : isCurrent ? 'bg-indigo-500 text-white border border-indigo-400' : 'bg-[#020617] border border-[#4B5563]'}
                `}
              >
                {done ? <CheckCircle className="w-3 h-3" /> : step.id}
              </span>
              <span>{step.title}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// --- DOCUMENT ITEM ---

const DocumentItem: FC<{
  doc: KnowledgeDocument;
  onDelete: (id: string) => void;
}> = ({ doc, onDelete }) => {
  const DownloadButton =
    doc.status === "indexed" ? (
      <button
        className="p-1 text-indigo-500 hover:text-indigo-700 transition rounded-full"
        aria-label="Download Document"
      >
        <Download className="w-4 h-4" />
      </button>
    ) : null;

  return (
    <div className="flex items-center p-2 mb-1 bg-white rounded-lg border border-gray-100 shadow-sm transition hover:bg-gray-50 text-xs">
      <div className="p-1 rounded-md mr-3 text-indigo-500 bg-indigo-50">
        <FileText className="w-4 h-4" />
      </div>

      <div className="flex-grow min-w-0">
        <p className="font-medium text-gray-800 truncate">{doc.name}</p>
        <div className="flex items-center space-x-2 text-gray-500">
          <span className="text-xs">chunks</span>
          {doc.status === "processing" && (
            <Clock className="w-3 h-3 text-yellow-500 animate-pulse" />
          )}
        </div>
      </div>

      <div className="flex space-x-1.5 ml-4">
        {DownloadButton}
        <button
          className="p-1 text-red-500 hover:text-red-700 transition rounded-full"
          onClick={() => onDelete(doc.id)}
          aria-label="Delete Document"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// --- UPLOAD AREA ---

const UploadArea: FC<{
  onFileSelect: (files: FileList) => void;
  isUploading: boolean;
  docCount: number;
  currentStepId?: number;
}> = ({ onFileSelect, isUploading, docCount, currentStepId = 1 }) => {
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  const handleDrop = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) {
      onFileSelect(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files) {
      onFileSelect(e.target.files);
      e.target.value = "";
    }
  };

  const borderColor = isUploading
    ? "border-green-500"
    : isDragOver
    ? "border-indigo-500"
    : "border-gray-300";
  const bgColor = isUploading
    ? "bg-green-50/70"
    : isDragOver
    ? "bg-indigo-50/70"
    : "bg-white";
  const uploadAreaStyles = isUploading ? "border-solid" : "border-dashed";

  const blinkClass = docCount === 0 && !isUploading ? "animate-pulse" : "";

  const shouldHighlight = currentStepId === 2;

  return (
    <div
      className={`p-6 text-center rounded-xl transition-colors duration-200 border-2 ${uploadAreaStyles} ${borderColor} ${bgColor} shadow-md ${
        shouldHighlight ? "shadow-[0_0_15px_rgba(99,102,241,0.5)]" : ""
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setIsDragOver(false);
      }}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center">
        <UploadCloud
          className="w-6 h-6 mx-auto mb-2 text-indigo-500"
          strokeWidth="1.5"
        />
        <p className="text-sm font-medium text-gray-700">
          Drop files here or click to upload
        </p>
        <p className="text-xs text-gray-400 mb-4">
          PDF, DOCX, PPTX, XLSX, XLS files only
        </p>

        <label htmlFor="sidebar-file-upload" className="cursor-pointer">
          <div
            className={`inline-flex items-center text-white text-sm font-medium px-6 py-2 rounded-full transition shadow-md bg-gradient-to-t from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 border border-indigo-400 ${blinkClass} ${
              shouldHighlight ? "shadow-[0_0_20px_rgba(34,197,94,0.6)]" : ""
            }`}
          >
            + Choose File
          </div>
          <input
            type="file"
            id="sidebar-file-upload"
            multiple
            className="hidden"
            onChange={handleFileChange}
            accept=".pdf,.docx,.pptx,.xlsx,.xls"
            disabled={isUploading}
          />
        </label>
      </div>
    </div>
  );
};

// --- MAIN APP CONSOLE ---

interface AppConsoleProps {
  onDocumentsPanelToggle: (isOpen: boolean) => void;
  currentStepId: number;
  setCurrentStepId: (id: number) => void;
}

const AppConsole: FC<AppConsoleProps> = ({
  onDocumentsPanelToggle,
  currentStepId,
  setCurrentStepId,
}) => {
  const [isDocumentsPanelOpen, setIsDocumentsPanelOpen] =
    useState<boolean>(false);
  const [documents, setDocuments] = useState<KnowledgeDocument[]>(MOCK_DOCS);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isHotMicOff, setIsHotMicOff] = useState<boolean>(false);

  const [meetingUrl, setMeetingUrl] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ type: 'bot' | 'user'; text: string }>>([
    {
      type: 'bot',
      text: "Hello! I'm your SpikedAI Agent. How can I help you manage the platform today?"
    }
  ]);
  const [chatInput, setChatInput] = useState("");

  // --- Upload handler (step 2) ---

  const handleFileSelect = useCallback(
    (files: FileList): void => {
      const fileArray = Array.from(files);
      if (fileArray.length === 0) return;

      setIsUploading(true);
      // If on step 2, stay on step 2 while uploading
      if (currentStepId === 2) {
        setCurrentStepId(2);
      }

      const newDocs: KnowledgeDocument[] = fileArray.map((file) => ({
        id: crypto.randomUUID(),
        name: file.name,
        sizeKB: Math.round(file.size / 1024),
        uploadDate: new Date(),
        status: "processing",
      }));

      setDocuments((prev) => [...newDocs, ...prev]);

      setTimeout(() => {
        setDocuments((prev) =>
          prev.map((doc) =>
            newDocs.some((newDoc) => newDoc.id === doc.id)
              ? { ...doc, status: "indexed" as const }
              : doc
          )
        );
        setIsUploading(false);
        if (currentStepId === 2) {
          setCurrentStepId(3); // upload completed, move to step 3 (Connect)
        }
      }, 2000);
    },
    [currentStepId, setCurrentStepId]
  );

  const deleteDocument = useCallback((id: string): void => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
  }, []);

  // --- Toggle Docs panel (step 1) ---

  const toggleDocumentsPanel = useCallback(() => {
    const newState = !isDocumentsPanelOpen;
    setIsDocumentsPanelOpen(newState);
    onDocumentsPanelToggle(newState);
    
    // When opening documents panel, move to step 2 if currently on step 1
    if (newState && currentStepId === 1) {
      setCurrentStepId(2);
    }
  }, [
    isDocumentsPanelOpen,
    onDocumentsPanelToggle,
    currentStepId,
    setCurrentStepId,
  ]);

  const HeaderButton: FC<{
    icon: React.ReactNode;
    active?: boolean;
    onClick?: () => void;
    shouldHighlight?: boolean;
  }> = ({ icon, active = false, onClick, shouldHighlight = false }) => {
    return (
      <button
        className={`p-2 rounded-full transition ${
          active ? "bg-white shadow-xl ring-2 ring-indigo-500/50" : "text-gray-500 hover:bg-gray-100"
        } ${
          shouldHighlight ? "shadow-[0_0_15px_rgba(99,102,241,0.5)]" : ""
        }`}
        onClick={onClick}
      >
        {icon}
      </button>
    );
  };

  // --- Meet URL + Connect (step 3-4) ---

  const handleMeetingUrlChange = (value: string) => {
    setMeetingUrl(value);
    // User can paste URL while on step 3, but step advances when they click connect
  };

  const handleConnectMeet = () => {
    if (!meetingUrl.trim()) return;

    if (currentStepId === 3) {
      // Stay on step 3 while connecting
    }

    setIsConnecting(true);
    setIsConnected(false);

    // simulate connecting
    setTimeout(() => {
      setIsConnecting(false);
      setIsConnected(true);
      // final state (step 4 - Connected)
      setTimeout(() => {
        setCurrentStepId(4);
      }, 800);
    }, 1500);
  };

  // --- RENDER SECTIONS ---

  const renderHeader = () => (
    <header className="flex flex-col md:flex-row items-stretch md:items-center justify-between p-2 md:p-3 bg-white border-b border-gray-100 shadow-md flex-shrink-0 gap-2 md:gap-0">
      <div className="flex flex-col md:flex-row items-stretch md:items-center space-y-2 md:space-y-0 md:space-x-4 flex-grow">
        {/* Logo */}
        <div className="flex items-center font-bold text-red-600 text-sm md:text-base lg:text-lg tracking-tight pr-2 md:pr-4 border-r border-gray-200">
          <div className="w-5 h-5 md:w-6 md:h-6 bg-red-600 rounded flex items-center justify-center mr-1 md:mr-2">
            <span className="text-white text-[10px] md:text-xs font-bold">!</span>
          </div>
          <span className="hidden sm:inline">SpikedAI Conversational AI Platform</span>
          <span className="sm:hidden">SpikedAI</span>
          <span className="text-[10px] md:text-xs font-normal text-gray-500 ml-1">v2.1</span>
        </div>

        {/* Meet URL input */}
        <div className="flex items-center border border-gray-300 rounded-full bg-gray-50 overflow-hidden flex-grow max-w-full md:max-w-md">
          <Paperclip className="w-3 h-3 md:w-4 md:h-4 text-gray-400 ml-2 md:ml-3 flex-shrink-0" />
          <input
            type="text"
            placeholder="Paste your meeting URL here..."
            className="flex-grow p-1.5 md:p-2 bg-transparent text-xs md:text-sm focus:outline-none"
            value={meetingUrl}
            onChange={(e) => handleMeetingUrlChange(e.target.value)}
          />
        </div>

        {/* Connect button */}
        <button
          className={`px-3 md:px-5 py-1.5 md:py-2 text-xs md:text-sm font-semibold rounded-full transition shadow-lg flex items-center justify-center space-x-1 md:space-x-2 flex-shrink-0 ${
            isConnected
              ? "bg-green-600 text-white"
              : isConnecting
              ? "bg-indigo-500 text-white"
              : "bg-gray-600 text-white hover:bg-gray-700"
          } ${
            currentStepId === 3 ? "shadow-[0_0_20px_rgba(34,197,94,0.6)]" : ""
          }`}
          onClick={handleConnectMeet}
        >
          <Calendar className="w-3 h-3 md:w-4 md:h-4" />
          <span className="hidden sm:inline">
            {isConnected
              ? "Connected"
              : isConnecting
              ? "Connecting..."
              : "Connect Meet"}
          </span>
          <span className="sm:hidden">
            {isConnected ? "✓" : isConnecting ? "..." : "Connect"}
          </span>
        </button>
      </div>

      <div className="flex items-center space-x-1 md:space-x-2 border-t md:border-t-0 md:border-l border-gray-200 pt-2 md:pt-0 md:pl-4">
        <HeaderButton
          icon={<Settings className="w-5 h-5" />}
        />
        <HeaderButton
          icon={<FileText className="w-5 h-5" />}
          active={isDocumentsPanelOpen}
          onClick={toggleDocumentsPanel}
          shouldHighlight={currentStepId === 1}
        />
        <HeaderButton icon={<Brain className="w-5 h-5" />} />
        <HeaderButton icon={<Pen className="w-5 h-5" />} />
        <HeaderButton icon={<Folder className="w-5 h-5" />} />
        <HeaderButton icon={<User className="w-5 h-5" />} />
      </div>
    </header>
  );

  const renderLiveTranscriptionPanel = () => (
    <div className="hidden md:flex w-[200px] flex-shrink-0 bg-white border-r border-gray-200 p-4 flex flex-col h-full overflow-y-auto">
      <div className="flex items-center mb-4 text-gray-700 flex-shrink-0">
        <Headphones className="w-5 h-5 mr-2" />
        <span className="font-semibold text-sm">Live-Assist</span>
        <div className="ml-auto flex items-center space-x-1">
          <TrendingUp className="w-3 h-3 text-gray-400" />
          <span className="text-xs text-gray-400">0 entries</span>
        </div>
      </div>

      <div className="text-sm mb-4 flex-shrink-0">
        <p className="text-xs text-gray-500 mb-3">
          Real-time meeting insights
        </p>

        {/* Hot mic */}
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center space-x-1">
            <Mic className="w-3 h-3 text-red-500" />
            <span className="text-gray-700 text-xs">Hot Mic Off</span>
          </div>
          <div
            className={`relative inline-block w-10 h-6 align-middle select-none transition duration-200 ease-in ${
              isHotMicOff ? "bg-gray-200" : "bg-green-500"
            } rounded-full`}
          >
            <input
              type="checkbox"
              name="toggle"
              id="hotMicToggle"
              checked={!isHotMicOff}
              onChange={() => setIsHotMicOff((prev) => !prev)}
              className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-2 appearance-none cursor-pointer top-0.5"
              style={{
                left: isHotMicOff ? "2px" : "22px",
                boxShadow: "0 0 1px 1px rgba(0,0,0,0.1)",
              }}
            />
            <label
              htmlFor="hotMicToggle"
              className="toggle-label block overflow-hidden h-6 rounded-full cursor-pointer"
            ></label>
          </div>
        </div>

        {/* Mode switch */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-indigo-600 rounded"></div>
            <span className="text-xs text-indigo-600 font-medium">Mode R</span>
          </div>
          <button className="text-xs font-semibold text-indigo-600 border border-indigo-600 rounded px-2 py-0.5 hover:bg-indigo-50 transition flex items-center space-x-1">
            <Star className="w-3 h-3" />
            <span>Switch to V</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center flex-grow text-center text-gray-500 p-8">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
          <Headphones className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-xs font-medium">
          {isConnected
            ? "Bot is connected. Transcript will appear here."
            : "No transcription yet"}
        </p>
        {!isConnected && (
          <p className="text-xs mt-1 text-gray-400">
            Connect your meeting bot to start real-time transcription
          </p>
        )}
      </div>
    </div>
  );

  const renderCentralPanel = () => (
    <div className="flex-grow min-w-0 bg-white p-6 flex flex-col h-full overflow-hidden">
      <div className="flex justify-start items-center space-x-4 pb-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <Brain className="w-5 h-5 text-indigo-600" />
          <span className="font-semibold text-base text-gray-800">Answer-Assist</span>
        </div>

        <div className="flex items-center space-x-2">
          <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
            Document: <span className="font-bold">{documents.length}</span>
          </div>
          <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
            Web Crawls: <span className="font-bold">5</span>
          </div>
        </div>

        <div className="flex items-center space-x-2 ml-auto">
          <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
            <RotateCcw className="w-4 h-4" />
          </button>
          <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chat Interface or Empty State */}
      {isChatOpen ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Chat Header */}
          <div className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              <span className="font-semibold text-sm">SpikedAI Agent</span>
            </div>
            <button
              onClick={() => setIsChatOpen(false)}
              className="p-1 hover:bg-blue-700 rounded transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    msg.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  <div className="text-sm whitespace-pre-line leading-relaxed">{msg.text}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-3 bg-white flex-shrink-0">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleChatSend()}
                placeholder="Ask about system config..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleChatSend}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center flex-grow text-center text-gray-500 p-8 overflow-y-auto">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Brain className="w-12 h-12 text-gray-300" />
          </div>
          <h3 className="font-semibold text-lg text-gray-700 mb-2">
            Ready to assist
          </h3>
          <p className="text-sm max-w-sm text-gray-500">
            Click the chatbot button to start a conversation.
          </p>
        </div>
      )}
    </div>
  );

  const renderIntelliAssistPanel = () => {
    const filterTabs = [
      "All",
      "Meeting Questions",
      "Sources",
      "Client Questions",
      "$ User Questions",
      "Live Sentiment",
      "Playbook",
    ];

    const salesFrameworkItems = [
      "Metrics",
      "Economic Buyer",
      "Decision Criteria",
      "Decision Process",
      "Pain Points",
    ];

    const toggleItem = (item: string) => {
      setExpandedItems((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(item)) {
          newSet.delete(item);
        } else {
          newSet.add(item);
        }
        return newSet;
      });
    };

    return (
      <div className="hidden md:flex w-[280px] flex-shrink-0 bg-white border-l border-gray-200 p-4 flex flex-col h-full overflow-y-auto relative">
        <div className="flex items-center mb-4 text-gray-700 flex-shrink-0">
          <Target className="w-5 h-5 mr-2" />
          <span className="font-semibold text-sm">Intelli-Assist</span>
        </div>

        <p className="text-xs text-gray-500 mb-4 flex-shrink-0">
          Sources, follow-ups & sales insights.
        </p>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-1 mb-4 flex-shrink-0">
          {filterTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-2 py-1 text-xs rounded transition ${
                activeFilter === tab
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Live Playbook Section */}
        <div className="mb-4 flex-shrink-0">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-purple-800">
                Live Playbook
              </span>
              <span className="px-2 py-0.5 bg-purple-200 text-purple-800 text-xs font-semibold rounded">
                Sales Qualification
              </span>
            </div>

            {/* Buying Signals Detected */}
            <div className="bg-white rounded-lg p-3 mb-3 border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-xs font-semibold text-gray-700">
                    Buying Signals Detected
                  </span>
                </div>
                <Zap className="w-4 h-4 text-yellow-500" />
              </div>
              <div className="mt-2">
                <div className="text-2xl font-bold text-green-600">0</div>
                <div className="text-xs text-gray-500">points</div>
                <div className="text-xs text-gray-500 mt-1">0 signals detected</div>
              </div>
            </div>

            {/* Sales Framework */}
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-gray-600" />
                  <span className="text-xs font-semibold text-gray-700">
                    Sales Framework
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Settings className="w-3 h-3 text-gray-500" />
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded">
                    Sales Framework
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                {salesFrameworkItems.map((item) => (
                  <button
                    key={item}
                    onClick={() => toggleItem(item)}
                    className="w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded text-left transition"
                  >
                    <div className="flex items-center space-x-2">
                      <Zap className="w-3 h-3 text-indigo-500" />
                      <span className="text-xs text-gray-700">{item}</span>
                    </div>
                    <ChevronRight
                      className={`w-3 h-3 text-gray-400 transition ${
                        expandedItems.has(item) ? "rotate-90" : ""
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Floating button */}
        <button 
          onClick={() => setIsChatOpen(true)}
          className="absolute bottom-6 right-6 w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition flex items-center justify-center z-10"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      </div>
    );
  };

  const renderDocumentsPanel = () => (
    <div
      className={`transition-all duration-300 min-w-0 ${
        isDocumentsPanelOpen ? "w-[300px] flex-shrink-0" : "w-0 overflow-hidden"
      }`}
    >
      <div className="bg-white border-l border-gray-200 p-4 h-full flex flex-col shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4 flex-shrink-0">
          <div className="flex flex-col">
            <h2 className="text-base font-semibold text-gray-800 flex items-center">
              <FileText className="w-4 h-4 mr-2 text-indigo-600" />
              Documents
            </h2>
            <p className="text-xs text-gray-500 mt-1">Manage your knowledge base</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              className="p-1 text-gray-500 hover:bg-gray-100 rounded-full"
              onClick={toggleDocumentsPanel}
              aria-label="Minimize Documents"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
            <button
              className="p-1 text-gray-500 hover:bg-gray-100 rounded-full"
              onClick={toggleDocumentsPanel}
              aria-label="Close Documents"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-shrink-0">
          <UploadArea
            onFileSelect={handleFileSelect}
            isUploading={isUploading}
            docCount={documents.length}
            currentStepId={currentStepId}
          />
        </div>

        <div className="flex items-center justify-between pt-4 pb-2 flex-shrink-0">
          <h3 className="text-sm font-medium text-gray-700">
            Document: {documents.length}
          </h3>
        </div>

        <div className="space-y-2 flex-grow overflow-y-auto pr-2">
          {documents.map((doc) => (
            <DocumentItem key={doc.id} doc={doc} onDelete={deleteDocument} />
          ))}
          {documents.length === 0 && (
            <div className="text-center p-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <p className="text-sm text-gray-500">No documents uploaded.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const handleChatSend = () => {
    if (!chatInput.trim()) return;
    
    const userMessage = chatInput.trim();
    
    // Add user message
    setChatMessages(prev => [...prev, { type: 'user', text: userMessage }]);
    
    // Simulate bot response based on user input
    setTimeout(() => {
      let botResponse = "";
      if (userMessage.toLowerCase().includes('connect') || userMessage.toLowerCase().includes('bot')) {
        botResponse = "Steps:\n\n• Get the URL: Copy your meeting URL from a supported platform like Google Meet.\n\n• Connect the Bot: Click the Connect Meet button to initiate the connection.\n\n• Admit the Bot: When prompted, click Admit to allow the bot (named \"SpikedAI\") into the meeting.\n\n• Note: Ensure you are using a supported video conferencing platform and that the meeting URL is valid.";
      } else {
        botResponse = "I'm here to help! How can I assist you with the SpikedAI platform today?";
      }
      
      setChatMessages(prev => [...prev, {
        type: 'bot',
        text: botResponse
      }]);
    }, 1000);
    
    setChatInput("");
  };


  return (
    <div className="min-h-full flex flex-col bg-gray-50 font-sans antialiased h-full overflow-y-auto relative">
      {renderHeader()}
      <div className="flex flex-1 overflow-hidden">
        {renderLiveTranscriptionPanel()}
        {renderCentralPanel()}
        {isDocumentsPanelOpen ? renderDocumentsPanel() : renderIntelliAssistPanel()}
      </div>
    </div>
  );
};

// --- OUTER LAYOUT ---

const AppWalkthroughLayout: FC = () => {
  const [isDocumentsPanelOpen, setIsDocumentsPanelOpen] = useState(false);
  const [currentStepId, setCurrentStepId] = useState(1);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const voicesLoadedRef = useRef(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const handleToggle = (isOpen: boolean) => {
    setIsDocumentsPanelOpen(isOpen);
  };


  // Create text content to read based on current step
  const getTextContent = () => {
    const articleTitle = "Document Upload & Meeting Bot Journey";
    const currentStep = FULL_GUIDE_STEPS.find(s => s.id === currentStepId);
    const stepDescription = currentStep ? currentStep.title : "";
    
    let actionText = "";
    let navigationGuidance = "";
    
    if (currentStepId === 1) {
      actionText = "Click the Documents button in the top header.";
      navigationGuidance = "You are on step 1 of 4. Complete the current step, then click the Next Step button in the header to proceed. You can also use the Undo button to reset your progress.";
    } else if (currentStepId === 2) {
      actionText = "Click the Choose File button in the Documents panel or drag and drop your file.";
      navigationGuidance = "You are on step 2 of 4. Complete the current step, then click the Next Step button in the header to proceed.";
    } else if (currentStepId === 3) {
      actionText = "Paste your Google Meet link into the URL bar on top, then click the Connect Meet button.";
      navigationGuidance = "You are on step 3 of 4. Complete the current step, then click the Next Step button in the header to proceed.";
    } else if (currentStepId >= 4) {
      actionText = "All steps completed. Document is indexed and your bot is connected to the meeting.";
      navigationGuidance = "You are on step 4 of 4. This is the final step. All steps are now complete.";
    }

    const allStepsText = FULL_GUIDE_STEPS.map((step, idx) => `${idx + 1}. ${step.title}`).join(". ");

    return `${articleTitle}. Current step: ${stepDescription}. ${actionText}. ${navigationGuidance} Here are all the steps in this journey: ${allStepsText}.`;
  };

  // Ensure voices are loaded
  useEffect(() => {
    if (!('speechSynthesis' in window)) return;
    const synth = window.speechSynthesis;

    const onVoicesChanged = () => {
      const vs = synth.getVoices();
      if (vs && vs.length > 0) voicesLoadedRef.current = true;
    };

    onVoicesChanged();
    synth.addEventListener('voiceschanged', onVoicesChanged);

    return () => {
      try {
        synth.removeEventListener('voiceschanged', onVoicesChanged);
      } catch {
        /* ignore if unavailable */
      }
    };
  }, []);

  // Stop any speaking safely
  const stopSpeaking = () => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    if (utteranceRef.current) {
      utteranceRef.current.onend = null;
      utteranceRef.current.onerror = null;
      utteranceRef.current = null;
    }
    setIsSpeaking(false);
  };

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis not supported in this browser.');
      return;
    }

    if (isSpeaking) {
      stopSpeaking();
      return;
    }

    window.speechSynthesis.cancel();

    const plainText = getTextContent();
    if (!plainText.trim()) return;

    const synth = window.speechSynthesis;
    const voices = synth.getVoices();

    if (!voicesLoadedRef.current || (voices && voices.length === 0)) {
      const dummy = new SpeechSynthesisUtterance(' ');
      synth.speak(dummy);
      dummy.onend = () => {
        voicesLoadedRef.current = true;
      };
    }

    const u = new SpeechSynthesisUtterance(plainText);
    utteranceRef.current = u;
    u.rate = 1;
    u.pitch = 1;

    const englishVoice = voices.find(v => v.lang === 'en-US') || voices.find(v => v.lang.startsWith('en')) || undefined;
    if (englishVoice) u.voice = englishVoice;

    let endedOrErrored = false;
    u.onstart = () => {
      setIsSpeaking(true);
    };
    u.onend = () => {
      if (endedOrErrored) return;
      endedOrErrored = true;
      setIsSpeaking(false);
      utteranceRef.current = null;
    };
    u.onerror = () => {
      if (endedOrErrored) return;
      endedOrErrored = true;
      setIsSpeaking(false);
      utteranceRef.current = null;
    };

    synth.speak(u);
  };

  // Stop speaking when step changes
  useEffect(() => {
    if (isSpeaking) {
      stopSpeaking();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStepId]);

  // Reset function
  const handleReset = () => {
    stopSpeaking();
    setCurrentStepId(1);
    setIsDocumentsPanelOpen(false);
    setResetKey(prev => prev + 1); // Force AppConsole remount
  };


  // Create short labels for the top bar steps
  const topSteps = [
    { label: '1', text: 'Documents' },
    { label: '2', text: 'Choose File' },
    { label: '3', text: 'Connect' },
    { label: '4', text: 'Connected' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans antialiased flex flex-col">
      {/* TOP BLACK BAR */}
      <div className="w-full bg-[#020617] text-white py-3 px-4 md:px-10 flex flex-wrap items-center justify-between gap-2 md:gap-4 shadow-md rounded-b-xl">
        <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-shrink">
          <span className="text-sm md:text-base lg:text-lg uppercase tracking-widest font-semibold text-white whitespace-nowrap">
            <span className="hidden sm:inline">DOCUMENT UPLOAD & MEETING BOT JOURNEY</span>
            <span className="sm:hidden">DOC & MEET BOT</span>
          </span>
        </div>
        <div className="flex items-center gap-1 md:gap-2 overflow-x-auto">
          {topSteps.map((step, index) => {
            const stepNumber = index + 1;
            const isActive = stepNumber === currentStepId;
            const isCompleted = stepNumber < currentStepId;
            return (
              <div
                key={step.label}
                className="flex items-center gap-1 md:gap-2 text-[10px] md:text-xs cursor-pointer transition-all flex-shrink-0"
                onClick={() => {
                  // Allow clicking to jump to steps (optional - can be removed if not needed)
                  if (stepNumber <= currentStepId || stepNumber === currentStepId + 1) {
                    setCurrentStepId(stepNumber);
                  }
                }}
              >
                <div
                  className={`
                    w-5 h-5 md:w-6 md:h-6 flex items-center justify-center rounded-full border text-[10px] md:text-[11px] font-semibold
                    ${isActive ? 'bg-white text-black border-white' : ''}
                    ${isCompleted && !isActive ? 'bg-green-500 border-green-500 text-white' : ''}
                    ${!isActive && !isCompleted ? 'border-gray-600 text-gray-300' : ''}
                  `}
                >
                  {isCompleted && !isActive ? <CheckCircle className="w-3 h-3" /> : step.label}
                </div>
                <span
                  className={`
                    hidden md:inline-block whitespace-nowrap
                    ${isActive ? 'text-white' : 'text-gray-400'}
                  `}
                >
                  {step.text}
                </span>
              </div>
            );
          })}
        </div>
        <div className="flex items-center ml-0 md:ml-4 space-x-2 md:space-x-3 flex-wrap gap-2">
          <button
            onClick={handleSpeak}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors text-sm ${
              isSpeaking
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
            }`}
          >
            {isSpeaking ? (
              <>
                <X className="w-4 h-4 mr-2" /> Stop Reading
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 mr-2" /> Read Aloud
              </>
            )}
          </button>
          <button
            onClick={handleReset}
            disabled={currentStepId === 1}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors text-sm ${
              currentStepId > 1
                ? 'bg-white text-gray-800 border border-gray-700 hover:bg-gray-100'
                : 'bg-gray-600 opacity-50 text-white cursor-not-allowed'
            }`}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Undo
          </button>
          <button
            onClick={() => {
              if (currentStepId < 4) {
                setCurrentStepId(currentStepId + 1);
              }
            }}
            disabled={currentStepId >= 4}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors text-sm ${
              currentStepId < 4
                ? 'bg-indigo-400 text-gray-900 font-semibold hover:bg-indigo-300'
                : 'bg-indigo-600 opacity-50 text-white cursor-not-allowed'
            }`}
          >
            <ChevronRight className="w-4 h-4 mr-2" />
            Next Step ({currentStepId}/4)
          </button>
        </div>
      </div>

      <div className="flex-1 flex justify-center items-center p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl w-full flex flex-col lg:flex-row bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100 min-h-[90vh] lg:h-[90vh]">
        {/* Left: Article + steps */}
        <div
          className={`p-4 md:p-6 lg:p-12 flex flex-col justify-start border-r-0 lg:border-r border-gray-100 overflow-y-auto transition-all duration-300 ${
            isDocumentsPanelOpen ? "lg:w-1/4" : "lg:w-1/3"
          } w-full lg:flex-shrink-0`}
        >
          <h1 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-800 mb-4 md:mb-6">
            Article: Upload a Document & Connect Your Meeting Bot
          </h1>

          <InteractiveGuide currentStepId={currentStepId} />

          <div className="mt-8 p-4 bg-yellow-50 border-l-4 border-yellow-500 text-yellow-800 rounded-md shadow-sm flex-shrink-0">
            <p className="font-semibold">Current Action:</p>

            {currentStepId === 1 && (
              <p>Click the <b>Documents</b> button in the top header.</p>
            )}
            {currentStepId === 2 && (
              <p>Click the <b>+ Choose File</b> button in the Documents panel or drag and drop your file.</p>
            )}
            {currentStepId === 3 && (
              <p>Paste your <b>Google Meet</b> link into the URL bar on top, then click the <b>Connect Meet</b> button.</p>
            )}
            {currentStepId >= 4 && (
              <p className="text-green-700">
                All steps completed. Document is indexed and your bot is
                connected to the meeting.
              </p>
            )}
          </div>
        </div>

        {/* Right: App console */}
        <div
          className={`bg-gray-100 flex-grow flex flex-col h-full transition-all duration-300 min-w-0 ${
            isDocumentsPanelOpen ? "lg:w-3/4" : "lg:w-2/3"
          } w-full`}
        >
          <div className="w-full bg-white flex-grow h-full">
            <AppConsole
              key={resetKey}
              onDocumentsPanelToggle={handleToggle}
              currentStepId={currentStepId}
              setCurrentStepId={setCurrentStepId}
            />
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default AppWalkthroughLayout;