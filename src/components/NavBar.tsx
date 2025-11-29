import React, { useState, useCallback, useRef, RefObject } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Loader,
    X,
    Bot,
    Settings,
    FileText,
    Puzzle,
    NotebookPen,
    Layout,
    User,
    Columns,
    Maximize,
    Minimize,
    AlertTriangle,
    Maximize2,
    Upload,
    Plus,
    File,
    Download,
    Trash2
} from 'lucide-react';

// --- Props Interface: Combined requirements from NavBar and DocumentSidebar ---
interface AppHeaderProps {
    // Theme & Navigation
    isDarkMode: boolean;
    apiStatus: 'online' | 'offline' | 'pending';

    // Bot Control State/Handlers
    meetingUrl: string;
    setMeetingUrl: (url: string) => void;
    isBotRunning: boolean;
    botStatus: 'idle' | 'starting' | 'running' | 'stopping';
    stopBot: () => void;
    handleConnectClick: () => void;

    // Layout State/Handlers
    layout: string;
    handleLayoutChange: (id: string) => void;

    // Integration Handler
    fetchSelectedJiraTasks: () => void;
}

// Placeholder for Document type
interface Document {
    filename: string;
    total_chunks: number;
}

// Layout Options (moved here for encapsulation)
const layouts = [
    { id: 'default', name: 'Default View', icon: Columns, desc: 'Chat and content side-by-side.' },
    { id: 'fullscreen', name: 'Full Chat', icon: Maximize, desc: 'Chat window maximized.' },
    { id: 'minimal', name: 'Minimal Content', icon: Minimize, desc: 'Focus on content feeds.' },
];


const AppHeader: React.FC<AppHeaderProps> = ({
    isDarkMode,
    apiStatus,
    meetingUrl,
    setMeetingUrl,
    isBotRunning,
    botStatus,
    stopBot,
    handleConnectClick,
    layout,
    handleLayoutChange,
    fetchSelectedJiraTasks,
}) => {
    const navigate = useNavigate();
    const location = useLocation();

    // --- Local State for UI Features (Layout Menu & Document Sidebar) ---
    const [showLayoutMenu, setShowLayoutMenu] = useState(false);
    const [showDocuments, setShowDocuments] = useState(false);
    
    // --- Local State for Document Management (Moved from MainLayout) ---
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [documents, setDocuments] = useState<Document[]>([
        { filename: "2024_Q3_Financial_Report.pdf", total_chunks: 15 },
        { filename: "Product_Roadmap_V3.docx", total_chunks: 8 },
    ]); // Placeholder documents
    const [isUploading, setIsUploading] = useState(false);

    // --- Document Handlers (Moved from MainLayout) ---
    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            console.log('File dropped:', e.dataTransfer.files[0].name);
            setIsUploading(true);
            setTimeout(() => {
                setDocuments(prev => [...prev, { filename: e.dataTransfer.files[0].name, total_chunks: 1 }]);
                setIsUploading(false);
            }, 1500);
        }
    }, []);

    const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            console.log('File selected:', file.name);
            setIsUploading(true);
            setTimeout(() => {
                setDocuments(prev => [...prev, { filename: file.name, total_chunks: Math.floor(Math.random() * 20) + 5 }]);
                setIsUploading(false);
            }, 1500);
        }
    }, []);

    const downloadDocument = useCallback((filename: string) => {
        console.log(`Downloading: ${filename}`);
    }, []);

    const deleteDocument = useCallback((filename: string) => {
        console.log(`Deleting: ${filename}`);
        setDocuments(prev => prev.filter(doc => doc.filename !== filename));
    }, []);
    // --- END Document Handlers ---


    const getApiStatusText = (status: 'online' | 'offline' | 'pending') => {
        switch (status) {
            case 'online': return 'API Online';
            case 'offline': return 'API Offline';
            default: return 'Checking API...';
        }
    };

    return (
        <>
            {/* ======================= 1. NAVIGATION BAR (Top Strip) ======================= */}
            <div
                className={`${
                    isDarkMode
                        ? "bg-slate-800/95 border-slate-700/50"
                        : "bg-white/95 border-non-photo-blue/30"
                } backdrop-blur-xl border-b px-6 py-4 shadow-lg sticky top-0 z-50`}
            >
                <div className="flex items-center justify-between">
                    
                    {/* 👇 MODIFIED SECTION: Logo & Title container is now clickable */}
                    {/* Left Section: Logo & Title */}
                    <div className="flex items-center space-x-6">
                        <div
                            className="flex items-center space-x-3 cursor-pointer"
                            onClick={() => navigate("/")} // <--- ADDED onClick handler to navigate to home
                        >
                            <div className="relative group">
                                {/* Logo */}
                               <img
                    src="/logo.png"
                    alt="SpikedAI Logo"
                    className="w-11 h-11 rounded-2lg shadow-lg object-cover"
                    style={{ background: isDarkMode ? "#0a2540" : "#e0f7fa" }}
                />
                                {/* API Status Indicator */}
                                <div
                                    className={`absolute -top-1 -right-1 w-4 h-4 rounded-full animate-pulse shadow-sm ${
                                        apiStatus === "online"
                                            ? "bg-gradient-to-r from-emerald-400 to-green-500"
                                            : apiStatus === "offline"
                                            ? "bg-gradient-to-r from-red-pantone to-red-500"
                                            : "bg-gradient-to-r from-amber-400 to-yellow-500"
                                    }`}
                                ></div>
                                {/* API Status Tooltip */}
                                <div className={`absolute left-1/2 transform -translate-x-1/2 mt-12 px-3 py-1 text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none ${isDarkMode ? "bg-slate-600 text-white" : "bg-gray-800 text-white"}`}>
                                    {getApiStatusText(apiStatus)}
                                </div>
                            </div>
                            <div>
                                <h1
                                    className={`text-2xl font-extrabold ${
                                        isDarkMode ? "text-white" : "text-black"
                                    }`}
                                >
                                    SpikedAI
                                </h1>
                                <p
                                    className={`text-sm font-medium ${
                                        isDarkMode ? "text-slate-300" : "text-slate-600"
                                    }`}
                                >
                                    Conversational AI Platform{" "}
                                    <span className="ml-2 px-2 py-0.5 rounded bg-cerulean/10 text-cerulean text-xs">
                                        v2.1
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Meeting Input and Connect Button */}
                    <div className="flex items-center space-x-3">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="🔗 Paste your meeting URL here..."
                                value={meetingUrl}
                                onChange={(e) => setMeetingUrl(e.target.value)}
                                className={`pl-4 pr-12 py-3 rounded-xl border-2 w-96 transition-all duration-300 focus:ring-2 focus:ring-cerulean/50 focus:border-cerulean ${
                                    isDarkMode
                                        ? "bg-slate-700/50 border-slate-600 text-white placeholder-slate-400"
                                        : "bg-white/80 border-non-photo-blue/30 text-gray-900 placeholder-slate-500 shadow-sm"
                                }`}
                            />
                            {meetingUrl && (
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={isBotRunning ? stopBot : handleConnectClick}
                            disabled={
                                !meetingUrl ||
                                botStatus === "starting" ||
                                botStatus === "stopping"
                            }
                            className={`px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 transition-all duration-300 transform hover:scale-105 ${
                                meetingUrl &&
                                !(botStatus === "starting" || botStatus === "stopping")
                                    ? isBotRunning
                                        ? "bg-gradient-to-r from-red-pantone to-red-500 text-white hover:from-red-500 hover:to-red-pantone shadow-lg"
                                        : "bg-gradient-to-r from-cerulean to-berkeley-blue text-white hover:from-berkeley-blue hover:to-cerulean shadow-lg"
                                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                            }`}
                        >
                            {botStatus === "starting" || botStatus === "stopping" ? (
                                <Loader className="w-5 h-5 animate-spin" />
                            ) : isBotRunning ? (
                                <X className="w-5 h-5" />
                            ) : (
                                <Bot className="w-5 h-5" />
                            )}
                            <span>
                                {botStatus === "starting"
                                    ? "Connecting..."
                                    : botStatus === "stopping"
                                    ? "Disconnecting..."
                                    : isBotRunning
                                    ? "Stop"
                                    : "Connect Meet"}
                            </span>
                        </button>
                    </div>

                    {/* Utility Buttons */}
                    <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-2 relative">
                            <div className="h-8 w-px bg-slate-300 dark:bg-slate-600"></div>

                            {/* Settings Button */}
                            <div className="relative group">
                                <button
                                    onClick={() => navigate("/settings")}
                                    className={`p-3 rounded-xl transition-all duration-300 hover:scale-105 ${
                                        isDarkMode
                                            ? "bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 hover:text-white"
                                            : "bg-slate-100/80 text-slate-700 hover:bg-slate-200/80 hover:text-slate-900"
                                    } backdrop-blur-sm`}
                                >
                                    <Settings className="w-5 h-5" />
                                </button>
                                <div
                                    className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 text-sm rounded-md 
                                    opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none
                                    shadow-md whitespace-nowrap z-10 ${
                                        isDarkMode
                                            ? "bg-slate-200 text-slate-800"
                                            : "bg-slate-800 text-slate-100"
                                    }`}
                                >
                                    Personalization
                                    <div
                                        className={`absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 ${
                                            isDarkMode ? "bg-slate-200" : "bg-slate-800"
                                        }`}
                                    ></div>
                                </div>
                            </div>

                            

                            {/* Integrations */}
                            <div className="relative group">
                                <button
                                    onClick={() => {
                                        navigate("/integrations");
                                        // Refresh tasks when user returns
                                        setTimeout(() => fetchSelectedJiraTasks(), 500);
                                    }}
                                    className={`p-3 rounded-xl transition-all duration-300 hover:scale-105 ${
                                        isDarkMode
                                            ? "bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 hover:text-white"
                                            : "bg-slate-100/80 text-slate-700 hover:bg-slate-200/80 hover:text-slate-900"
                                    } backdrop-blur-sm`}
                                >
                                    <Puzzle className="w-5 h-5" />
                                </button>
                                <div
                                    className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 text-sm rounded-md 
                                    opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none
                                    shadow-md whitespace-nowrap z-10 ${
                                        isDarkMode
                                            ? "bg-slate-200 text-slate-800"
                                            : "bg-slate-800 text-slate-100"
                                    }`}
                                >
                                    Integrations
                                    <div
                                        className={`absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 ${
                                            isDarkMode ? "bg-slate-200" : "bg-slate-800"
                                        }`}
                                    ></div>
                                </div>
                            </div>

                            {/* Note Taker Button */}
                            <div className="relative group">
                                <button
                                    onClick={() => window.open("/note-taker", "_blank")}
                                    className={`p-3 rounded-xl transition-all duration-300 hover:scale-105 ${
                                        isDarkMode
                                            ? "bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 hover:text-white"
                                            : "bg-slate-100/80 text-slate-700 hover:bg-slate-200/80 hover:text-slate-900"
                                    } backdrop-blur-sm`}
                                >
                                    <NotebookPen className="w-5 h-5" />
                                </button>
                                <div
                                    className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 text-sm rounded-md 
                                    opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none
                                    shadow-md whitespace-nowrap z-10 ${
                                        isDarkMode
                                            ? "bg-slate-200 text-slate-800"
                                            : "bg-slate-800 text-slate-100"
                                    }`}
                                >
                                    Analyser
                                    <div
                                        className={`absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 ${
                                            isDarkMode ? "bg-slate-200" : "bg-slate-800"
                                        }`}
                                    ></div>
                                </div>
                            </div>

                            

                            {/* User Button */}
                            <div className="relative group">
                                <button
                                    onClick={() => navigate("/admin")}
                                    className={`p-3 rounded-xl transition-all duration-300 hover:scale-105 ${
                                        isDarkMode
                                            ? "bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 hover:text-white"
                                            : "bg-slate-100/80 text-slate-700 hover:bg-slate-200/80 hover:text-slate-900"
                                    } backdrop-blur-sm`}
                                >
                                    <User className="w-5 h-5" />
                                </button>
                                <div
                                    className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 text-sm rounded-md 
                                    opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none
                                    shadow-md whitespace-nowrap z-10 ${
                                        isDarkMode
                                            ? "bg-slate-200 text-slate-800"
                                            : "bg-slate-800 text-slate-100"
                                    }`}
                                >
                                    Admin
                                    <div
                                        className={`absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 ${
                                            isDarkMode ? "bg-slate-200" : "bg-slate-800"
                                        }`}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ======================= 2. DOCUMENT SIDEBAR PANEL (Conditional) ======================= */}
            {showDocuments && (
                <div
                    className={`absolute top-[88px] right-0 w-96 h-[calc(100vh-88px)] ${
                        isDarkMode
                            ? "bg-slate-800/95 border-slate-700/50"
                            : "bg-white/95 border-non-photo-blue/30"
                    } backdrop-blur-xl border-l shadow-2xl z-20 flex flex-col`}
                >
                    {/* Header */}
                    <div
                        className={`px-6 py-4 border-b ${
                            isDarkMode ? "border-slate-700/50" : "border-non-photo-blue/30"
                        } flex items-center justify-between`}
                    >
                        <div className="flex items-center space-x-3">
                            <div
                                className={`p-2 rounded-lg ${
                                    isDarkMode ? "bg-cerulean/20" : "bg-cerulean/30"
                                }`}
                            >
                                <FileText
                                    className={`w-5 h-5 ${
                                        isDarkMode ? "text-cerulean" : "text-berkeley-blue"
                                    }`}
                                />
                            </div>
                            <div>
                                <h2
                                    className={`font-bold ${
                                        isDarkMode ? "text-white" : "text-berkeley-blue"
                                    }`}
                                >
                                    Documents
                                </h2>
                                <p
                                    className={`text-xs ${
                                        isDarkMode ? "text-slate-400" : "text-slate-500"
                                    }`}
                                >
                                    Manage your knowledge base
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() =>
                                    navigate("/documents", { state: { from: location.pathname } })
                                }
                                className={`p-2 rounded-lg transition-all duration-300 hover:scale-105 ${
                                    isDarkMode
                                        ? "bg-slate-700/50 text-slate-300 hover:bg-slate-600/50"
                                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                }`}
                                title="Expand view"
                            >
                                <Maximize2 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setShowDocuments(false)}
                                className={`p-2 rounded-lg transition-all duration-300 hover:scale-105 ${
                                    isDarkMode
                                        ? "bg-slate-700/50 text-slate-300 hover:bg-slate-600/50"
                                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                }`}
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto p-2 space-y-3 custom-scrollbar">
                        {/* Upload Section */}
                        <div
                            className={`p-6 border-b ${
                                isDarkMode ? "border-slate-700/50" : "border-non-photo-blue/30"
                            }`}
                        >
                            <div
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                                className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300 ${
                                    isDarkMode
                                        ? "border-slate-600 hover:border-cerulean bg-slate-700/30 hover:bg-slate-700/50"
                                        : "border-non-photo-blue/50 hover:border-cerulean bg-honeydew/30 hover:bg-honeydew/50"
                                }`}
                            >
                                <Upload
                                    className={`w-4 h-4 mx-auto mb-3 ${
                                        isDarkMode ? "text-slate-400" : "text-cerulean"
                                    }`}
                                />
                                <p
                                    className={`text-sm font-medium mb-2 ${
                                        isDarkMode ? "text-slate-300" : "text-berkeley-blue"
                                    }`}
                                >
                                    Drop files here or click to upload
                                </p>
                                <p
                                    className={`text-xs ${
                                        isDarkMode ? "text-slate-400" : "text-slate-500"
                                    }`}
                                >
                                    PDF, DOCX, PPTX, XLSX, XLS files only
                                </p>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading}
                                    className={`mt-3 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                                        isUploading
                                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                            : "bg-gradient-to-r from-cerulean to-berkeley-blue text-white hover:from-berkeley-blue hover:to-cerulean"
                                    }`}
                                >
                                    {isUploading ? (
                                        <div className="flex items-center space-x-2">
                                            <Loader className="w-4 h-4 animate-spin" />
                                            <span>Uploading...</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center space-x-2">
                                            <Plus className="w-4 h-4" />
                                            <span>Choose File</span>
                                        </div>
                                    )}
                                </button>
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf,.docx,.pptx,.xlsx,.xls"
                                onChange={handleFileUpload}
                                className="hidden"
                            />
                        </div>
                        
                        {/* Document Count */}
                        <span
                            className={`ml-2 px-2 py-0.5 rounded-lg text-xs font-semibold shadow-sm ${
                                isDarkMode
                                    ? "bg-non-photo-blue/20 text-non-photo-blue border border-non-photo-blue/40"
                                    : "bg-non-photo-blue/20 text-berkeley-blue border border-non-photo-blue/40"
                            }`}
                            style={{ minWidth: 48, maxWidth: 100, textAlign: "center" }}
                        >
                            Document: {documents.length}
                        </span>

                        {/* Document List */}
                        {documents.length === 0 ? (
                            <div
                                className={`text-center py-12 ${
                                    isDarkMode ? "text-slate-400" : "text-slate-500"
                                }`}
                            >
                                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p className="text-lg font-medium mb-2">No documents yet</p>
                                <p className="text-sm">
                                    Upload your first document to get started
                                </p>
                            </div>
                        ) : (
                            documents.map((doc) => (
                                <div
                                    key={doc.filename}
                                    className={`p-4 rounded-xl border transition-all duration-300 hover:shadow-md ${
                                        isDarkMode
                                            ? "bg-slate-700/50 border-slate-600/30 hover:bg-slate-600/50"
                                            : "bg-honeydew/50 border-non-photo-blue/30 hover:bg-honeydew/80"
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center space-x-3">
                                            <div
                                                className={`p-2 rounded-lg ${
                                                    isDarkMode ? "bg-cerulean/20" : "bg-cerulean/30"
                                                }`}
                                            >
                                                <File
                                                    className={`w-4 h-4 ${
                                                        isDarkMode ? "text-cerulean" : "text-berkeley-blue"
                                                    }`}
                                                />
                                            </div>
                                            <div>
                                                <p
                                                    className={`font-medium text-sm break-words whitespace-normal max-w-[200px] ${
                                                        isDarkMode ? "text-slate-300" : "text-berkeley-blue"
                                                    }`}
                                                >
                                                    {doc.filename}
                                                </p>
                                                <p
                                                    className={`text-xs ${
                                                        isDarkMode ? "text-slate-400" : "text-slate-500"
                                                    }`}
                                                >
                                                    {doc.total_chunks} chunks
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <button
                                                onClick={() => downloadDocument(doc.filename)}
                                                className={`p-2 ml-2 rounded-lg transition-all duration-300 hover:scale-105 ${
                                                    isDarkMode
                                                        ? "bg-slate-600/50 text-slate-300 hover:bg-slate-500/50"
                                                        : "bg-cerulean/10 text-cerulean hover:bg-cerulean/20"
                                                }`}
                                                title="Download"
                                            >
                                                <Download className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => deleteDocument(doc.filename)}
                                                className={`p-2 rounded-lg transition-all duration-300 hover:scale-105 ${
                                                    isDarkMode
                                                        ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                                                        : "bg-red-pantone/10 text-red-pantone hover:bg-red-pantone/20"
                                                }`}
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default AppHeader;