// src/pages/notetaker.tsx
import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import EmailDialog from '../components/EmailDialog';
// 🆕 ADDED: Import the useBot hook
import { useBot } from '../BotContext';
// 🆕 ADDED: Import the useAuth hook for authentication token
import { useAuth } from '../AuthContext';


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
    Save
} from 'lucide-react';
import { jsPDF } from "jspdf";

// ... (EnhancedMarkdown component and all interfaces remain the same)
// ...

const BASE_URL = 'https://recall-backend-production-822359826336.us-central1.run.app';
const SALES_ASSISTANT_BASE_URL = 'https://sales-assistant-service-822359826336.us-central1.run.app';

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

interface RecallTranscriptItem {
    speaker: string;
    text: string;
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
        
        request.onerror = () => {
            console.error('IndexedDB error:', request.error);
            reject(request.error);
        };
        
        request.onsuccess = () => {
            console.log('IndexedDB opened successfully');
            resolve(request.result);
        };
        
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
        console.log('Initializing database for save operation');
        const db = await initDB();
        console.log('Database initialized, starting transaction');
        
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        
        console.log('Adding data to store:', data);
        const request = store.add(data);
        
        return new Promise((resolve) => {
            request.onsuccess = () => {
                console.log('Data saved successfully, generated ID:', request.result);
                resolve(true);
            };
            request.onerror = () => {
                console.error('Error saving data:', request.error);
                resolve(false);
            };
            
            transaction.oncomplete = () => {
                console.log('Transaction completed successfully');
            };
            
            transaction.onerror = () => {
                console.error('Transaction error:', transaction.error);
                resolve(false);
            };
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

export default function Notetaker() {
    // 🆕 CHANGED: Use useAuth and useBot hooks
    const { session } = useAuth();
    const { botId, setBotId } = useBot();

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

    useEffect(() => {
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
        loadCustomTemplates();
    }, []);

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

    // 🆕 CHANGED: Remove local meetingUrl state and use botId from context
    // const [meetingUrl, setMeetingUrl] = useState('');
    const [transcript, setTranscript] = useState<TranscriptSegment[]>([]);
    const [questions, setQuestions] = useState<RecallTranscriptItem[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState('');
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [isProcessingTemplate, setIsProcessingTemplate] = useState(false);
    const [isAITyping, setIsAITyping] = useState(false);
    const [additionalQuestions, setAdditionalQuestions] = useState<string[]>([]);
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
    const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);

    const generateEmailContent = () => {
        if (!chatMessages || chatMessages.length === 0) {
            alert('No conversation to share. Please start a chat first.');
            return null;
        }

        const summary = chatMessages
            .filter(msg => !msg.isUser)
            .map(msg => msg.text)
            .join('\n\n');

        const emailSubject = `SpikedAI Meeting Summary - ${new Date().toLocaleDateString()}`;
        const emailBody = `
Meeting Summary from SpikedAI
Date: ${new Date().toLocaleString()}
Meeting ID: ${botId || 'N/A'}

${summary}

---
Generated by SpikedAI
Visit us at: https://www.spiked.ai
        `.trim();

        return { subject: encodeURIComponent(emailSubject), body: encodeURIComponent(emailBody) };
    };

    const handleShareClick = () => {
        if (!chatMessages || chatMessages.length === 0) {
            alert('No conversation to share. Please start a chat first.');
            return;
        }
        setIsEmailDialogOpen(true);
    };

    const generatePDF = () => {
        if (!chatMessages || chatMessages.length === 0) {
            alert('No conversation to export. Please start a chat first.');
            return;
        }

        try {
            setIsGeneratingPDF(true);
            
            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });
            
            if (!doc) {
                throw new Error('Failed to initialize PDF document');
            }
            
            const accentRed = '#F44336';
            const accentGreen = '#4CAF50';
            const accentBlue = '#2196F3';
            const textPrimary = '#212121';
            const textSecondary = '#757575';
            const borderLight = '#E0E0E0';
            
            let yPosition = 20;
            const pageWidth = doc.internal.pageSize.getWidth();
            const margin = 20;
            const contentWidth = pageWidth - (margin * 2);
            const lineHeight = 7;

            const checkPageBreak = (requiredHeight: number): void => {
                if (yPosition + requiredHeight > doc.internal.pageSize.height - 25) {
                    addFooter();
                    doc.addPage();
                    addHeader();
                    yPosition = 40;
                }
            };

            const addHeader = (): void => {
                try {
                    doc.addImage('/logo.png', 'PNG', margin, 15, 4, 4);
                } catch (error) {
                    console.error('Error adding logo:', error);
                }

                doc.setFont('helvetica', 'bold');
                doc.setFontSize(18);
                doc.setTextColor(textPrimary);
                doc.text('SpikedAI', margin + 18, 21);
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(10);
                doc.setTextColor(textSecondary);
                doc.text('Conversation Export', pageWidth - margin, 20, { align: 'right' });
                doc.setDrawColor(accentRed);
                doc.setLineWidth(0.5);
                doc.line(margin, 25, pageWidth - margin, 25);
            };

            const addFooter = (): void => {
                const pageNumber = doc.getNumberOfPages();
                doc.setFontSize(8);
                doc.setTextColor(textSecondary);
                doc.text(`Page ${pageNumber}`, pageWidth - margin, 290, { align: 'right' });
                doc.text('Confidential & Proprietary. All rights reserved to SpikedAI', margin, 290);
            };

            addHeader();
            yPosition = 40;

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(22);
            doc.setTextColor(textPrimary);
            doc.text('Conversation Summary', margin, yPosition);
            yPosition += 15;

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.setTextColor(textSecondary);
            doc.text(`Meeting ID: ${botId || 'N/A'}`, margin, yPosition);
            doc.text(`Export Date: ${new Date().toLocaleString()}`, margin, yPosition + 5);
            doc.text(`Total Messages: ${chatMessages.length}`, margin, yPosition + 10);
            yPosition += 20;

            if (chatMessages.length > 0) {
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(18);
                doc.setTextColor(textPrimary);
                doc.text('Chat Transcript', margin, yPosition);
                yPosition += 10;

                chatMessages.forEach((message) => {
                    checkPageBreak(60);

                    doc.setDrawColor(borderLight);
                    doc.setLineWidth(0.2);
                    doc.line(margin, yPosition - 5, pageWidth - margin, yPosition - 5);

                    doc.setFontSize(11);
                    doc.setFont('helvetica', 'bold');
                    doc.setTextColor(message.isUser ? accentBlue : accentGreen);
                    const role = message.isUser ? 'You' : 'AI Assistant';
                    const timestamp = message.timestamp.toLocaleString();
                    doc.text(`${role} (${timestamp})`, margin, yPosition + 5);

                    let cleanText = message.text
                        ? message.text
                            .replace(/\*\*(.*?)\*\*/g, '$1')
                            .replace(/\*(.*?)\*/g, '$1')
                            .replace(/`(.*?)`/g, '$1')
                            .replace(/#{1,6}\s/g, '')
                            .replace(/```[\s\S]*?```/g, '[Code Block]')
                            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
                            .trim()
                        : '';

                    if (cleanText) {
                        doc.setFont('helvetica', 'normal');
                        doc.setFontSize(10);
                        doc.setTextColor(textPrimary);
                        const lines = doc.splitTextToSize(cleanText, contentWidth);
                        
                        const messageHeight = lines.length * lineHeight + 20;
                        checkPageBreak(messageHeight);
                        
                        doc.text(lines, margin, yPosition + 12);
                        yPosition += messageHeight;
                    } else {
                        yPosition += 10;
                    }
                });
            }

            if (additionalQuestions.length > 0) {
                checkPageBreak(60);
                
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(18);
                doc.setTextColor(textPrimary);
                doc.text('Suggested Follow-up Questions', margin, yPosition);
                yPosition += 10;

                doc.setFont('helvetica', 'normal');
                doc.setFontSize(10);
                doc.setTextColor(textPrimary);

                additionalQuestions.forEach((question, index) => {
                    checkPageBreak(15);
                    doc.text(`${index + 1}. ${question}`, margin, yPosition);
                    yPosition += 7;
                });
            }

            addFooter();

            const timestamp = new Date().toISOString().split('T')[0];
            const filename = `SpikedAI_Conversation_${timestamp}.pdf`;
            
            try {
                doc.save(filename);
                console.log('PDF generated successfully:', filename);
            } catch (saveError) {
                console.error('Error saving PDF:', saveError);
                throw new Error('Failed to save the PDF file');
            }

        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF: ' + (error instanceof Error ? error.message : 'Unknown error'));
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    // 🆕 CHANGED: Use botId directly from context, remove sessionStorage logic
    useEffect(() => {
        if (botId) {
            connectToExistingStreams();
        } else {
            // Clear data if no botId is available
            setTranscript([]);
            setQuestions([]);
            setIsConnected(false);
            setError('No active meeting bot found. Please start a session in the main interface.');
        }

        // The cleanup function remains the same
        return () => {
            if (transcriptSourceRef.current) {
                transcriptSourceRef.current.close();
            }
            if (questionSourceRef.current) {
                questionSourceRef.current.close();
            }
        };
    }, [botId, session]); // 🆕 CHANGED: Depend on botId and session

    const transcriptEndRef = useRef<HTMLDivElement>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const transcriptSourceRef = useRef<EventSource | null>(null);
    const questionSourceRef = useRef<EventSource | null>(null);

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

    const connectToExistingStreams = async () => {
        console.log('🚀 Starting connectToExistingStreams...');
        setError('');

        // 🆕 CHANGED: Check for botId from context
        if (!botId || !session?.access_token) {
            const errorMsg = 'No active meeting bot found or user not authenticated. Please start a session in the main SpikedAI interface.';
            console.error('❌', errorMsg);
            setError(errorMsg);
            return;
        }

        console.log('🎯 Attempting to connect to streams for bot ID:', botId);
        
        try {
            setIsConnected(true);
            console.log('✅ Set connection status to true');
            
            // Fetch transcript history
            console.log('📥 Fetching transcript history...');
            try {
                // 🆕 CHANGED: Use botId in the endpoint
                const historyResponse = await fetch(`${BASE_URL}/bot/${botId}/data`, {
                    headers: {
                        Authorization: `Bearer ${session.access_token}`
                    }
                });
                console.log('📥 History response status:', historyResponse.status);
                
                if (historyResponse.ok) {
                    const historyData = await historyResponse.json();
                    if (historyData.transcripts && Array.isArray(historyData.transcripts)) {
                        const historicalTranscripts = historyData.transcripts.map((item: any, index: number) => ({
                            id: Date.now() + index,
                            start: 0,
                            end: 0,
                            text: item.text,
                            language: 'en',
                            created_at: item.timestamp || new Date().toISOString(),
                            speaker: item.speaker,
                            absolute_start_time: item.timestamp || new Date().toISOString(),
                            absolute_end_time: item.timestamp || new Date().toISOString()
                        }));
                        
                        console.log(`📚 Loading ${historicalTranscripts.length} historical transcripts`);
                        setTranscript(historicalTranscripts); // 🆕 CHANGED: Overwrite, don't append, as this is the full history
                    }
                } else {
                    console.log('ℹ️ No transcript history available or history endpoint returned:', historyResponse.status);
                }
            } catch (historyError) {
                console.log('ℹ️ Error fetching historical transcripts:', historyError);
            }
            
            // Close existing connections if any
            if (transcriptSourceRef.current) {
                console.log('🔌 Closing existing transcript connection');
                transcriptSourceRef.current.close();
                transcriptSourceRef.current = null;
            }
            if (questionSourceRef.current) {
                console.log('🔌 Closing existing question connection');
                questionSourceRef.current.close();
                questionSourceRef.current = null;
            }
            
            // Connect to transcript stream
            console.log('📡 Connecting to transcript stream with botId:', botId);
            transcriptSourceRef.current = new EventSource(`${BASE_URL}/transcripts/${botId}`);
            
            transcriptSourceRef.current.onopen = () => {
                console.log('✅ Transcript stream connected successfully');
            };
            
            transcriptSourceRef.current.onmessage = (event) => {
                try {
                    console.log('📝 Received transcript data:', event.data);
                    const data: RecallTranscriptItem = JSON.parse(event.data);
                    const legacyTranscript: TranscriptSegment = {
                        id: Date.now() + Math.random(),
                        start: 0,
                        end: 0,
                        text: data.text,
                        language: 'en',
                        created_at: new Date().toISOString(),
                        speaker: data.speaker,
                        absolute_start_time: new Date().toISOString(),
                        absolute_end_time: new Date().toISOString()
                    };
                    setTranscript(prev => [...prev, legacyTranscript]);
                    console.log('✅ Added transcript to state');
                } catch (err) {
                    console.error('❌ Error parsing transcript data:', err);
                }
            };
            
            transcriptSourceRef.current.onerror = (error) => {
                console.error('❌ Transcript stream error:', error);
                setError('Connection to transcript stream failed');
                setIsConnected(false);
            };
            
            // Connect to questions stream
            console.log('❓ Connecting to questions stream with botId:', botId);
            questionSourceRef.current = new EventSource(`${BASE_URL}/questions/${botId}`);
            
            questionSourceRef.current.onopen = () => {
                console.log('✅ Questions stream connected successfully');
            };
            
            questionSourceRef.current.onmessage = (event) => {
                try {
                    console.log('❓ Received question data:', event.data);
                    const data: RecallTranscriptItem = JSON.parse(event.data);
                    setQuestions(prev => [...prev, data]);
                    console.log('✅ Added question to state');
                } catch (err) {
                    console.error('❌ Error parsing question data:', err);
                }
            };
            
            questionSourceRef.current.onerror = (error) => {
                console.error('❌ Questions stream error:', error);
                setError('Connection to questions stream failed');
                setIsConnected(false);
            };
            
            console.log('🎉 Stream connections initiated successfully');
            
        } catch (err: any) {
            console.error('❌ Failed to connect to streams:', err);
            setError(err.message || 'Failed to connect to streams');
            setIsConnected(false);
        }
    };

    useEffect(() => {
        return () => {
            if (transcriptSourceRef.current) {
                transcriptSourceRef.current.close();
            }
            if (questionSourceRef.current) {
                questionSourceRef.current.close();
            }
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
        if (!userQuestion) return;
        const newUserMessage: ChatMessage = { id: Date.now(), text: userQuestion, isUser: true, timestamp: new Date() };
        setChatMessages((prev) => [...prev, newUserMessage]);
        setChatInput('');
        setAdditionalQuestions([]);
        setIsAITyping(true);
        const transcriptText = groupTranscriptBySpeaker(transcript).map(group => `${group.speaker || 'Unknown'}: ${group.text}`).join('\n\n');
        
        try {
            // 🆕 CHANGED: Include botId and access_token in the request body and headers
            const response = await fetch(`${SALES_ASSISTANT_BASE_URL}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session?.access_token}`,
                },
                body: JSON.stringify({
                    question: userQuestion,
                    transcript: transcriptText,
                    chat_history: chatMessages,
                    bot_id: botId, // 🆕 ADDED: Pass the botId
                })
            });
            
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
            // 🆕 CHANGED: Include botId and access_token in the request body and headers
            const response = await fetch(`${SALES_ASSISTANT_BASE_URL}/api/process-template`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session?.access_token}`,
                },
                body: JSON.stringify({
                    prompt: template.prompt,
                    transcript: transcriptText,
                    bot_id: botId, // 🆕 ADDED: Pass the botId
                })
            });
            
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
            console.log('Validation failed: Missing required fields');
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

        console.log('Attempting to save template:', templateData);

        try {
            if (editingTemplate) {
                console.log('Updating existing template with ID:', editingTemplate.id);
                const updatedTemplate = { ...templateData, id: editingTemplate.id };
                const success = await updateInIndexedDB(CUSTOM_TEMPLATES_STORE, updatedTemplate);
                console.log('Update result:', success);
                if (success) {
                    const templateWithIcon = { ...updatedTemplate, icon: FileText };
                    setCustomTemplates(prev =>
                        prev.map(t => t.id === editingTemplate.id ? templateWithIcon : t)
                    );
                }
            } else {
                console.log('Creating new template');
                const success = await saveToIndexedDB(CUSTOM_TEMPLATES_STORE, templateData);
                console.log('Save result:', success);
                if (success) {
                    const updatedTemplates = await loadFromIndexedDB(CUSTOM_TEMPLATES_STORE);
                    console.log('Loaded templates after save:', updatedTemplates);
                    const formattedTemplates = updatedTemplates.map((template: any) => ({
                        ...template,
                        icon: FileText,
                        category: 'custom',
                        isCustom: true,
                    }));
                    setCustomTemplates(formattedTemplates);
                } else {
                    console.error('Failed to save template to IndexedDB');
                    alert('Failed to save template. Please try again.');
                    return;
                }
            }
            setShowCreateTemplateModal(false);
            resetTemplateForm();
            console.log('Template operation completed successfully');
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

    const allTemplates = [...customTemplates, ...templates];
    
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

                    {allTemplates.length > 0 && (
                        <>
                            {customTemplates.length > 0 && (
                                <div className="pt-2">
                                    <h4 className={`text-xs font-semibold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        Custom Templates
                                    </h4>
                                    {customTemplates.map((template) => {
                                        const currentTheme = themeClasses[template.theme];
                                        return (
                                            <div key={template.id} className="relative group">
                                                <div onClick={() => !isProcessingTemplate && handleTemplateClick(template)}
                                                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-lg mb-2
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
                                                        <div className="flex items-center space-x-1 flex-shrink-0">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleEditTemplate(template);
                                                                }}
                                                                className={`p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 ${isDarkMode ? 'hover:bg-gray-600 text-gray-400' : 'hover:bg-gray-200 text-gray-600'}`}
                                                            >
                                                                <Edit className="w-3 h-3" />
                                                            </button>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDeleteTemplate(template);
                                                                }}
                                                                className={`p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 ${isDarkMode ? 'hover:bg-red-600 text-gray-400 hover:text-white' : 'hover:bg-red-100 text-gray-600 hover:text-red-600'}`}
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

                            <div className="pt-2">
                                <h4 className={`text-xs font-semibold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Prebuilt Templates
                                </h4>
                                {allTemplates.filter(t => t.category === 'prebuilt').map((template) => {
                                    const currentTheme = themeClasses[template.theme];
                                    return (
                                        <div key={template.id} className="relative group">
                                            <div onClick={() => !isProcessingTemplate && handleTemplateClick(template)}
                                                className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-lg mb-2
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
                        </>
                    )}
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
                
                <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'}`}>
                    <div className="space-y-3">
                        {/* 🆕 CHANGED: Display botId instead of meetingUrl */}
                        {botId ? (
                            <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                                    <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Bot ID:
                                    </span>
                                </div>
                                <div className={`px-3 py-2 rounded-lg text-xs font-mono break-all ${
                                    isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-white text-gray-600'
                                }`}>
                                    {botId}
                                </div>
                            </div>
                        ) : (
                            <div className={`py-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                <div className="text-center mb-3">
                                    <p className="text-sm">No active meeting bot found</p>
                                    <p className="text-xs mt-1">Please start a meeting in the main SpikedAI interface.</p>
                                </div>
                                
                                <div className="space-y-2">
                                    <button
                                        onClick={() => {
                                            console.log('🔄 Force reload from main interface');
                                            window.location.reload();
                                        }}
                                        className={`w-full px-3 py-2 text-xs rounded-lg transition-colors ${
                                            isDarkMode
                                                ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                                                : 'bg-yellow-500 text-white hover:bg-yellow-600'
                                        }`}
                                    >
                                        Reload Page (if a meeting was just started)
                                    </button>
                                </div>
                            </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                                    <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        {isConnected ? 'Streaming' : 'Not Connected'}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                                {botId && ( // 🆕 CHANGED: Only show refresh if a botId exists
                                    <div className={`px-3 py-1.5 rounded-lg text-xs flex items-center space-x-2 ${
                                        isDarkMode
                                            ? 'bg-gray-700 text-gray-300'
                                            : 'bg-gray-100 text-gray-600'
                                    }`}>
                                        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                                        <span>
                                            {isConnected ? 'Receiving Transcripts' : 'Connecting to Streams...'}
                                        </span>
                                    </div>
                                )}
                                
                                <button
                                    onClick={() => {
                                        console.log('🔄 Manual refresh connection triggered');
                                        connectToExistingStreams();
                                    }}
                                    className={`px-3 py-1.5 text-xs rounded-lg transition-all duration-200 hover:scale-105 flex items-center space-x-1 ${
                                        isDarkMode
                                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                                            : 'bg-blue-500 text-white hover:bg-blue-600'
                                    }`}
                                    title="Refresh connection to streams"
                                >
                                    <RotateCcw className="w-3 h-3" />
                                    <span>Refresh</span>
                                </button>
                            </div>
                        </div>
                        
                        {error && (
                            <div className={`text-xs p-2 rounded ${isDarkMode ? 'bg-red-900/20 text-red-400' : 'bg-red-50 text-red-600'}`}>
                                {error}
                            </div>
                        )}
                        
                    </div>
                </div>
                
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Transcript Section */}
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
                    
                    {questions.length > 0 && (
                        <div className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                            <div className={`p-3 border-b ${isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-yellow-50'}`}>
                                <h3 className={`text-sm font-semibold ${isDarkMode ? 'text-yellow-400' : 'text-yellow-800'}`}>
                                    Detected Questions ({questions.length})
                                </h3>
                            </div>
                            <div className="max-h-48 p-3 space-y-2 overflow-y-auto">
                                {questions.map((question, index) => (
                                    <div key={index} className={`p-3 rounded-lg border ${isDarkMode ? 'bg-yellow-900/20 border-yellow-800/30' : 'bg-yellow-50 border-yellow-200'}`}>
                                        <div className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-800'}`}>
                                            {question.speaker}
                                        </div>
                                        <div
                                            className={`text-sm ${isDarkMode ? 'text-yellow-200' : 'text-yellow-900'}`}
                                            dangerouslySetInnerHTML={{ __html: question.text }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
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
                                type="button"
                                onClick={generatePDF}
                                disabled={isGeneratingPDF || chatMessages.length === 0}
                                className={`p-3 rounded-xl transition-all duration-200 hover:scale-105 ${
                                    isDarkMode
                                        ? 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50'
                                        : 'bg-blue-500 text-white hover:bg-blue-600 disabled:bg-blue-400 disabled:opacity-50'
                                }`}
                            >
                                <FileText className="w-4 h-4" />
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

            {/* Custom Template Creation Modal */}
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
                            {/* Template Name */}
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

                            {/* Template Description */}
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

                            {/* Theme Color */}
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

                            {/* Template Prompt */}
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
        </div>
    );
}