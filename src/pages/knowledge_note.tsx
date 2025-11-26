import React, { FC, useState, useEffect, useCallback } from 'react';
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
    Volume2,
    VolumeX,
    ClipboardList, // New icon for Template Selection
    Mail // New icon for Review & Share
} from 'lucide-react';

/* ======================================================================
    0. useSpeechSynthesis HOOK (Text-to-Speech)
    ====================================================================== */

const useSpeechSynthesis = (text: string) => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isEnabled, setIsEnabled] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const stripHtml = (html: string) =>
        html.replace(/<[^>]*>/g, ' ').replace(/\s{2,}/g, ' ').trim();

    const speak = useCallback(
        (content: string) => {
            if (!('speechSynthesis' in window)) {
                setError('Text-to-speech not supported in this browser.');
                return;
            }

            window.speechSynthesis.cancel();
            setIsSpeaking(false);

            if (!isEnabled || !content) return;

            const utterance = new SpeechSynthesisUtterance(stripHtml(content));
            utterance.rate = 1;
            utterance.pitch = 1;
            utterance.volume = 1;

            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => setIsSpeaking(false);
            utterance.onerror = () => {
                setError('An error occurred during speech.');
                setIsSpeaking(false);
            };

            window.speechSynthesis.speak(utterance);
        },
        [isEnabled]
    );

    const toggleEnabled = () => {
        setIsEnabled(prev => {
            if (prev) {
                window.speechSynthesis.cancel();
                setIsSpeaking(false);
            }
            return !prev;
        });
    };

    useEffect(() => {
        if (isEnabled && text) speak(text);
        return () => {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        };
    }, [text, isEnabled, speak]);

    useEffect(() => {
        return () => {
            window.speechSynthesis.cancel();
        };
    }, []);

    return { isSpeaking, isEnabled, toggleEnabled, error };
};

/* ======================================================================
    1. STEPS BAR (Adjusted to start at 'Select Template')
    ====================================================================== */

// We only care about these two steps now:
const steps = [
    'Select Template', // Index 0 in this array, but functionally Step 2
    'Review & Share'   // Index 1 in this array, but functionally Step 3
];

interface StepsBarProps {
    currentStepIndex: number; // 0 or 1
}

const StepsBar: FC<StepsBarProps> = ({ currentStepIndex }) => {
    return (
        <div className="w-full border-b border-gray-200 bg-white sticky top-0 z-10">
            <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
                <div className="flex items-center space-x-4 text-xs font-medium text-gray-700">
                    {steps.map((step, index) => {
                        const isCompleted = index < currentStepIndex;
                        const isCurrent = index === currentStepIndex;
                        
                        let Icon;
                        switch (index) {
                            case 0: Icon = ClipboardList; break;
                            case 1: Icon = Mail; break;
                            default: Icon = CheckCircle;
                        }

                        return (
                            <div key={step} className="flex items-center">
                                {index !== 0 && (
                                    <span className="mx-2 h-px w-6 bg-gray-300" />
                                )}
                                <div className="flex items-center">
                                    {isCompleted ? (
                                        <CheckCircle className="w-4 h-4 mr-1 text-black" />
                                    ) : (
                                        <Icon className={`w-4 h-4 mr-1 ${isCurrent ? 'text-red-600' : 'text-gray-500'}`} />
                                    )}
                                    
                                    <span
                                        className={`
                                            ${isCompleted ? 'line-through text-black' : ''}
                                            ${isCurrent ? 'text-red-600 font-bold' : 'text-gray-500'}
                                        `}
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
                    <span>Template Selection → Review & Share</span>
                </div>
            </div>
        </div>
    );
};

/* ======================================================================
    2. REVIEW & SHARE STEP (Final Step)
    ====================================================================== */

interface ReviewShareStepProps {
    onStartNew: () => void;
    onViewArticle: () => void;
}

const ReviewShareStep: FC<ReviewShareStepProps> = ({ onStartNew, onViewArticle }) => (
    <div className="flex flex-col h-full w-full bg-gray-50 p-10 justify-center items-center">
        <div className="max-w-xl w-full bg-white p-10 rounded-xl shadow-lg border border-gray-200 text-center">
            <Mail className="w-12 h-12 mx-auto text-red-600 mb-4" />
            <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
                Step 2: Review & Share Insights
            </h2>
            <p className="text-gray-500 mb-6 text-md">
                The AI analysis is complete. Review the final report and distribute it to your team.
            </p>
            <div className="flex justify-center space-x-4">
                <button className="py-3 px-6 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 flex items-center">
                    <Share2 className="w-5 h-5 mr-2" /> Share Final Report
                </button>
                <button onClick={onStartNew} className="py-3 px-6 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 flex items-center">
                    <ArrowLeft className="w-5 h-5 mr-2" /> Start New Analysis
                </button>
            </div>
            <button 
                onClick={onViewArticle} 
                className="mt-6 py-2 px-4 text-sm text-gray-500 hover:text-gray-700 flex items-center mx-auto"
            >
                <BookOpen className="w-4 h-4 mr-1" /> View How-To Guide
            </button>
        </div>
    </div>
);

/* ======================================================================
    3. ARTICLE COMPONENT (Helper/Documentation View)
    ====================================================================== */

interface NoteTakerArticleProps {
    onBack: () => void;
    currentStepIndex: number;
}

const NoteTakerArticle: FC<NoteTakerArticleProps> = ({ onBack, currentStepIndex }) => {
    const articleTtsText = `
        This article explains how to use the SpikedAI Analyser.
        Step one, connect the meeting using Google Meet, Zoom, or Microsoft Teams.
        Step two, select or create an AI template that tells the AI what kind of analysis to perform.
        Step three, analyze and share the insights using the AI assistant panel and export options.
    `;

    const { isSpeaking, isEnabled, toggleEnabled, error } =
        useSpeechSynthesis(articleTtsText);

    return (
        <div className="flex flex-col h-full w-full bg-white overflow-hidden text-gray-900">
            {/* StepsBar is NOT rendered here, but the parent component manages the state */}
            
            <div className="flex flex-1 justify-center">
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
                                    Article: How to Use Analyser (SpikedAI)
                                </h1>
                                <p className="text-gray-500 mb-3 text-lg">
                                    A step-by-step guide to setting up and leveraging the AI Analyser in your meetings.
                                </p>
                            </div>

                            {/* READ ALOUD BUTTON */}
                            <button
                                onClick={toggleEnabled}
                                className={`flex items-center px-3 py-2 text-xs font-medium rounded-full border transition ${
                                    isEnabled
                                        ? 'border-red-500 text-red-600 bg-red-50'
                                        : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                                }`}
                                title={isEnabled ? 'Turn off Read Aloud' : 'Read this article aloud'}
                            >
                                {isEnabled ? (
                                    <>
                                        <Volume2 className={`w-4 h-4 mr-1 ${isSpeaking ? 'animate-pulse' : ''}`} />
                                        {isSpeaking ? 'Speaking…' : 'Voice On'}
                                    </>
                                ) : (
                                    <>
                                        <VolumeX className="w-4 h-4 mr-1" />
                                        Voice Off
                                    </>
                                )}
                            </button>
                        </div>

                        {error && (
                            <div className="mb-4 text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                                ⚠ {error}
                            </div>
                        )}

                        <hr className="mb-8" />
                        {/* Article content kept the same for context */}
                        <p className="text-gray-700 mb-4">
                            This documentation remains comprehensive, covering all phases of the process.
                        </p>
                        
                        <div className="mb-10">
                            <h2 className="text-2xl font-bold text-red-600 mb-4 flex items-center">
                                1. Connect the Meeting 📞
                            </h2>
                            <p className="text-gray-700 mb-4">
                                ... (Content for Step 1)
                            </p>
                        </div>

                        <div className="mb-10">
                            <h2 className="text-2xl font-bold text-red-600 mb-4 flex items-center">
                                2. Select or Create an AI Template 📝
                            </h2>
                            <p className="text-gray-700 mb-4">
                                ... (Content for Step 2)
                            </p>
                        </div>

                        <div className="mb-10">
                            <h2 className="text-2xl font-bold text-red-600 mb-4 flex items-center">
                                3. Analyze and Share the Insights ✨
                            </h2>
                            <p className="text-gray-700 mb-4">
                                ... (Content for Step 3)
                            </p>
                        </div>
                        
                    </div>
                </div>

                <div className="w-16 flex-shrink-0"></div>
            </div>
        </div>
    );
};

/* ======================================================================
    4. MODAL + DASHBOARD (Template Selection Step 1/2)
    ====================================================================== */

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
    
    const [selectedColor, setSelectedColor] = useState('Red'); 

    const handleCreate = () => {
        alert(`Template created with color: ${selectedColor}.`);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 transform transition-all duration-300 scale-100">
                <div className="flex justify-between items-center p-5 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">Create Custom Template</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                    {/* ... (Modal fields are unchanged) ... */}
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

                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                            Analysis Prompt <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            placeholder="Describe exactly what analysis you want the AI to perform on the meeting transcript."
                            rows={6}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 text-sm resize-none"
                        />
                        <p className="mt-2 text-xs text-gray-500">
                            Tip: Use specific instructions like "Create a table with...", "List the top 5...", or "Analyze each person's contribution..."
                        </p>
                    </div>
                </div>

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

interface DashboardDemoProps {
    onViewArticle: () => void;
    onNext: () => void;
}

const DashboardDemo: FC<DashboardDemoProps> = ({ onViewArticle, onNext }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const customGoals = [
        { title: 'status of jira', icon: <Activity className="w-3 h-3" />, status: 'No detected evidence' },
        { title: 'economic buyer', icon: <Users className="w-3 h-3" />, status: 'No detected evidence' },
        { title: 'what are dhruv and chirag working on', icon: <MessageCircle className="w-3 h-3" />, status: 'No detected evidence' },
    ];
    
    return (
        <div className="flex flex-col h-full w-full bg-gray-100 overflow-hidden text-gray-900">
            {/* The StepsBar is now managed by the parent NoteTakerFlow */}

            <div className="flex flex-1">
                {/* LEFT SIDEBAR */}
                <div className="w-72 bg-white border-r border-gray-200 flex flex-col p-4 shadow-md overflow-y-auto">
                    <div className="flex items-center mb-6">
                        <button 
                            onClick={onViewArticle}
                            className="flex items-center text-sm font-medium text-gray-600 hover:text-red-600 transition p-2 rounded-lg bg-red-50 border border-red-200 mr-2"
                        >
                            <BookOpen className="w-4 h-4 mr-1" />
                            How to Use Analyser
                        </button>
                    </div>
                    
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">AI Templates</h2>
                    
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center p-3 mb-6 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg text-red-700 font-medium text-sm transition"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Custom Template
                    </button>
                    
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

                    <div>
                        <div className="flex items-center justify-between cursor-pointer mb-2">
                            <p className="text-xs font-semibold text-gray-500 uppercase">
                                PREBUILT TEMPLATES
                            </p>
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                        </div>
                        <div className="flex items-start p-3 bg-red-50/50 hover:bg-red-100 cursor-pointer rounded-lg border border-red-200" onClick={onNext}>
                            <List className="w-5 h-5 text-red-600 mr-3 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium">Summary (Selected)</p>
                                <p className="text-xs text-gray-500">
                                    Quickly summarize the meeting highlights, action items, and next steps.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* CENTER */}
                <div className="flex-grow flex flex-col p-6 bg-gray-50 border-r border-gray-200">
                    <h1 className="text-xl font-semibold mb-1">Live Transcription</h1>
                    <p className="text-sm text-gray-500 mb-8">Real-time meeting notes</p>
                    
                    <div className="flex-grow flex flex-col items-center justify-center p-8 bg-white rounded-xl shadow-inner border border-dashed border-gray-300">
                        <Headphones className="w-10 h-10 text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-600 mb-2">Waiting for Transcription Data</h3>
                        <p className="text-sm text-gray-400">The AI is listening and will populate the transcript here.</p>
                        <p className="text-xs text-red-500 mt-4 font-medium">Template: Summary is active</p>
                    </div>
                </div>
                
                {/* RIGHT SIDEBAR */}
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
                        <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
                            **AI Analysis Pending...**
                            <br/>
                            Once the meeting concludes, the analysis based on the **'Summary'** template will appear here.
                        </div>
                        <p className="text-sm text-gray-500 mt-4 mb-4">Ask me anything</p>
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


/* ======================================================================
    5. FLOW MANAGER (ROOT APP) - Simplified
    ====================================================================== */

const NoteTakerFlow: FC = () => {
    // Current step index relative to the new, simplified 'steps' array (0 or 1)
    const [currentStep, setCurrentStep] = useState(0); 
    const [view, setView] = useState<'flow' | 'article'>('flow');

    const handleNext = () => {
        // Move from Template (0) to Review (1)
        setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    };

    const handleStartNew = () => {
        // Go back to Template Selection (0)
        setCurrentStep(0);
    };

    const handleArticleView = () => {
        setView('article');
    };

    const handleBackToFlow = () => {
        setView('flow');
        // Ensure we land on the Review step if coming back from the article (since it represents the completed flow state)
        setCurrentStep(1); 
    };

    let Content;
    if (view === 'article') {
        // The Article component shows documentation. It doesn't use the simple step bar but we pass the step index for reference.
        Content = <NoteTakerArticle onBack={handleBackToFlow} currentStepIndex={currentStep} />;
    } else {
        // The main operational flow
        switch (currentStep) {
            case 0: // Select Template
                Content = <DashboardDemo onViewArticle={handleArticleView} onNext={handleNext} />;
                break;
            case 1: // Review & Share
                Content = <ReviewShareStep onStartNew={handleStartNew} onViewArticle={handleArticleView} />;
                break;
            default:
                Content = <DashboardDemo onViewArticle={handleArticleView} onNext={handleNext} />;
        }
    }

    return (
        <div className="font-inter h-screen w-full flex flex-col">
            <StepsBar currentStepIndex={currentStep} />
            <div className="flex-1 overflow-auto">
                {Content}
            </div>
        </div>
    );
};

export default NoteTakerFlow;