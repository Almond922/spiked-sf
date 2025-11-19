import React, { FC, useState } from 'react';
import { 
    ArrowLeft, 
    Plus, 
    Settings, 
    CheckCircle, 
    Headphones, 
    Share2, 
    Save, 
    Send, 
    ChevronDown, 
    List, 
    MessageCircle, 
    Zap, 
    Activity,
    Users,
    X,
    BookOpen,
    FileText,
    Volume2
} from 'lucide-react';

// ======================================================================
// 0. SMALL TOP STEPS BAR
// ======================================================================

const steps = [
    'Sign In',
    'Connect Meeting',
    'Select Template',
    'Review & Share'
];

interface StepsBarProps {
    currentStepIndex: number;
}

const StepsBar: FC<StepsBarProps> = ({ currentStepIndex }) => {
    return (
        <div className="w-full border-b border-gray-200 bg-white">
            <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
                <div className="flex items-center space-x-4 text-xs font-medium text-gray-700">
                    {steps.map((step, index) => {
                        const isCompleted = index < currentStepIndex;
                        const isCurrent = index === currentStepIndex;
                        return (
                            <div key={step} className="flex items-center">
                                {index !== 0 && (
                                    <span className="mx-2 h-px w-6 bg-gray-300" />
                                )}
                                <div className="flex items-center">
                                    {isCompleted && (
                                        <CheckCircle className="w-4 h-4 mr-1 text-black" />
                                    )}
                                    <span
                                        className={
                                            isCompleted
                                                ? 'line-through text-black'
                                                : isCurrent
                                                ? 'text-red-600'
                                                : 'text-gray-500'
                                        }
                                    >
                                        {step}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="hidden sm:flex items-center text-xs text-gray-500">
                    <span className="font-semibold mr-1">Flow:</span>
                    <span>Sign In → Meeting → Template → Share</span>
                </div>
            </div>
        </div>
    );
};

// ======================================================================
// --- 1. ARTICLE COMPONENT: How to use Note Taker (New) ---
// ======================================================================

interface NoteTakerArticleProps {
    onBack: () => void;
}

const NoteTakerArticle: FC<NoteTakerArticleProps> = ({ onBack }) => {
    return (
        <div className="flex flex-col h-screen w-full bg-white overflow-hidden text-gray-900">

            {/* Steps Bar for Article View (assume user is at "Review & Share") */}
            <StepsBar currentStepIndex={3} />

            <div className="flex flex-1 justify-center">
                {/* Left Sidebar / Back Button Area */}
                <div className="w-16 flex-shrink-0 flex justify-center pt-8">
                    <button 
                        onClick={onBack}
                        className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition"
                        title="Back to Dashboard"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                </div>

                {/* Main Article Content Area */}
                <div className="flex-grow max-w-4xl pt-10 pb-10 overflow-y-auto px-4">
                    <div className="bg-white p-8 rounded-lg">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h1 className="text-4xl font-extrabold text-gray-900 mb-2 flex items-center">
                                    <FileText className="w-8 h-8 mr-3 text-red-600" /> 
                                    Article: How to Use Note Taker (SpikedAI)
                                </h1>
                                <p className="text-gray-500 mb-3 text-lg">
                                    A step-by-step guide to setting up and leveraging the AI Note Taker in your meetings.
                                </p>
                            </div>

                            {/* Read Aloud placeholder button */}
                            <button
                                className="flex items-center px-3 py-2 text-xs font-medium rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50"
                                title="Read this article aloud"
                            >
                                <Volume2 className="w-4 h-4 mr-1" />
                                Read Aloud
                            </button>
                        </div>

                        <hr className="mb-8" />

                        {/* Step 1: Connect the Meeting */}
                        <div className="mb-10">
                            <h2 className="text-2xl font-bold text-red-600 mb-4 flex items-center">
                                1. Connect the Meeting 📞
                            </h2>
                            <p className="text-gray-700 mb-4">
                                The SpikedAI Note Taker integrates directly with popular video conferencing tools like Google Meet, Zoom, and Microsoft Teams.
                            </p>
                            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                                <li>
                                    <span className="font-semibold">For Scheduled Meetings:</span> Ensure the SpikedAI bot is invited to the calendar event. It will automatically join and start transcribing when the meeting begins.
                                </li>
                                <li>
                                    <span className="font-semibold">For Ad-Hoc Meetings:</span> Copy the meeting URL from your conferencing software (e.g., Google Meet URL) and paste it into the <strong>"Connect Meet"</strong> field in your SpikedAI dashboard.
                                </li>
                            </ul>
                            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                                <strong>Tip:</strong> Always check that <strong>"Live Transcription"</strong> is active (Green indicator) to ensure the AI is listening.
                            </div>
                        </div>

                        {/* Step 2: Use AI Templates */}
                        <div className="mb-10">
                            <h2 className="text-2xl font-bold text-red-600 mb-4 flex items-center">
                                2. Select or Create an AI Template 📝
                            </h2>
                            <p className="text-gray-700 mb-4">
                                Templates tell the AI what kind of analysis to perform.
                            </p>
                            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                                <li>
                                    <span className="font-semibold">Pre-built Templates:</span> Use default options like <strong>"Summary," "Action Items,"</strong> or <strong>"Sentiment Analysis"</strong> for quick, standard reports.
                                </li>
                                <li>
                                    <span className="font-semibold">Create Custom Template:</span> Click the <strong>"Create Custom Template"</strong> button in the left sidebar. This opens a modal where you define a specific <strong>Analysis Prompt</strong> (e.g., "Extract all technical requirements and list them by severity.").
                                </li>
                                <li>
                                    <span className="font-semibold">Custom Goals:</span> Your <strong>Custom Goals</strong> are automatically tracked by the AI in real-time if the information is mentioned during the conversation.
                                </li>
                            </ul>
                        </div>

                        {/* Step 3: Analyze and Share */}
                        <div className="mb-10">
                            <h2 className="text-2xl font-bold text-red-600 mb-4 flex items-center">
                                3. Analyze and Share the Insights ✨
                            </h2>
                            <p className="text-gray-700 mb-4">
                                Once the meeting is over, the AI Assistant panel on the right will generate the analysis based on your selected template.
                            </p>
                            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                                <li>
                                    <span className="font-semibold">Ask the Assistant:</span> Use the chat field in the <strong>AI Assistant</strong> panel to ask follow-up questions about the transcript, like "What were the next steps for the engineering team?"
                                </li>
                                <li>
                                    <span className="font-semibold">Share and Save:</span> Use the <strong>"Share"</strong> or <strong>"Save PDF"</strong> buttons (located near the top of the AI Assistant panel) to distribute the final transcript and analysis report to your team.
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar (Space Filler) */}
                <div className="w-16 flex-shrink-0"></div>
            </div>
        </div>
    );
};


// ======================================================================
// --- 2. MODAL AND DASHBOARD COMPONENTS (Original Code + modifications) ---
// ======================================================================

interface CreateTemplateModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const CreateTemplateModal: FC<CreateTemplateModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const themeColors = [
        { name: 'Blue', color: '#3b82f6' },
        { name: 'Green', color: '#22c55e' },
        { name: 'Red', color: '#ef4444' },
        { name: 'Pink', color: '#ec4899' },
        { name: 'Teal', color: '#14b8a6' },
        { name: 'Sky', color: '#0ea5e9' },
        { name: 'Slate', color: '#64748b' },
        { name: 'Purple', color: '#a855f7' },
    ];
    
    const [selectedColor, setSelectedColor] = useState('Blue'); 

    const handleCreate = () => {
        alert(`Template created with color: ${selectedColor}`);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 transform transition-all duration-300 scale-100">
                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">Create Custom Template</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                    {/* Template Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                            Template Name <span className="text-red-500">*</span>
                        </label>
                        <input 
                            type="text" 
                            placeholder="e.g., Risk Assessment, Technical Review" 
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 text-sm"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                            Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            placeholder="Brief description of what this template does"
                            rows={2}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 text-sm resize-none"
                        />
                    </div>

                    {/* Theme Color */}
                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-3">
                            Theme Color
                        </label>
                        <div className="flex flex-wrap gap-3">
                            {themeColors.map(item => (
                                <button
                                    key={item.name}
                                    onClick={() => setSelectedColor(item.name)}
                                    className={`flex items-center space-x-2 px-3 py-2 rounded-full text-xs font-medium transition duration-150 border ${
                                        selectedColor === item.name 
                                            ? 'border-red-500 ring-2 ring-offset-1 ring-red-500 bg-gray-50' 
                                            : 'border-gray-200 hover:bg-gray-50'
                                    }`}
                                >
                                    <span 
                                        className="w-4 h-4 rounded-full border border-gray-300" 
                                        style={{ backgroundColor: item.color }}
                                    ></span>
                                    <span>{item.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Analysis Prompt */}
                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                            Analysis Prompt <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            placeholder="Describe exactly what analysis you want the AI to perform on the meeting transcript. Be specific about the format, sections, and type of insights you want."
                            rows={6}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 text-sm resize-none"
                        />
                        <p className="mt-2 text-xs text-gray-500">
                            Tip: Use specific instructions like &quot;Create a table with...&quot;, &quot;List the top 5...&quot;, or &quot;Analyze each person's contribution...&quot;
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end space-x-3 p-5 border-t border-gray-200">
                    <button 
                        onClick={onClose} 
                        className="py-2 px-4 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleCreate} 
                        className="flex items-center py-2 px-4 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition"
                    >
                        <CheckCircle className="w-4 h-4 mr-2" /> 
                        Create Template
                    </button>
                </div>
            </div>
        </div>
    );
};

interface GoalCardProps {
    title: string;
    icon: JSX.Element;
    status: string;
}

const GoalCard: FC<GoalCardProps> = ({ title, icon, status }) => {
    const statusText = status === 'No detected evidence' ? 'text-gray-500' : 'text-green-500';

    return (
        <div className="flex items-start justify-between p-3 bg-white hover:bg-gray-50 cursor-pointer rounded-lg border border-gray-100 mb-2">
            <div className="flex items-center">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${status === 'No detected evidence' ? 'bg-red-500/10 text-red-600' : 'bg-green-500/10 text-green-600'}`}>
                    {icon}
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-800 flex items-center">
                        {title} 
                        <ChevronDown className="w-3 h-3 ml-1 text-gray-400" />
                    </p>
                    <p className={`text-xs ${statusText}`}>Status: {status}</p>
                </div>
            </div>
        </div>
    );
};


const DashboardDemo: FC<{ onViewArticle: () => void }> = ({ onViewArticle }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const customGoals = [
        { title: 'status of jira', icon: <Activity className="w-3 h-3" />, status: 'No detected evidence' },
        { title: 'economic buyer', icon: <Users className="w-3 h-3" />, status: 'No detected evidence' },
        { title: 'what are dhruv and chirag working on', icon: <MessageCircle className="w-3 h-3" />, status: 'No detected evidence' },
    ];
    
    return (
        <div className="flex flex-col h-screen w-full bg-gray-100 overflow-hidden text-gray-900">
            
            {/* Steps Bar for Dashboard (assume they are at Select Template step) */}
            <StepsBar currentStepIndex={2} />

            <div className="flex flex-1">
                {/* 1. LEFT SIDEBAR: AI Templates / Custom Goals */}
                <div className="w-72 bg-white border-r border-gray-200 flex flex-col p-4 shadow-md">
                    <div className="flex items-center mb-6">
                        <button 
                            onClick={onViewArticle}
                            className="flex items-center text-sm font-medium text-gray-600 hover:text-red-600 transition p-2 rounded-lg bg-red-50 border border-red-200 mr-2"
                        >
                            <BookOpen className="w-4 h-4 mr-1" />
                            How to Use Note Taker
                        </button>
                    </div>
                    
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">AI Templates</h2>
                    
                    {/* Create Custom Template Button */}
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center p-3 mb-6 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg text-red-700 font-medium text-sm transition"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Custom Template
                    </button>
                    
                    {/* Custom Goals List */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between cursor-pointer mb-2">
                            <p className="text-xs font-semibold text-gray-500 uppercase">
                                CUSTOM GOALS ({customGoals.length})
                            </p>
                            <Settings className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                        </div>
                        <div className="space-y-2">
                            {customGoals.map((goal, index) => (
                                <GoalCard key={index} {...goal} />
                            ))}
                        </div>
                    </div>

                    {/* Prebuilt Templates Section */}
                    <div>
                        <div className="flex items-center justify-between cursor-pointer mb-2">
                            <p className="text-xs font-semibold text-gray-500 uppercase">
                                PREBUILT TEMPLATES
                            </p>
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                        </div>
                        <div className="flex items-start p-3 bg-red-50/50 hover:bg-red-100 cursor-pointer rounded-lg border border-red-200">
                            <List className="w-5 h-5 text-red-600 mr-3 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium">Summary</p>
                                <p className="text-xs text-gray-500">
                                    Quickly summarize the meeting highlights, action items, and next steps.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* 2. CENTER PANEL: Live Transcription */}
                <div className="flex-grow flex flex-col p-6 bg-gray-50 border-r border-gray-200">
                    <h1 className="text-xl font-semibold mb-1">Live Transcription</h1>
                    <p className="text-sm text-gray-500 mb-8">Real-time meeting notes</p>
                    
                    <div className="flex-grow flex flex-col items-center justify-center p-8 bg-white rounded-xl shadow-inner border border-dashed border-gray-300">
                        <Headphones className="w-10 h-10 text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-600 mb-2">No Transcription Data</h3>
                        <p className="text-sm text-gray-400">Connect to a meeting to start.</p>
                    </div>
                </div>
                
                {/* 3. RIGHT SIDEBAR: AI Assistant */}
                <div className="w-80 bg-white flex flex-col border-l border-gray-200 shadow-md">
                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                            <Zap className="w-5 h-5 text-red-600 mr-2" /> 
                            AI Assistant
                        </h2>
                        <div className="flex space-x-2">
                            <button className="flex items-center text-sm text-gray-600 hover:text-red-600 p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition">
                                <Save className="w-4 h-4 mr-1" /> 
                                Save PDF
                            </button>
                            <button className="flex items-center text-sm text-gray-600 hover:text-red-600 p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition">
                                <Share2 className="w-4 h-4 mr-1" /> 
                                Share
                            </button>
                        </div>
                    </div>

                    <div className="flex-grow p-4 overflow-y-auto">
                        <p className="text-sm text-gray-500 mb-4">Ask me anything</p>
                    </div>

                    <div className="p-4 border-t border-gray-200">
                        <div className="relative flex items-center">
                            <input 
                                type="text" 
                                placeholder="Ask a question..." 
                                className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500 text-sm"
                            />
                            <button className="absolute right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition">
                                <Send className="w-4 h-4 transform -rotate-45" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <CreateTemplateModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
            />
        </div>
    );
};


// ======================================================================
// --- 3. ROOT APP COMPONENT (MODIFIED) ---
// ======================================================================

const NoteTakerApp: FC = () => {
    const [view, setView] = useState<'dashboard' | 'article'>('dashboard');

    return (
        <div className="font-inter h-screen w-full">
            {view === 'dashboard' ? (
                <DashboardDemo onViewArticle={() => setView('article')} />
            ) : (
                <NoteTakerArticle onBack={() => setView('dashboard')} />
            )}
        </div>
    );
};

export default NoteTakerApp;
