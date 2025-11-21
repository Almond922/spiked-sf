import React, { useState, FormEvent, FC, useMemo } from 'react';
import { 
    ArrowLeft, Info, RefreshCw, Save, Check, X, Plus, 
    Cpu, TrendingUp, Briefcase, Users, Zap, Tag, Goal, Settings, Loader2
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

const CustomGoalsStep: FC<{ goals: CustomGoal[], onAddGoal: (goal: CustomGoal) => void }> = ({ goals, onAddGoal }) => {
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
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 disabled:bg-indigo-300"
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
        "Review the Bot Configuration and System Prompt.",
        "Complete Step 1: Meeting Focus (Requires > 0 tags).",
        "Complete Step 2: Customer Persona (Requires 1 selection).",
        "Complete Step 3: Answer Styles (Requires > 0 styles).",
        "Complete Step 4: Custom Goals (Optional).",
        "Click 'Save Changes' on the last step (4/4).",
    ];

    return (
        <div className="p-6 bg-white rounded-xl shadow-md border border-gray-100">
            <h3 className="flex items-center text-lg font-bold text-gray-900 mb-4">
                <Info className="w-5 h-5 mr-2 text-green-600" />
                Interactive Demo Guide
            </h3>
            <ol className="space-y-3 text-sm">
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

                    return (
                        <li key={index} className={`flex items-start transition-colors ${isStepComplete ? 'text-gray-500' : (isActive ? 'text-indigo-600' : 'text-gray-800')}`}>
                            {isStepComplete ? (
                                <Check className="w-4 h-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                            ) : (
                                <Loader2 className={`w-4 h-4 mr-2 mt-0.5 text-indigo-500 flex-shrink-0 ${isActive ? 'animate-spin' : ''}`} />
                            )}
                            <span className={isStepComplete ? 'line-through' : (isActive ? 'font-semibold' : '')}>
                                {guideStep}
                            </span>
                        </li>
                    );
                })}
            </ol>
        </div>
    );
};

// Placeholder components (copied from previous turn for completeness)
const MeetingFocusStep: FC<{ selectedTags: FocusTag[], onTagToggle: (tag: FocusTag) => void, onAddDomain: (domain: string) => void }> = ({ selectedTags, onTagToggle, onAddDomain }) => {
    const [newDomain, setNewDomain] = useState('');
    const handleAdd = (e: FormEvent) => { e.preventDefault(); if (newDomain.trim()) { onAddDomain(newDomain.trim()); setNewDomain(''); } };
    return (<div className="p-6 bg-white rounded-xl shadow-md border border-gray-100 h-full"><div className="flex items-center text-lg font-semibold text-gray-900 mb-4"><Tag className="w-5 h-5 mr-2 text-indigo-600" />Meeting Focus<Info className="w-4 h-4 ml-2 text-gray-400 cursor-pointer" /></div><p className="text-sm text-gray-600 mb-4">Add topics to focus the AI on. (Requires at least **one tag**)</p><div className="border border-gray-300 p-4 rounded-lg bg-gray-50 space-y-3"><div className="flex flex-wrap gap-2 mb-3">{MOCK_FOCUS_TAGS.map(tag => {const isSelected = selectedTags.some(t => t.id === tag.id); return (<button key={tag.id} onClick={() => onTagToggle(tag)} className={`flex items-center text-sm px-3 py-1 rounded-full transition-colors ${isSelected ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>{tag.label}{isSelected && <X className="w-3 h-3 ml-1" />}</button>);})}</div><form onSubmit={handleAdd} className="w-full"><input type="text" value={newDomain} onChange={(e) => setNewDomain(e.target.value)} placeholder="Add a domain (e.g., 'Databricks')" className="w-full px-3 py-2 text-sm border-b border-gray-300 focus:border-indigo-500 focus:ring-0 outline-none transition-colors"/>{newDomain && (<button type="submit" className="mt-2 text-xs text-indigo-600 hover:text-indigo-800 font-medium"><Plus className="w-3 h-3 inline-block mr-1" /> Add "{newDomain}"</button>)}</form></div></div>);
};
  
const CustomerPersonaStep: FC<{ selectedPersona: Persona | null, onSelect: (persona: Persona) => void }> = ({ selectedPersona, onSelect }) => {
    return (<div className="p-6 bg-white rounded-xl shadow-md border border-gray-100 h-full"><div className="flex items-center text-lg font-semibold text-gray-900 mb-4"><Users className="w-5 h-5 mr-2 text-indigo-600" />Customer Persona</div><p className="text-sm text-gray-600 mb-4">Choose **one** persona to affect the AI's tone, depth, and focus. (Requires **one selection**)</p><div className="grid grid-cols-2 gap-4">{MOCK_PERSONAS.map(persona => {const isSelected = selectedPersona?.id === persona.id; return (<div key={persona.id} onClick={() => onSelect(persona)} className={`p-4 rounded-xl border-2 transition-all cursor-pointer min-h-[120px] relative ${isSelected ? 'border-indigo-600 bg-indigo-50 shadow-lg' : 'border-gray-200 hover:border-indigo-400 bg-white'}`}><div className="flex justify-between items-start mb-2"><h4 className="font-semibold text-base">{persona.title}</h4>{isSelected && <Check className="w-5 h-5 text-indigo-600" />}</div><p className="text-xs text-gray-600">{persona.description}</p>{persona.id === 'technical' && isSelected && (<div className="absolute inset-0 border-4 border-purple-600 rounded-xl pointer-events-none"></div>)}</div>);})}</div><h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">System Prompt</h3><div className="p-4 bg-gray-50 border border-gray-300 rounded-lg h-40 overflow-y-auto text-sm text-gray-700">{selectedPersona ? selectedPersona.detail : "Select a persona to see the corresponding system prompt/instruction that guides the AI's output."}</div></div>);
};
  
const AnswerStylesStep: FC<{ selectedStyles: string[], onStyleToggle: (styleId: string) => void }> = ({ selectedStyles, onStyleToggle }) => {
    return (<div className="p-6 bg-white rounded-xl shadow-md border border-gray-100 h-full"><div className="flex items-center text-lg font-semibold text-gray-900 mb-4"><Zap className="w-5 h-5 mr-2 text-indigo-600" />Answer Styles</div><p className="text-sm text-gray-600 mb-4">Select **multiple** styles to customize responses. (Requires at least **one selection**)</p><div className="grid grid-cols-3 gap-3">{MOCK_ANSWER_STYLES.map(style => {const isSelected = selectedStyles.includes(style.id); return (<div key={style.id} onClick={() => onStyleToggle(style.id)} className={`p-3 rounded-lg border transition-all cursor-pointer min-h-[100px] relative ${isSelected ? 'border-green-600 bg-green-50 shadow-inner' : 'border-gray-200 hover:border-green-300 bg-white'}`}><div className="flex items-start mb-1"><h4 className="font-semibold text-sm text-gray-900">{style.title}</h4><div className={`w-3 h-3 rounded-full ml-auto mt-0.5 border ${isSelected ? 'bg-green-600 border-white' : 'bg-gray-200 border-gray-400'}`}></div></div><p className="text-xs text-gray-500">{style.description}</p></div>);})}</div></div>);
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
            case 0: return <MeetingFocusStep selectedTags={meetingFocus} onTagToggle={handleTagToggle} onAddDomain={handleAddDomain} />;
            case 1: return <CustomerPersonaStep selectedPersona={customerPersona} onSelect={setCustomerPersona} />;
            case 2: return <AnswerStylesStep selectedStyles={answerStyles} onStyleToggle={handleStyleToggle} />;
            case 3: return <CustomGoalsStep goals={customGoals} onAddGoal={handleAddGoal} />;
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


    return (
        <div className="p-6 md:p-10 bg-gray-50 min-h-screen font-sans">
            <div className="max-w-7xl mx-auto">
                
                {/* Header and Controls */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                        <button onClick={handleBack} disabled={currentStep === 0 || isCompleted} className="p-2 rounded-full text-gray-700 hover:bg-gray-200 disabled:opacity-50">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h1 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center">
                            <Settings className="w-6 h-6 mr-2 text-indigo-600" />
                            Personalisation
                        </h1>
                        <span className="text-gray-500 text-lg hidden md:inline">Configure your AI sales copilot</span>
                    </div>
                    
                    <div className="flex space-x-3">
                        <button className="flex items-center px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50" disabled={isCompleted}>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Undo
                        </button>
                        <button 
                            onClick={handleNext} 
                            disabled={!isCurrentStepValid && !isSaveMode || isCompleted}
                            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                                isCurrentStepValid || isSaveMode
                                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                    : 'bg-indigo-300 text-white cursor-not-allowed'
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

                {/* Progress Indicator */}
                <div className="mb-8">
                    <div className="flex justify-between text-xs font-medium text-gray-500 mb-1">
                        {STEPS.map((step, index) => (
                            <span key={index} className={index === currentStep ? 'text-indigo-600 font-bold' : (index < currentStep ? 'text-green-600' : '')}>
                                {index + 1}. {step}
                            </span>
                        ))}
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full">
                        <div 
                            style={{ width: `${((currentStep) / STEPS.length) * 100}%` }} 
                            className="h-2 bg-indigo-600 rounded-full transition-all duration-500"
                        ></div>
                    </div>
                </div>

                {/* Main Content (3-column layout) */}
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