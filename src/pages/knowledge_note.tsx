import React, { FC, useState, useEffect, useCallback, useRef } from 'react';
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
    ClipboardList,
    Mail,
    ChevronRight,
    RefreshCw,
    Brain,
    Target
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
    1. STEPS DEFINITION
    ====================================================================== */

const FULL_STEPS = [
    'Connect Meeting',
    'Select Template',
    'Start Transcription',
    'Use AI Features',
    'Review & Share'
];

// StepsBar removed - will use black header bar instead

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
    5. FLOW MANAGER (ROOT APP) - Updated with Steps
    ====================================================================== */

const NoteTakerFlow: FC = () => {
    const [currentStep, setCurrentStep] = useState(0); 
    const [view, setView] = useState<'flow' | 'article'>('flow');
    const [isSpeaking, setIsSpeaking] = useState(false);
    const voicesLoadedRef = useRef(false);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    // Create text content to read based on current step
    const getTextContent = () => {
        const articleTitle = "Note-Taker Journey - AI-Powered Meeting Analysis";
        const currentStepName = FULL_STEPS[currentStep] || "";
        const guideSteps = [
            "Connect your meeting using Google Meet, Zoom, or Microsoft Teams",
            "Select or create an AI template that matches your analysis needs",
            "Click Note-Taker when bot joins to start live transcription",
            "Use Custom Goals and AI Assistant to analyze your meeting",
            "Review insights and share professional summaries with your team"
        ];
        
        let stepDescription = "";
        let navigationGuidance = "";
        
        if (currentStep === 0) {
            stepDescription = guideSteps[0];
            navigationGuidance = "You are on step 1 of 5. Complete the current step, then click the Next Step button in the header to proceed. You can also use the Undo button to reset your progress.";
        } else if (currentStep === 1) {
            stepDescription = guideSteps[1];
            navigationGuidance = "You are on step 2 of 5. Complete the current step, then click the Next Step button in the header to proceed.";
        } else if (currentStep === 2) {
            stepDescription = guideSteps[2];
            navigationGuidance = "You are on step 3 of 5. Complete the current step, then click the Next Step button in the header to proceed.";
        } else if (currentStep === 3) {
            stepDescription = guideSteps[3];
            navigationGuidance = "You are on step 4 of 5. Complete the current step, then click the Next Step button in the header to proceed.";
        } else if (currentStep === 4) {
            stepDescription = guideSteps[4];
            navigationGuidance = "You are on step 5 of 5. This is the final step. Complete it to finish the Note-Taker journey.";
        }

        const allStepsText = guideSteps.map((step, idx) => `${idx + 1}. ${step}`).join(". ");

        return `${articleTitle}. Current step: ${currentStepName}. ${stepDescription}. ${navigationGuidance} Here are all the steps in this journey: ${allStepsText}.`;
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
    }, [currentStep]);

    // Reset function
    const handleReset = () => {
        stopSpeaking();
        setCurrentStep(0);
    };

    const handleNext = () => {
        setCurrentStep(prev => Math.min(prev + 1, FULL_STEPS.length - 1));
    };

    const handleStartNew = () => {
        setCurrentStep(0);
    };

    const handleArticleView = () => {
        setView('article');
    };

    const handleBackToFlow = () => {
        setView('flow');
        setCurrentStep(0); 
    };

    // Create short labels for the top bar steps
    const topSteps = FULL_STEPS.map((step, index) => ({
        label: String(index + 1),
        text: step.split(' ').slice(0, 2).join(' '),
        fullText: step
    }));

    let Content;
    if (view === 'article') {
        Content = <NoteTakerArticle onBack={handleBackToFlow} currentStepIndex={currentStep} />;
    } else {
        switch (currentStep) {
            case 0: // Connect Meeting
            case 1: // Select Template
                Content = <DashboardDemo onViewArticle={handleArticleView} onNext={handleNext} />;
                break;
            case 2: // Start Transcription
            case 3: // Use AI Features
            case 4: // Review & Share
                Content = <ReviewShareStep onStartNew={handleStartNew} onViewArticle={handleArticleView} />;
                break;
            default:
                Content = <DashboardDemo onViewArticle={handleArticleView} onNext={handleNext} />;
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans antialiased flex flex-col">
            {/* TOP BLACK BAR */}
            <div className="w-full bg-[#020617] text-white py-3 px-4 md:px-10 flex items-center justify-between shadow-md rounded-b-xl">
                <div className="flex items-center gap-2 md:gap-3">
                    <span className="text-xs uppercase tracking-widest text-gray-400">
                        NOTE-TAKER JOURNEY
                    </span>
                </div>
                <div className="flex items-center gap-1 md:gap-2 overflow-x-auto">
                    {topSteps.map((step, index) => {
                        const stepNumber = index;
                        const isActive = stepNumber === currentStep;
                        const isCompleted = stepNumber < currentStep;
                        return (
                            <div
                                key={step.label}
                                className="flex items-center gap-1 md:gap-2 text-[10px] md:text-xs cursor-pointer transition-all flex-shrink-0"
                                onClick={() => {
                                    if (stepNumber <= currentStep || stepNumber === currentStep + 1) {
                                        setCurrentStep(stepNumber);
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
                <div className="flex items-center ml-4 space-x-3">
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
                        disabled={currentStep === 0}
                        className={`flex items-center px-4 py-2 rounded-lg transition-colors text-sm ${
                            currentStep > 0
                                ? 'bg-white text-gray-800 border border-gray-700 hover:bg-gray-100'
                                : 'bg-gray-600 opacity-50 text-white cursor-not-allowed'
                        }`}
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Undo
                    </button>
                    <button
                        onClick={handleNext}
                        disabled={currentStep >= FULL_STEPS.length - 1}
                        className={`flex items-center px-4 py-2 rounded-lg transition-colors text-sm ${
                            currentStep < FULL_STEPS.length - 1
                                ? 'bg-indigo-400 text-gray-900 font-semibold hover:bg-indigo-300'
                                : 'bg-indigo-600 opacity-50 text-white cursor-not-allowed'
                        }`}
                    >
                        <ChevronRight className="w-4 h-4 mr-2" />
                        Next Step ({currentStep + 1}/{FULL_STEPS.length})
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-auto">
                {Content}
            </div>
        </div>
    );
};

export default NoteTakerFlow;