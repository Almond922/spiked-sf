import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
    
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


const BASE_URL = 'https://recall-backend-822359826336.us-central1.run.app';
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

// Updated interface for Recall.ai transcript format
interface RecallTranscriptItem {
    speaker: string;
    text: string;
}

// Legacy interface for compatibility
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
const DB_VERSION = 2; // Incremented for custom templates
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
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
    const [isDarkMode, setIsDarkMode] = useState(false);
    
    // Custom template management state
    const [customTemplates, setCustomTemplates] = useState<Template[]>([]);
    const [showCreateTemplateModal, setShowCreateTemplateModal] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
    const [templateForm, setTemplateForm] = useState<CustomTemplateForm>({
        name: '',
        description: '',
        prompt: '',
        theme: 'blue'
    });
    
    // State for column widths
    const [columnWidths, setColumnWidths] = useState([25, 45, 30]); // Percentages for templates, transcript, AI
    const [resizingIndex, setResizingIndex] = useState<number | null>(null);

    // Load custom templates from IndexedDB
    useEffect(() => {
        const loadCustomTemplates = async () => {
            try {
                const customTemplatesData = await loadFromIndexedDB(CUSTOM_TEMPLATES_STORE);
                if (customTemplatesData && customTemplatesData.length > 0) {
                    const formattedTemplates = customTemplatesData.map((template: any) => ({
                        ...template,
                        icon: FileText, // Default icon for custom templates
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

    const [meetingUrl, setMeetingUrl] = useState('');
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

    // Client-side PDF Generation function using jsPDF
    const generatePDF = async () => {
        try {
            setIsGeneratingPDF(true);
            
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const margin = 20;
            const lineHeight = 7;
            let currentY = margin;
            
            // Helper function to add text with word wrapping
            const addTextToPDF = (text: string, fontSize: number = 12, fontStyle: string = 'normal', color: [number, number, number] = [0, 0, 0]) => {
                pdf.setFontSize(fontSize);
                pdf.setFont('helvetica', fontStyle);
                pdf.setTextColor(color[0], color[1], color[2]);
                
                const splitText = pdf.splitTextToSize(text, pageWidth - 2 * margin);
                
                // Check if we need a new page
                if (currentY + (splitText.length * lineHeight) > pageHeight - margin) {
                    pdf.addPage();
                    currentY = margin;
                }
                
                pdf.text(splitText, margin, currentY);
                currentY += splitText.length * lineHeight + 5;
            };
            
            // Helper function to add a section break
            const addSectionBreak = () => {
                currentY += 10;
                if (currentY > pageHeight - margin - 20) {
                    pdf.addPage();
                    currentY = margin;
                }
            };
            
            // Title
            addTextToPDF('SpikedAI Conversation Export', 20, 'bold', [220, 38, 38]);
            addSectionBreak();
            
            // Meeting information
            const exportDate = new Date().toLocaleString();
            addTextToPDF(`Meeting URL: ${meetingUrl || 'N/A'}`, 12, 'normal', [100, 100, 100]);
            addTextToPDF(`Export Date: ${exportDate}`, 12, 'normal', [100, 100, 100]);
            addSectionBreak();
            
            // AI Assistant Conversation
            if (chatMessages.length > 0) {
                addTextToPDF('AI Assistant Conversation', 16, 'bold', [220, 38, 38]);
                addSectionBreak();
                
                chatMessages.forEach((message) => {
                    const timestamp = message.timestamp.toLocaleString();
                    const role = message.isUser ? 'You' : 'AI Assistant';
                    
                    // Add message header
                    addTextToPDF(`${role} (${timestamp})`, 11, 'bold', message.isUser ? [59, 130, 246] : [16, 185, 129]);
                    
                    // Clean the message text (remove markdown formatting for PDF)
                    let cleanText = message.text
                        .replace(/\*\*(.*?)\*\*/g, '$1')  // Remove bold markdown
                        .replace(/\*(.*?)\*/g, '$1')      // Remove italic markdown
                        .replace(/`(.*?)`/g, '$1')        // Remove code markdown
                        .replace(/#{1,6}\s/g, '')         // Remove headers
                        .replace(/```[\s\S]*?```/g, '[Code Block]') // Replace code blocks
                        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1'); // Remove links, keep text
                    
                    addTextToPDF(cleanText, 11, 'normal');
                    addSectionBreak();
                });
            }
            
            // Meeting Transcript
            if (transcript.length > 0) {
                // Add new page for transcript
                pdf.addPage();
                currentY = margin;
                
                addTextToPDF('Meeting Transcript', 16, 'bold', [220, 38, 38]);
                addSectionBreak();
                
                transcript.forEach((segment) => {
                    const speaker = segment.speaker || 'Unknown Speaker';
                    const startTime = (segment as any).start_time || 0;
                    const minutes = Math.floor(startTime / 60);
                    const seconds = Math.floor(startTime % 60);
                    const timeStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                    
                    // Add speaker and time
                    addTextToPDF(`${speaker} (${timeStr})`, 11, 'bold', [124, 58, 237]);
                    
                    // Add transcript text
                    addTextToPDF(segment.text, 10, 'normal');
                    addSectionBreak();
                });
            }
            
            // Additional Questions
            if (additionalQuestions.length > 0) {
                // Add new page for questions if needed
                if (currentY > pageHeight - margin - 100) {
                    pdf.addPage();
                    currentY = margin;
                }
                
                addTextToPDF('Suggested Follow-up Questions', 16, 'bold', [220, 38, 38]);
                addSectionBreak();
                
                additionalQuestions.forEach((question, index) => {
                    addTextToPDF(`${index + 1}. ${question}`, 11, 'normal');
                });
            }
            
            // Generate filename with timestamp
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
            const filename = `spikedai_conversation_${timestamp}.pdf`;
            
            // Save the PDF
            pdf.save(filename);
            
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF. Please try again.');
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    // Alternative: Visual PDF generation that captures the chat interface
    const generateVisualPDF = async () => {
        try {
            setIsGeneratingPDF(true);
            
            // Find the chat messages container
            const chatContainer = document.querySelector('[data-chat-container]');
            if (!chatContainer) {
                alert('Chat container not found. Please try the text-based PDF option.');
                return;
            }
            
            // Create canvas from the chat container
            const canvas = await html2canvas(chatContainer as HTMLElement, {
                height: chatContainer.scrollHeight,
                width: chatContainer.scrollWidth,
                useCORS: true
            });
            
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            
            // Calculate dimensions
            const canvasAspectRatio = canvas.height / canvas.width;
            const pdfWidth = pageWidth - 20; // 10mm margin on each side
            const pdfHeight = pdfWidth * canvasAspectRatio;
            
            // If the content is taller than one page, we'll need to split it
            const totalPages = Math.ceil(pdfHeight / (pageHeight - 40));
            
            for (let page = 0; page < totalPages; page++) {
                if (page > 0) {
                    pdf.addPage();
                }
                
                pdf.addImage(
                    canvas.toDataURL('image/png'),
                    'PNG',
                    10, // x position
                    20, // y position
                    pdfWidth,
                    Math.min(pdfHeight - (page * (pageHeight - 40)), pageHeight - 40)
                );
            }
            
            // Generate filename with timestamp
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
            const filename = `spikedai_visual_${timestamp}.pdf`;
            
            pdf.save(filename);
            
        } catch (error) {
            console.error('Error generating visual PDF:', error);
            alert('Failed to generate visual PDF. Please try the text-based option.');
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    // Email sharing function
    const shareViaEmail = async (useVisualPdf: boolean = false) => {
        try {
            setIsGeneratingPDF(true);
            
            let pdf: jsPDF;
            let filename: string;
            let subject = 'SpikedAI Conversation Export';
            
            if (useVisualPdf) {
                // Generate visual PDF for email
                const chatContainer = document.querySelector('[data-chat-container]');
                if (!chatContainer) {
                    alert('Chat container not found. Using text-based PDF instead.');
                    useVisualPdf = false;
                }
            }
            
            if (useVisualPdf) {
                // Visual PDF generation for email
                const chatContainer = document.querySelector('[data-chat-container]');
                const canvas = await html2canvas(chatContainer as HTMLElement, {
                    height: chatContainer!.scrollHeight,
                    width: chatContainer!.scrollWidth,
                    useCORS: true
                });
                
                pdf = new jsPDF('p', 'mm', 'a4');
                const pageWidth = pdf.internal.pageSize.getWidth();
                const pageHeight = pdf.internal.pageSize.getHeight();
                
                const canvasAspectRatio = canvas.height / canvas.width;
                const pdfWidth = pageWidth - 20;
                const pdfHeight = pdfWidth * canvasAspectRatio;
                
                const totalPages = Math.ceil(pdfHeight / (pageHeight - 40));
                
                for (let page = 0; page < totalPages; page++) {
                    if (page > 0) {
                        pdf.addPage();
                    }
                    
                    pdf.addImage(
                        canvas.toDataURL('image/png'),
                        'PNG',
                        10,
                        20,
                        pdfWidth,
                        Math.min(pdfHeight - (page * (pageHeight - 40)), pageHeight - 40)
                    );
                }
                
                filename = `spikedai_visual_${new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)}.pdf`;
                subject = 'SpikedAI Visual Conversation Export';
            } else {
                // Text-based PDF generation for email (reuse existing logic)
                pdf = new jsPDF('p', 'mm', 'a4');
                const pageWidth = pdf.internal.pageSize.getWidth();
                const pageHeight = pdf.internal.pageSize.getHeight();
                const margin = 20;
                const lineHeight = 7;
                let currentY = margin;
                
                const addTextToPDF = (text: string, fontSize: number = 12, fontStyle: string = 'normal', color: [number, number, number] = [0, 0, 0]) => {
                    pdf.setFontSize(fontSize);
                    pdf.setFont('helvetica', fontStyle);
                    pdf.setTextColor(color[0], color[1], color[2]);
                    
                    const splitText = pdf.splitTextToSize(text, pageWidth - 2 * margin);
                    
                    if (currentY + (splitText.length * lineHeight) > pageHeight - margin) {
                        pdf.addPage();
                        currentY = margin;
                    }
                    
                    pdf.text(splitText, margin, currentY);
                    currentY += splitText.length * lineHeight + 5;
                };
                
                const addSectionBreak = () => {
                    currentY += 10;
                    if (currentY > pageHeight - margin - 20) {
                        pdf.addPage();
                        currentY = margin;
                    }
                };
                
                // Add content (same as generatePDF function)
                addTextToPDF('SpikedAI Conversation Export', 20, 'bold', [220, 38, 38]);
                addSectionBreak();
                
                const exportDate = new Date().toLocaleString();
                addTextToPDF(`Meeting URL: ${meetingUrl || 'N/A'}`, 12, 'normal', [100, 100, 100]);
                addTextToPDF(`Export Date: ${exportDate}`, 12, 'normal', [100, 100, 100]);
                addSectionBreak();
                
                if (chatMessages.length > 0) {
                    addTextToPDF('AI Assistant Conversation', 16, 'bold', [220, 38, 38]);
                    addSectionBreak();
                    
                    chatMessages.forEach((message) => {
                        const timestamp = message.timestamp.toLocaleString();
                        const role = message.isUser ? 'You' : 'AI Assistant';
                        
                        addTextToPDF(`${role} (${timestamp})`, 11, 'bold', message.isUser ? [59, 130, 246] : [16, 185, 129]);
                        
                        let cleanText = message.text
                            .replace(/\*\*(.*?)\*\*/g, '$1')
                            .replace(/\*(.*?)\*/g, '$1')
                            .replace(/`(.*?)`/g, '$1')
                            .replace(/#{1,6}\s/g, '')
                            .replace(/```[\s\S]*?```/g, '[Code Block]')
                            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
                        
                        addTextToPDF(cleanText, 11, 'normal');
                        addSectionBreak();
                    });
                }
                
                if (transcript.length > 0) {
                    pdf.addPage();
                    currentY = margin;
                    
                    addTextToPDF('Meeting Transcript', 16, 'bold', [220, 38, 38]);
                    addSectionBreak();
                    
                    transcript.forEach((segment) => {
                        const speaker = segment.speaker || 'Unknown Speaker';
                        const startTime = (segment as any).start_time || 0;
                        const minutes = Math.floor(startTime / 60);
                        const seconds = Math.floor(startTime % 60);
                        const timeStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                        
                        addTextToPDF(`${speaker} (${timeStr})`, 11, 'bold', [124, 58, 237]);
                        addTextToPDF(segment.text, 10, 'normal');
                        addSectionBreak();
                    });
                }
                
                if (additionalQuestions.length > 0) {
                    if (currentY > pageHeight - margin - 100) {
                        pdf.addPage();
                        currentY = margin;
                    }
                    
                    addTextToPDF('Suggested Follow-up Questions', 16, 'bold', [220, 38, 38]);
                    addSectionBreak();
                    
                    additionalQuestions.forEach((question, index) => {
                        addTextToPDF(`${index + 1}. ${question}`, 11, 'normal');
                    });
                }
                
                filename = `spikedai_conversation_${new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)}.pdf`;
            }
            
            // Create email body
            const emailBody = `Hi,

I'm sharing the SpikedAI conversation export from our recent meeting.

Meeting Details:
- Meeting URL: ${meetingUrl || 'N/A'}
- Export Date: ${new Date().toLocaleString()}
- Messages: ${chatMessages.length} conversation exchanges
- Transcript: ${transcript.length > 0 ? 'Included' : 'Not available'}

Please find the PDF attachment with the complete conversation and transcript.

Best regards,
SpikedAI Export`;

            // Create mailto link with PDF attachment (note: this has limitations)
            const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
            
            // Save PDF for manual attachment
            pdf.save(filename);
            
            // Show email instructions
            const emailInstructions = `📧 Email Sharing Instructions:

1. ✅ PDF has been downloaded: "${filename}"
2. 📎 Open your email client and create a new message
3. 📎 Attach the downloaded PDF file
4. 📝 Use this suggested content:

Subject: ${subject}

${emailBody}

Would you like me to open your default email client?`;

            const openEmailClient = confirm(emailInstructions);
            
            if (openEmailClient) {
                // Open email client with pre-filled content
                window.location.href = mailtoLink;
            }
            
        } catch (error) {
            console.error('Error sharing via email:', error);
            alert('Failed to prepare email. The PDF has been downloaded instead - you can manually attach it to an email.');
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    // Load meeting URL from sessionStorage and connect to existing streams (set by SpikedAI_recall.tsx)
    useEffect(() => {
        const loadMeetingUrlAndConnectStreams = () => {
            console.log('🔍 Attempting to load meeting URL from sessionStorage...');
            
            try {
                // Try multiple possible keys for the meeting URL
                const possibleKeys = ['spikedai_meeting_url', 'meetingUrl', 'meeting_url'];
                let foundUrl = null;
                let usedKey = null;
                
                for (const key of possibleKeys) {
                    const storedValue = sessionStorage.getItem(key);
                    console.log(`📝 Checking sessionStorage key "${key}":`, storedValue);
                    
                    if (storedValue) {
                        try {
                            // Try parsing as JSON first
                            foundUrl = JSON.parse(storedValue);
                            usedKey = key;
                            break;
                        } catch {
                            // If JSON parsing fails, use as plain string
                            foundUrl = storedValue;
                            usedKey = key;
                            break;
                        }
                    }
                }
                
                console.log(`🎯 Found meeting URL from key "${usedKey}":`, foundUrl);
                
                if (foundUrl) {
                    setMeetingUrl(foundUrl);
                    // Connect to existing streams to display transcriptions from beginning
                    if (foundUrl && !isConnected) {
                        console.log('🔗 Connecting to existing streams...');
                        setTimeout(() => connectToExistingStreams(), 1000); // Small delay to ensure component is ready
                    }
                } else {
                    console.warn('⚠️ No meeting URL found in sessionStorage');
                    // Try to get URL from current page context or other sources
                    const urlParams = new URLSearchParams(window.location.search);
                    const urlFromParams = urlParams.get('meetingUrl');
                    if (urlFromParams) {
                        console.log('📎 Found meeting URL from URL params:', urlFromParams);
                        setMeetingUrl(urlFromParams);
                        if (!isConnected) {
                            setTimeout(() => connectToExistingStreams(), 1000);
                        }
                    }
                }
            } catch (error) {
                console.error('❌ Error loading meeting URL from sessionStorage:', error);
            }
        };

        loadMeetingUrlAndConnectStreams();
        
        // Interval check for meeting URL (in case sessionStorage is updated)
        const urlCheckInterval = setInterval(() => {
            const storedUrl = sessionStorage.getItem('spikedai_meeting_url');
            if (storedUrl && !meetingUrl) {
                console.log('🔄 Found meeting URL on interval check:', storedUrl);
                try {
                    const parsedUrl = JSON.parse(storedUrl);
                    setMeetingUrl(parsedUrl);
                    if (!isConnected) {
                        setTimeout(() => connectToExistingStreams(), 1000);
                    }
                } catch {
                    setMeetingUrl(storedUrl);
                    if (!isConnected) {
                        setTimeout(() => connectToExistingStreams(), 1000);
                    }
                }
            }
        }, 2000); // Check every 2 seconds
        
        // Listen for changes to sessionStorage (when URL is updated in SpikedAI_recall.tsx)
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'spikedai_meeting_url' && e.newValue) {
                console.log('📻 Storage change detected:', e.newValue);
                try {
                    const newUrl = JSON.parse(e.newValue);
                    setMeetingUrl(newUrl);
                    // Connect to existing streams with new URL
                    if (newUrl && !isConnected) {
                        setTimeout(() => connectToExistingStreams(), 1000);
                    }
                } catch (error) {
                    console.error('Error parsing new meeting URL:', error);
                    setMeetingUrl(e.newValue);
                    if (e.newValue && !isConnected) {
                        setTimeout(() => connectToExistingStreams(), 1000);
                    }
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        
        return () => {
            clearInterval(urlCheckInterval);
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [isConnected, meetingUrl]);

    const transcriptEndRef = useRef<HTMLDivElement>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const transcriptSourceRef = useRef<EventSource | null>(null);
    const questionSourceRef = useRef<EventSource | null>(null);

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

    // Connect to existing Recall streams to display transcriptions from beginning
    const connectToExistingStreams = async () => {
        console.log('🚀 Starting connectToExistingStreams...');
        setError('');
        
        if (!meetingUrl || !meetingUrl.trim()) {
            const errorMsg = 'No meeting URL found. Please set a meeting URL in the main SpikedAI interface.';
            console.error('❌', errorMsg);
            setError(errorMsg);
            return;
        }
        
        console.log('🎯 Attempting to connect to streams for meeting URL:', meetingUrl);
        
        try {
            // Note: We don't start a new recording - we just connect to existing streams
            // The bot should already be running from SpikedAI_recall.tsx
            
            setIsConnected(true);
            console.log('✅ Set connection status to true');
            
            // First, try to fetch any existing transcripts from the beginning
            console.log('📥 Fetching transcript history...');
            try {
                const historyResponse = await fetch(`${BASE_URL}/transcript_history`);
                console.log('📥 History response status:', historyResponse.status);
                
                if (historyResponse.ok) {
                    const historyData = await historyResponse.json();
                    console.log('📥 History data received:', historyData);
                    
                    if (historyData.transcripts && Array.isArray(historyData.transcripts)) {
                        // Convert historical transcripts to our format
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
                        setTranscript(prev => [...historicalTranscripts, ...prev]);
                    }
                } else {
                    console.log('ℹ️ No transcript history available or history endpoint returned:', historyResponse.status);
                }
            } catch (historyError) {
                console.log('ℹ️ No historical transcripts available or error fetching:', historyError);
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
            
            // Connect to transcript stream to get all transcriptions from beginning
            console.log('📡 Connecting to transcript stream...');
            transcriptSourceRef.current = new EventSource(`${BASE_URL}/transcripts`);
            
            transcriptSourceRef.current.onopen = () => {
                console.log('✅ Transcript stream connected successfully');
            };
            
            transcriptSourceRef.current.onmessage = (event) => {
                try {
                    console.log('📝 Received transcript data:', event.data);
                    const data: RecallTranscriptItem = JSON.parse(event.data);
                    
                    // Convert to legacy format for compatibility with existing UI
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
            console.log('❓ Connecting to questions stream...');
            questionSourceRef.current = new EventSource(`${BASE_URL}/questions`);
            
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
            };
            
            console.log('🎉 Stream connections initiated successfully');
            
        } catch (err: any) {
            console.error('❌ Failed to connect to streams:', err);
            setError(err.message || 'Failed to connect to streams');
            setIsConnected(false);
        }
    };

    // Cleanup connections on unmount
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
            const response = await fetch(`${SALES_ASSISTANT_BASE_URL}/api/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question: userQuestion, transcript: transcriptText, chat_history: chatMessages }) });
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
            const response = await fetch(`${SALES_ASSISTANT_BASE_URL}/api/process-template`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: template.prompt, transcript: transcriptText }) });
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

    // Custom template management functions
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

        // Create template data WITHOUT the icon (since React components can't be serialized)
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
                // Update existing template
                console.log('Updating existing template with ID:', editingTemplate.id);
                const updatedTemplate = { ...templateData, id: editingTemplate.id };
                const success = await updateInIndexedDB(CUSTOM_TEMPLATES_STORE, updatedTemplate);
                console.log('Update result:', success);
                if (success) {
                    // Add the icon when updating the state
                    const templateWithIcon = { ...updatedTemplate, icon: FileText };
                    setCustomTemplates(prev => 
                        prev.map(t => t.id === editingTemplate.id ? templateWithIcon : t)
                    );
                }
            } else {
                // Create new template
                console.log('Creating new template');
                const success = await saveToIndexedDB(CUSTOM_TEMPLATES_STORE, templateData);
                console.log('Save result:', success);
                if (success) {
                    // Reload custom templates to get the auto-generated ID
                    const updatedTemplates = await loadFromIndexedDB(CUSTOM_TEMPLATES_STORE);
                    console.log('Loaded templates after save:', updatedTemplates);
                    const formattedTemplates = updatedTemplates.map((template: any) => ({
                        ...template,
                        icon: FileText, // Add icon when loading from database
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

    // Combine custom and prebuilt templates (custom templates first)
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
                    {/* Create Custom Template Button */}
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

                    {/* Template Categories */}
                    {allTemplates.length > 0 && (
                        <>
                            {/* Custom Templates */}
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

                            {/* Prebuilt Templates */}
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
                
                {/* Meeting Status Display */}
                <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'}`}>
                    <div className="space-y-3">
                        {/* Meeting URL Display */}
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
                                    <p className="text-sm">No meeting URL found</p>
                                    <p className="text-xs mt-1">Please set a meeting URL in the main SpikedAI interface or enter manually below</p>
                                </div>
                                
                                {/* Manual URL Input */}
                                <div className="space-y-2">
                                    <input
                                        type="url"
                                        placeholder="Enter Google Meet URL (e.g., https://meet.google.com/abc-defg-hij)"
                                        className={`w-full px-3 py-2 text-xs rounded-lg border transition-colors ${
                                            isDarkMode 
                                                ? 'bg-gray-700 border-gray-600 text-gray-300 placeholder-gray-500' 
                                                : 'bg-white border-gray-300 text-gray-700 placeholder-gray-400'
                                        } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                                        onChange={(e) => {
                                            const url = e.target.value.trim();
                                            if (url) {
                                                console.log('🎯 Manual URL entered:', url);
                                                setMeetingUrl(url);
                                                // Save to sessionStorage for consistency
                                                sessionStorage.setItem('spikedai_meeting_url', JSON.stringify(url));
                                                if (!isConnected) {
                                                    setTimeout(() => connectToExistingStreams(), 500);
                                                }
                                            }
                                        }}
                                    />
                                    <button
                                        onClick={() => {
                                            console.log('🔄 Force reload URL from main interface');
                                            window.location.reload();
                                        }}
                                        className={`w-full px-3 py-2 text-xs rounded-lg transition-colors ${
                                            isDarkMode 
                                                ? 'bg-yellow-600 text-white hover:bg-yellow-700' 
                                                : 'bg-yellow-500 text-white hover:bg-yellow-600'
                                        }`}
                                    >
                                        Reload Page (if URL was set in main interface)
                                    </button>
                                </div>
                            </div>
                        )}
                        
                        {/* Control Buttons */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                {/* Stream Status */}
                                <div className="flex items-center space-x-2">
                                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                                    <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        {isConnected ? 'Streaming' : 'Not Connected'}
                                    </span>
                                </div>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex items-center space-x-2">
                                {/* Connection status display */}
                                {meetingUrl && (
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
                                
                                {/* Refresh Connection Button */}
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
                        
                        {/* Debug Panel - shows sessionStorage state */}
                        {!meetingUrl && (
                            <div className={`text-xs p-3 rounded border ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
                                <div className="font-semibold mb-2">Debug Info:</div>
                                <div>Meeting URL: {meetingUrl || 'Not found'}</div>
                                <div>SessionStorage keys: {Object.keys(sessionStorage).join(', ') || 'None'}</div>
                                <div>spikedai_meeting_url: {sessionStorage.getItem('spikedai_meeting_url') || 'Not set'}</div>
                                <div>Connection Status: {isConnected ? 'Connected' : 'Disconnected'}</div>
                                <div>Transcript Count: {transcript.length}</div>
                                <div>Questions Count: {questions.length}</div>
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
                    
                    {/* Questions Section */}
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
                    {/* Save to PDF and Email Buttons */}
                    <div className="relative">
                        <div className="flex space-x-1">
                            {/* Main PDF Button */}
                            <button
                                onClick={generatePDF}
                                disabled={isGeneratingPDF || (chatMessages.length === 0 && transcript.length === 0)}
                                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 ${
                                    isDarkMode 
                                        ? 'bg-red-600 hover:bg-red-700 text-white disabled:bg-gray-600' 
                                        : 'bg-red-600 hover:bg-red-700 text-white disabled:bg-gray-400'
                                }`}
                                title="Save conversation and transcript to PDF (Text Format)"
                            >
                                {isGeneratingPDF ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Generating...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        <span>Save PDF</span>
                                    </>
                                )}
                            </button>
                            
                            {/* Visual PDF Button */}
                            <button
                                onClick={generateVisualPDF}
                                disabled={isGeneratingPDF || chatMessages.length === 0}
                                className={`p-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 ${
                                    isDarkMode 
                                        ? 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-600' 
                                        : 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400'
                                }`}
                                title="Save conversation as visual PDF (preserves chat appearance)"
                            >
                                <FileText className="w-4 h-4" />
                            </button>
                            
                            {/* Email Text PDF Button */}
                            <button
                                onClick={() => shareViaEmail(false)}
                                disabled={isGeneratingPDF || (chatMessages.length === 0 && transcript.length === 0)}
                                className={`p-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 ${
                                    isDarkMode 
                                        ? 'bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-600' 
                                        : 'bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-400'
                                }`}
                                title="Share text-based PDF via email"
                            >
                                <Mail className="w-4 h-4" />
                            </button>
                            
                            {/* Email Visual PDF Button */}
                            <button
                                onClick={() => shareViaEmail(true)}
                                disabled={isGeneratingPDF || chatMessages.length === 0}
                                className={`flex items-center space-x-1 px-2 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 ${
                                    isDarkMode 
                                        ? 'bg-purple-600 hover:bg-purple-700 text-white disabled:bg-gray-600' 
                                        : 'bg-purple-600 hover:bg-purple-700 text-white disabled:bg-gray-400'
                                }`}
                                title="Share visual PDF via email"
                            >
                                <Mail className="w-3 h-3" />
                                <FileText className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                </div>
                <div className="flex-1 p-4 space-y-4 overflow-y-auto" data-chat-container>
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
