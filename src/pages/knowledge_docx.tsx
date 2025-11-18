import React, { useState, useCallback, FC, DragEvent, ChangeEvent } from 'react';
import { 
  Menu, FileText, Download, Trash2, UploadCloud, Clock, Mic, MessageSquare,
  Zap, Play, Pause, Settings, Grid, Minimize2, X, Plus, ChevronsDown
} from 'lucide-react';

// --- INTERFACES (TypeScript Definitions) ---

interface KnowledgeDocument {
  id: string;
  name: string;
  sizeKB: number;
  uploadDate: Date;
  status: 'indexed' | 'processing';
}

// --- MOCK DATA & UTILS ---

const MOCK_DOCS: KnowledgeDocument[] = [
  { id: 'd1', name: 'Week - 04.pdf', sizeKB: 3200, uploadDate: new Date(Date.now() - 86400000), status: 'indexed' },
  { id: 'd2', name: 'Resume_(3)[1].pdf', sizeKB: 850, uploadDate: new Date(Date.now() - 172800000), status: 'indexed' },
];

// --- SUB-COMPONENTS ---

/**
 * 1. Document Item Component
 */
const DocumentItem: FC<{ doc: KnowledgeDocument, onDelete: (id: string) => void }> = ({ doc, onDelete }) => {
  const DownloadButton = doc.status === 'indexed' ? (
    <button className="p-1 text-indigo-500 hover:text-indigo-700 transition rounded-full" aria-label="Download Document">
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
          {doc.status === 'processing' && (
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

/**
 * 2. Upload Area Component (INCLUDES BLINKING EFFECT)
 */
const UploadArea: FC<{ onFileSelect: (files: FileList) => void, isUploading: boolean }> = ({ onFileSelect, isUploading }) => {
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
      e.target.value = '';
    }
  };

  const borderColor = isUploading ? 'border-green-500' : isDragOver ? 'border-indigo-500' : 'border-gray-300';
  const bgColor = isUploading ? 'bg-green-50/70' : isDragOver ? 'bg-indigo-50/70' : 'bg-white';
  const uploadAreaStyles = isUploading ? 'border-solid' : 'border-dashed';

    // Apply blinking only if no documents are uploaded and not currently uploading
    const blinkClass = MOCK_DOCS.length === 0 && !isUploading ? 'animate-pulse' : '';


  return (
    <div 
      className={`p-6 text-center rounded-xl transition-colors duration-200 border-2 ${uploadAreaStyles} ${borderColor} ${bgColor} shadow-md`}
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
      onDragLeave={(e) => { e.preventDefault(); setIsDragOver(false); }}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center">
        <UploadCloud className="w-6 h-6 mx-auto mb-2 text-indigo-500" strokeWidth="1.5" />
        <p className="text-sm font-medium text-gray-700">Drop files here or click to upload</p>
        <p className="text-xs text-gray-400 mb-4">PDF, DOCX, PPTX, XLSX, XLS files only</p>
        
        <label htmlFor="sidebar-file-upload" className="cursor-pointer">
          <div className={`inline-flex items-center text-white text-sm font-medium px-6 py-2 rounded-full transition shadow-md bg-gradient-to-t from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 border border-indigo-400 ${blinkClass}`}>
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

// --- MAIN APPLICATION COMPONENT (AppConsole) ---

const AppConsole: FC = () => {
  const [isDocumentsPanelOpen, setIsDocumentsPanelOpen] = useState<boolean>(true);
  const [documents, setDocuments] = useState<KnowledgeDocument[]>(MOCK_DOCS);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isHotMicOff, setIsHotMicOff] = useState<boolean>(false);

  // Document Upload Handler
  const handleFileSelect = useCallback((files: FileList): void => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    setIsUploading(true);

    const newDocs: KnowledgeDocument[] = fileArray.map(file => ({
      id: crypto.randomUUID(),
      name: file.name,
      sizeKB: Math.round(file.size / 1024), 
      uploadDate: new Date(),
      status: 'processing',
    }));

    setDocuments(prev => [...newDocs, ...prev]);

    // Simulate indexing
    setTimeout(() => {
      setDocuments(prev => prev.map(doc => {
        if (newDocs.some(newDoc => newDoc.id === doc.id)) {
          return { ...doc, status: 'indexed' as const };
        }
        return doc;
      }));
      setIsUploading(false);
    }, 2000); 
  }, []);

  // Document Delete Handler
  const deleteDocument = useCallback((id: string): void => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
  }, []);

  // --- Utility Components (for Navigation/Header) ---

  const HeaderButton: FC<{ icon: React.ReactNode, active?: boolean, onClick?: () => void }> = ({ icon, active = false, onClick }) => (
    <button 
      className={`p-2 rounded-full transition ${active ? 'bg-white shadow-xl ring-2 ring-indigo-500/50' : 'text-gray-500 hover:bg-gray-100'}`}
      onClick={onClick}
    >
      {icon}
    </button>
  );

  // --- Render Sections ---

  const renderHeader = () => (
    <header className="flex items-center justify-between p-3 bg-white border-b border-gray-100 shadow-md">
      <div className="flex items-center space-x-2">
        {/* Logo/Title Section */}
        <div className="flex items-center font-bold text-red-600 text-xl tracking-tight pr-4 border-r border-gray-200">
          <Zap className="w-5 h-5 mr-1" />
          SpikedAI
          <span className="text-xs font-normal text-gray-500 ml-1">v1.7</span>
        </div>
        
        {/* Meeting URL Input */}
        <div className="flex items-center border border-gray-300 rounded-full bg-gray-50 overflow-hidden w-96">
          <Menu className="w-4 h-4 text-gray-400 ml-3" />
          <input 
            type="text" 
            placeholder="Paste your meeting URL here..." 
            className="flex-grow p-2 bg-transparent text-sm focus:outline-none"
          />
        </div>
        
        {/* Connect Button */}
        <button className="px-5 py-2 text-sm font-semibold text-white bg-gray-600 rounded-full transition hover:bg-gray-700 shadow-lg">
          Connect Meet
        </button>
      </div>

      <div className="flex items-center space-x-3">
        {/* Paused/Play Buttons */}
        <div className="flex items-center space-x-2 text-gray-500">
          <Pause className="w-4 h-4" />
          <span className="text-sm">Paused</span>
        </div>
        <button className="p-2 rounded-full bg-green-500 transition hover:bg-green-600 shadow-lg">
          <Play className="w-5 h-5 text-white fill-current" />
        </button>

        {/* Action Icons (Matching the image) */}
        <div className="flex items-center space-x-2 border-l border-gray-200 pl-4">
          <HeaderButton icon={<FileText className="w-5 h-5" />} active={isDocumentsPanelOpen} onClick={() => setIsDocumentsPanelOpen(prev => !prev)} />
          <HeaderButton icon={<Grid className="w-5 h-5" />} />
          <HeaderButton icon={<Settings className="w-5 h-5" />} />
          <HeaderButton icon={<Minimize2 className="w-5 h-5" />} />
          <HeaderButton icon={<X className="w-5 h-5" />} />
        </div>
        
      </div>
    </header>
  );

  const renderLiveTranscriptionPanel = () => (
    // Side panel with tight min-w and no shrinking
    <div className="min-w-[150px] flex-shrink-0 bg-white border-r border-gray-200 p-4 flex flex-col h-full overflow-y-auto">
      <div className="flex items-center mb-4 text-gray-700">
        <Mic className="w-5 h-5 mr-2" />
        <span className="font-semibold text-sm">Live Transcription</span>
        <span className="ml-auto text-xs text-gray-400">0 entries</span>
      </div>

      <div className="text-sm mb-4">
        <p className="text-xs text-gray-500 mb-2">Real-time meeting insights</p>
        
        {/* Hot Mic Toggle */}
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center space-x-1">
            <Mic className="w-3 h-3 text-red-500" />
            <span className="text-gray-700">Hot Mic Off</span>
          </div>
          <div className={`relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in ${isHotMicOff ? 'bg-gray-200' : 'bg-green-500'} rounded-full`}>
            <input 
              type="checkbox" 
              name="toggle" 
              id="hotMicToggle" 
              checked={!isHotMicOff} 
              onChange={() => setIsHotMicOff(prev => !prev)}
              className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
              style={{
                left: isHotMicOff ? '0' : '40%', 
                boxShadow: '0 0 1px 1px rgba(0,0,0,0.1)'
              }}
            />
            <label htmlFor="hotMicToggle" className="toggle-label block overflow-hidden h-6 rounded-full cursor-pointer"></label>
        </div>
        </div>

        {/* Mode Switch */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
            <span className="text-xs text-indigo-600 font-medium">Mode R</span>
            <button className="text-xs font-semibold text-indigo-600 border border-indigo-600 rounded px-2 py-0.5 hover:bg-indigo-50 transition">
              Switch to V
            </button>
        </div>
      </div>

      {/* No Transcription State */}
      <div className="flex flex-col items-center justify-center flex-grow text-center text-gray-500 p-8">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
          <Mic className="w-6 h-6" />
        </div>
        <p className="text-xs">No transcription yet</p>
        <p className="text-xs mt-1">Connect your meeting bot to start real-time transcription</p>
      </div>
    </div>
  );

  const renderCentralPanel = () => (
    // Central panel takes up all remaining space
    <div className="flex-grow bg-white p-6 flex flex-col h-full overflow-hidden">
      <div className="flex justify-start items-center space-x-6 pb-4 border-b border-gray-200">
        {/* AI Copilot Block */}
        <div className="flex items-center space-x-2 p-2 bg-indigo-50 rounded-lg text-indigo-700 font-semibold">
          <MessageSquare className="w-4 h-4" />
          <span className="text-sm">AI Copilot</span>
        </div>
        
        {/* Document Count Block */}
        <div className="flex items-center space-x-1 p-2 bg-indigo-50 border border-indigo-200 rounded-lg text-indigo-700 font-semibold text-xs">
          Document: 
          <span className="text-base font-bold">{documents.length}</span>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center space-x-2">
            <div className="p-2 bg-gray-100 rounded-lg text-gray-700 font-semibold text-sm">
                Manual Mode <span className="text-green-600 font-bold">ON</span>
            </div>
            
            <button className="px-3 py-2 text-sm font-semibold text-indigo-600 border border-indigo-600 rounded-lg transition hover:bg-indigo-50">
                Generate Question
            </button>

            <button className="px-3 py-2 text-sm font-semibold text-white bg-green-500 rounded-lg transition hover:bg-green-600 shadow-md">
                Auto-Answer <span className="font-bold">ON</span>
            </button>

            {/* Action Buttons */}
            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"><Clock className="w-5 h-5" /></button>
            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"><Trash2 className="w-5 h-5" /></button>
            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"><ChevronsDown className="w-5 h-5" /></button>
        </div>
        
        {/* Placeholder for remaining flex space */}
        <div className="flex-grow"></div>
      </div>

      {/* Chat Input Area */}
      <div className="mt-6 flex flex-col space-y-4">
        <div className="flex items-center space-x-3 p-4 border border-gray-300 rounded-xl bg-gray-50 shadow-inner">
          <input 
            type="text" 
            placeholder="Ask me anything about your documents..." 
            className="flex-grow p-1 bg-transparent text-gray-800 focus:outline-none"
          />
          <button className="p-2 text-gray-500 hover:text-indigo-600"><Mic className="w-5 h-5" /></button>
          <button className="p-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition">
            <Play className="w-5 h-5 fill-current" />
          </button>
        </div>
        <p className="text-xs text-yellow-600 ml-4">⚠️ Speech input not supported in this browser</p>
      </div>

      {/* Ready to Assist State */}
      <div className="flex flex-col items-center justify-center flex-grow text-center text-gray-500 p-8 mt-12">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-3">
          {/* Custom Brain Icon (Mocked with a simple SVG/Lucide icon) */}
          <Grid className="w-10 h-10 text-gray-300" /> 
        </div>
        <h3 className="font-semibold text-lg text-gray-700 mb-2">Ready to assist</h3>
        <p className="text-sm max-w-sm">Ask me anything about your uploaded documents and I'll provide insights with sources.</p>
      </div>
    </div>
  );

  const renderDocumentsPanel = () => (
    // Side panel with tight min-w and no shrinking
    <div className={`transition-all duration-300 ${isDocumentsPanelOpen ? 'min-w-[200px] flex-shrink-0' : 'w-0 overflow-hidden'}`}>
      <div className="bg-white border-l border-gray-200 p-4 h-full flex flex-col shadow-2xl">
        
        {/* Panel Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
          <h2 className="text-base font-semibold text-gray-800 flex items-center">
            <FileText className="w-4 h-4 mr-2 text-indigo-600" />
            Documents
          </h2>
          <div className="flex items-center space-x-2">
            <button className="p-1 text-gray-500 hover:bg-gray-100 rounded-full" onClick={() => setIsDocumentsPanelOpen(false)} aria-label="Minimize Documents">
              <Minimize2 className="w-4 h-4" />
            </button>
            <button className="p-1 text-gray-500 hover:bg-gray-100 rounded-full" onClick={() => setIsDocumentsPanelOpen(false)} aria-label="Close Documents">
              <X className="w-4 h-4" />
            </button>
        </div>
        </div>

        {/* Upload Section */}
        <UploadArea onFileSelect={handleFileSelect} isUploading={isUploading} />

        {/* Documents List Section Header */}
        <div className="flex items-center justify-between pt-4 pb-2">
          <h3 className="text-sm font-medium text-gray-700">Document: {documents.length}</h3>
        </div>

        {/* Documents List */}
        <div className="space-y-2 flex-grow overflow-y-auto pr-2">
          {documents.map(doc => (
            <DocumentItem 
              key={doc.id} 
              doc={doc} 
              onDelete={deleteDocument} 
            />
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

  return (
    // FIX 1: The outer AppConsole container is given a set height (h-full/min-h-full) and its 
    // vertical overflow is set to auto, enabling scrolling for the entire console content.
    // We also use flex-col to stack the header and main content area.
    <div className="min-h-full flex flex-col bg-gray-50 font-sans antialiased h-full overflow-y-auto"> 
      {renderHeader()}
      
      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {renderLiveTranscriptionPanel()}
        {renderCentralPanel()}
        {renderDocumentsPanel()}
      </div>
    </div>
  );
};

// --- CONTAINER COMPONENT (SignInLayout) ---

const SignInLayout: FC = () => {
    return (
        // FIX 2: Removed min-h-[85vh] from the outer container to let it grow or shrink naturally
        // and allow the body/viewport to handle the scrolling if the console content is too large.
        <div className="min-h-screen flex justify-center items-center bg-gray-50 p-8 font-sans antialiased">
            <div className="max-w-full w-full flex bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100 h-[90vh]"> 
                
                {/* Left Side: Article/Instructions Text */}
                <div className="w-1/2 p-12 flex flex-col justify-start border-r border-gray-100 overflow-y-auto">
                    <h1 className="text-2xl font-bold text-gray-800 mb-6">Article: How to Quickly Upload a Document</h1>
                    
                    <ol className="list-decimal pl-6 space-y-4 text-gray-700 text-lg font-medium">
                        <li>
                            Go to the <span className="text-indigo-600 font-bold">Main Console</span>
                        </li>
                        <li>
                            Click the <span className="text-indigo-600 font-bold">Documents</span> button in the console
                        </li>
                        <li>
                            Click <span className="text-indigo-600 font-bold">Choose File</span> or drag and drop your file
                        </li>
                        <li>
                            Your document will be uploaded and ready to use
                        </li>
                    </ol>

                    <div className="mt-8 p-4 bg-yellow-50 border-l-4 border-yellow-500 text-yellow-800 rounded-md shadow-sm">
                        <p className="font-semibold">Use this when:</p>
                        <p>You need to quickly upload a document right before a meeting.</p>
                    </div>
                </div>

                {/* Right Side: AppConsole UI (w-1/2, full height) */}
                <div className="w-1/2 bg-gray-100 flex-grow flex flex-col h-full"> 
                    <div className="w-full bg-white flex-grow h-full"> 
                        {/* AppConsole now handles its own vertical scrolling */}
                        <AppConsole />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignInLayout;