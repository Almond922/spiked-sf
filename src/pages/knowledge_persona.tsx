import { useState, FormEvent, FC, useMemo, useEffect, useRef } from 'react';
import { 
    ArrowLeft, Info, RefreshCw, Save, Check, CheckCircle, X, Plus, 
    Cpu, TrendingUp, Briefcase, Users, Zap, Tag, Goal, Settings, Volume2
} from 'lucide-react';

// --- INTERFACES & MOCK DATA ---

// 1. Meeting Focus
interface FocusTag {
    id: string;
    label: string;
}
const MOCK_FOCUS_TAGS: FocusTag[] = [
    { id: 'aws', label: 'AWS' },
    { id: 'amazon', label: 'Amazon' },
    { id: 'gcp', label: 'GCP' },
    { id: 'googlesales', label: 'google sales' },
    { id: 'nvidia', label: 'nvidia' },
];

// 2. Customer Persona
interface Persona {
    id: string;
    title: string;
    description: string;
    detail: string;
    icon: JSX.Element;
    style: string;
}
const MOCK_PERSONAS: Persona[] = [
    { id: 'balanced', title: 'Balanced (Default)', description: 'Versatile profile for general business users in B2B settings', detail: 'Versatile profile for general business users in B2B settings', icon: <Users className="w-5 h-5 text-gray-500" />, style: 'bg-white border-gray-200' },
    { id: 'technical', title: 'Technical', description: 'Deep technical, jargon-friendly (CTO, VP Engineering, Tech Lead, Solution Architect)', detail: 'You are speaking to a technical decision maker — such as a CTO, VP Engineering, Tech Lead, or Solution Architect. Use deep technical language and industry-specific terminology where appropriate. Focus on topics like backend architecture, API/SDK availability, developer documentation, scalability, latency benchmarks, data residency, encryption standards, CI/CD compatibility, and how the solution fits into their existing stack. Provide...', icon: <Cpu className="w-5 h-5 text-purple-600" />, style: 'bg-purple-50 border-purple-300' },
    { id: 'financial', title: 'Financial', description: 'ROI-driven, cost-benefit analysis (CFO, Financial Controller, Budget Owner)', detail: 'ROI-driven, cost-benefit analysis (CFO, Financial Controller, Budget Owner)', icon: <TrendingUp className="w-5 h-5 text-yellow-600" />, style: 'bg-yellow-50 border-yellow-300' },
    { id: 'businessexecutive', title: 'Business Executives', description: 'Layman, operational clarity, Strategic, high-level impact (CEO, Managing Director, Founder, Business Head)', detail: 'Layman, operational clarity, Strategic, high-level impact (CEO, Managing Director, Founder, Business Head)', icon: <Briefcase className="w-5 h-5 text-blue-600" />, style: 'bg-blue-50 border-blue-300' },
];

// 3. Answer Styles
interface AnswerStyle {
    id: string;
    title: string;
    description: string;
}
const MOCK_ANSWER_STYLES: AnswerStyle[] = [
    { id: 'concise', title: 'Concise Answer', description: 'Give a short, high-level answer suitable for quick consumption or alerts' },
    { id: 'indepth', title: 'In-Depth Response', description: 'Comprehensive, structured answer with examples, comparisons, and rich detail' },
    { id: 'points', title: 'Answer in Points', description: 'Structure responses as bullet points' },
    { id: 'analogy', title: 'Use Analogy', description: 'Use real-world analogies or metaphors to explain technical concepts' },
    { id: 'terms', title: 'Define Technical Terms', description: 'Include brief, clear definitions of key technical concepts used in the answer' },
    { id: 'sales', title: 'Sales Points', description: 'Present benefits as persuasive selling points' },
    { id: 'stats', title: 'Key Statistics', description: 'Include impactful, quantitative data points' },
    { id: 'case', title: 'Case Study Summary', description: 'Use a real or hypothetical successful story to illustrate impact' },
    { id: 'compare', title: 'Competitive Comparison', description: 'Provide a side-by-side comparison of your solution and others' },
    { id: 'faq', title: 'Anticipated Customer Questions', description: 'Predict what the customer might ask next' },
    { id: 'gap', title: 'Information Gap', description: 'Call out missing or unclear information the user should consider' },
    { id: 'pricing', title: 'Pricing Overview', description: 'Offer an overview of pricing models, tiers, or TCO' },
];

// 4. Custom Goals
interface CustomGoal {
    id: string;
    title: string;
    evaluationCriteria: string;
}
const MOCK_CUSTOM_GOALS: CustomGoal[] = [
    { id: 'jira-status', title: 'status of jira', evaluationCriteria: 'know about the jira integration' },
    { id: 'economic-buyer', title: 'economic buyer', evaluationCriteria: 'who is interested to be a economic buyer' },
    { id: 'what-dhruv-chirag', title: 'what are dhruv and chirag working on', evaluationCriteria: 'anyone can answer' },
    { id: 'owner-notetaker', title: 'can you tell who is the owner of notetaker', evaluationCriteria: 'smruthi answer this' },
    { id: 'mumbai-status', title: 'Check the status of Mumbai', evaluationCriteria: 'To understand how the person enjoys Mumbai' },
    { id: 'follow-up', title: 'secure a follow meet up', evaluationCriteria: 'send a calender invitation' },
];


// --- NEW COMPONENT: AddNewGoalModal ---

interface AddNewGoalModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (title: string, criteria: string) => void;
}

const AddNewGoalModal: FC<AddNewGoalModalProps> = ({ isOpen, onClose, onSave }) => {
    const [title, setTitle] = useState('');
    const [criteria, setCriteria] = useState('');

    if (!isOpen) return null;

    const handleSave = () => {
        if (title.trim() && criteria.trim()) {
            onSave(title.trim(), criteria.trim());
            setTitle('');
            setCriteria('');
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Add New Goal</h2>
                
                {/* Emoji Selection (Simplified for Demo) */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Emoji</label>
                    <div className="mt-1">
                        <div className="w-12 h-12 flex items-center justify-center border-2 border-indigo-400 rounded-lg cursor-pointer bg-white shadow-inner">
                            <span className="text-2xl">🎯</span>
                        </div>
                    </div>
                </div>

                {/* Goal Description */}
                <div className="mb-4">
                    <label htmlFor="goal-description" className="block text-sm font-medium text-gray-700">Goal Description</label>
                    <textarea
                        id="goal-description"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g., Secure a follow-up meeting with the CTO"
                        rows={3}
                        className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    />
                </div>

                {/* Evaluation Criteria */}
                <div className="mb-8">
                    <label htmlFor="evaluation-criteria" className="block text-sm font-medium text-gray-700">Evaluation Criteria</label>
                    <textarea
                        id="evaluation-criteria"
                        value={criteria}
                        onChange={(e) => setCriteria(e.target.value)}
                        placeholder="e.g., A calendar invitation is sent and accepted."
                        rows={3}
                        className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!title.trim() || !criteria.trim()}
                        className={`px-4 py-2 text-white font-medium rounded-lg transition-colors ${
                            title.trim() && criteria.trim()
                                ? 'bg-indigo-600 hover:bg-indigo-700'
                                : 'bg-gray-400 cursor-not-allowed'
                        }`}
                    >
                        Save Goal
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- MODIFIED CustomGoalsStep Component ---

const CustomGoalsStep: FC<{ goals: CustomGoal[], onAddGoal: (goal: CustomGoal) => void, currentStep?: number }> = ({ goals, onAddGoal, currentStep = 3 }) => {
    const shouldHighlight = currentStep === 3;
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSaveGoal = (title: string, criteria: string) => {
        onAddGoal({
            id: `custom-${Date.now()}`,
            title: title,
            evaluationCriteria: criteria,
        });
    };

    return (
      <>
        <div className="p-6 bg-white rounded-xl shadow-md border border-gray-100 h-full">
            <div className="flex items-center justify-between text-lg font-semibold text-gray-900 mb-4">
                <div className="flex items-center">
                    <Goal className="w-5 h-5 mr-2 text-red-500" />
                    Custom Goals
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className={`flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 disabled:bg-indigo-300 ${
                        shouldHighlight ? "shadow-[0_0_20px_rgba(34,197,94,0.6)]" : ""
                    }`}
                >
                    <Plus className="w-4 h-4 mr-1" /> Add New Goal
                </button>
            </div>
            <p className="text-sm text-gray-600 mb-6">Define key objectives for your meetings to track success.</p>
            
            {/* Render Existing Goals */}
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            {goals.map((goal) => (
                <div key={goal.id} className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-start">
                    <Goal className="w-5 h-5 mt-0.5 mr-3 text-red-500 flex-shrink-0" />
                    <div className="flex-grow">
                    <div className="font-semibold text-base text-gray-800 mb-1">{goal.title}</div>
                    <div className="text-xs text-gray-500 space-y-0.5">
                        <span className="uppercase font-medium tracking-wider">Evaluation Criteria</span>
                        <p className="text-sm text-gray-700">{goal.evaluationCriteria}</p>
                    </div>
                    </div>
                </div>
                </div>
            ))}
            </div>
            {/* The input form fields are now replaced by the modal trigger button above */}
        </div>
        
        {/* The Modal itself */}
        <AddNewGoalModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={handleSaveGoal}
        />
      </>
    );
};


// --- Interactive Guide Panel and Other Steps (Retained for completeness) ---

interface GuidePanelProps {
    currentStep: number;
    stepsLength: number;
}

const InteractiveGuidePanel: FC<GuidePanelProps> = ({ currentStep, stepsLength }) => {
    const guideSteps = [
        "Review the Bot Configuration and System Prompt",
        "Select meeting focus tags (at least one required)",
        "Choose a customer persona (one selection required)",
        "Select answer styles (at least one required)",
        "Add custom goals (optional)",
        "Click Save Changes to complete setup",
    ];

    return (
        <div className="p-6 bg-white rounded-xl shadow-md border border-gray-100">
            <h3 className="flex items-center text-lg font-bold text-gray-900 mb-4">
                <Info className="w-5 h-5 mr-2 text-green-600" />
                Interactive Demo Guide
            </h3>
            <div className="space-y-2">
                {guideSteps.map((guideStep, index) => {
                    let isStepComplete = false;
                    let isActive = false;
                    
                    if (index === 0) {
                        isStepComplete = currentStep > 0;
                        isActive = currentStep === 0;
                    } else if (index >= 1 && index <= stepsLength) { 
                        isStepComplete = currentStep > index;
                        isActive = currentStep === index;
                    } else if (index === stepsLength + 1) {
                        isStepComplete = currentStep > stepsLength;
                        isActive = currentStep === stepsLength;
                    }

                    const done = isStepComplete;

                    return (
                        <div
                            key={index}
                            className={`
                                flex items-center justify-between w-full text-[11px] rounded-full px-3 py-2
                                ${done
                                    ? 'bg-[#ECFDF5] border border-[#22C55E] text-[#16A34A] line-through'
                                    : isActive
                                    ? 'bg-[#020617] border-2 border-indigo-500 text-[#E5E7EB]'
                                    : 'bg-[#020617] border border-[#1F2937] text-[#E5E7EB]'}
                            `}
                        >
                            <div className="flex items-center gap-1">
                                <span
                                    className={`
                                        w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-semibold
                                        ${done ? 'bg-[#22C55E] text-white' : isActive ? 'bg-indigo-500 text-white border border-indigo-400' : 'bg-[#020617] border border-[#4B5563]'}
                                    `}
                                >
                                    {done ? <CheckCircle className="w-3 h-3" /> : index + 1}
                                </span>
                                <span>{guideStep}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// Placeholder components (copied from previous turn for completeness)
const MeetingFocusStep: FC<{ selectedTags: FocusTag[], onTagToggle: (tag: FocusTag) => void, onAddDomain: (domain: string) => void, currentStep?: number }> = ({ selectedTags, onTagToggle, onAddDomain, currentStep = 0 }) => {
    const [newDomain, setNewDomain] = useState('');
    const handleAdd = (e: FormEvent) => { e.preventDefault(); if (newDomain.trim()) { onAddDomain(newDomain.trim()); setNewDomain(''); } };
    const shouldHighlight = currentStep === 0;
    return (<div className="p-6 bg-white rounded-xl shadow-md border border-gray-100 h-full"><div className="flex items-center text-lg font-semibold text-gray-900 mb-4"><Tag className="w-5 h-5 mr-2 text-indigo-600" />Meeting Focus<Info className="w-4 h-4 ml-2 text-gray-400 cursor-pointer" /></div><p className="text-sm text-gray-600 mb-4">Add topics to focus the AI on. (Requires at least **one tag**)</p><div className={`border border-gray-300 p-4 rounded-lg bg-gray-50 space-y-3 ${shouldHighlight ? 'shadow-[0_0_15px_rgba(99,102,241,0.5)]' : ''}`}><div className="flex flex-wrap gap-2 mb-3">{MOCK_FOCUS_TAGS.map(tag => {const isSelected = selectedTags.some(t => t.id === tag.id); return (<button key={tag.id} onClick={() => onTagToggle(tag)} className={`flex items-center text-sm px-3 py-1 rounded-full transition-colors ${isSelected ? 'bg-red-600 text-white' : shouldHighlight ? 'bg-gray-200 text-gray-700 hover:bg-gray-300 shadow-[0_0_12px_rgba(99,102,241,0.4)]' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>{tag.label}{isSelected && <X className="w-3 h-3 ml-1" />}</button>);} )}</div><form onSubmit={handleAdd} className="w-full"><input type="text" value={newDomain} onChange={(e) => setNewDomain(e.target.value)} placeholder="Add a domain (e.g., 'Databricks')" className={`w-full px-3 py-2 text-sm border-b border-gray-300 focus:border-indigo-500 focus:ring-0 outline-none transition-colors ${shouldHighlight ? 'shadow-[0_0_12px_rgba(99,102,241,0.4)]' : ''}`}/>{newDomain && (<button type="submit" className="mt-2 text-xs text-indigo-600 hover:text-indigo-800 font-medium"><Plus className="w-3 h-3 inline-block mr-1" /> Add "{newDomain}"</button>)}</form></div></div>);
};
  
const CustomerPersonaStep: FC<{ selectedPersona: Persona | null, onSelect: (persona: Persona) => void, currentStep?: number }> = ({ selectedPersona, onSelect, currentStep = 1 }) => {
    const shouldHighlight = currentStep === 1;
    return (<div className="p-6 bg-white rounded-xl shadow-md border border-gray-100 h-full"><div className="flex items-center text-lg font-semibold text-gray-900 mb-4"><Users className="w-5 h-5 mr-2 text-indigo-600" />Customer Persona</div><p className="text-sm text-gray-600 mb-4">Choose **one** persona to affect the AI's tone, depth, and focus. (Requires **one selection**)</p><div className="grid grid-cols-2 gap-4">{MOCK_PERSONAS.map(persona => {const isSelected = selectedPersona?.id === persona.id; return (<div key={persona.id} onClick={() => onSelect(persona)} className={`p-4 rounded-xl border-2 transition-all cursor-pointer min-h-[120px] relative ${isSelected ? 'border-indigo-600 bg-indigo-50 shadow-lg' : shouldHighlight ? 'border-gray-200 hover:border-indigo-400 bg-white shadow-[0_0_12px_rgba(99,102,241,0.4)]' : 'border-gray-200 hover:border-indigo-400 bg-white'}`}><div className="flex justify-between items-start mb-2"><h4 className="font-semibold text-base">{persona.title}</h4>{isSelected && <Check className="w-5 h-5 text-indigo-600" />}</div><p className="text-xs text-gray-600">{persona.description}</p>{persona.id === 'technical' && isSelected && (<div className="absolute inset-0 border-4 border-purple-600 rounded-xl pointer-events-none"></div>)}</div>);})}</div><h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">System Prompt</h3><div className="p-4 bg-gray-50 border border-gray-300 rounded-lg h-40 overflow-y-auto text-sm text-gray-700">{selectedPersona ? selectedPersona.detail : "Select a persona to see the corresponding system prompt/instruction that guides the AI's output."}</div></div>);
};
  
const AnswerStylesStep: FC<{ selectedStyles: string[], onStyleToggle: (styleId: string) => void, currentStep?: number }> = ({ selectedStyles, onStyleToggle, currentStep = 2 }) => {
    const shouldHighlight = currentStep === 2;
    return (<div className="p-6 bg-white rounded-xl shadow-md border border-gray-100 h-full"><div className="flex items-center text-lg font-semibold text-gray-900 mb-4"><Zap className="w-5 h-5 mr-2 text-indigo-600" />Answer Styles</div><p className="text-sm text-gray-600 mb-4">Select **multiple** styles to customize responses. (Requires at least **one selection**)</p><div className="grid grid-cols-3 gap-3">{MOCK_ANSWER_STYLES.map(style => {const isSelected = selectedStyles.includes(style.id); return (<div key={style.id} onClick={() => onStyleToggle(style.id)} className={`p-3 rounded-lg border transition-all cursor-pointer min-h-[100px] relative ${isSelected ? 'border-green-600 bg-green-50 shadow-inner' : shouldHighlight ? 'border-gray-200 hover:border-green-300 bg-white shadow-[0_0_12px_rgba(99,102,241,0.4)]' : 'border-gray-200 hover:border-green-300 bg-white'}`}><div className="flex items-start mb-1"><h4 className="font-semibold text-sm text-gray-900">{style.title}</h4><div className={`w-3 h-3 rounded-full ml-auto mt-0.5 border ${isSelected ? 'bg-green-600 border-white' : 'bg-gray-200 border-gray-400'}`}></div></div><p className="text-xs text-gray-500">{style.description}</p></div>);})}</div></div>);
};


// --- MAIN PERSONALIZATION PAGE COMPONENT ---

const PersonalizationPage: FC = () => {
    // 0. State for the User Journey
    const STEPS = ['Meeting Focus', 'Customer Persona', 'Answer Styles', 'Custom Goals'];
    const [currentStep, setCurrentStep] = useState(0); 

    // 1. State for Personalization Data 
    const initialAnswerStyles = MOCK_ANSWER_STYLES.map(s => s.id);
    const [meetingFocus, setMeetingFocus] = useState<FocusTag[]>(MOCK_FOCUS_TAGS);
    const [customerPersona, setCustomerPersona] = useState<Persona | null>(MOCK_PERSONAS.find(p => p.id === 'technical') || MOCK_PERSONAS[0]);
    const [answerStyles, setAnswerStyles] = useState<string[]>(initialAnswerStyles);
    const [customGoals, setCustomGoals] = useState<CustomGoal[]>(MOCK_CUSTOM_GOALS);
    const [botName, setBotName] = useState('SpikedAI');
    const [isSpeaking, setIsSpeaking] = useState(false);
    const voicesLoadedRef = useRef(false);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    // Create text content to read based on current step
    const getTextContent = () => {
        const articleTitle = "Personalisation - Configure your AI sales copilot";
        const currentStepName = STEPS[currentStep] || "";
        const guideSteps = [
            "Review the Bot Configuration and System Prompt",
            "Select meeting focus tags (at least one required)",
            "Choose a customer persona (one selection required)",
            "Select answer styles (at least one required)",
            "Add custom goals (optional)",
            "Click Save Changes to complete setup",
        ];
        
        let stepDescription = "";
        let navigationGuidance = "";
        
        if (currentStep === 0) {
            stepDescription = guideSteps[1];
            navigationGuidance = "You are on step 1 of 4. Complete the current step, then click the Next Step button in the header to proceed. You can also use the Undo button to reset your progress.";
        } else if (currentStep === 1) {
            stepDescription = guideSteps[2];
            navigationGuidance = "You are on step 2 of 4. Complete the current step, then click the Next Step button in the header to proceed.";
        } else if (currentStep === 2) {
            stepDescription = guideSteps[3];
            navigationGuidance = "You are on step 3 of 4. Complete the current step, then click the Next Step button in the header to proceed.";
        } else if (currentStep === 3) {
            stepDescription = guideSteps[4];
            navigationGuidance = "You are on step 4 of 4. This is the final step. Complete it and click Save Changes to finish the setup.";
        } else if (currentStep === 4) {
            stepDescription = guideSteps[5];
            navigationGuidance = "Setup is complete! You can click Start Over to begin again.";
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

    // Handlers
    const handleTagToggle = (tag: FocusTag) => { setMeetingFocus(prev => prev.some(t => t.id === tag.id) ? prev.filter(t => t.id !== tag.id) : [...prev, tag]); };
    const handleAddDomain = (domain: string) => { const newTag: FocusTag = { id: domain.toLowerCase().replace(/\s/g, '-'), label: domain }; if (!meetingFocus.some(t => t.id === newTag.id)) { setMeetingFocus(prev => [...prev, newTag]); } };
    const handleStyleToggle = (styleId: string) => { setAnswerStyles(prev => prev.includes(styleId) ? prev.filter(id => id !== styleId) : [...prev, styleId]); };
    const handleAddGoal = (goal: CustomGoal) => { setCustomGoals(prev => [...prev, goal]); };


    // --- Navigation Logic ---
    const isCurrentStepValid = useMemo(() => {
        switch (currentStep) {
            case 0: return meetingFocus.length > 0;
            case 1: return customerPersona !== null;
            case 2: return answerStyles.length > 0;
            case 3: return true;
            default: return false;
        }
    }, [currentStep, meetingFocus, customerPersona, answerStyles]);

    const handleNext = () => {
        if (currentStep < STEPS.length - 1 && isCurrentStepValid) {
            setCurrentStep(prev => prev + 1);
        } else if (currentStep === STEPS.length - 1 && isCurrentStepValid) {
            setTimeout(() => {
                setCurrentStep(STEPS.length); 
            }, 500);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };
    
    // --- Conditional Rendering of Step Content ---
    const renderStepContent = () => {
        switch (currentStep) {
            case 0: return <MeetingFocusStep selectedTags={meetingFocus} onTagToggle={handleTagToggle} onAddDomain={handleAddDomain} currentStep={currentStep} />;
            case 1: return <CustomerPersonaStep selectedPersona={customerPersona} onSelect={setCustomerPersona} currentStep={currentStep} />;
            case 2: return <AnswerStylesStep selectedStyles={answerStyles} onStyleToggle={handleStyleToggle} currentStep={currentStep} />;
            case 3: return <CustomGoalsStep goals={customGoals} onAddGoal={handleAddGoal} currentStep={currentStep} />;
            case 4: return (
                <div className="p-10 bg-green-50 rounded-xl border-2 border-green-300 text-center flex flex-col items-center justify-center h-full">
                    <Check className="w-10 h-10 text-green-600 mb-4" />
                    <h2 className="text-2xl font-bold text-green-800">Setup Complete!</h2>
                    <p className="text-lg text-green-700">Your AI Copilot is now fully personalized and changes are saved.</p>
                    <button onClick={() => setCurrentStep(0)} className="mt-4 text-indigo-600 font-medium hover:text-indigo-800">
                        Start Over
                    </button>
                </div>
            );
            default: return <div className="p-10 text-center text-red-600">Error: Invalid Step</div>;
        }
    };

    const isSaveMode = currentStep === STEPS.length - 1;
    const isCompleted = currentStep === STEPS.length;


    // Create step labels for the top bar
    const topSteps = STEPS.map((step, index) => ({
        label: String(index + 1),
        text: step.split(' ').slice(0, 2).join(' '), // Short version
        fullText: step
    }));

    return (
        <div className="bg-gray-50 min-h-screen font-sans flex flex-col">
            {/* TOP BLACK BAR */}
            <div className="w-full bg-[#020617] text-white py-3 px-4 md:px-10 flex items-center justify-between shadow-md rounded-b-xl">
                <div className="flex items-center gap-2 md:gap-3">
                    <button onClick={handleBack} disabled={currentStep === 0 || isCompleted} className="p-2 rounded-full text-white hover:bg-gray-700 disabled:opacity-50">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <span className="text-xs uppercase tracking-widest text-gray-400">
                        PERSONALISATION JOURNEY
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
                <div className="flex space-x-3 ml-4">
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
                    <button className="flex items-center px-4 py-2 bg-white text-gray-800 border border-gray-700 rounded-lg hover:bg-gray-100 disabled:opacity-50 text-sm" disabled={isCompleted}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Undo
                    </button>
                    <button 
                        onClick={handleNext} 
                        disabled={!isCurrentStepValid && !isSaveMode || isCompleted}
                        className={`flex items-center px-4 py-2 rounded-lg transition-colors text-sm ${
                            isCurrentStepValid || isSaveMode
                                ? 'bg-indigo-400 text-gray-900 font-semibold hover:bg-indigo-300 shadow-[0_0_20px_rgba(34,197,94,0.6)]' 
                                : 'bg-indigo-600 opacity-50 text-white cursor-not-allowed'
                        }`}
                    >
                        {isCompleted ? (
                            <>Setup Complete!</>
                        ) : isSaveMode ? (
                            <><Save className="w-4 h-4 mr-2" /> Save Changes</>
                        ) : (
                            <>Next Step ({currentStep + 1}/{STEPS.length})</>
                        )}
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-7xl mx-auto px-4 md:px-6 pt-6 pb-10">

                {/* Main Step Content (3-column layout) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[500px]">
                    
                    {/* LEFT COLUMN: Bot Configuration and Guide */}
                    <div className="lg:col-span-1 space-y-6">
                        
                        {/* Interactive Guide Panel */}
                        <InteractiveGuidePanel currentStep={currentStep} stepsLength={STEPS.length} />

                        {/* Bot Configuration */}
                        <div className="p-6 bg-white rounded-xl shadow-md border border-gray-100">
                            <div className="flex items-center text-lg font-semibold text-gray-900 mb-3">
                                <Settings className="w-5 h-5 mr-2 text-red-600" />
                                Bot Configuration
                            </div>
                            <input
                                type="text"
                                value={botName}
                                onChange={(e) => setBotName(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>
                        
                        {/* System Prompt Display */}
                        <div className="p-6 bg-white rounded-xl shadow-md border border-gray-100">
                            <div className="flex items-center text-lg font-semibold text-gray-900 mb-3">
                                <Info className="w-5 h-5 mr-2 text-orange-600" />
                                System Prompt
                            </div>
                            <p className="text-sm text-gray-600 mb-2">The instruction set guiding the AI's core behavior.</p>
                            <textarea
                                value={customerPersona?.detail || "Select a persona to load the System Prompt..."}
                                readOnly
                                className="w-full p-3 border border-gray-300 rounded-lg text-sm text-gray-700 bg-gray-50 h-48 focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    {/* MIDDLE/RIGHT COLUMN: Current Step Content */}
                    <div className="lg:col-span-2">
                        {renderStepContent()}
                        
                        {/* Display validation warning if needed */}
                        {!isCurrentStepValid && !isCompleted && (
                            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm flex items-center">
                                <X className="w-4 h-4 mr-2" />
                                Please complete the current step before proceeding: **{STEPS[currentStep]}** requires selection/input.
                            </div>
                        )}
                    </div>
                    
                </div>
            </div>
        </div>
    );
};

export default PersonalizationPage;