import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import EmailDialog from '../components/EmailDialog';
import PdfTemplateDialog from '../components/PdfTemplateDialog';
import { useBotId } from '../BotIdContext';
import { useAuth } from '../AuthContext';
import { useTheme } from '../ThemeContext';
import { fetchEventSource } from "@microsoft/fetch-event-source";
import HelpChatWidget from './HelpChatWidget';
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
    CheckCircle,
    Loader
} from 'lucide-react';

const BASE_URL = 'https://recall-backend-production-409019309412.us-central1.run.app';
const SALES_ASSISTANT_BASE_URL = 'https://spikedai-old-backend-409019309412.us-central1.run.app';
const service_url_recall = "https://spikedai-production-application-409019309412.us-central1.run.app";

// --- INTERFACES (UNCHANGED) ---

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
    summary?: string;
}


interface GoalSettings {
    format: 'summary' | 'detailed' | 'speakers_only';
    wordLimit: number;
    includeTimestamps: boolean;
    includeSpeakers: boolean;
    includeInstances: boolean;
    pollInterval: number;
    promptExtension: string;
}

// --- INDEXEDDB SETUP AND GLOBAL PROMISE ---

const DB_NAME = 'SpikedAI_Cache';
const DB_VERSION = 3;
const TRANSCRIPTS_STORE = 'transcripts';
const CUSTOM_TEMPLATES_STORE = 'customTemplates';

// Global reference for the database promise to ensure single, synchronized open call
let dbPromise: Promise<IDBDatabase> | null = null; 

const initDB = (): Promise<IDBDatabase> => {
    if (dbPromise) return dbPromise; // Return the existing promise if initialization is underway or complete

    dbPromise = new Promise((resolve, reject) => {
        if (!window.indexedDB) {
            reject(new Error('IndexedDB is not supported in this browser'));
            dbPromise = null; // Clear the promise on rejection for retries
            return;
        }
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        
        request.onerror = () => { 
            console.error('IndexedDB error:', request.error); 
            dbPromise = null;
            reject(request.error); 
        };
        
        request.onsuccess = () => { 
            const db = request.result;
            if (db.version !== DB_VERSION) {
                console.warn('Database version mismatch. Retrying init is typically done by incrementing DB_VERSION.');
            }
            console.log('IndexedDB opened successfully'); 
            resolve(db); 
        };
        
        request.onupgradeneeded = (event) => {
            console.log('IndexedDB upgrade needed, creating object stores');
            const db = (event.target as IDBOpenDBRequest).result;
            
            // 1. Transcripts Store
            if (!db.objectStoreNames.contains(TRANSCRIPTS_STORE)) {
                console.log('Creating transcripts store');
                db.createObjectStore(TRANSCRIPTS_STORE, { keyPath: 'meetingId' });
            }
            
            // 2. Custom Templates Store (The one that was causing issues)
            if (!db.objectStoreNames.contains(CUSTOM_TEMPLATES_STORE)) {
                console.log('Creating custom templates store');
                const customTemplatesStore = db.createObjectStore(CUSTOM_TEMPLATES_STORE, { keyPath: 'id', autoIncrement: true });
                customTemplatesStore.createIndex('name', 'name', { unique: false });
                customTemplatesStore.createIndex('createdAt', 'createdAt', { unique: false });
            }
        };
    });
    return dbPromise;
};

const saveToIndexedDB = async (storeName: string, data: any): Promise<boolean> => {
    try {
        const db = await initDB();
        
        // 🛑 CRITICAL DEFENSE CHECK: Ensure the store exists before trying a transaction
        if (!db.objectStoreNames.contains(storeName)) {
            console.error(`Object store '${storeName}' does not exist, cannot save.`);
            return false;
        }
        
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.add(data);
        return new Promise((resolve) => {
            request.onsuccess = () => resolve(true);
            request.onerror = () => {
                 // Log specific error during transaction/add
                console.error(`Error adding data to store ${storeName}:`, request.error);
                resolve(false);
            }
        });
    } catch (error) {
        console.error('Error in saveToIndexedDB:', error);
        // This catch handles errors from initDB (like unsupported browser) or transaction creation failures
        return false;
    }
};

const updateInIndexedDB = async (storeName: string, data: any): Promise<boolean> => {
    try {
        const db = await initDB();

        // 🛑 CRITICAL DEFENSE CHECK
        if (!db.objectStoreNames.contains(storeName)) {
            console.error(`Object store '${storeName}' does not exist, cannot update.`);
            return false;
        }

        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.put(data);
        return new Promise((resolve) => {
            request.onsuccess = () => resolve(true);
            request.onerror = () => {
                console.error(`Error updating data in store ${storeName}:`, request.error);
                resolve(false);
            }
        });
    } catch (error) {
        console.error('Error updating in IndexedDB:', error);
        return false;
    }
};

const deleteFromIndexedDB = async (storeName: string, key: any): Promise<boolean> => {
    try {
        const db = await initDB();
        // NOTE: While usually okay, adding the defense check here for consistency
        if (!db.objectStoreNames.contains(storeName)) {
            console.error(`Object store '${storeName}' does not exist, cannot delete.`);
            return false;
        }

        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.delete(key);
        return new Promise((resolve) => {
            request.onsuccess = () => resolve(true);
            request.onerror = () => {
                console.error(`Error deleting data from store ${storeName}:`, request.error);
                resolve(false);
            }
        });
    } catch (error) {
        console.error('Error deleting from IndexedDB:', error);
        return false;
    }
};

const loadFromIndexedDB = async (storeName: string, key?: string): Promise<any> => {
    try {
        const db = await initDB();
        
        // This is the intended and correct check
        if (!db.objectStoreNames.contains(storeName)) {
            console.log(`Object store '${storeName}' does not exist yet`);
            return key ? null : [];
        }
        
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

// --- REACT COMPONENT CODE (Unchanged functional parts for brevity, only keeping the main component) ---

const EnhancedMarkdown = ({ children, isDarkMode }: { children: string; isDarkMode: boolean }) => {
    // ... (unchanged)
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

const GoalAnalysisDisplay: React.FC<{ analysis: string; isDarkMode: boolean }> = ({ analysis, isDarkMode }) => {
    // ... (unchanged)
    if (analysis.startsWith('Generating analysis...') || analysis.startsWith('Error')) {
        return <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{analysis}</p>;
    }

    // 1. Split the raw AI response into sections based on headers like "Status:", "Summary/Analysis:", etc.
    const sections: { [key: string]: string } = {};
    const lines = analysis.split('\n');
    let currentHeader: string | null = null;
    let currentContent: string[] = [];

    for (const line of lines) {
        const statusMatch = line.match(/^Status:\s*(.*)/i);
        const summaryMatch = line.match(/^Summary\/Analysis:\s*(.*)/i);
        
        if (statusMatch) {
            if (currentHeader) sections[currentHeader] = currentContent.join('\n').trim();
            currentHeader = 'Status';
            currentContent = [statusMatch[1].trim()];
        } else if (summaryMatch) {
            if (currentHeader) sections[currentHeader] = currentContent.join('\n').trim();
            currentHeader = 'Summary/Analysis';
            currentContent = [summaryMatch[1].trim()];
        } else if (currentHeader && line.trim()) {
            currentContent.push(line);
        }
    }
    if (currentHeader) sections[currentHeader] = currentContent.join('\n').trim();

    // 2. Format for display
    const status = sections['Status'] || 'Unknown';
    const summary = sections['Summary/Analysis'] || 'No detailed summary provided by AI.';

    return (
        <div className="space-y-3">
            <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h5 className={`text-xs font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-1`}>Status</h5>
                <span className={`text-sm font-bold ${status.includes('Achieved') ? 'text-green-500' : (status.includes('Progress') ? 'text-blue-500' : 'text-gray-500')}`}>
                    {status}
                </span>
            </div>
            
            <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <h5 className={`text-xs font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-1`}>Analysis</h5>
                <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} prose prose-sm max-w-none dark:prose-invert`}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                        {summary}
                    </ReactMarkdown>
                </div>
            </div>
        </div>
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
    const { isDarkMode } = useTheme();
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
    
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
    const [transcript, setTranscript] = useState<TranscriptSegment[]>(loadFromSessionStorage('spikedai_transcript', []));
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState('');
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [isProcessingTemplate, setIsProcessingTemplate] = useState(false);
    const [isAITyping, setIsAITyping] = useState(false);
    const [additionalQuestions, setAdditionalQuestions] = useState<string[]>([]);    
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
    const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
    const [isPdfDialogOpen, setIsPdfDialogOpen] = useState(false);

    // CUSTOM GOALS STATE
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
    const [goalSettings, setGoalSettings] = useState<GoalSettings>(loadFromSessionStorage('spikedai_goal_settings', {
        format: 'summary',    
        wordLimit: 150,    
        includeTimestamps: true,
        includeSpeakers: true,
        includeInstances: false,
        pollInterval: 30000,
        promptExtension: '',
    }));
    const [retryCount, setRetryCount] = useState(0);
    const [maxRetries] = useState(3);
    const [lastFetchTime, setLastFetchTime] = useState(0);
    const [fetchCooldown] = useState(5000);

    const transcriptEndRef = useRef<HTMLDivElement>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const sseRefs = useRef<{ transcript: AbortController | null; }>({ transcript: null });

    const transcriptRef = useRef(transcript);
    useEffect(() => {
        transcriptRef.current = transcript;
    }, [transcript]);

    const groupTranscriptBySpeaker = useCallback((segments: TranscriptSegment[]) => {
        if (!segments || segments.length === 0) return [];
        const groups: { speaker: string | null, text: string, id: number, start: number }[] = [];
        let currentGroup: { speaker: string | null, text: string, id: number, start: number } | null = null;
        segments.forEach((segment, index) => {
            const startTimeInSeconds = segment.start;    
            if (currentGroup && currentGroup.speaker === segment.speaker) {
                currentGroup.text += ' ' + segment.text;
            } else {
                if (currentGroup) groups.push(currentGroup);
                currentGroup = { speaker: segment.speaker, text: segment.text, id: segment.id || index, start: startTimeInSeconds };
            }
        });
        if (currentGroup) groups.push(currentGroup);
        return groups;
    }, []);

    const fetchCustomGoals = useCallback(async () => {
        if (!session) {
            console.log('No session, skipping goals fetch');
            return;
        }
        
        const now = Date.now();
        if (now - lastFetchTime < fetchCooldown) {
            console.log('Goals fetch in cooldown, skipping...');
            return;
        }
        
        try {
            setLastFetchTime(now);
            const response = await fetch(`${service_url_recall}/meetingGoals`, {
                headers: { Authorization: `Bearer ${session.access_token}` },
            });
            if (response.ok) {
                const goals = await response.json();
                setCustomGoals(goals);
            } else if (response.status === 404) {
                console.log('Custom goals endpoint not available');
                setCustomGoals([]);
            } else {
                console.error("Failed to fetch custom goals:", response.status, response.statusText);
            }
        } catch (error) {
            console.error("Error fetching custom goals:", error);
            setCustomGoals([]);
        }
    }, [session, lastFetchTime, fetchCooldown]);

    const fetchCustomGoalsProgress = useCallback(async () => {
        const currentTranscript = transcriptRef.current;
        if (!session || !customGoals.length || currentTranscript.length === 0) return;

        const now = Date.now();
        if (now - lastFetchTime < fetchCooldown) {
            return;
        }
        setLastFetchTime(now);

        try {
            const response = await fetch(`${service_url_recall}/sentiment/custom-goals`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({
                    goals: customGoals.map(g => ({ id: g.id, description: g.goal_description, criteria: g.evaluation_criteria })),
                    transcript_segments: currentTranscript,
                }),
            });
            if (response.ok) {
                const data = await response.json();
                if (Array.isArray(data.custom_goals_progress)) {
                    setCustomGoalsProgress(data.custom_goals_progress);
                } else {
                    console.error('Invalid data format for custom goals progress:', data);
                }
            } else if (response.status === 404) {
                // Silently handle 404
            } else {
                console.error("Failed to fetch custom goals progress:", response.status, response.statusText);
            }
        } catch (error) {
            console.error("Error fetching custom goals progress:", error);
        }
    }, [session, customGoals, lastFetchTime, fetchCooldown]);

    const fetchCustomGoalUpdates = useCallback(async () => {
        const currentTranscript = transcriptRef.current;
        if (!session || isAITyping || isProcessingTemplate || !customGoals.length || currentTranscript.length === 0) {
            console.log("Goal update skipped: busy or no data.");
            return;
        }
        
        if (isPollingGoals) {
            console.log("Goal update skipped: analysis already running.");
            return;
        }

        setIsPollingGoals(true);
        const loadingAnalysis = customGoals.reduce((acc, goal) => ({ ...acc, [goal.id]: 'Generating analysis...' }), {});
        setGoalAnalysis(loadingAnalysis);

        console.log("Fetching consolidated goal updates silently...");

        const goalsText = customGoals.map(goal => `Goal: ${goal.goal_description}${goal.evaluation_criteria ? ` (Criteria: ${goal.evaluation_criteria})` : ''}`).join('\n- ');
        const transcriptText = groupTranscriptBySpeaker(currentTranscript).map(group => `[${group.start}s] ${group.speaker || 'Unknown'}: ${group.text}`).join('\n');
        
        let promptParts: string[] = [];

        promptParts.push(`Based on the full transcript provided below, analyze each of the custom goals and provide a consolidated update.
        
Your output MUST adhere to the following strict format for *each* goal, starting with the exact "Goal:" line. Do NOT include any conversational filler before the first "Goal:" line.

Goal: [The Goal's description]
Status: [Achieved/In Progress/Not Started]
Summary/Analysis: [Your detailed summary and analysis...]

Goals to analyze:
- ${goalsText}
`);

        let formatInstruction: string = `Your response MUST be a **single, raw text response** containing only the analysis for all goals, separated by the "Goal:" marker. For each goal:
1. State the **Goal:** exactly as listed above.
2. State its current **Status:** (Achieved/In Progress/Not Started).
3. Provide a **Summary/Analysis:** of the progress based on the transcript, keeping the response for this summary concise, around ${goalSettings.wordLimit} words.`;

        if (goalSettings.format === 'detailed') {
            formatInstruction = `Your response MUST be a **single, raw text response** containing only the analysis for all goals. For each goal, include:
1. **Goal:** [The Goal's description]
2. **Status:** [Achieved/In Progress/Not Started]
3. **Summary/Analysis:** A thorough analysis (strictly within ${goalSettings.wordLimit} words).
4. **Evidence List:** A markdown list of the most relevant quotes/instances from the transcript.`;
        } else if (goalSettings.format === 'speakers_only') {
            formatInstruction = `Your response MUST be a **single, raw text response** containing only the analysis for all goals. For each goal, include:
1. **Goal:** [The Goal's description]
2. **Status:** [Achieved/In Progress/Not Started]
3. **Summary/Analysis:** List only the names of the speakers who contributed evidence towards this goal.`;
        }

        let inclusionInstruction: string = '';
        if (goalSettings.includeSpeakers) {
            inclusionInstruction += 'Ensure you explicitly mention the speaker(s) associated with key evidence in your summary/analysis.';
        }
        if (goalSettings.includeTimestamps) {
            inclusionInstruction += 'Include the relevant timestamps (e.g., [45s]) next to critical pieces of evidence or dialogue.';
        }
        if (goalSettings.includeInstances) {
            inclusionInstruction += 'Where applicable, include the exact quote of the instance where the goal was mentioned or addressed (if the output format allows for an evidence list, put them there).';
        }
        if (goalSettings.promptExtension.trim()) {
            inclusionInstruction += `\nADDITIONAL CLAUSE: ${goalSettings.promptExtension.trim()}`;
        }

        promptParts.push(formatInstruction);
        if (inclusionInstruction) {
            promptParts.push(`\nAdditional Requirements: ${inclusionInstruction}`);
        }
        
        const finalPrompt = promptParts.join('\n\n') + `\n\n---
FULL TRANSCRIPT:
${transcriptText}`;

        try {
            const response = await fetch(`${SALES_ASSISTANT_BASE_URL}/api/process-template`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({ prompt: finalPrompt, transcript: transcriptText }),
            });
            if (!response.ok) throw new Error(`API failed with status ${response.status}`);
            const data = await response.json();
            
            // --- NEW LOGIC: PARSE THE CONSOLIDATED RESPONSE ---
            const rawResponse = data.response as string;
            const parsedAnalysis: Record<string, string> = {};

            const goalSections = rawResponse.split(/Goal: /g).filter(s => s.trim().length > 0);

            for (const section of goalSections) {
                const fullSection = `Goal: ${section.trim()}`;
                
                const lines = fullSection.split('\n').map(l => l.trim()).filter(l => l.length > 0);
                const goalDescriptionLine = lines[0].replace(/^Goal:\s*/i, '').replace(/Status:.*$/i, '').replace(/Summary\/Analysis:.*$/i, '').trim();

                const matchingGoal = customGoals.find(g => 
                    goalDescriptionLine.toLowerCase().includes(g.goal_description.toLowerCase().trim())
                );
                
                if (matchingGoal) {
                    parsedAnalysis[matchingGoal.id] = fullSection;
                } else {
                    console.warn('Could not match AI analysis block to a custom goal:', goalDescriptionLine);
                }
            }
            
            setGoalAnalysis(parsedAnalysis);
            console.log("✅ Goal analysis updated successfully (silently).");
            
        } catch (error) {
            console.error("💥 Error fetching custom goal updates:", error);
            setGoalAnalysis({});
        } finally {
            setIsAITyping(false);
            setIsPollingGoals(false);
        }
    }, [session, customGoals, isAITyping, isProcessingTemplate, goalSettings, groupTranscriptBySpeaker]);

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
    
    useEffect(() => {
        saveToSessionStorage('spikedai_goal_settings', goalSettings);
    }, [goalSettings]);

    const fetchTemplatesAndGoals = useCallback(() => {
        const loadCustomTemplates = async () => {
            try {
                // This call awaits the globally synchronized initDB promise
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
            loadCustomTemplates();
        }
    }, [session, fetchCustomGoals]);

    useEffect(() => {
        fetchTemplatesAndGoals();
    }, [fetchTemplatesAndGoals]);

    useEffect(() => {
        let intervalId: NodeJS.Timeout | null = null;
        
        if (isConnected && session && customGoals.length > 0) {
            console.log(`Starting/Restarting Goal Polling Interval: ${goalSettings.pollInterval / 1000}s`);

            fetchCustomGoalsProgress();    
            fetchCustomGoalUpdates();    
            
            intervalId = setInterval(() => {
                console.log('Goal Polling triggered by interval.');
                fetchCustomGoalsProgress();
                fetchCustomGoalUpdates();
            }, goalSettings.pollInterval);

            return () => {
                if (intervalId) {
                    console.log('Clearing old Goal Polling Interval.');
                    clearInterval(intervalId);
                }
            };
        }
        
        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [isConnected, session, customGoals.length, goalSettings.pollInterval, fetchCustomGoalsProgress, fetchCustomGoalUpdates]);    


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
                        setRetryCount(0);
                    } catch (e) {
                        console.error("Error parsing new transcript message:", e);
                    }
                },
                onerror(err) {
                    console.error('Transcript Stream Error:', err);
                    
                    setRetryCount(prev => prev + 1);
                    
                    if (retryCount >= maxRetries) {
                        console.log('Max retry attempts reached, stopping transcript stream');
                        if (err.message && err.message.includes('403')) {
                            setError('Access denied to transcript stream. Please check your permissions.');
                        } else if (err.message && err.message.includes('Expected content-type')) {
                            setError('Transcript stream format error. The service may be temporarily unavailable.');
                        } else {
                            setError('Transcript stream failed. Please refresh the page.');
                        }
                        setIsConnected(false);
                        cleanup();
                        return;
                    }
                    
                    if (err.message && err.message.includes('403')) {
                        setError('Access denied to transcript stream. Please check your permissions.');
                        setIsConnected(false);
                        cleanup();
                        return;
                    }
                    
                    console.log(`Transcript stream error, retry ${retryCount + 1}/${maxRetries}`);
                },
            });

        } else {
            setTranscript([]);
            setIsConnected(false);
            setError('No active meeting bot found. Please start a session in the main interface.');
            cleanup();
        }
    }, [botId, session, fetchCustomGoals, fetchCustomGoalsProgress]);    

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
    }, [setBotId]);
    
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
            const bgLight = '#F8F9FA';

            // Add SpikedAI logo (simplified version)
            doc.setFillColor(accentRed);
            doc.rect(15, 15, 8, 8, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8);
            doc.text('SA', 19, 20);

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
                const currentPage = (doc as any).internal.getCurrentPageInfo().pageNumber;
                const totalPages = (doc as any).internal.getNumberOfPages();
                doc.text(`Page ${currentPage} of ${totalPages}`, 195, 290, { align: 'right' });
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

            // Title
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(22);
            doc.setTextColor(textPrimary);
            doc.text('Conversation Summary', margin, yPosition);
            yPosition += 15;

            // Date
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
            yPosition += 20;

            // Add meeting URL if available
            if (meetingUrl) {
                doc.setFontSize(9);
                doc.setTextColor(textSecondary);
                doc.text('Meeting URL:', margin, yPosition);
                yPosition += 5;
                doc.setFontSize(8);
                doc.setTextColor('#666666');
                const urlLines = doc.splitTextToSize(meetingUrl, contentWidth);
                doc.text(urlLines, margin, yPosition);
                yPosition += urlLines.length * 4 + 15;
            }

            // Process messages with better formatting
            chatMessages.forEach((msg, index) => {
                checkPageBreak(60);

                // Add separator line between messages
                if (index > 0) {
                    doc.setDrawColor(borderLight);
                    doc.setLineWidth(0.2);
                    doc.line(margin, yPosition - 5, pageWidth - margin, yPosition - 5);
                    yPosition += 5;
                }

                // Message bubble background
                const sender = msg.isUser ? 'You' : 'AI Assistant';
                const isUser = msg.isUser;
                
                // Clean and format text properly
                let cleanText = msg.text
                    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markers
                    .replace(/\*(.*?)\*/g, '$1') // Remove italic markers
                    .replace(/### (.*)/g, '$1') // Remove h3 markers
                    .replace(/## (.*)/g, '$1') // Remove h2 markers
                    .replace(/- (.*)/g, '• $1') // Convert bullets
                    .replace(/\[\d+s\] /g, '') // Remove timestamps
                    .replace(/\n\s*\n/g, '\n') // Remove multiple newlines
                    .trim();

                // Split text into lines
                const messageLines = doc.splitTextToSize(cleanText, contentWidth - 20);
                const textHeight = messageLines.length * 4.5 + 20;

                checkPageBreak(textHeight);

                // Draw message bubble
                if (isUser) {
                    // User message - right aligned with red background
                    const bubbleWidth = Math.min(contentWidth * 0.7, 120);
                    const bubbleX = pageWidth - margin - bubbleWidth;
                    
                    doc.setFillColor(accentRed);
                    doc.roundedRect(bubbleX, yPosition, bubbleWidth, textHeight, 2, 2, 'F');
                    
                    doc.setFontSize(9);
                    doc.setTextColor(255, 255, 255);
                    doc.setFont('helvetica', 'bold');
                    doc.text(sender, bubbleX + 8, yPosition + 8);
                    
                    doc.setFontSize(8);
                    doc.setFont('helvetica', 'normal');
                    doc.text(messageLines, bubbleX + 8, yPosition + 15);
                    
                    // Timestamp
                    if (msg.timestamp) {
                        doc.setFontSize(7);
                        (doc as any).setTextColor(255, 255, 255, 0.8);
                        const time = msg.timestamp.toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                        });
                        doc.text(time, bubbleX + bubbleWidth - 8, yPosition + textHeight - 5, { align: 'right' });
                    }
                } else {
                    // AI message - left aligned with light background
                    const bubbleWidth = Math.min(contentWidth * 0.8, 140);
                    
                    doc.setFillColor(bgLight);
                    doc.roundedRect(margin, yPosition, bubbleWidth, textHeight, 2, 2, 'F');
                    
                    doc.setFontSize(9);
                    doc.setTextColor(accentRed);
                    doc.setFont('helvetica', 'bold');
                    doc.text(sender, margin + 8, yPosition + 8);
                    
                    doc.setFontSize(8);
                    doc.setTextColor(textPrimary);
                    doc.setFont('helvetica', 'normal');
                    doc.text(messageLines, margin + 8, yPosition + 15);
                    
                    // Timestamp
                    if (msg.timestamp) {
                        doc.setFontSize(7);
                        doc.setTextColor(textSecondary);
                        const time = msg.timestamp.toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                        });
                        doc.text(time, margin + bubbleWidth - 8, yPosition + textHeight - 5, { align: 'right' });
                    }
                }

                yPosition += textHeight + 10;
            });

            addFooter();

            const fileName = `SpikedAI_Conversation_${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(fileName);
        } catch (err) {
            console.error('Error generating PDF:', err);
            alert('Error generating PDF. Please ensure jspdf is loaded and try again.');
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    useEffect(() => {
        try {
            (window as any).generatePDF = generatePDF;
        } catch (e) {
            // ignore
        }
        return () => { try { delete (window as any).generatePDF; } catch (e) {} };
    }, [generatePDF, chatMessages]);

    const handleShareClick = () => {
        setIsEmailDialogOpen(true);
    };

    return (
        <div className={`flex flex-col lg:flex-row h-screen transition-colors duration-300 ${isDarkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
            <div className={`flex flex-col border-r ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'bg-gray-200 bg-white'} min-w-0`} style={{ width: `${columnWidths[0]}%`, minWidth: '280px' }}>
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
                    
                    {/* CUSTOM GOALS SECTION - MODIFIED COLLAPSIBLE UI */}
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
                                    onClick={(e) => { e.stopPropagation(); fetchCustomGoalsProgress(); fetchCustomGoalUpdates(); }}
                                    disabled={isPollingGoals || isAITyping}
                                    title="Refresh Goals Status and Run AI Analysis"
                                    className={`p-1.5 rounded-full transition-all duration-200 hover:scale-105 disabled:opacity-50 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
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
                                        
                                        let statusText = 'No analysis yet';
                                        let analysisTime = '';
                                        
                                        if (goalAnalysis[goal.id] && goalAnalysis[goal.id] !== 'Generating analysis...') {
                                            const statusMatch = goalAnalysis[goal.id].match(/Status:\s*(.*?)\n/i);
                                            statusText = statusMatch ? statusMatch[1].trim() : 'Analysis Complete';

                                            const lastAnalysisMessage = chatMessages.slice().reverse().find(msg => !msg.isUser && msg.text.includes('Goal Analysis Updated'));
                                            if (lastAnalysisMessage) {
                                                analysisTime = `Last Analysis: ${lastAnalysisMessage.timestamp.toLocaleTimeString()}`;
                                            }
                                        } else if (goalAnalysis[goal.id] === 'Generating analysis...') {
                                            statusText = 'Running analysis...';
                                            analysisTime = 'Updating in progress';
                                        } else if (!goalAnalysis[goal.id] && evidenceCount > 0) {
                                            statusText = isAchieved ? 'Achieved (Evidence Detected)' : 'In Progress (Evidence Detected)';
                                            analysisTime = `${evidenceCount} instance${evidenceCount !== 1 ? 's' : ''} found`;
                                        } else if (!goalAnalysis[goal.id] && evidenceCount === 0) {
                                            statusText = 'No detected evidence';
                                        }

                                        
                                        return (
                                            <div key={goal.id} className="relative">
                                                <div
                                                    onClick={() => toggleGoalExpansion(goal.id)}
                                                    className={`group p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-lg
                                                         ${currentTheme.hoverBorder} ${currentTheme.hoverBg}
                                                         ${expandedGoals.has(goal.id) ? `${currentTheme.border} ring-2 ring-offset-2 ${currentTheme.ring} ${isDarkMode ? 'ring-offset-gray-800' : 'ring-offset-white'}` : 'border-gray-200 dark:border-gray-700'}`
                                                    }
                                                >
                                                    <div className="flex items-center space-x-3">
                                                        <div className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg ${currentTheme.iconBg}`}>
                                                            <span className="text-xl leading-none">{emoji}</span>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className={`text-sm font-bold mb-1 line-clamp-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                                {goal.goal_description}
                                                            </h3>
                                                            <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                                <div className="flex items-center justify-between">
                                                                    <span className="font-medium mr-1">Status:</span>
                                                                    <span className={`font-semibold ${statusText.includes('Achieved') ? 'text-green-500' : (statusText.includes('Progress') ? 'text-blue-500' : 'text-gray-500')}`}>
                                                                        {statusText}
                                                                    </span>
                                                                </div>
                                                                {analysisTime && <p className="truncate mt-0.5">{analysisTime}</p>}
                                                            </div>
                                                        </div>
                                                        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} ${expandedGoals.has(goal.id) ? 'rotate-180' : ''}`} />
                                                    </div>
                                                    
                                                    {/* NEW: Display Formatted AI Analysis (if ready) */}
                                                    {expandedGoals.has(goal.id) && (
                                                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                                                            {goalAnalysis[goal.id] && goalAnalysis[goal.id] !== 'Generating analysis...' ? (
                                                                <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border border-gray-200 dark:border-gray-700`}>
                                                                    <GoalAnalysisDisplay analysis={goalAnalysis[goal.id]} isDarkMode={isDarkMode} />
                                                                </div>
                                                            ) : (
                                                                <div className={`p-3 text-center text-sm rounded-xl ${isDarkMode ? 'bg-gray-900/50 text-gray-400' : 'bg-gray-50 text-gray-600'} border border-dashed border-gray-300 dark:border-gray-700`}>
                                                                    {isPollingGoals ? (
                                                                        <div className="flex items-center justify-center space-x-2">
                                                                            <Loader className="w-4 h-4 animate-spin text-red-500" />
                                                                            <span>Running detailed analysis...</span>
                                                                        </div>
                                                                    ) : (
                                                                        <span>Detailed AI analysis will run soon or click the refresh icon.</span>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                    
                                                    {/* Evidence Expansion Section (simplified UI) */}
                                                    {expandedGoals.has(goal.id) && progress && progress.evidences.length > 0 && (
                                                        <div className={`mt-3 pt-3 border-t ${goalAnalysis[goal.id] ? 'border-none pt-0' : 'border-gray-200 dark:border-gray-600'}`}>
                                                            <div className={`mt-2 p-3 rounded-lg space-y-2 border-2 ${isDarkMode ? 'bg-gray-900/50 border-red-900/50' : 'bg-red-50 border-red-300/50'}`}>
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                                                                        Evidence Instance {progress.current_evidence_index + 1} of {progress.evidences.length}
                                                                    </span>
                                                                    <div className="flex space-x-2">
                                                                        <button
                                                                            onClick={(e) => { e.stopPropagation(); navigateCustomGoalEvidence(goal.id, 'prev'); }}
                                                                            disabled={progress.current_evidence_index === 0}
                                                                            className={`p-1 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} disabled:opacity-50`}
                                                                        >
                                                                            <ChevronRight className="w-4 h-4 rotate-180" />
                                                                        </button>
                                                                        <button
                                                                            onClick={(e) => { e.stopPropagation(); navigateCustomGoalEvidence(goal.id, 'next'); }}
                                                                            disabled={progress.current_evidence_index === progress.evidences.length - 1}
                                                                            className={`p-1 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} disabled:opacity-50`}
                                                                        >
                                                                            <ChevronRight className="w-4 h-4" />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                                {progress.evidences[progress.current_evidence_index] && (
                                                                    <div className={`p-2 rounded-md border border-red-500/50 ${isDarkMode ? 'bg-gray-900/80 text-gray-300' : 'bg-white text-gray-800'}`}>
                                                                        <p className="text-sm italic text-red-500 font-medium">"{progress.evidences[progress.current_evidence_index].text}"</p>
                                                                        <p className="text-xs mt-2 text-gray-500 text-right"> - {progress.evidences[progress.current_evidence_index].primary_speaker} @ {new Date(progress.evidences[progress.current_evidence_index].timestamp).toLocaleTimeString()}</p>
                                                                    </div>
                                                                )}
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

                    {/* CUSTOM TEMPLATES SECTION */}
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

                    {/* PREBUILT TEMPLATES SECTION */}
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
                        
                    </div>
                </div>
                
                <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'}`}>  
                    <HelpChatWidget />              
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
                                    <div className={`p-4 rounded-full mb-4 mx-auto w-16 h-16 flex items-center justify-center ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
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
                    {error && (
                        <div className={`p-4 rounded-xl border-l-4 border-red-500 ${isDarkMode ? 'bg-red-900/20' : 'bg-red-50'}`}>
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                <p className={`text-sm ${isDarkMode ? 'text-red-200' : 'text-red-800'}`}>
                                    {error}
                                </p>
                            </div>
                        </div>
                    )}
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
                            <div className={`p-4 rounded-full mb-4 mx-auto w-16 h-16 flex items-center justify-center ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                                <Headphones className="w-12 h-12 text-gray-400" />
                            </div>
                            <h3 className="mb-2 text-lg font-bold text-black-600 dark:text-red-400">No Transcription Data</h3>
                            <p className="text-sm text-gray-500">Enter a meeting URL and click Start to begin recording.</p>
                        </div>
                    )}
                    <div ref={transcriptEndRef} />
                </div>
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
                            onClick={() => setIsPdfDialogOpen(true)}
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
                            transcriptText={groupTranscriptBySpeaker(transcript).map(group => `${group.speaker || 'Unknown'}: ${group.text}`).join('\n\n')}
                            meetingUrl={meetingUrl}
                            isDarkMode={isDarkMode}
                            sessionToken={session?.access_token}
                            backendUrl={SALES_ASSISTANT_BASE_URL}
                        />
                        <PdfTemplateDialog
                            isOpen={isPdfDialogOpen}
                            onClose={() => setIsPdfDialogOpen(false)}
                            templates={allTemplates}
                            transcriptText={groupTranscriptBySpeaker(transcript).map(group => `${group.speaker || 'Unknown'}: ${group.text}`).join('\n\n')}
                            sessionToken={session?.access_token}
                            isDarkMode={isDarkMode}
                            backendUrl={SALES_ASSISTANT_BASE_URL}
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
            
            {/* GOAL SETTINGS MODAL */}
            {showGoalSettingsModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className={`w-full max-w-2xl rounded-2xl shadow-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} max-h-[90vh] overflow-y-auto`}>
                        <div className={`flex items-center justify-between p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                            <h2 className="text-xl font-bold text-red-600 dark:text-red-400">
                                AI Goal Update Settings
                            </h2>
                            <button
                                onClick={() => setShowGoalSettingsModal(false)}
                                className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-6">
                             {/* Polling Interval */}
                            <div>
                                <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    Automatic Update Interval (Seconds)
                                </label>
                                <input
                                    type="number"
                                    min="30"
                                    max="300"
                                    value={goalSettings.pollInterval / 1000}
                                    onChange={(e) => {
                                        const value = parseInt(e.target.value);
                                        const newInterval = Math.max(30, Math.min(300, value)) * 1000;
                                        setGoalSettings(prev => ({ ...prev, pollInterval: newInterval }));
                                    }}
                                    className={`w-full px-4 py-3 border rounded-xl text-sm transition-all duration-200 focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                                        isDarkMode
                                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                    } focus:outline-none`}
                                />
                                <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    The AI will check goals and post an update to the chat every {goalSettings.pollInterval / 1000} seconds. (Min 30s, Max 300s)
                                </p>
                            </div>

                            {/* Output Format */}
                            <div>
                                <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    Output Format
                                </label>
                                <div className="flex flex-wrap gap-4">
                                    {['summary', 'detailed', 'speakers_only'].map((format) => (
                                        <label key={format} className="flex items-center space-x-2">
                                            <input
                                                type="radio"
                                                name="format"
                                                value={format}
                                                checked={goalSettings.format === format}
                                                onChange={(e) => setGoalSettings(prev => ({ ...prev, format: e.target.value as 'summary' | 'detailed' | 'speakers_only' }))}
                                                className="form-radio h-4 w-4 text-red-600 border-gray-300 focus:ring-red-500"
                                            />
                                            <span className={`text-sm capitalize ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{format.replace('_', ' ')}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Word Limit */}
                            <div>
                                <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    Word Limit per Goal Summary ({goalSettings.wordLimit} words)
                                </label>
                                <input
                                    type="range"
                                    min="50"
                                    max="500"
                                    step="50"
                                    value={goalSettings.wordLimit}
                                    onChange={(e) => setGoalSettings(prev => ({ ...prev, wordLimit: parseInt(e.target.value) }))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                                />
                                <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Controls the verbosity of the AI's summary for each goal.
                                </p>
                            </div>

                            {/* Inclusion Options Checkboxes */}
                            <div className="space-y-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                                <label className={`block text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    Details to Include
                                </label>
                                
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        checked={goalSettings.includeTimestamps}
                                        onChange={(e) => setGoalSettings(prev => ({ ...prev, includeTimestamps: e.target.checked }))}
                                        className="form-checkbox h-4 w-4 rounded text-red-600 border-gray-300 focus:ring-red-500"
                                    />
                                    <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Include Timestamps with evidence.</span>
                                </label>
                                
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        checked={goalSettings.includeSpeakers}
                                        onChange={(e) => setGoalSettings(prev => ({ ...prev, includeSpeakers: e.target.checked }))}
                                        className="form-checkbox h-4 w-4 rounded text-red-600 border-gray-300 focus:ring-red-500"
                                    />
                                    <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Include Speakers who uttered the evidence.</span>
                                </label>

                                <label className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        checked={goalSettings.includeInstances}
                                        onChange={(e) => setGoalSettings(prev => ({ ...prev, includeInstances: e.target.checked }))}
                                        className="form-checkbox h-4 w-4 rounded text-red-600 border-gray-300 focus:ring-red-500"
                                    />
                                    <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Include Exact Quotes (Instances) in the output.</span>
                                </label>
                            </div>

                            {/* NEW: Prompt Extension */}
                            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                                <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    Additional Prompt Clause (Optional)
                                </label>
                                <textarea
                                    value={goalSettings.promptExtension}
                                    onChange={(e) => setGoalSettings(prev => ({ ...prev, promptExtension: e.target.value }))}
                                    placeholder="e.g., 'Focus only on buyer-side commitments.', or 'Rate the confidence of achievement from 1-10.'"
                                    rows={3}
                                    className={`w-full px-4 py-3 border rounded-xl text-sm resize-none transition-all duration-200 focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                                        isDarkMode
                                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                    } focus:outline-none`}
                                />
                                <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    This clause is appended to the main AI instruction for every goal check.
                                </p>
                            </div>
                        </div>

                        <div className={`flex items-center justify-end p-6 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                            <button
                                onClick={() => setShowGoalSettingsModal(false)}
                                className={`px-6 py-2.5 text-white transition-all duration-200 shadow-lg rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 flex items-center space-x-2`}
                            >
                                <CheckCircle className="w-4 h-4" />
                                <span>Save Settings</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}