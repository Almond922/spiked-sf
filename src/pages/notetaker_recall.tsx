import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

import {
    Send,
    Mic,
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
    ArrowLeft
} from 'lucide-react';
import HelpChatWidget from "./HelpChatWidget";


// Enhanced Markdown Component with custom styling
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
                            <div className={`flex items-center justify-between px-4 py-2 border-b ${isDarkMode ? 'border-slate-700 bg-slate-800/60' : 'border-slate-200 bg-slate-100'}`}>
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


const BASE_URL = 'https://spikedai-old-backend-409019309412.us-central1.run.app';

interface Template {
    id: number;
    name: string;
    icon: any;
    theme: string;
    description: string;
    prompt: string;
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

const DB_NAME = 'SpikedAI_Cache';
const DB_VERSION = 1;
const TRANSCRIPTS_STORE = 'transcripts';

const initDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(TRANSCRIPTS_STORE)) {
                db.createObjectStore(TRANSCRIPTS_STORE, { keyPath: 'meetingId' });
            }
        };
    });
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

const extractGoogleMeetId = (url: string): string | null => {
    try {
        const parsedUrl = new URL(url);
        if (parsedUrl.hostname === 'meet.google.com') {
            const pathParts = parsedUrl.pathname.split('/').filter((part) => part);
            if (pathParts.length > 0) return pathParts[0];
        }
        return null;
    } catch (e) {
        return null;
    }
};

const useSessionStorage = (key: string, initialValue: any) => {
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = window.sessionStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error('Error loading from session storage:', error);
            return initialValue;
        }
    });
    useEffect(() => {
        try {
            window.sessionStorage.setItem(key, JSON.stringify(storedValue));
        } catch (error) {
            console.error('Error saving to session storage:', error);
        }
    }, [key, storedValue]);
    return [storedValue, setStoredValue];
};

export default function Notetaker() {
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
    const [isDarkMode, setIsDarkMode] = useState(false);
    
    // State for column widths
    const [columnWidths, setColumnWidths] = useState([25, 45, 30]); // Percentages for templates, transcript, AI
    const [resizingIndex, setResizingIndex] = useState<number | null>(null);

    // Check for mobile viewport - responsive behavior
    useEffect(() => {
        const checkMobile = () => {
            const isMobileView = window.innerWidth < 1024;
            if (isMobileView) {
                // Adjust column widths for mobile if needed
                setColumnWidths([100, 100, 100]); // Stack columns on mobile
            } else {
                setColumnWidths([25, 45, 30]); // Default desktop layout
            }
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const [meetingUrl] = useSessionStorage('spikedai_meeting_url', '');
    const [transcript, setTranscript] = useState<TranscriptSegment[]>([]);
    const [isRecording] = useState(false);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [isProcessingTemplate, setIsProcessingTemplate] = useState(false);
    const [isAITyping, setIsAITyping] = useState(false);
    const [additionalQuestions, setAdditionalQuestions] = useState<string[]>([]);

    const transcriptEndRef = useRef<HTMLDivElement>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Dynamic highlight.js theme loading
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

    // Fetch transcript from IndexedDB
    const fetchTranscript = async (url: string) => {
        const meetingId = extractGoogleMeetId(url);
        if (!meetingId) return;
        try {
            const cachedData = await loadFromIndexedDB(TRANSCRIPTS_STORE, meetingId);
            if (cachedData && cachedData.data) {
                setTranscript(cachedData.data);
            }
        } catch (error) {
            console.error('Failed to load transcript from cache:', error);
        }
    };

    useEffect(() => {
        if (meetingUrl) {
            fetchTranscript(meetingUrl);
            const intervalId = setInterval(() => fetchTranscript(meetingUrl), 3000);
            return () => clearInterval(intervalId);
        }
    }, [meetingUrl]);

    // Auto-scroll logic
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
    };

    const templates: Template[] = [
        { id: 1, name: 'Summary', icon: FileText, theme: 'blue', description: 'Quickly summarize the meeting highlights, action items, and next steps.', prompt: 'Provide a concise and scannable summary of the meeting, including key discussion points, action items with owners, and clear next steps.' },
        { id: 2, name: 'Stakeholder Mapper', icon: Users, theme: 'green', description: 'Map and analyze key stakeholder relationships', prompt: 'Based on the meeting transcript, identify all stakeholders mentioned, their roles, influence levels, and relationships. Create a stakeholder map with decision-making power analysis and recommend the best approach for each stakeholder.' },
        { id: 3, name: 'Battle Card Intelligence', icon: Shield, theme: 'red', description: 'Competitive intelligence and positioning', prompt: 'Analyze the meeting transcript for competitive mentions, concerns, or comparisons. Create a battle card with competitor strengths/weaknesses mentioned, objections raised, and recommended positioning strategies to address competitive threats.' },
        { id: 4, name: 'MEDDIC Command Center', icon: Target, theme: 'red', description: 'MEDDIC qualification framework', prompt: 'Evaluate this meeting using the MEDDIC framework: Metrics (quantifiable business impact), Economic Buyer (budget authority), Decision Criteria (evaluation factors), Decision Process (how they buy), Identify Pain (business problems), and Champion (internal advocate). Provide a detailed MEDDIC assessment with gaps and next steps.' },
        { id: 5, name: 'CRM Sync Studio', icon: RotateCcw, theme: 'pink', description: 'Synchronize and optimize CRM data', prompt: 'Extract all relevant CRM data from this meeting including contact information updates, deal stage progression, next meeting dates, action items with owners, budget information, timeline updates, and any other data that should be updated in the CRM system.' },
        { id: 6, name: 'Deal Health Monitor', icon: Heart, theme: 'teal', description: 'Track and monitor deal progression', prompt: 'Assess the overall health of this deal based on the meeting transcript. Analyze buyer engagement, decision-making progress, timeline adherence, budget discussions, stakeholder alignment, and competitive threats. Provide a deal health score (1-10) with specific risks and recommendations.' },
        { id: 7, name: 'Follow-Up Email Composer', icon: Mail, theme: 'sky', description: 'Craft personalized follow-up emails', prompt: 'Write a personalized follow-up email based on this meeting. Include a recap of key discussion points, commitments made by both parties, next steps with deadlines, and any materials promised. Make it professional, concise, and action-oriented.' },
        { id: 8, name: 'Executive Briefing', icon: Document, theme: 'slate', description: 'Generate executive summaries and briefs', prompt: 'Create an executive briefing document for leadership based on this meeting. Include: Executive Summary, Key Outcomes, Strategic Implications, Resource Requirements, Timeline, Risks & Mitigation, and Recommended Actions. Keep it concise and focused on business impact.' },
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
        if (!userQuestion) return;
        const newUserMessage: ChatMessage = { id: Date.now(), text: userQuestion, isUser: true, timestamp: new Date() };
        setChatMessages((prev) => [...prev, newUserMessage]);
        setChatInput('');
        setAdditionalQuestions([]);
        setIsAITyping(true);
        const transcriptText = groupTranscriptBySpeaker(transcript).map(group => `${group.speaker || 'Unknown'}: ${group.text}`).join('\n\n');
        try {
            const response = await fetch(`${BASE_URL}/api/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question: userQuestion, transcript: transcriptText, chat_history: chatMessages }) });
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
        const templateMessage: ChatMessage = { id: Date.now(), text: `Running "${template.name}"...`, isUser: true, timestamp: new Date() };
        setChatMessages((prev) => [...prev, templateMessage]);
        setIsAITyping(true);
        try {
            const response = await fetch(`${BASE_URL}/api/process-template`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: template.prompt, transcript: transcriptText }) });
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
    
    return (
        <div className={`flex flex-col lg:flex-row h-screen transition-colors duration-300 ${isDarkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
            {/* Column 1: AI Templates */}
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
                    {templates.map((template) => {
                        const currentTheme = themeClasses[template.theme];
                        return (
                            <div key={template.id} onClick={() => !isProcessingTemplate && handleTemplateClick(template)} 
                                className={`group p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-lg
                                ${isProcessingTemplate ? 'opacity-60 cursor-not-allowed' : `${currentTheme.hoverBorder} ${currentTheme.hoverBg}`} 
                                ${selectedTemplate?.id === template.id ? `${currentTheme.border} ring-2 ring-offset-2 ${currentTheme.ring} ${isDarkMode ? 'ring-offset-gray-800' : 'ring-offset-white'}` : 'border-gray-200 dark:border-gray-700'}`}>
                                <div className="flex items-start space-x-3">
                                    <div className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg ${currentTheme.iconBg}`}>
                                        {isProcessingTemplate && selectedTemplate?.id === template.id ? <div className={`w-4 h-4 border-2 ${currentTheme.icon} rounded-full border-t-transparent animate-spin`} /> : <template.icon className={`w-4 h-4 ${currentTheme.icon}`} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className={`mb-1 text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} line-clamp-1`}>{template.name}</h3>
                                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} line-clamp-2`}>{template.description}</p>
                                    </div>
                                    <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} group-hover:translate-x-1 group-hover:${currentTheme.icon} flex-shrink-0`} />
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            <div onMouseDown={handleMouseDown(0)} className={`hidden lg:flex w-2 cursor-col-resize items-center justify-center group ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 transition-all duration-200`}>
                <div className={`w-0.5 h-8 rounded-full ${isDarkMode ? 'bg-gray-600 group-hover:bg-white' : 'bg-gray-300 group-hover:bg-white'} transition-colors`}></div>
            </div>

            {/* Column 2: Live Transcription */}
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
                <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                    {groupTranscriptBySpeaker(transcript).map((group) => (
                        <div key={group.id} className={`flex items-start space-x-3 p-4 rounded-xl border transition-all duration-200 hover:shadow-md ${isDarkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                            <div className={`w-8 h-8 flex-shrink-0 rounded-full border-2 ${getSpeakerColor(group.speaker)} flex items-center justify-center font-bold text-sm text-white`}>
                                {group.speaker ? group.speaker.charAt(0).toUpperCase() : '?'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className={`text-sm font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{group.speaker || 'Unknown Speaker'}</h4>
                                <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{group.text}</p>
                            </div>
                        </div>
                    ))}
                    {transcript.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                            <div className={`p-4 rounded-full mb-4 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                                <Headphones className="w-12 h-12 text-gray-400" />
                            </div>
                            <h3 className="mb-2 text-lg font-bold text-black-600 dark:text-red-400">No Transcription Data</h3>
                            <p className="text-sm text-gray-500">Connect the bot to a meeting to start transcribing.</p>
                        </div>
                    )}
                    <div ref={transcriptEndRef} />
                </div>
            </div>

            <div onMouseDown={handleMouseDown(1)} className={`hidden lg:flex w-2 cursor-col-resize items-center justify-center group ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 transition-all duration-200`}>
                 <div className={`w-0.5 h-8 rounded-full ${isDarkMode ? 'bg-gray-600 group-hover:bg-white' : 'bg-gray-300 group-hover:bg-white'} transition-colors`}></div>
            </div>

            {/* Column 3: AI Assistant */}
            <div className={`flex flex-col border-l ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} min-w-0`} style={{ width: `${columnWidths[2]}%`, minWidth: '320px' }}>
                 <div className={`flex items-center space-x-4 p-5 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} flex-shrink-0`}>                    
                    <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-green-900/20' : 'bg-green-100'}`}><MessageSquare className={`w-5 h-5 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} /></div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-xl font-bold truncate text-black-600 dark:text-red-400">AI Assistant</h2>
                        <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} truncate`}>Ask me anything</p>
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
                            <button type="button" className={`p-3 rounded-xl transition-all duration-200 hover:scale-105 ${isRecording ? 'bg-red-500 text-white hover:bg-red-600' : (isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-200 text-gray-600')}`}>
                                <Mic className="w-4 h-4" />
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
        </div>
    );
}
