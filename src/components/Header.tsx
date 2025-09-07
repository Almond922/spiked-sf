import { useState } from 'react';
import { Bot, Download, FileText, Gamepad2, Layout, Loader, Mic, MicOff, Moon, NotebookPen, Pause, Play, Settings, Sun, User, X } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isDarkMode: boolean;
  setIsDarkMode: (isDarkMode: boolean) => void;
  toggleDarkMode: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  toggleNotifications: () => void;
  meetingUrl: string;
  setMeetingUrl: (url: string) => void;
  isBotRunning: boolean;
  botStatus: "idle" | "starting" | "running" | "stopping";
  startBot: () => void;
  stopBot: () => void;
  isTranscribing: boolean;
  toggleTranscription: () => void;
  isConnected: boolean;
  setShowDocuments: (show: boolean) => void;
  showDocuments: boolean;
  handleLayoutChange: (layoutId: string) => void;
  layout: string;
  navigate: (path: string) => void;
  downloadStatus: { status: string; filename: string } | null;
  previewDocument: { filename: string; url: string } | null;
  setPreviewDocument: (doc: { filename: string; url: string } | null) => void;
}

const layouts = [
  { id: 'default', name: 'Default View', desc: 'Summary on the left, full transcript on the right.', icon: Layout },
  { id: 'summary-only', name: 'Summary Only', desc: 'Focus on key takeaways and action items.', icon: NotebookPen },
  { id: 'transcript-only', name: 'Transcript Only', desc: 'Raw, unsummarized text of the conversation.', icon: FileText },
];

export default function Header({
  isDarkMode,
  setIsDarkMode,
  meetingUrl,
  setMeetingUrl,
  isBotRunning,
  botStatus,
  startBot,
  stopBot,
  isTranscribing,
  toggleTranscription,
  isConnected,
  setShowDocuments,
  showDocuments,
  handleLayoutChange,
  layout,
  navigate,
  downloadStatus,
  previewDocument,
  setPreviewDocument,
}: HeaderProps) {
  const [showLayoutMenu, setShowLayoutMenu] = useState(false);

  return (
    <>
      <div
        className={`h-screen overflow-hidden transition-all duration-300 ${
          isDarkMode
            ? "dark bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800"
            : "bg-gradient-to-br from-honeydew via-white to-non-photo-blue/20"
        }`}
      >
        {downloadStatus && (
          <div
            className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-xl flex items-center space-x-3 transition-all duration-300 ${
              downloadStatus.status === "downloading"
                ? "bg-gradient-to-r from-cerulean to-berkeley-blue text-white"
                : downloadStatus.status === "downloaded"
                ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white"
                : "bg-gradient-to-r from-red-pantone to-red-500 text-white"
            }`}
          >
            {downloadStatus.status === "downloading" ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : downloadStatus.status === "downloaded" ? (
              <Download className="w-5 h-5" />
            ) : (
              <X className="w-5 h-5" />
            )}
            <div>
              <p className="font-medium">
                {downloadStatus.status === "downloading"
                  ? `Downloading ${downloadStatus.filename}...`
                  : downloadStatus.status === "downloaded"
                  ? `Downloaded ${downloadStatus.filename}`
                  : `Failed to download ${downloadStatus.filename}`}
              </p>
              {downloadStatus.status === "downloading" && (
                <div className="w-full bg-white/30 h-1 mt-2 rounded-full overflow-hidden">
                  <div
                    className="bg-white h-full animate-pulse"
                    style={{ width: "50%" }}
                  ></div>
                </div>
              )}
            </div>
          </div>
        )}

        {previewDocument && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div
              className={`relative w-4/5 h-4/5 rounded-xl shadow-2xl overflow-hidden flex flex-col ${
                isDarkMode ? "bg-slate-800" : "bg-white"
              }`}
            >
              <div
                className={`absolute top-0 left-0 right-0 p-4 flex items-center justify-between ${
                  isDarkMode ? "bg-slate-700" : "bg-gray-100"
                }`}
              >
                <h3
                  className={`font-medium ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Previewing: {previewDocument.filename}
                </h3>
                <button
                  onClick={() => setPreviewDocument(null)}
                  className={`p-2 rounded-full ${
                    isDarkMode ? "hover:bg-slate-600" : "hover:bg-gray-200"
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="h-full pt-16">
                <iframe
                  src={previewDocument.url}
                  className="w-full h-full border-none"
                  title={`Preview of ${previewDocument.filename}`}
                />
              </div>
            </div>
          </div>
        )}

        <div
          className={`${
            isDarkMode
              ? "bg-slate-800/95 border-slate-700/50"
              : "bg-white/95 border-non-photo-blue/30"
          } backdrop-blur-xl border-b px-6 py-4 shadow-lg relative z-10`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img
                    src="/logo.png"
                    alt="SpikedAI Logo"
                    className="w-11 h-11 rounded-2lg shadow-lg object-cover"
                    style={{ background: isDarkMode ? "#0a2540" : "#e0f7fa" }}
                  />
                  <div
                    className={`absolute -top-1 -right-1 w-4 h-4 rounded-full animate-pulse shadow-sm ${
                      botStatus === "running"
                        ? "bg-gradient-to-r from-emerald-400 to-green-500"
                        : botStatus === "idle"
                        ? "bg-gradient-to-r from-red-pantone to-red-500"
                        : "bg-gradient-to-r from-amber-400 to-yellow-500"
                    }`}
                  ></div>
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
                      v1.7
                    </span>
                  </p>
                </div>
              </div>
            </div>

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
                onClick={isBotRunning ? stopBot : startBot}
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
                    ? "Stop Bot"
                    : "Connect Bot"}
                </span>
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <div
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl ${
                  isTranscribing
                    ? "bg-red-pantone/10 border border-red-pantone/30"
                    : "bg-slate-100 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600/30"
                }`}
              >
                {isTranscribing ? (
                  <Mic className="w-4 h-4 text-red-pantone animate-pulse" />
                ) : (
                  <MicOff className="w-4 h-4 text-slate-400" />
                )}
                <span
                  className={`text-sm font-medium ${
                    isTranscribing
                      ? "text-red-pantone"
                      : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {isTranscribing ? "Recording" : "Paused"}
                </span>
              </div>

              <button
                onClick={toggleTranscription}
                disabled={!isConnected}
                className={`p-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
                  isTranscribing
                    ? "bg-gradient-to-r from-red-pantone to-red-500 text-white hover:from-red-500 hover:to-red-pantone shadow-lg"
                    : "bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:from-emerald-600 hover:to-green-600 shadow-lg"
                }`}
              >
                {isTranscribing ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5" />
                )}
              </button>

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
                    Settings
                    <div
                      className={`absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 ${
                        isDarkMode ? "bg-slate-200" : "bg-slate-800"
                      }`}
                    ></div>
                  </div>
                </div>

                {/* Documents Button */}
                <div className="relative group">
                  <button
                    onClick={() => setShowDocuments(!showDocuments)}
                    className={`p-3 rounded-xl transition-all duration-300 hover:scale-105 ${
                      showDocuments
                        ? "bg-gradient-to-r from-cerulean to-berkeley-blue text-white shadow-lg"
                        : isDarkMode
                        ? "bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 hover:text-white"
                        : "bg-slate-100/80 text-slate-700 hover:bg-slate-200/80 hover:text-slate-900"
                    } backdrop-blur-sm`}
                  >
                    <FileText className="w-5 h-5" />
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
                    Documents
                    <div
                      className={`absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 ${
                        isDarkMode ? "bg-slate-200" : "bg-slate-800"
                      }`}
                    ></div>
                  </div>
                </div>

                {/* Meeting Prep Button */}
                <div className="relative group">
                  <button
                    onClick={() => navigate("/meeting-prep")}
                    className={`p-3 rounded-xl transition-all duration-300 hover:scale-105 ${
                      isDarkMode
                        ? "bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 hover:text-white"
                        : "bg-slate-100/80 text-slate-700 hover:bg-slate-200/80 hover:text-slate-900"
                    } backdrop-blur-sm`}
                  >
                    <Gamepad2 className="w-5 h-5" />
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
                    Meeting Simulator
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
                    onClick={() => navigate("/note-taker")}
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
                    Note Taker
                    <div
                      className={`absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 ${
                        isDarkMode ? "bg-slate-200" : "bg-slate-800"
                      }`}
                    ></div>
                  </div>
                </div>

                {/* Layout Menu */}
                <div className="relative group">
                  <button
                    onClick={() => setShowLayoutMenu(!showLayoutMenu)}
                    className={`p-3 rounded-xl transition-all duration-300 hover:scale-105 ${
                      isDarkMode
                        ? "bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 hover:text-white"
                        : "bg-slate-100/80 text-slate-700 hover:bg-slate-200/80 hover:text-slate-900"
                    } backdrop-blur-sm`}
                  >
                    <Layout className="w-5 h-5" />
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
                    Layout Options
                    <div
                      className={`absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 ${
                        isDarkMode ? "bg-slate-200" : "bg-slate-800"
                      }`}
                    ></div>
                  </div>

                  {showLayoutMenu && (
                    <div
                      className={`absolute right-0 mt-2 w-56 rounded-xl shadow-2xl border backdrop-blur-xl z-20 ${
                        isDarkMode
                          ? "bg-slate-800/95 border-slate-700/50"
                          : "bg-white/95 border-gray-200/50"
                      }`}
                    >
                      {layouts.map((layoutOption) => (
                        <button
                          key={layoutOption.id}
                          onClick={() => handleLayoutChange(layoutOption.id)}
                          className={`w-full px-4 py-3 text-left transition-all duration-200 first:rounded-t-xl last:rounded-b-xl flex items-center space-x-3 ${
                            layout === layoutOption.id
                              ? "bg-gradient-to-r from-cerulean/20 to-berkeley-blue/20 border-l-4 border-cerulean"
                              : "hover:bg-slate-100 dark:hover:bg-slate-700/50"
                          } ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}
                        >
                          <layoutOption.icon className="w-4 h-4" />
                          <div>
                            <div className="font-medium">{layoutOption.name}</div>
                            <div className="text-xs opacity-70">
                              {layoutOption.desc}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Dark/Light Mode Toggle */}
                <div className="relative group">
                  <button
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className={`p-3 rounded-xl transition-all duration-300 hover:scale-105 ${
                      isDarkMode
                        ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600"
                        : "bg-gradient-to-r from-berkeley-blue to-cerulean text-white hover:from-cerulean hover:to-berkeley-blue"
                    } shadow-lg`}
                  >
                    {isDarkMode ? (
                      <Sun className="w-5 h-5" />
                    ) : (
                      <Moon className="w-5 h-5" />
                    )}
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
                    {isDarkMode ? "Light Mode" : "Dark Mode"}
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
                    Profile
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
      </div>
    </>
  );
}
