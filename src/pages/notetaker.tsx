import React, { useState, useRef, useEffect, useMemo } from 'react';
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import EmailDialog from '../components/EmailDialog';
import { useBotId } from '../BotIdContext';
import { useAuth } from '../AuthContext';
import { fetchEventSource } from "@microsoft/fetch-event-source";
import {
    Send,
    Users,
    Target,
    Mail,
    FileText,
    Shield,
    RotateCcw,
    Heart,
    MessageSquare,
    ChevronRight,
    Moon,
    Sun,
    FileText as Document,
    Headphones,
    Settings,
    Bot,
    ArrowLeft,
    Plus,
    Edit,
    Trash2,
    UserCheck,
    X,
    Save,
    ChevronDown,
    TrendingUp,
    CheckCircle,
    Loader
} from 'lucide-react';
import { jsPDF } from "jspdf";

const BASE_URL = 'https://recall-backend-production-409019309412.us-central1.run.app';
const SALES_ASSISTANT_BASE_URL = 'https://spikedai-old-backend-409019309412.us-central1.run.app';
const service_url_recall = "https://spikedai-production-application-409019309412.us-central1.run.app";

interface Session {
    user: { id: string; email: string };
    access_token: string;
}

interface Template {
    id: number;
    name: string;
    icon: any;
    theme: string;
    description: string;
    prompt: string;
    isCustom?: boolean;
    category?: 'prebuilt' | 'custom';
    createdAt?: Date;
}

interface CustomTemplateForm {
    name: string;
    description: string;
    prompt: string;
    theme: string;
}

interface TranscriptSegment {
    id: number;
    start: number;
    end: number;
    text: string;
    language: string;
    created_at: string;
    speaker: string | null;
    absolute_start_time: string;
    absolute_end_time: string;
}

interface ChatMessage {
    id: number;
    text: string;
    isUser: boolean;
    timestamp: Date;
    speaker?: string;
}

interface CustomGoal {
    id: string;
    goal_description: string;
    evaluation_criteria?: string;
    emoji_icon?: string;
    created_at?: string;
    updated_at?: string;
}

interface CustomGoalProgress {
    goal: CustomGoal;
    is_achieved: boolean;
    evidences: Array<{
        text: string;
        timestamp: string;
        primary_speaker: string;
        match_score: number;
        segment_index: number;
    }>;
    current_evidence_index: number;
    total_evidence_count: number;
    achievement_percentage: number;
    confidence_score?: number;
    summary?: string; // Add summary here
}

interface CustomGoalUpdate {
    goal_id: string;
    speakers: string[];
    summary: string;
    timestamp: Date;
    instances: Array<{
        speaker: string;
        text: string;
        timestamp: string;
    }>;
}

interface GoalSettings {
    format: 'summary' | 'detailed' | 'speakers_only';
    wordLimit: number;
    includeTimestamps: boolean;
    includeSpeakers: boolean;
    includeInstances: boolean;
}

const DB_NAME = 'SpikedAI_Cache';
const DB_VERSION = 2;
const TRANSCRIPTS_STORE = 'transcripts';
const CUSTOM_TEMPLATES_STORE = 'customTemplates';

const initDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        if (!window.indexedDB) {
            reject(new Error('IndexedDB is not supported in this browser'));
            return;
        }
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onerror = () => { console.error('IndexedDB error:', request.error); reject(request.error); };
        request.onsuccess = () => { console.log('IndexedDB opened successfully'); resolve(request.result); };
        request.onupgradeneeded = (event) => {
            console.log('IndexedDB upgrade needed, creating object stores');
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(TRANSCRIPTS_STORE)) {
                console.log('Creating transcripts store');
                db.createObjectStore(TRANSCRIPTS_STORE, { keyPath: 'meetingId' });
            }
            if (!db.objectStoreNames.contains(CUSTOM_TEMPLATES_STORE)) {
                console.log('Creating custom templates store');
                const customTemplatesStore = db.createObjectStore(CUSTOM_TEMPLATES_STORE, { keyPath: 'id', autoIncrement: true });
                customTemplatesStore.createIndex('name', 'name', { unique: false });
                customTemplatesStore.createIndex('createdAt', 'createdAt', { unique: false });
            }
        };
    });
};

const saveToIndexedDB = async (storeName: string, data: any): Promise<boolean> => {
    try {
        const db = await initDB();
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.add(data);
        return new Promise((resolve) => {
            request.onsuccess = () => resolve(true);
            request.onerror = () => resolve(false);
        });
    } catch (error) {
        console.error('Error in saveToIndexedDB:', error);
        return false;
    }
};

const updateInIndexedDB = async (storeName: string, data: any): Promise<boolean> => {
    try {
        const db = await initDB();
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.put(data);
        return new Promise((resolve) => {
            request.onsuccess = () => resolve(true);
            request.onerror = () => resolve(false);
        });
    } catch (error) {
        console.error('Error updating in IndexedDB:', error);
        return false;
    }
};

const deleteFromIndexedDB = async (storeName: string, key: any): Promise<boolean> => {
    try {
        const db = await initDB();
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.delete(key);
        return new Promise((resolve) => {
            request.onsuccess = () => resolve(true);
            request.onerror = () => resolve(false);
        });
    } catch (error) {
        console.error('Error deleting from IndexedDB:', error);
        return false;
    }
};

const loadFromIndexedDB = async (storeName: string, key?: string): Promise<any> => {
    try {
        const db = await initDB();
        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        if (key) {
            const request = store.get(key);
            return new Promise((resolve) => {
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => resolve(null);
            });
        } else {
            const request = store.getAll();
            return new Promise((resolve) => {
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => resolve([]);
            });
        }
    } catch (error) {
        console.error('Error loading from IndexedDB:', error);
        return key ? null : [];
    }
};

const EnhancedMarkdown = ({ children, isDarkMode }: { children: string; isDarkMode: boolean }) => {
    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[
                rehypeRaw,
                rehypeHighlight,
                rehypeSlug,
                [rehypeAutolinkHeadings, { behavior: 'wrap' }]
            ]}
            components={{
                h1: ({ children }) => <h1 className={`text-3xl font-bold mb-4 text-red-600 dark:text-red-400`}>{children}</h1>,
                h2: ({ children }) => <h2 className={`text-2xl font-bold mb-3 text-red-600 dark:text-red-400`}>{children}</h2>,
                h3: ({ children }) => <h3 className={`text-xl font-bold mb-3 text-red-600 dark:text-red-400`}>{children}</h3>,
                p: ({ children }) => <p className={`mb-3 leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{children}</p>,
                ul: ({ children }) => <ul className={`mb-3 ml-4 space-y-1 list-disc ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{children}</ul>,
                ol: ({ children }) => <ol className={`mb-3 ml-4 space-y-1 list-decimal ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{children}</ol>,
                li: ({ children }) => <li className="mb-1">{children}</li>,
                code: ({ node, className, children, ...props }) => {
                    const match = /language-(\w+)/.exec(className || '');
                    return !match ? (
                        <code className={`px-1.5 py-0.5 rounded text-sm font-mono ${isDarkMode ? 'bg-slate-700 text-red-300' : 'bg-red-100 text-red-700'}`} {...props}>
                            {children}
                        </code>
                    ) : (
                        <div className={`mb-4 rounded-lg border overflow-hidden ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                            <div className={`flex items-center justify-between px-4 py-2 border-b ${isDarkMode ? 'border-slate-700 bg-slate-800/60' : 'bg-slate-100'}`}>
                                <span className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{match[1]}</span>
                                <button onClick={() => navigator.clipboard.writeText(String(children))} className={`text-xs px-2 py-1 rounded transition-colors ${isDarkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-white text-slate-600 hover:bg-slate-200'}`}>
                                    Copy
                                </button>
                            </div>
                            <pre className="p-4 overflow-x-auto"><code className={`block text-sm font-mono ${className || ''}`} {...props}>{children}</code></pre>
                        </div>
                    );
                },
                blockquote: ({ children }) => <blockquote className={`border-l-4 pl-4 py-2 mb-3 italic ${isDarkMode ? 'border-red-500 bg-red-900/20 text-red-200' : 'border-red-400 bg-red-50 text-red-800'}`}>{children}</blockquote>,
                table: ({ children }) => <div className="mb-4 overflow-x-auto"><table className={`w-full border-collapse border rounded-lg ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>{children}</table></div>,
                thead: ({ children }) => <thead className={`${isDarkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>{children}</thead>,
                th: ({ children }) => <th className={`px-3 py-2 text-left text-sm font-semibold border-b ${isDarkMode ? 'text-slate-200 border-slate-700' : 'text-slate-900 border-slate-200'}`}>{children}</th>,
                td: ({ children }) => <td className={`px-3 py-2 text-sm border-b ${isDarkMode ? 'text-slate-300 border-slate-700' : 'text-slate-700 border-slate-200'}`}>{children}</td>,
                a: ({ children, href }) => <a href={href} target="_blank" rel="noopener noreferrer" className={`font-medium no-underline transition-colors ${isDarkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-700'}`}>{children}</a>,
                hr: () => <hr className={`my-4 ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`} />,
            }}
        >
            {children}
        </ReactMarkdown>
    );
};

const loadFromSessionStorage = (key: string, defaultValue: any) => {
    try {
        const item = window.sessionStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        return defaultValue;
    }
};

const saveToSessionStorage = (key: string, value: any) => {
    try {
        window.sessionStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error('Error saving to sessionStorage:', error);
    }
};

export default function Notetaker() {
    const { botId, setBotId } = useBotId();
    const { session } = useAuth();
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
    const [isDarkMode, setIsDarkMode] = useState(false);
    
    const [customTemplates, setCustomTemplates] = useState<Template[]>([]);
    const [showCreateTemplateModal, setShowCreateTemplateModal] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
    const [templateForm, setTemplateForm] = useState<CustomTemplateForm>({
        name: '',
        description: '',
        prompt: '',
        theme: 'blue'
    });
    
    const [columnWidths, setColumnWidths] = useState([25, 45, 30]);
    const [resizingIndex, setResizingIndex] = useState<number | null>(null);

    const [meetingUrl, setMeetingUrl] = useState(loadFromSessionStorage('spikedai_meeting_url', ''));
    const [transcript, setTranscript] = useState(loadFromSessionStorage('spikedai_transcript', []));
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState('');
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [isProcessingTemplate, setIsProcessingTemplate] = useState(false);
    const [isAITyping, setIsAITyping] = useState(false);
    const [additionalQuestions, setAdditionalQuestions] = useState<string[]>([]);
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
    const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);

    // CUSTOM GOALS STATE (REPLACED DUMMY DATA)
    const [customGoals, setCustomGoals] = useState<CustomGoal[]>([]);
    const [customGoalsProgress, setCustomGoalsProgress] = useState<CustomGoalProgress[]>([]);
    const [expandedGoals, setExpandedGoals] = useState<Set<string>>(new Set());
    const [goalAnalysis, setGoalAnalysis] = useState<Record<string, string>>({});

    // NEW STATE FOR COLLAPSIBLE SECTIONS AND POLLING
    const [isCollapsibleOpen, setIsCollapsibleOpen] = useState({
        customTemplates: true,
        prebuiltTemplates: true,
        customGoals: true,
    });
    const [isPollingGoals, setIsPollingGoals] = useState(false);
    const [showGoalSettingsModal, setShowGoalSettingsModal] = useState(false);
    const [goalSettings, setGoalSettings] = useState<GoalSettings>({
        format: 'summary',
        wordLimit: 100,
        includeTimestamps: true,
        includeSpeakers: true,
        includeInstances: false,
    });

    const transcriptEndRef = useRef<HTMLDivElement>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const sseRefs = useRef<{ transcript: AbortController | null; }>({ transcript: null });

    // API calls for Custom Goals
    const fetchCustomGoals = async () => {
    if (!session) {
        console.log('No session, skipping goals fetch');
        return;
    }
    try {
        console.log('Fetching goals...');
            const response = await fetch(`${service_url_recall}/meetingGoals`, {
                headers: { Authorization: `Bearer ${session.access_token}` },
            });
            if (response.ok) {
                const goals = await response.json();
                setCustomGoals(goals);
            }
        } catch (error) {
            console.error("Error fetching custom goals:", error);
        }
    };

    const fetchCustomGoalsProgress = async () => {
        if (!session || isPollingGoals || !customGoals.length) return;

        setIsPollingGoals(true);
        try {
            const response = await fetch(`${service_url_recall}/sentiment/custom-goals`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({
                    goals: customGoals.map(g => ({ id: g.id, description: g.goal_description, criteria: g.evaluation_criteria })),
                    transcript_segments: transcript,
                }),
            });
            if (response.ok) {
                const data = await response.json();
                if (Array.isArray(data.custom_goals_progress)) {
                    setCustomGoalsProgress(data.custom_goals_progress);
                } else {
                    console.error('Invalid data format for custom goals progress:', data);
                }
            } else {
                console.error("Failed to fetch custom goals progress:", response.status, response.statusText);
            }
        } catch (error) {
            console.error("Error fetching custom goals progress:", error);
        } finally {
            setIsPollingGoals(false);
        }
    };

    const navigateCustomGoalEvidence = async (goalId: string, direction: "next" | "prev") => {
        if (!session) return;
        setCustomGoalsProgress(prev => prev.map(progress => {
            if (progress.goal.id === goalId) {
                const currentIndex = progress.current_evidence_index || 0;
                const newIndex = direction === "next"
                    ? Math.min(currentIndex + 1, progress.evidences.length - 1)
                    : Math.max(currentIndex - 1, 0);
                return { ...progress, current_evidence_index: newIndex };
            }
            return progress;
        }));
    };

    const toggleGoalExpansion = (goalId: string) => {
        setExpandedGoals(prev => {
            const newSet = new Set(prev);
            if (newSet.has(goalId)) {
                newSet.delete(goalId);
            } else {
                newSet.add(goalId);
            }
            return newSet;
        });
    };
    
    // NEW FUNCTION TO FETCH GOAL UPDATES
    const fetchCustomGoalUpdates = async () => {
        if (!session || isAITyping || !customGoals.length) return;
        setIsPollingGoals(true);
        console.log("Fetching goal updates...");

        const goalsText = customGoals.map(goal => `Goal: ${goal.goal_description}\nEvaluation Criteria: ${goal.evaluation_criteria || 'N/A'}`).join('\n---\n');
        const transcriptText = groupTranscriptBySpeaker(transcript).map(group => `${group.speaker || 'Unknown'}: ${group.text}`).join('\n\n');

        const prompt = `Based on the following transcript, provide a progress update for each of the specified goals.

Goals:
${goalsText}

Transcript:
${transcriptText}

Provide the response as a markdown list. For each goal, state its name, whether it has been achieved, and provide a summary of the evidence from the transcript. If the goal hasn't been achieved, provide a progress update.
${goalSettings.includeSpeakers ? 'Include the names of the speakers for each piece of evidence.' : ''}
${goalSettings.includeTimestamps ? 'Include timestamps for the evidence found.' : ''}
${goalSettings.includeInstances ? 'Include the exact quote of the instance where the goal was mentioned.' : ''}
The summary should be concise, around ${goalSettings.wordLimit} words per goal.
`;

        const newGoalUpdateMessage: ChatMessage = { id: Date.now(), text: `Checking for updates on your custom goals.`, isUser: true, timestamp: new Date() };
        setChatMessages((prev) => [...prev, newGoalUpdateMessage]);
        setIsAITyping(true);

        try {
            const response = await fetch(`${SALES_ASSISTANT_BASE_URL}/api/process-template`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({ prompt, transcript: transcriptText }),
            });
            if (!response.ok) throw new Error('Failed to process goals update');
            const data = await response.json();
            const botResponse: ChatMessage = {
                id: Date.now() + 1,
                text: `**Custom Goals Update**\n\n${data.response}`,
                isUser: false,
                timestamp: new Date(),
            };
            setChatMessages((prev) => [...prev, botResponse]);

        } catch (error) {
            console.error("Error fetching custom goal updates:", error);
            const errorResponse: ChatMessage = {
                id: Date.now() + 1,
                text: "Sorry, I'm having trouble getting an update on your goals. Please try again later.",
                isUser: false,
                timestamp: new Date(),
            };
            setChatMessages((prev) => [...prev, errorResponse]);
        } finally {
            setIsAITyping(false);
            setIsPollingGoals(false);
        }
    };
    
    const fetchTemplatesAndGoals = () => {
        const loadCustomTemplates = async () => {
            try {
                const customTemplatesData = await loadFromIndexedDB(CUSTOM_TEMPLATES_STORE);
                if (customTemplatesData && customTemplatesData.length > 0) {
                    const formattedTemplates = customTemplatesData.map((template: any) => ({
                        ...template,
                        icon: FileText,
                        category: 'custom',
                        isCustom: true,
                    }));
                    setCustomTemplates(formattedTemplates);
                }
            } catch (error) {
                console.error('Error loading custom templates:', error);
            }
        };

        if (session) {
            fetchCustomGoals();
            fetchCustomGoalsProgress();
            loadCustomTemplates();
        }
    };

    useEffect(() => {
        fetchTemplatesAndGoals();
    }, [session]);

    // NEW useEffect for automatic polling
    useEffect(() => {
        let intervalId: NodeJS.Timeout | null = null;
        if (isConnected && session && customGoals.length > 0) {
            fetchCustomGoalsProgress(); // Initial fetch
            intervalId = setInterval(() => {
                fetchCustomGoalsProgress();
            }, 30000); // 30 seconds
        }

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [isConnected, session, customGoals, transcript, goalSettings]);


    useEffect(() => {
        const checkMobile = () => {
            const isMobileView = window.innerWidth < 1024;
            if (isMobileView) {
                setColumnWidths([100, 100, 100]);
            } else {
                setColumnWidths([25, 45, 30]);
            }
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        const linkId = 'highlight-theme';
        let link = document.getElementById(linkId) as HTMLLinkElement;
        if (!link) {
            link = document.createElement('link');
            link.id = linkId;
            link.rel = 'stylesheet';
            document.head.appendChild(link);
        }
        link.href = isDarkMode
            ? 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/atom-one-dark.min.css'
            : 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/github.min.css';
    }, [isDarkMode]);

    useEffect(() => {
        const cleanup = () => {
            if (sseRefs.current.transcript) {
                sseRefs.current.transcript.abort();
                sseRefs.current.transcript = null;
            }
        };

        const currentBotId = loadFromSessionStorage('spikedai_botId', null);
        if (currentBotId) {
            setBotId(currentBotId);
        }

        if (botId && session?.access_token) {
            cleanup();
            setIsConnected(true);
            fetchCustomGoals();
            fetchCustomGoalsProgress();

            const fetchInitialTranscripts = async () => {
                if (transcript.length === 0) {
                    try {
                        const response = await fetch(`${BASE_URL}/transcripts/${encodeURIComponent(botId)}`, {
                            headers: { Authorization: `Bearer ${session.access_token}` },
                        });
                        if (response.ok) {
                            const initialTranscripts = await response.json();
                            setTranscript(initialTranscripts);
                            saveToSessionStorage('spikedai_transcript', initialTranscripts);
                        }
                    } catch (err) {
                        console.error('Failed to fetch initial transcripts:', err);
                    }
                }
            };
            fetchInitialTranscripts();
            
            const transcriptController = new AbortController();
            sseRefs.current.transcript = transcriptController;
            const transcriptUrl = `${BASE_URL}/transcripts/${encodeURIComponent(botId)}`;
            
            fetchEventSource(transcriptUrl, {
                signal: transcriptController.signal,
                headers: { Authorization: `Bearer ${session.access_token}` },
                onmessage(event) {
                    try {
                        const newTranscript = JSON.parse(event.data);
                        setTranscript((prev: TranscriptSegment[]) => {
                            const lastLine = prev.length > 0 ? prev[prev.length - 1].text : '';
                            if (newTranscript.text.trim() === lastLine.trim()) {
                                return prev;
                            }
                            const newTranscripts = [...prev, newTranscript];
                            saveToSessionStorage('spikedai_transcript', newTranscripts);
                            return newTranscripts;
                        });
                    } catch (e) {
                        console.error("Error parsing new transcript message:", e);
                    }
                },
                onerror(err) {
                    console.error('Transcript Stream Error:', err);
                    setError('Transcript stream failed. Please refresh the page.');
                    setIsConnected(false);
                    cleanup();
                },
            });

        } else {
            setTranscript([]);
            setIsConnected(false);
            setError('No active meeting bot found. Please start a session in the main interface.');
            cleanup();
        }

        return cleanup;
    }, [botId, session]);

    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'spikedai_meeting_url' && e.newValue) {
                setMeetingUrl(JSON.parse(e.newValue));
            }
            if (e.key === 'spikedai_botId' && e.newValue) {
                setBotId(JSON.parse(e.newValue));
            }
        };

        window.addEventListener('storage', handleStorageChange);
        
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);
    
    useEffect(() => {
        transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [transcript]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages, isAITyping]);

    const themeClasses: { [key: string]: any } = {
        blue: { border: 'border-blue-500', iconBg: 'bg-blue-100 dark:bg-blue-900/30', icon: 'text-blue-600 dark:text-blue-400', hoverBorder: 'hover:border-blue-500', hoverBg: 'hover:bg-blue-50 dark:hover:bg-blue-900/20', ring: 'ring-blue-500' },
        green: { border: 'border-green-500', iconBg: 'bg-green-100 dark:bg-green-900/30', icon: 'text-green-600 dark:text-green-400', hoverBorder: 'hover:border-green-500', hoverBg: 'hover:bg-green-50 dark:hover:bg-green-900/20', ring: 'ring-green-500' },
        red: { border: 'border-red-500', iconBg: 'bg-red-100 dark:bg-red-900/30', icon: 'text-red-600 dark:text-red-400', hoverBorder: 'hover:border-red-500', hoverBg: 'hover:bg-red-50 dark:hover:bg-red-900/20', ring: 'ring-red-500' },
        pink: { border: 'border-pink-500', iconBg: 'bg-pink-100 dark:bg-pink-900/30', icon: 'text-pink-600 dark:text-pink-400', hoverBorder: 'hover:border-pink-500', hoverBg: 'hover:bg-pink-50 dark:hover:bg-pink-900/20', ring: 'ring-pink-500' },
        teal: { border: 'border-teal-500', iconBg: 'bg-teal-100 dark:bg-teal-900/30', icon: 'text-teal-600 dark:text-teal-400', hoverBorder: 'hover:border-teal-500', hoverBg: 'hover:bg-teal-50 dark:hover:bg-teal-900/20', ring: 'ring-teal-500' },
        sky: { border: 'border-sky-500', iconBg: 'bg-sky-100 dark:bg-sky-900/30', icon: 'text-sky-600 dark:text-sky-400', hoverBorder: 'hover:border-sky-500', hoverBg: 'hover:bg-sky-50 dark:hover:bg-sky-900/20', ring: 'ring-sky-500' },
        slate: { border: 'border-slate-500', iconBg: 'bg-slate-100 dark:bg-slate-700/30', icon: 'text-slate-600 dark:text-slate-400', hoverBorder: 'hover:border-slate-500', hoverBg: 'hover:bg-slate-200 dark:hover:bg-slate-700/20', ring: 'ring-slate-500' },
        purple: { border: 'border-purple-500', iconBg: 'bg-purple-100 dark:bg-purple-900/30', icon: 'text-purple-600 dark:text-purple-400', hoverBorder: 'hover:border-purple-500', hoverBg: 'hover:bg-purple-50 dark:hover:bg-purple-900/20', ring: 'ring-purple-500' },
    };

    const templates: Template[] = [
        { id: 1, name: 'Summary', icon: FileText, theme: 'blue', description: 'Quickly summarize the meeting highlights, action items, and next steps.', prompt: 'Provide a concise and scannable summary of the meeting, including key discussion points, action items with owners, and clear next steps.', category: 'prebuilt' },
        { id: 2, name: 'Stakeholder Mapper', icon: Users, theme: 'green', description: 'Map and analyze key stakeholder relationships', prompt: 'Based on the meeting transcript, identify all stakeholders mentioned, their roles, influence levels, and relationships. Create a stakeholder map with decision-making power analysis and recommend the best approach for each stakeholder.', category: 'prebuilt' },
        { id: 3, name: 'Battle Card Intelligence', icon: Shield, theme: 'red', description: 'Competitive intelligence and positioning', prompt: 'Analyze the meeting transcript for competitive mentions, concerns, or comparisons. Create a battle card with competitor strengths/weaknesses mentioned, objections raised, and recommended positioning strategies to address competitive threats.', category: 'prebuilt' },
        { id: 4, name: 'PLAYBOOK Command Center', icon: Target, theme: 'red', description: 'MEDDIC qualification framework', prompt: 'Evaluate this meeting using the MEDDIC framework: Metrics (quantifiable business impact), Economic Buyer (budget authority), Decision Criteria (evaluation factors), Decision Process (how they buy), Identify Pain (business problems), and Champion (internal advocate). Provide a detailed MEDDIC assessment with gaps and next steps.', category: 'prebuilt' },
        { id: 5, name: 'CRM Sync Studio', icon: RotateCcw, theme: 'pink', description: 'Synchronize and optimize CRM data', prompt: 'Extract all relevant CRM data from this meeting including contact information updates, deal stage progression, next meeting dates, action items with owners, budget information, timeline updates, and any other data that should be updated in the CRM system.', category: 'prebuilt' },
        { id: 6, name: 'Deal Health Monitor', icon: Heart, theme: 'teal', description: 'Track and monitor deal progression', prompt: 'Assess the overall health of this deal based on the meeting transcript. Analyze buyer engagement, decision-making progress, timeline adherence, budget discussions, stakeholder alignment, and competitive threats. Provide a deal health score (1-10) with specific risks and recommendations.', category: 'prebuilt' },
        { id: 7, name: 'Follow-Up Email Composer', icon: Mail, theme: 'sky', description: 'Craft personalized follow-up emails', prompt: 'Write a personalized follow-up email based on this meeting. Include a recap of key discussion points, commitments made by both parties, next steps with deadlines, and any materials promised. Make it professional, concise, and action-oriented.', category: 'prebuilt' },
        { id: 8, name: 'Executive Briefing', icon: Document, theme: 'slate', description: 'Generate executive summaries and briefs', prompt: 'Create an executive briefing document for leadership based on this meeting. Include: Executive Summary, Key Outcomes, Strategic Implications, Resource Requirements, Timeline, Risks & Mitigation, and Recommended Actions. Keep it concise and focused on business impact.', category: 'prebuilt' },
        { id: 9, name: 'Participant Analysis', icon: UserCheck, theme: 'purple', description: 'Individual analysis for each meeting participant', prompt: 'Analyze each participant in this meeting individually. For each person identified in the transcript, provide: 1) **Individual Summary** - Key points they made and their overall contribution, 2) **Action Items** - Specific tasks or commitments they have, 3) **Questions Raised** - Any questions or concerns they expressed, 4) **Decision Influence** - Their level of influence and decision-making power, 5) **Follow-up Needs** - What they specifically need from others or next steps. Present this as a comprehensive participant-by-participant breakdown with clear sections for each person.', category: 'prebuilt' },
    ];

    const getSpeakerColor = (speakerName: string | null) => {
        if (!speakerName) return 'border-gray-500 bg-gray-600';
        const hash = speakerName.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
        const colors = [ 'border-red-500 bg-red-600', 'border-blue-500 bg-blue-600', 'border-green-500 bg-green-600', 'border-yellow-500 bg-yellow-600', 'border-red-500 bg-red-600', 'border-pink-500 bg-pink-600', 'border-indigo-500 bg-indigo-600', 'border-teal-500 bg-teal-600' ];
        return colors[Math.abs(hash) % colors.length];
    };

    const handleChatSubmit = async (e: React.FormEvent, question?: string) => {
        e.preventDefault();
        const userQuestion = question || chatInput.trim();
        if (!userQuestion || !session) return;
        const newUserMessage: ChatMessage = { id: Date.now(), text: userQuestion, isUser: true, timestamp: new Date() };
        setChatMessages((prev) => [...prev, newUserMessage]);
        setChatInput('');
        setAdditionalQuestions([]);
        setIsAITyping(true);
        const transcriptText = groupTranscriptBySpeaker(transcript).map(group => `${group.speaker || 'Unknown'}: ${group.text}`).join('\n\n');
        try {
            const response = await fetch(`${SALES_ASSISTANT_BASE_URL}/api/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` }, body: JSON.stringify({ question: userQuestion, transcript: transcriptText, chat_history: chatMessages }) });
            if (!response.ok) throw new Error('Failed to get AI response');
            const data = await response.json();
            const botResponse: ChatMessage = { id: Date.now() + 1, text: data.response, isUser: false, timestamp: new Date() };
            setChatMessages((prev) => [...prev, botResponse]);
            setAdditionalQuestions(data.additional_questions || []);
        } catch (error) {
            console.error('Error handling chat message:', error);
            const errorResponse: ChatMessage = { id: Date.now() + 1, text: "Sorry, I'm having trouble connecting. Please try again.", isUser: false, timestamp: new Date() };
            setChatMessages((prev) => [...prev, errorResponse]);
        } finally {
            setIsAITyping(false);
        }
    };
    
    const handleTemplateClick = async (template: Template) => {
        setSelectedTemplate(template);
        setIsProcessingTemplate(true);
        setAdditionalQuestions([]);
        const transcriptText = groupTranscriptBySpeaker(transcript).map(group => `${group.speaker || 'Unknown'}: ${group.text}`).join('\n\n');
        const templateMessage: ChatMessage = { id: Date.now(), text: `Running "${template.name}" on the transcript.`, isUser: true, timestamp: new Date() };
        setChatMessages((prev) => [...prev, templateMessage]);
        setIsAITyping(true);
        try {
            const response = await fetch(`${SALES_ASSISTANT_BASE_URL}/api/process-template`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` }, body: JSON.stringify({ prompt: template.prompt, transcript: transcriptText }) });
            if (!response.ok) throw new Error('Failed to process template');
            const data = await response.json();
            const botResponse: ChatMessage = { id: Date.now() + 1, text: data.response, isUser: false, timestamp: new Date() };
            setChatMessages((prev) => [...prev, botResponse]);
            setAdditionalQuestions(data.additional_questions || []);
        } catch (error) {
            console.error('Error processing template:', error);
            const errorResponse: ChatMessage = { id: Date.now() + 1, text: `Sorry, an error occurred while processing ${template.name}.`, isUser: false, timestamp: new Date() };
            setChatMessages((prev) => [...prev, errorResponse]);
        } finally {
            setIsAITyping(false);
            setIsProcessingTemplate(false);
        }
    };

    const handleMouseDown = (index: number) => (e: React.MouseEvent) => {
        setResizingIndex(index);
        e.preventDefault();
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (resizingIndex === null) return;
        const totalWidth = window.innerWidth;
        const mouseX = e.clientX;
        const newWidths = [...columnWidths];
        const leftWidth = newWidths.slice(0, resizingIndex + 1).reduce((a, b) => a + b, 0) / 100 * totalWidth;
        const delta = mouseX - leftWidth;
        const deltaPercent = (delta / totalWidth) * 100;
        const minWidth = 10;
        if (newWidths[resizingIndex] + deltaPercent > minWidth && newWidths[resizingIndex + 1] - deltaPercent > minWidth) {
            newWidths[resizingIndex] += deltaPercent;
            newWidths[resizingIndex + 1] -= deltaPercent;
            setColumnWidths(newWidths);
        }
    };

    const handleMouseUp = () => {
        setResizingIndex(null);
    };

    useEffect(() => {
        if (resizingIndex !== null) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [resizingIndex, columnWidths]);

    const groupTranscriptBySpeaker = (transcript: TranscriptSegment[]) => {
        if (!transcript || transcript.length === 0) return [];
        const groups: { speaker: string | null, text: string, id: number }[] = [];
        let currentGroup: { speaker: string | null, text: string, id: number } | null = null;
        transcript.forEach((segment, index) => {
            if (currentGroup && currentGroup.speaker === segment.speaker) {
                currentGroup.text += ' ' + segment.text;
            } else {
                if (currentGroup) groups.push(currentGroup);
                currentGroup = { speaker: segment.speaker, text: segment.text, id: segment.id || index };
            }
        });
        if (currentGroup) groups.push(currentGroup);
        return groups;
    };

    const handleCustomGoalClick = async (goal: CustomGoal) => {
        if (!session) return;
        
        // Clear previous analysis for this goal and show loading state
        setGoalAnalysis(prev => ({ ...prev, [goal.id]: 'Generating analysis...' }));
        
        const goalPrompt = `Analyze the custom goal: "${goal.goal_description}" based on the current meeting transcript. Provide detailed insights including progress assessment, evidence found, recommendations, and next steps. Do not generate follow-up questions.`;
        
        const transcriptText = groupTranscriptBySpeaker(transcript).map(group =>
            `${group.speaker || 'Unknown'}: ${group.text}`
        ).join('\n\n');
        
        try {
            const response = await fetch(`${SALES_ASSISTANT_BASE_URL}/api/process-template`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`
                },
                body: JSON.stringify({
                    prompt: goalPrompt,
                    transcript: transcriptText
                })
            });
            
            if (!response.ok) throw new Error('Failed to get AI response for goal analysis');
            
            const data = await response.json();
            
            // Update the state with the new analysis
            setGoalAnalysis(prev => ({ ...prev, [goal.id]: data.response }));
        } catch (error) {
            console.error('Error handling custom goal analysis:', error);
            setGoalAnalysis(prev => ({ ...prev, [goal.id]: `Sorry, I'm having trouble analyzing the goal "${goal.goal_description}". Please try again.` }));
        }
    };
    

    const resetTemplateForm = () => {
        setTemplateForm({
            name: '',
            description: '',
            prompt: '',
            theme: 'blue'
        });
        setEditingTemplate(null);
    };

    const handleCreateTemplate = () => {
        resetTemplateForm();
        setShowCreateTemplateModal(true);
    };

    const handleEditTemplate = (template: Template) => {
        setTemplateForm({
            name: template.name,
            description: template.description,
            prompt: template.prompt,
            theme: template.theme
        });
        setEditingTemplate(template);
        setShowCreateTemplateModal(true);
    };

    const handleSaveTemplate = async () => {
        if (!templateForm.name.trim() || !templateForm.description.trim() || !templateForm.prompt.trim()) {
            alert('Please fill in all required fields (Name, Description, and Prompt)');
            return;
        }

        const templateData = {
            name: templateForm.name,
            description: templateForm.description,
            prompt: templateForm.prompt,
            theme: templateForm.theme,
            createdAt: new Date(),
            category: 'custom' as const,
            isCustom: true
        };

        try {
            if (editingTemplate) {
                const updatedTemplate = { ...templateData, id: editingTemplate.id };
                const success = await updateInIndexedDB(CUSTOM_TEMPLATES_STORE, updatedTemplate);
                if (success) {
                    const templateWithIcon = { ...updatedTemplate, icon: FileText };
                    setCustomTemplates(prev =>
                        prev.map(t => t.id === editingTemplate.id ? templateWithIcon : t)
                    );
                }
            } else {
                const success = await saveToIndexedDB(CUSTOM_TEMPLATES_STORE, templateData);
                if (success) {
                    const updatedTemplates = await loadFromIndexedDB(CUSTOM_TEMPLATES_STORE);
                    const formattedTemplates = updatedTemplates.map((template: any) => ({
                        ...template,
                        icon: FileText,
                        category: 'custom',
                        isCustom: true,
                    }));
                    setCustomTemplates(formattedTemplates);
                } else {
                    alert('Failed to save template. Please try again.');
                    return;
                }
            }
            setShowCreateTemplateModal(false);
            resetTemplateForm();
        } catch (error) {
            console.error('Error saving template:', error);
            alert('An error occurred while saving the template. Please try again.');
        }
    };

    const handleDeleteTemplate = async (template: Template) => {
        if (!template.isCustom || !window.confirm('Are you sure you want to delete this template?')) {
            return;
        }

        try {
            const success = await deleteFromIndexedDB(CUSTOM_TEMPLATES_STORE, template.id);
            if (success) {
                setCustomTemplates(prev => prev.filter(t => t.id !== template.id));
            }
        } catch (error) {
            console.error('Error deleting template:', error);
        }
    };

    const allTemplates = useMemo(() => [...customTemplates, ...templates], [customTemplates, templates]);
    
    const generatePDF = () => {
        if (chatMessages.length === 0) return;
        
        try {
            setIsGeneratingPDF(true);
            const { jsPDF } = (window as any).jspdf;
            const doc = new jsPDF();

            const accentRed = '#F44336';
            const textPrimary = '#212121';
            const textSecondary = '#757575';
            const borderLight = '#E0E0E0';

            const logoBase64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wgARCADIAMgDASIAAhEBAxEB/8QAGgABAAMBAQEAAAAAAAAAAAAAAAUHCAQGA//EABoBAQADAQEBAAAAAAAAAAAAAAAEBQcGAgP/2gAIAQEAAwAAAPPjn/RoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADSGb9dTeFgeL3UfO4HIwpN4AAAAAAAAAAa6yLrqfn3fHyEfYZxkYUHogAAAAAAAAABrrIuup+fdv/8QAKhAAAAQIEBAUEAwAAAAAAAAAAAgEDBEBzsQAQERIUUXGS0SIyNHAxM5H/2gAIAQEABj8C+oWDKERSIEVV3Ly64+GncXnD5jCIhCCqi7l5dZeGpjbKJplaXhqY2yiaZWl4amNsommVpeGpjbKJplaXhqY2yiaZWl4amNsommVpeGpjbKJplaXhqY2yiaZWl22+FbXYKD7lx8RvuXDjfCtpvFR13LLsuq6/qYIS6KnLpj9z/wDU8YdcR1/UAUvyniXhaQ2yiaZWl2GyF7cAIK6CnLrj2v8AYnnDzYi9qQKKelPP1F//xAAcEAABBQEBAQAAAAAAAAAAAAABEBFAUfAhMXD/2gAIAQEAAg/h+Q+rCMJIIGeaKOJBR2lRNq0fSom1aPpUTatH0qJtWj6VE2rR9KibVo+lRNq0fSom1aOAggAnowZHChEIBwcNHFLCRg5AoXE9hIFhwHjseqbVo/m0mJwAQI7YOjTkN8if/9oADAMBAAIAAwAAABAEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEF4EEEEEEEEEEED0EEEEEEEEEEED0EEEEEEEEEEED0EEEEEEEEEEEfEEEEEEEEEEEEP0EEEEEEEEEEFOAEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEH/8QAIhEBAAEDAwQDAAAAAAAAAAAAAREAMFExcYFQobHwIUGR/9oACAEEDAQE/EOmO7Cykl8GsJRAww/Te56HFOyebnocU7J5uehxTsnm4E1NMoahGqYopkCPNvcTcpEfcBULApjO1yXiGpDGtDSmM8OOnf//EAB4RAAEEAgMBAAAAAAAAAAAAAAEAETAxIbFBUJGh/9oACAECAQE/EOsbw9J2x8EmqrJNVWSaqskMkVogEP8ADIPBdAljIaJ5olDY867/xAAgEAEBAAEEAQUAAAAAAAAAAAAABESEAEEFwMUBQYcHw/2gAIAQEAA/EOoXxc46BccldhB6O09QOYwh2/GPRj0Y9GPRj0Y9GPRjwBmCkFTj41+S+tOqYAQyTHF9OYN+MKAvhXZxbaguWBnhT3AoeStd1UiPCmxAwNwNRFeFeov/2Q==';
            doc.addImage(logoBase64, 'JPEG', 15, 21, 10, 10);

            const addHeader = (): void => {
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(18);
                doc.setTextColor(textPrimary);
                doc.text('SpikedAI', 27, 29);
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(10);
                doc.setTextColor(textSecondary);
                doc.text('AI Assistant Conversation', 195, 29, { align: 'right' });
                doc.setDrawColor(accentRed);
                doc.setLineWidth(0.5);
                doc.line(15, 35, 195, 35);
            };

            const addFooter = (): void => {
                doc.setFontSize(8);
                doc.setTextColor(textSecondary);
                const pageNumber = (doc as any).internal.getNumberOfPages();
                doc.text(`Page ${(doc as any).internal.getCurrentPageInfo().pageNumber} of ${pageNumber}`, 195, 290, { align: 'right' });
                doc.text('Confidential & Proprietary. All rights reserved to SpikedAI', 15, 290);
            };

            const pageWidth = doc.internal.pageSize.width;
            const margin = 15;
            const contentWidth = pageWidth - 2 * margin;
            let yPosition = 45;

            const checkPageBreak = (height: number): void => {
                if (yPosition + height > 280) {
                    addFooter();
                    doc.addPage();
                    addHeader();
                    yPosition = 45;
                }
            };
            
            addHeader();
            yPosition = 50;

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(22);
            doc.setTextColor(textPrimary);
            doc.text('Conversation Summary', margin, yPosition);
            yPosition += 15;

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.setTextColor(textSecondary);
            const date = new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            doc.text(`Generated on ${date}`, margin, yPosition);
            yPosition += 15;

            chatMessages.forEach((msg, index) => {
                checkPageBreak(80);

                if (index > 0) {
                    doc.setDrawColor(borderLight);
                    doc.setLineWidth(0.2);
                    doc.line(margin, yPosition - 5, pageWidth - margin, yPosition - 5);
                }

                doc.setFontSize(11);
                doc.setTextColor(accentRed);
                doc.setFont('helvetica', 'bold');
                const sender = msg.isUser ? 'You' : 'AI Assistant';
                doc.text(sender, margin, yPosition + 5);
                yPosition += 10;

                checkPageBreak(20);
                doc.setFontSize(10);
                doc.setTextColor(textPrimary);
                doc.setFont('helvetica', 'normal');
                const messageLines = doc.splitTextToSize(msg.text, contentWidth);
                doc.text(messageLines, margin, yPosition);
                yPosition += messageLines.length * 5 + 15;

                if (msg.timestamp) {
                    doc.setFontSize(8);
                    doc.setTextColor(textSecondary);
                    doc.setFont('helvetica', 'italic');
                    const time = msg.timestamp.toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                    doc.text(time, pageWidth - margin, yPosition - 10, { align: 'right' });
                }
            });

            addFooter();

            const fileName = `SpikedAI_Conversation_${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(fileName);
        } catch (error) {
            console.error('Error generating PDF:', error);
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    const handleShareClick = () => {
        setIsEmailDialogOpen(true);
    };

    return (
        <div className={`flex flex-col lg:flex-row h-screen transition-colors duration-300 ${isDarkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
            <div className={`flex flex-col border-r ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} min-w-0`} style={{ width: `${columnWidths[0]}%`, minWidth: '280px' }}>
                <div className={`flex items-center space-x-4 p-5 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} flex-shrink-0`}>
                    <a href="/" className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                        <ArrowLeft className="w-5 h-5" />
                    </a>
                    <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-red-900/20' : 'bg-red-100'}`}><Bot className={`w-5 h-5 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} /></div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-xl font-bold truncate text-black-600 dark:text-red-400">AI Templates</h2>
                        <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} truncate`}>Analysis Frameworks</p>
                    </div>
                </div>
                <div className="flex-1 p-3 space-y-2 overflow-y-auto">
                    <div
                        onClick={handleCreateTemplate}
                        className={`group p-4 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-300 hover:shadow-lg
                        ${isDarkMode ? 'border-gray-600 hover:border-red-500 hover:bg-red-900/10' : 'border-gray-300 hover:border-red-400 hover:bg-red-50'}`}
                    >
                        <div className="flex items-center space-x-3">
                            <div className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg ${isDarkMode ? 'bg-gray-700 group-hover:bg-red-900/20' : 'bg-gray-100 group-hover:bg-red-100'}`}>
                                <Plus className={`w-4 h-4 ${isDarkMode ? 'text-gray-400 group-hover:text-red-400' : 'text-gray-600 group-hover:text-red-600'}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className={`mb-1 text-sm font-bold ${isDarkMode ? 'text-white group-hover:text-red-400' : 'text-gray-900 group-hover:text-red-600'}`}>Create Custom Template</h3>
                                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Build your own analysis framework</p>
                            </div>
                        </div>
                    </div>
                    
                    {/* CUSTOM GOALS SECTION - NEW COLLAPSIBLE UI */}
                    <div className="pt-2">
                        <div
                            className="flex items-center justify-between cursor-pointer mb-2"
                            onClick={() => setIsCollapsibleOpen(prev => ({ ...prev, customGoals: !prev.customGoals }))}
                        >
                            <div className="flex items-center space-x-2">
                                <h4 className={`text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Custom Goals ({customGoals.length})
                                </h4>
                                <button
                                    onClick={(e) => { e.stopPropagation(); fetchCustomGoalsProgress(); }}
                                    disabled={isPollingGoals}
                                    title="Refresh Goals Status"
                                    className={`p-1.5 rounded-full transition-all duration-200 hover:scale-110 disabled:opacity-50 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
                                >
                                    <RotateCcw className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} ${isPollingGoals ? 'animate-spin' : ''}`} />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setShowGoalSettingsModal(true); }}
                                    title="Goal Settings"
                                    className={`p-1.5 rounded-full transition-all duration-200 hover:scale-110 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
                                >
                                    <Settings className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                                </button>
                            </div>
                            <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isCollapsibleOpen.customGoals ? 'rotate-180' : ''}`} />
                        </div>
                        {isCollapsibleOpen.customGoals && (
                            <div className="space-y-2">
                                {customGoals.length > 0 ? (
                                    customGoals.map((goal) => {
                                        const progress = customGoalsProgress.find(p => p.goal.id === goal.id);
                                        const isAchieved = progress?.is_achieved || false;
                                        const evidenceCount = progress?.evidences.length || 0;
                                        const emoji = goal.emoji_icon || (isAchieved ? '✅' : '🎯');
                                        const theme = isAchieved ? 'green' : 'blue';
                                        const currentTheme = themeClasses[theme];
                                        
                                        return (
                                            <div key={goal.id} className="relative">
                                                <div
                                                    className={`group p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-lg
                                                        ${currentTheme.hoverBorder} ${currentTheme.hoverBg}
                                                        ${expandedGoals.has(goal.id) ? `${currentTheme.border} ring-2 ring-offset-2 ${currentTheme.ring} ${isDarkMode ? 'ring-offset-gray-800' : 'ring-offset-white'}` : 'border-gray-200 dark:border-gray-700'}`
                                                    }
                                                >
                                                    <div 
                                                        className="flex items-center space-x-3"
                                                        onClick={() => toggleGoalExpansion(goal.id)}
                                                    >
                                                        <div className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg ${currentTheme.iconBg}`}>
                                                            <span className="text-xl leading-none">{emoji}</span>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className={`text-sm font-bold mb-1 line-clamp-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                                {goal.goal_description}
                                                            </h3>
                                                            {progress && (
                                                                <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                                    <div className="flex items-center">
                                                                        <span className="font-medium mr-1">Summary:</span>
                                                                        <span className="truncate">{progress.summary || 'No summary available.'}</span>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                                {isAchieved ? 'Achieved' : 'In Progress'} - {evidenceCount} evidence{evidenceCount !== 1 ? 's' : ''} found
                                                            </p>
                                                        </div>
                                                        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} ${expandedGoals.has(goal.id) ? 'rotate-180' : ''}`} />
                                                    </div>
                                                    
                                                    {/* NEW: AI Analysis Button */}
                                                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleCustomGoalClick(goal);
                                                            }}
                                                            disabled={isAITyping || !session}
                                                            className={`w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                                                                isDarkMode
                                                                    ? 'bg-red-600 hover:bg-red-700 text-white'
                                                                    : 'bg-red-600 hover:bg-red-700 text-white'
                                                                }`}
                                                        >
                                                            {goalAnalysis[goal.id] === 'Generating analysis...' ? (
                                                                <>
                                                                    <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                                                                    <span>Analyzing...</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <MessageSquare className="w-4 h-4" />
                                                                    <span>Analyze with AI</span>
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>

                                                    {/* NEW: Display AI Analysis directly below the goal */}
                                                    {goalAnalysis[goal.id] && (
                                                        <div className={`mt-2 p-3 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border border-gray-200 dark:border-gray-700`}>
                                                            <EnhancedMarkdown isDarkMode={isDarkMode}>{goalAnalysis[goal.id]}</EnhancedMarkdown>
                                                        </div>
                                                    )}
                                                    
                                                    {expandedGoals.has(goal.id) && progress && progress.evidences.length > 0 && (
                                                        <div className={`mt-2 p-3 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border border-gray-200 dark:border-gray-700`}>
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                                                                    Evidence {progress.current_evidence_index + 1} of {progress.evidences.length}
                                                                </span>
                                                                <div className="flex space-x-2">
                                                                    <button
                                                                        onClick={() => navigateCustomGoalEvidence(goal.id, 'prev')}
                                                                        disabled={progress.current_evidence_index === 0}
                                                                        className={`p-1 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} disabled:opacity-50`}
                                                                    >
                                                                        <ChevronRight className="w-4 h-4 rotate-180" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => navigateCustomGoalEvidence(goal.id, 'next')}
                                                                        disabled={progress.current_evidence_index === progress.evidences.length - 1}
                                                                        className={`p-1 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} disabled:opacity-50`}
                                                                    >
                                                                        <ChevronRight className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <div className={`mt-2 p-3 rounded-md border ${isDarkMode ? 'bg-gray-900 text-gray-300 border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'}`}>
                                                                <p className="text-sm italic">
                                                                    {`"${progress.evidences[progress.current_evidence_index].text}"`}
                                                                </p>
                                                                <p className="text-xs mt-2 text-gray-500 text-right">
                                                                    - {progress.evidences[progress.current_evidence_index].primary_speaker} ({new Date(progress.evidences[progress.current_evidence_index].timestamp).toLocaleTimeString()})
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className={`p-3 rounded-xl border-2 border-dashed text-center ${isDarkMode ? 'border-gray-600 bg-gray-800/30' : 'border-gray-300 bg-gray-50'}`}>
                                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                            No meeting goals found
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* CUSTOM TEMPLATES SECTION - NEW COLLAPSIBLE UI */}
                    {customTemplates.length > 0 && (
                        <div className="pt-2">
                            <div
                                className="flex items-center justify-between cursor-pointer mb-2"
                                onClick={() => setIsCollapsibleOpen(prev => ({ ...prev, customTemplates: !prev.customTemplates }))}
                            >
                                <h4 className={`text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Custom Templates
                                </h4>
                                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isCollapsibleOpen.customTemplates ? 'rotate-180' : ''}`} />
                            </div>
                            {isCollapsibleOpen.customTemplates && (
                                <div className="space-y-2">
                                    {customTemplates.map((template) => {
                                        const currentTheme = themeClasses[template.theme];
                                        return (
                                            <div key={template.id} className="relative group">
                                                <div onClick={() => !isProcessingTemplate && handleTemplateClick(template)}
                                                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-lg
                                                        ${isProcessingTemplate ? 'opacity-60 cursor-not-allowed' : `${currentTheme.hoverBorder} ${currentTheme.hoverBg}`}
                                                        ${selectedTemplate?.id === template.id ? `${currentTheme.border} ring-2 ring-offset-2 ${currentTheme.ring} ${isDarkMode ? 'ring-offset-gray-800' : 'ring-offset-white'}` : 'border-gray-200 dark:border-gray-700'}`}>
                                                    <div className="flex items-start space-x-3">
                                                        <div className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg ${currentTheme.iconBg}`}>
                                                            {isProcessingTemplate && selectedTemplate?.id === template.id ?
                                                                <div className={`w-4 h-4 border-2 ${currentTheme.icon} rounded-full border-t-transparent animate-spin`} /> :
                                                                <template.icon className={`w-4 h-4 ${currentTheme.icon}`} />
                                                            }
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className={`mb-1 text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} line-clamp-1`}>{template.name}</h3>
                                                            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} line-clamp-2`}>{template.description}</p>
                                                        </div>
                                                        <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleEditTemplate(template); }}
                                                                className={`p-1 rounded-full ${isDarkMode ? 'bg-gray-700 text-gray-400 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                                            >
                                                                <Edit className="w-3 h-3" />
                                                            </button>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleDeleteTemplate(template); }}
                                                                className={`p-1 rounded-full ${isDarkMode ? 'bg-gray-700 text-gray-400 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                                            >
                                                                <Trash2 className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* PREBUILT TEMPLATES SECTION - NEW COLLAPSIBLE UI */}
                    <div className="pt-2">
                        <div
                            className="flex items-center justify-between cursor-pointer mb-2"
                            onClick={() => setIsCollapsibleOpen(prev => ({ ...prev, prebuiltTemplates: !prev.prebuiltTemplates }))}
                        >
                            <h4 className={`text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Prebuilt Templates
                            </h4>
                            <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isCollapsibleOpen.prebuiltTemplates ? 'rotate-180' : ''}`} />
                        </div>
                        {isCollapsibleOpen.prebuiltTemplates && (
                            <div className="space-y-2">
                                {allTemplates.filter(t => t.category === 'prebuilt').map((template) => {
                                    const currentTheme = themeClasses[template.theme];
                                    return (
                                        <div key={template.id} className="relative group">
                                            <div onClick={() => !isProcessingTemplate && handleTemplateClick(template)}
                                                className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-lg
                                                    ${isProcessingTemplate ? 'opacity-60 cursor-not-allowed' : `${currentTheme.hoverBorder} ${currentTheme.hoverBg}`}
                                                    ${selectedTemplate?.id === template.id ? `${currentTheme.border} ring-2 ring-offset-2 ${currentTheme.ring} ${isDarkMode ? 'ring-offset-gray-800' : 'ring-offset-white'}` : 'border-gray-200 dark:border-gray-700'}`}>
                                                <div className="flex items-start space-x-3">
                                                    <div className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg ${currentTheme.iconBg}`}>
                                                        {isProcessingTemplate && selectedTemplate?.id === template.id ?
                                                            <div className={`w-4 h-4 border-2 ${currentTheme.icon} rounded-full border-t-transparent animate-spin`} /> :
                                                            <template.icon className={`w-4 h-4 ${currentTheme.icon}`} />
                                                        }
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className={`mb-1 text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} line-clamp-1`}>{template.name}</h3>
                                                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} line-clamp-2`}>{template.description}</p>
                                                    </div>
                                                    <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} group-hover:translate-x-1 group-hover:${currentTheme.icon} flex-shrink-0`} />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div onMouseDown={handleMouseDown(0)} className={`hidden lg:flex w-2 cursor-col-resize items-center justify-center group ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 transition-all duration-200`}>
                <div className={`w-0.5 h-8 rounded-full ${isDarkMode ? 'bg-gray-600 group-hover:bg-white' : 'bg-gray-300 group-hover:bg-white'} transition-colors`}></div>
            </div>

            <div className="flex flex-col flex-1 min-w-0" style={{ width: `${columnWidths[1]}%` }}>
                <div className={`flex items-center justify-between p-5 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} flex-shrink-0`}>
                    <div className="flex items-center flex-1 min-w-0 space-x-4">
                        <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-blue-900/20' : 'bg-blue-100'} flex-shrink-0`}><Headphones className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} /></div>
                        <div className="flex-1 min-w-0">
                            <h2 className="text-xl font-bold truncate text-black-600 dark:text-red-400">Live Transcription</h2>
                            <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} truncate`}>Real-time meeting notes</p>
                        </div>
                    </div>
                    <div className="flex items-center flex-shrink-0 space-x-2">
                        <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-2.5 rounded-xl transition-all duration-200 ${isDarkMode ? 'hover:bg-gray-700 text-gray-400 hover:text-yellow-400' : 'hover:bg-gray-200 text-gray-600 hover:text-blue-600'} hover:scale-105`}>
                            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>
                        <button className={`p-2.5 rounded-xl transition-all duration-200 ${isDarkMode ? 'hover:bg-gray-700 text-gray-400 hover:text-white' : 'hover:bg-gray-200 text-gray-600 hover:text-gray-900'} hover:scale-105`}>
                            <Settings className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                
                <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'}`}>
                    <div className="space-y-3">
                        {meetingUrl ? (
                            <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                                    <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Meeting URL:
                                    </span>
                                </div>
                                <div className={`px-3 py-2 rounded-lg text-xs font-mono break-all ${
                                        isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-white text-gray-600'
                                    }`}>
                                    {meetingUrl}
                                </div>
                            </div>
                        ) : (
                            <div className={`py-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                <div className="text-center mb-3">
                                    <div className={`p-4 rounded-full mb-4 mx-auto w-16 h-16 flex items-center justify-center ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                        <Headphones className="w-12 h-12 text-gray-400" />
                                    </div>
                                    <h3 className="mb-2 text-lg font-bold text-black-600 dark:text-red-400">No Transcription Data</h3>
                                    <p className="text-sm text-gray-500">Please connect a meeting to start live transcription.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                        {transcript.length > 0 ? (
                            groupTranscriptBySpeaker(transcript).map((group) => (
                                <div key={group.id} className={`flex items-start space-x-3 p-4 rounded-xl border transition-all duration-200 hover:shadow-md ${isDarkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                                    <div className={`w-8 h-8 flex-shrink-0 rounded-full border-2 ${getSpeakerColor(group.speaker)} flex items-center justify-center font-bold text-sm text-white`}>
                                        {group.speaker ? group.speaker.charAt(0).toUpperCase() : '?'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className={`text-sm font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{group.speaker || 'Unknown Speaker'}</h4>
                                        <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{group.text}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                                <div className={`p-4 rounded-full mb-4 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                                    <Headphones className="w-12 h-12 text-gray-400" />
                                </div>
                                <h3 className="mb-2 text-lg font-bold text-black-600 dark:text-red-400">No Transcription Data</h3>
                                <p className="text-sm text-gray-500">Enter a meeting URL and click Start to begin recording.</p>
                            </div>
                        )}
                        <div ref={transcriptEndRef} />
                    </div>
                    {/* BEGIN: CUSTOM GOALS SECTION - MODIFIED */}
                    {customGoalsProgress.length > 0 && (
                        <div className={`p-4 border-t ${isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'}`}>
                            <div className="space-y-3">
                                <div className="flex items-center space-x-2">
                                    <TrendingUp className={`w-5 h-5 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                                    <h4 className={`text-xl font-bold ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                                        Custom Goals Progress
                                    </h4>
                                </div>
                                {customGoalsProgress.map((progress) => {
                                    const goal = progress.goal;
                                    const isAchieved = progress.is_achieved || false;
                                    const evidences = progress.evidences || [];
                                    const currentIndex = progress.current_evidence_index || 0;
                                    const emoji = goal.emoji_icon || (isAchieved ? '✅' : '🎯');
                                    const currentEvidence = evidences[currentIndex];

                                    return (
                                        <div key={goal.id} className={`p-4 rounded-xl border-2 transition-all duration-200 ${isAchieved ? 'border-green-500' : 'border-blue-500'} ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                                            <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleGoalExpansion(goal.id)}>
                                                <div className="flex items-center space-x-3 flex-1">
                                                    <div className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg ${isAchieved ? 'bg-green-100 dark:bg-green-900/30' : 'bg-blue-100 dark:bg-blue-900/30'}`}>
                                                        <span className="text-xl leading-none">{emoji}</span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className={`text-sm font-bold mb-1 line-clamp-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{goal.goal_description}</h3>
                                                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                            {isAchieved ? 'Achieved' : 'In Progress'} - {evidences.length} evidence{evidences.length !== 1 ? 's' : ''} found
                                                        </p>
                                                    </div>
                                                    <ChevronDown
                                                        className={`w-4 h-4 transition-transform duration-300 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} ${expandedGoals.has(goal.id) ? 'rotate-180' : ''}`}
                                                    />
                                                </div>
                                            </div>
                                            
                                            {expandedGoals.has(goal.id) && evidences.length > 0 && (
                                                <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                                                            Evidence {currentIndex + 1} of {evidences.length}
                                                        </span>
                                                        <div className="flex space-x-2">
                                                            <button
                                                                onClick={() => navigateCustomGoalEvidence(goal.id, 'prev')}
                                                                disabled={currentIndex === 0}
                                                                className={`p-1 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} disabled:opacity-50`}
                                                            >
                                                                <ChevronRight className="w-4 h-4 rotate-180" />
                                                            </button>
                                                            <button
                                                                onClick={() => navigateCustomGoalEvidence(goal.id, 'next')}
                                                                disabled={currentIndex === evidences.length - 1}
                                                                className={`p-1 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} disabled:opacity-50`}
                                                            >
                                                                <ChevronRight className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    {currentEvidence && (
                                                        <div className={`p-2 rounded-md ${isDarkMode ? 'bg-gray-900 text-gray-300' : 'bg-white text-gray-800'}`}>
                                                            <p className="text-sm italic">"{currentEvidence.text}"</p>
                                                            <p className="text-xs mt-2 text-gray-500 text-right"> - {currentEvidence.primary_speaker}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                    {/* END: CUSTOM GOALS SECTION */}
                </div>
            </div>

            <div onMouseDown={handleMouseDown(1)} className={`hidden lg:flex w-2 cursor-col-resize items-center justify-center group ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 transition-all duration-200`}>
                    <div className={`w-0.5 h-8 rounded-full ${isDarkMode ? 'bg-gray-600 group-hover:bg-white' : 'bg-gray-300 group-hover:bg-white'} transition-colors`}></div>
            </div>

            <div className={`flex flex-col border-l ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} min-w-0`} style={{ width: `${columnWidths[2]}%`, minWidth: '320px' }}>
                <div className={`flex items-center space-x-4 p-5 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} flex-shrink-0`}>
                    <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-green-900/20' : 'bg-green-100'}`}><MessageSquare className={`w-5 h-5 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} /></div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-xl font-bold truncate text-black-600 dark:text-red-400">AI Assistant</h2>
                        <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} truncate`}>Ask me anything</p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={generatePDF}
                            disabled={isGeneratingPDF || chatMessages.length === 0}
                            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 ${
                                isDarkMode
                                    ? 'bg-red-600 hover:bg-red-700 text-white disabled:bg-gray-600'
                                    : 'bg-red-600 hover:bg-red-700 text-white disabled:bg-gray-400'
                            }`}
                            title="Save conversation as PDF"
                        >
                            {isGeneratingPDF ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>Generating...</span>
                                </>
                            ) : (
                                <>
                                    <FileText className="w-4 h-4" />
                                    <span>Save PDF</span>
                                </>
                            )}
                        </button>
                        <button
                            onClick={handleShareClick}
                            disabled={chatMessages.length === 0}
                            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 ${
                                isDarkMode
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-600'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400'
                            }`}
                            title="Share via Email"
                        >
                            <Mail className="w-4 h-4" />
                            <span>Share</span>
                        </button>

                        <EmailDialog
                            isOpen={isEmailDialogOpen}
                            onClose={() => setIsEmailDialogOpen(false)}
                            defaultSubject={`SpikedAI Meeting Summary - ${new Date().toLocaleDateString()}`}
                            defaultBody={chatMessages
                                .filter(msg => !msg.isUser)
                                .map(msg => msg.text)
                                .join('\n\n') + '\n\n---\nGenerated by SpikedAI\nVisit us at: https://www.spiked.ai'}
                            isDarkMode={isDarkMode}
                        />
                    </div>
                </div>
                <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                    {chatMessages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] p-4 rounded-xl shadow-sm transition-all duration-200 hover:shadow-md ${
                                    msg.isUser
                                        ? 'bg-gradient-to-r from-red-600 to-red-700 text-white'
                                        : (isDarkMode ? 'bg-gray-700 hover:bg-gray-650' : 'bg-gray-100 hover:bg-gray-200')
                                }`}>
                                <EnhancedMarkdown isDarkMode={isDarkMode || msg.isUser}>{msg.text}</EnhancedMarkdown>
                                <div className={`text-xs mt-2 text-right ${msg.isUser ? 'text-red-200' : (isDarkMode ? 'text-gray-400' : 'text-gray-500')}`}>
                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>
                    ))}
                    {isAITyping && (
                        <div className="flex justify-start">
                            <div className={`p-4 rounded-xl shadow-sm ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce [animation-delay:0.1s]"></div>
                                    <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                    <span className="text-xs font-medium">AI is thinking...</span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>
                <div className={`p-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} flex-shrink-0`}>
                    {additionalQuestions.length > 0 && (
                        <div className="mb-3">
                            <p className="mb-2 text-xs font-semibold text-red-600 dark:text-red-400">Suggested questions:</p>
                            <div className="flex flex-wrap gap-2">
                                {additionalQuestions.map((q, i) => (
                                    <button key={i} onClick={(e) => handleChatSubmit(e, q)} className={`px-3 py-2 text-xs rounded-full transition-all duration-200 hover:scale-105 ${isDarkMode ? 'bg-gray-700 hover:bg-red-600 border border-gray-600' : 'bg-gray-200 hover:bg-red-100 border border-gray-300'} font-medium`}>
                                        {q}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    <form onSubmit={handleChatSubmit} className="flex items-end space-x-3">
                        <div className="flex-1">
                            <textarea
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleChatSubmit(e); } }}
                                placeholder="Ask a question..."
                                rows={1}
                                className={`w-full px-4 py-3 border rounded-xl resize-none text-sm transition-all duration-200 focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                                    isDarkMode
                                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                } focus:outline-none`}
                                style={{ minHeight: '44px', maxHeight: '120px' }}
                            />
                        </div>
                        <div className="flex space-x-2">
                            <button type="button" className={`p-3 rounded-xl transition-all duration-200 hover:scale-105 ${isConnected ? 'bg-green-500 text-white hover:bg-green-600' : (isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-200 text-gray-600')}`}>
                                <Headphones className="w-4 h-4" />
                            </button>
                            <button
                                type="submit"
                                disabled={!chatInput.trim() || isAITyping}
                                className="p-3 text-white transition-all duration-200 shadow-lg rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-red-400 disabled:to-red-500 disabled:cursor-not-allowed hover:scale-105 disabled:hover:scale-100"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {showCreateTemplateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className={`w-full max-w-2xl rounded-2xl shadow-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} max-h-[90vh] overflow-y-auto`}>
                        <div className={`flex items-center justify-between p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                            <h2 className="text-xl font-bold text-red-600 dark:text-red-400">
                                {editingTemplate ? 'Edit Custom Template' : 'Create Custom Template'}
                            </h2>
                            <button
                                onClick={() => {
                                    setShowCreateTemplateModal(false);
                                    resetTemplateForm();
                                }}
                                className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-6">
                            <div>
                                <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    Template Name *
                                </label>
                                <input
                                    type="text"
                                    value={templateForm.name}
                                    onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="e.g., Risk Assessment, Technical Review"
                                    className={`w-full px-4 py-3 border rounded-xl text-sm transition-all duration-200 focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                                        isDarkMode
                                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                    } focus:outline-none`}
                                />
                            </div>

                            <div>
                                <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    Description *
                                </label>
                                <input
                                    type="text"
                                    value={templateForm.description}
                                    onChange={(e) => setTemplateForm(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Brief description of what this template does"
                                    className={`w-full px-4 py-3 border rounded-xl text-sm transition-all duration-200 focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                                        isDarkMode
                                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                    } focus:outline-none`}
                                />
                            </div>

                            <div>
                                <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    Theme Color
                                </label>
                                <div className="flex flex-wrap gap-3">
                                    {Object.entries(themeClasses).map(([color, theme]) => (
                                        <button
                                            key={color}
                                            type="button"
                                            onClick={() => setTemplateForm(prev => ({ ...prev, theme: color }))}
                                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-2 transition-all duration-200 ${
                                                templateForm.theme === color
                                                    ? `${theme.border} ${theme.hoverBg}`
                                                    : `border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500`
                                            }`}
                                        >
                                            <div className={`w-4 h-4 rounded-full ${theme.iconBg}`}></div>
                                            <span className={`text-sm capitalize ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                {color}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    Analysis Prompt *
                                </label>
                                <textarea
                                    value={templateForm.prompt}
                                    onChange={(e) => setTemplateForm(prev => ({ ...prev, prompt: e.target.value }))}
                                    placeholder="Describe exactly what analysis you want the AI to perform on the meeting transcript. Be specific about the format, sections, and type of insights you want."
                                    rows={6}
                                    className={`w-full px-4 py-3 border rounded-xl text-sm resize-none transition-all duration-200 focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                                        isDarkMode
                                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                    } focus:outline-none`}
                                />
                                <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Tip: Use specific instructions like "Create a table with...", "List the top 5...", or "Analyze each person's contribution..."
                                </p>
                            </div>
                        </div>

                        <div className={`flex items-center justify-end space-x-3 p-6 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                            <button
                                onClick={() => {
                                    setShowCreateTemplateModal(false);
                                    resetTemplateForm();
                                }}
                                className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                                    isDarkMode
                                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveTemplate}
                                disabled={!templateForm.name.trim() || !templateForm.description.trim() || !templateForm.prompt.trim()}
                                className="px-6 py-2.5 text-white transition-all duration-200 shadow-lg rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-red-400 disabled:to-red-500 disabled:cursor-not-allowed hover:scale-105 disabled:hover:scale-100 flex items-center space-x-2"
                            >
                                <Save className="w-4 h-4" />
                                <span>{editingTemplate ? 'Update Template' : 'Create Template'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* GOAL SETTINGS MODAL - NEW */}
            {showGoalSettingsModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className={`w-full max-w-2xl rounded-2xl shadow-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} max-h-[90vh] overflow-y-auto`}>
                        <div className={`flex items-center justify-between p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                            <h2 className="text-xl font-bold text-red-600 dark:text-red-400">
                                Goal Update Settings
                            </h2>
                            <button
                                onClick={() => setShowGoalSettingsModal(false)}
                                className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-6">
                            <div>
                                <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    Output Format
                                </label>
                                <div className="flex space-x-4">
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="radio"
                                            name="format"
                                            value="summary"
                                            checked={goalSettings.format === 'summary'}
                                            onChange={(e) => setGoalSettings(prev => ({ ...prev, format: e.target.value as 'summary' }))}
                                            className="form-radio"
                                        />
                                        <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Summary</span>
                                    </label>
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="radio"
                                            name="format"
                                            value="detailed"
                                            checked={goalSettings.format === 'detailed'}
                                            onChange={(e) => setGoalSettings(prev => ({ ...prev, format: e.target.value as 'detailed' }))}
                                            className="form-radio"
                                        />
                                        <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Detailed</span>
                                    </label>
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="radio"
                                            name="format"
                                            value="speakers_only"
                                            checked={goalSettings.format === 'speakers_only'}
                                            onChange={(e) => setGoalSettings(prev => ({ ...prev, format: e.target.value as 'speakers_only' }))}
                                            className="form-radio"
                                        />
                                        <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Speakers Only</span>
                                    </label>
                                </div>
                            </div>
                            
                            <div>
                                <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    Word Limit per Goal
                                </label>
                                <input
                                    type="number"
                                    min="10"
                                    max="500"
                                    value={goalSettings.wordLimit}
                                    onChange={(e) => setGoalSettings(prev => ({ ...prev, wordLimit: parseInt(e.target.value) }))}
                                    className={`w-full px-4 py-3 border rounded-xl text-sm transition-all duration-200 focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                                        isDarkMode
                                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                    } focus:outline-none`}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        checked={goalSettings.includeTimestamps}
                                        onChange={(e) => setGoalSettings(prev => ({ ...prev, includeTimestamps: e.target.checked }))}
                                        className="form-checkbox rounded text-red-600"
                                    />
                                    <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Include Timestamps</span>
                                </label>
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        checked={goalSettings.includeSpeakers}
                                        onChange={(e) => setGoalSettings(prev => ({ ...prev, includeSpeakers: e.target.checked }))}
                                        className="form-checkbox rounded text-red-600"
                                    />
                                    <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Include Speakers</span>
                                </label>
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        checked={goalSettings.includeInstances}
                                        onChange={(e) => setGoalSettings(prev => ({ ...prev, includeInstances: e.target.checked }))}
                                        className="form-checkbox rounded text-red-600"
                                    />
                                    <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Include Exact Quotes (Instances)</span>
                                </label>
                            </div>
                        </div>

                        <div className={`flex items-center justify-end p-6 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                            <button
                                onClick={() => setShowGoalSettingsModal(false)}
                                className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                                    isDarkMode
                                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}