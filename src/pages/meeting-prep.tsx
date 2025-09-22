import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Upload, Sparkles, Play, X, Trash2, Download,
  File, Send, TrendingUp, Target, Award, Gamepad2, CheckCircle,
  MessageSquare, ArrowRight, BookCheck, MessageCircleQuestion,
  Mic, MicOff, ArrowLeft, HelpCircle, Loader2
} from 'lucide-react';
import jsPDF from "jspdf";

// --- CONSTANTS ---
const BASE_URL = 'https://spikedai-old-backend-409019309412.us-central1.run.app/train';
const CACHE_KEY_DOCUMENTS = 'meetingPrep_existingDocuments';
const CACHE_EXPIRATION_MS = 60 * 60 * 1000; // 1 hour

const handleBack = () => { window.location.href = '/'; };

// --- INTERFACE DEFINITIONS ---
interface UploadResponse {
  filename: string;
  chunks_added: number;
  total_chunks: number;
}

interface Document {
  doc_id: string;
  filename: string;
  chunks_added: number;
  total_chunks: number;
  extractedTopics: string[];
  keyFeatures: string[];
  documentType: 'proposal' | 'technical' | 'presentation' | 'general';
  extractedHeadings: { section: string; title: string; content_summary: string }[];
}

interface IdealAnswerResponse {
  answer: string;
  sources: Array<{ filename: string; url?: string; }>;
  follow_up_questions: string[];
  sales_followups: string[];
}

interface CompareResponse {
  score: number;
  coverage: string;
  key_points_missed: string[];
  feedback: string;
  strengths: string[];
  improvements: string[];
  confidence_level: number;
  response_time: number;
}

interface GeneratedQuestion {
  question: string;
  difficulty_level: 'Easy' | 'Medium';
  focus_area: string;
  document_references: string[];
  question_id: string;
}

interface GenerateQuestionsResponse {
  questions: GeneratedQuestion[];
  status: string;
  document_count: number;
  persona: string;
  total_available: number;
}

// --- NEW QUIZ INTERFACES ---
interface QuizQuestion {
    question: string;
    options: string[];
    correct_answer: string;
    explanation: string;
    question_id: string;
}

interface GenerateQuizResponse {
    questions: QuizQuestion[];
    status: string;
    document_count: number;
    persona: string;
}


interface ChatMessage {
  type: 'user' | 'ai_question' | 'ai_ideal_answer' | 'ai_analysis';
  text: string;
  timestamp: Date;
  sources?: IdealAnswerResponse['sources'];
  analysis?: CompareResponse;
  userAnswer?: string;
  aiIdealAnswer?: string;
  questionData?: GeneratedQuestion;
  responseTime?: number;
  isVoiceInput?: boolean;
}

interface SessionRecord {
    question: string;
    userAnswer: string;
    idealAnswer: string;
    score: number;
    feedback: string;
}


type Persona = 'Technical Lead' | 'Business Manager' | 'C-Suite Executive' | null;
type AIMode = 'AI Auto' | 'AI Custom';
type SessionType = 'Q&A' | 'AI Quiz';


// --- Resizer Component ---
const Resizer = ({ onMouseDown }: { onMouseDown: (e: React.MouseEvent) => void }) => (
  <div
    onMouseDown={onMouseDown}
    className="w-1.5 h-full cursor-col-resize bg-gray-200 hover:bg-blue-500 transition-colors duration-200 flex-shrink-0"
    style={{ flexShrink: 0 }}
  />
);


const MeetingPrep = () => {
  const [currentPhase, setCurrentPhase] = useState(1);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<number | null>(null);

  // --- Panel Resizing State ---
  const [panelWidths, setPanelWidths] = useState({ left: 25, right: 25 });
  const resizingRef = useRef<{
    active: boolean;
    target: 'left' | 'right' | null;
    startX: number;
    startWidths: { left: number, right: number };
  } | null>(null);


  // --- Phase 1 State ---
  const [uploadedDocuments, setUploadedDocuments] = useState<Document[]>([]);
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set());
  const [existingDocuments, setExistingDocuments] = useState<Document[]>([]);
  const [selectedPersona, setSelectedPersona] = useState<Persona>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(10);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [meetingObjective, setMeetingObjective] = useState('');
  const [isStartingSession, setIsStartingSession] = useState(false);

  // --- NEW: Session Type State ---
  const [sessionType, setSessionType] = useState<SessionType>('Q&A');


  // --- AI Configuration State ---
  const [aiMode, setAiMode] = useState<AIMode>('AI Auto');
  const [customInstructions, setCustomInstructions] = useState('');

  // --- Phase 2 State (Q&A) ---
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([]);
  const [askedQuestions, setAskedQuestions] = useState<Set<string>>(new Set());
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [userChatInput, setUserChatInput] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<CompareResponse | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [questionCount, setQuestionCount] = useState(0);
  const [correctAnswerCount, setCorrectAnswerCount] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);
  const [sessionHistory, setSessionHistory] = useState<SessionRecord[]>([]);
  
  // --- NEW: Phase 2 State (Quiz) ---
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [userQuizAnswers, setUserQuizAnswers] = useState<Record<string, string>>({});
  const [quizScore, setQuizScore] = useState(0);


  const [timer, setTimer] = useState(0);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [sessionStats, setSessionStats] = useState({
    avgResponseTime: 0,
    avgScore: 0,
    strongestArea: '',
    weakestArea: '',
    improvementTrend: 0
  });

  // --- Voice Recording State ---
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const speechRecognitionRef = useRef<any>(null);
  const [accumulatedTranscript, setAccumulatedTranscript] = useState<string>('');
  const [isSupported, setIsSupported] = useState(false);

  const personas = [
    {
      id: 'Technical Lead',
      name: 'Technical',
      description: 'Architecture, integrations, roadmap',
      icon: Gamepad2
    },
    {
      id: 'Business Manager',
      name: 'Business',
      description: 'ROI, use cases, timelines',
      icon: TrendingUp
    },
    {
      id: 'C-Suite Executive',
      name: 'C-Suite',
      description: 'Strategy, scalability, risk, vision',
      icon: Target
    },
  ];

  // --- PANEL RESIZING HANDLERS ---
  const handleMouseDown = (target: 'left' | 'right') => (e: React.MouseEvent) => {
    e.preventDefault();
    resizingRef.current = {
      active: true,
      target,
      startX: e.clientX,
      startWidths: {
        left: panelWidths.left,
        right: panelWidths.right,
      },
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!resizingRef.current?.active) return;

    const dx = e.clientX - resizingRef.current.startX;
    const totalWidth = window.innerWidth;
    const dxPercent = (dx / totalWidth) * 100;

    const { target, startWidths } = resizingRef.current;
    const minWidth = 15; // 15% minimum width
    const maxWidth = 40; // 40% maximum width

    if (target === 'left') {
      const newLeftWidth = Math.max(minWidth, Math.min(maxWidth, startWidths.left + dxPercent));
      setPanelWidths(prev => ({ ...prev, left: newLeftWidth }));
    } else if (target === 'right') {
      const newRightWidth = Math.max(minWidth, Math.min(maxWidth, startWidths.right - dxPercent));
      setPanelWidths(prev => ({ ...prev, right: newRightWidth }));
    }
  };

  const handleMouseUp = () => {
    resizingRef.current = null;
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  };

  useEffect(() => {
    // Cleanup listeners on component unmount
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);


  // --- VOICE RECORDING FUNCTIONS ---
  const startRecording = async () => {
    if (isRecording || !speechRecognitionRef.current) return;
    try {
        setAccumulatedTranscript('');
        setUserChatInput('');
        speechRecognitionRef.current.start();
        setIsRecording(true);
        setRecordingDuration(0);
        recordingTimerRef.current = setInterval(() => {
            setRecordingDuration(prev => prev + 1);
        }, 1000);
    } catch (error) {
        console.error("Could not start speech recognition:", error);
    }
  };

  const stopRecording = () => {
    if (!isRecording || !speechRecognitionRef.current) return;
    try {
        speechRecognitionRef.current.stop();
        setIsRecording(false);
        if (recordingTimerRef.current) {
            clearInterval(recordingTimerRef.current);
            recordingTimerRef.current = null;
        }
    } catch(error) {
        console.error("Could not stop speech recognition:", error);
    }
  };

  const toggleListening = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };


  // --- API FUNCTIONS ---
  const askQuestionBackend = async (question: string): Promise<IdealAnswerResponse> => {
    const response = await fetch(`${BASE_URL}/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: question,
        include_followups: true,
        include_sales_questions: true,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get ideal answer from backend');
    }
    return response.json();
  };

  const analyzeDocumentWithLLM = async (filename: string): Promise<{
    extractedTopics: string[];
    keyFeatures: string[];
    documentType: 'proposal' | 'technical' | 'presentation' | 'general';
    extractedHeadings: { section: string; title: string; content_summary: string }[];
  }> => {
    try {
      const response = await fetch(`${BASE_URL}/analyze-document`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename }),
      });

      if (!response.ok) {
        throw new Error(`Document analysis failed: ${response.status}`);
      }

      const analysis = await response.json();
      return analysis;
    } catch (error) {
      console.error('Error analyzing document:', error);
      throw error;
    }
  };

  const compareAnswersWithLLM = async (
    userAnswer: string,
    aiIdealAnswer: string,
    question: string,
    responseTime: number
  ): Promise<CompareResponse> => {
    try {
      const response = await fetch(`${BASE_URL}/compare-answers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_answer: userAnswer,
          ideal_answer: aiIdealAnswer,
          original_question: question,
          response_time: responseTime
        }),
      });

      if (!response.ok) {
        throw new Error(`Answer comparison failed: ${response.status}`);
      }

      const analysis: CompareResponse = await response.json();
      return analysis;
    } catch (error) {
      console.error('Error comparing answers:', error);
      throw error;
    }
  };

  const generateQuestionsWithLLM = async (
    persona: Persona,
    objective: string,
    selectedDocuments: string[]
  ): Promise<GeneratedQuestion[]> => {
    try {
      const response = await fetch(`${BASE_URL}/generate-questions-llm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          persona: persona,
          objective: objective || 'General sales presentation practice',
          document_filenames: selectedDocuments,
          max_questions: 15,
          difficulty_levels: ['Easy', 'Medium'],
          ai_mode: aiMode,
          custom_instructions: aiMode === 'AI Custom' ? customInstructions : null
        }),
      });

      if (!response.ok) {
        throw new Error(`Question generation failed: ${response.status}`);
      }

      const result = await response.json();
      return result.questions;
    } catch (error) {
      console.error('Error generating questions with LLM:', error);
      throw error;
    }
  };

  // --- NEW: API function for Quiz Generation ---
  const generateQuizWithLLM = async (
    persona: Persona,
    selectedDocuments: string[]
  ): Promise<QuizQuestion[]> => {
      try {
          const response = await fetch(`${BASE_URL}/generate-quiz`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  persona: persona,
                  document_filenames: selectedDocuments,
                  max_questions: 10,
                  // --- FIX: Added missing fields to match the backend's expected request model ---
                  objective: 'Generate a knowledge quiz', // Default value
                  difficulty_levels: [], // Default empty array
                  ai_mode: 'AI Auto', // Default value
                  custom_instructions: null // Default null value
              }),
          });
          if (!response.ok) {
              const errorText = await response.text();
              console.error("Quiz generation failed with status:", response.status, "and body:", errorText);
              throw new Error(`Quiz generation failed: ${response.status}`);
          }
          const result: GenerateQuizResponse = await response.json();
          return result.questions;
      } catch (error) {
          console.error('Error generating quiz with LLM:', error);
          throw error;
      }
  };


  const fetchExistingDocuments = async (): Promise<Document[]> => {
        const cachedData = sessionStorage.getItem(CACHE_KEY_DOCUMENTS);
        if (cachedData) {
            const { timestamp, documents } = JSON.parse(cachedData);
            if (Date.now() - timestamp < CACHE_EXPIRATION_MS) {
                console.log("Serving documents from cache.");
                return documents;
            }
        }

        try {
            console.log("Fetching documents from API.");
            const response = await fetch(`${BASE_URL}/documents`);
            if (response.ok) {
                const docs = await response.json();
                const documents = docs.map((doc: any) => ({
                    doc_id: `existing_${doc.filename}`,
                    filename: doc.filename,
                    chunks_added: doc.chunk_ids?.length || 0,
                    total_chunks: doc.total_chunks,
                    extractedTopics: doc.extractedTopics || [],
                    keyFeatures: doc.keyFeatures || [],
                    documentType: doc.documentType || 'general',
                    extractedHeadings: doc.extractedHeadings || []
                }));

                const cachePayload = {
                    timestamp: Date.now(),
                    documents: documents
                };
                sessionStorage.setItem(CACHE_KEY_DOCUMENTS, JSON.stringify(cachePayload));

                return documents;
            }
            return [];
        } catch (error) {
            console.error('Failed to fetch existing documents:', error);
            return [];
        }
    };


  const uploadDocumentToBackend = async (file: File): Promise<Document> => {
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await fetch(`${BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.status}`);
      }

      const uploadResult: UploadResponse = await uploadResponse.json();
      const analysis = await analyzeDocumentWithLLM(uploadResult.filename);

      const document: Document = {
        doc_id: `meetingprep_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        filename: uploadResult.filename,
        chunks_added: uploadResult.chunks_added,
        total_chunks: uploadResult.total_chunks,
        extractedTopics: analysis.extractedTopics,
        keyFeatures: analysis.keyFeatures,
        documentType: analysis.documentType,
        extractedHeadings: analysis.extractedHeadings
      };

      const existingDocIndex = uploadedDocuments.findIndex(doc => doc.filename === uploadResult.filename);
      if (existingDocIndex !== -1) {
        setUploadedDocuments(prev => {
          const updated = [...prev];
          updated[existingDocIndex] = { ...updated[existingDocIndex], ...document };
          return updated;
        });
      } else {
        setUploadedDocuments(prev => [...prev, document]);
      }

      return document;

    } catch (error) {
      console.error('Upload or analysis error:', error);
      throw new Error(`Failed to upload/analyze document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  // --- HANDLER FUNCTIONS ---
  const deleteDocument = async (doc_id: string) => {
    setUploadedDocuments(prev => prev.filter(doc => doc.doc_id !== doc_id));
    setSelectedDocuments(prev => {
      const updated = new Set(prev);
      const doc = uploadedDocuments.find(d => d.doc_id === doc_id);
      if (doc) updated.delete(doc.filename);
      return updated;
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const newDoc = await uploadDocumentToBackend(file);
      setSelectedDocuments(prev => new Set(prev).add(newDoc.filename));
    } catch (error) {
      console.error('File upload failed:', error);
      alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
        if(fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      try {
        const newDoc = await uploadDocumentToBackend(file);
        setSelectedDocuments(prev => new Set(prev).add(newDoc.filename));
      } catch (error) {
        console.error('File upload failed:', error);
        alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  };

  const handleDocumentSelection = (filename: string, isSelected: boolean) => {
    setSelectedDocuments(prev => {
      const updated = new Set(prev);
      if (isSelected) {
        updated.add(filename);
      } else {
        updated.delete(filename);
      }
      return updated;
    });
  };

  // --- MODIFIED: Handles both Q&A and Quiz session start ---
  const handleStartSession = async () => {
    if (!selectedPersona) {
      alert('Please select a client persona to start the session.');
      return;
    }
    if (selectedDocuments.size === 0) {
      alert('Please select at least one document for the training session.');
      return;
    }
    if (sessionType === 'Q&A' && aiMode === 'AI Custom' && !customInstructions.trim()) {
      alert('Please provide custom instructions for AI Custom mode or switch to AI Auto.');
      return;
    }
    
    setIsStartingSession(true);
    setIsAiTyping(true);
    
    try {
        if (sessionType === 'Q&A') {
            const questions = await generateQuestionsWithLLM(selectedPersona, meetingObjective, Array.from(selectedDocuments));
            setGeneratedQuestions(questions);
            setAskedQuestions(new Set());
            setChatHistory([]);
            setSessionHistory([]);
            if (questions.length > 0) {
                presentQuestion(questions[0]);
            }
        } else { // AI Quiz
            const questions = await generateQuizWithLLM(selectedPersona, Array.from(selectedDocuments));
            setQuizQuestions(questions);
            setUserQuizAnswers({});
            setQuizScore(0);
        }

        setCurrentPhase(2);
        setTimer(sessionDuration * 60);
        setQuestionCount(0);
        setCorrectAnswerCount(0);
        setShowAnalysis(false);
        setCurrentAnalysis(null);
        startTimer();

    } catch (error) {
      console.error('Error starting session:', error);
      alert(`Failed to generate ${sessionType === 'Q&A' ? 'questions' : 'quiz'}. Please try again.`);
    } finally {
      setIsAiTyping(false);
      setIsStartingSession(false);
    }
  };


  const presentQuestion = (questionData: GeneratedQuestion) => {
    setQuestionStartTime(Date.now());
    setShowAnalysis(false);
    setCurrentAnalysis(null);

    const questionMessage: ChatMessage = {
      type: 'ai_question',
      text: questionData.question,
      timestamp: new Date(),
      questionData
    };

    setChatHistory([questionMessage]);
    setAskedQuestions(prev => new Set(prev).add(questionData.question_id));
    setQuestionCount(prev => prev + 1);
  };

  const getNextAvailableQuestion = (): GeneratedQuestion | null => {
    const availableQuestions = generatedQuestions.filter(q => !askedQuestions.has(q.question_id));
    return availableQuestions.length > 0 ? availableQuestions[0] : null;
  };

  const handleNextQuestion = () => {
    const nextQuestion = getNextAvailableQuestion();
    if (nextQuestion && timer > 0) {
      presentQuestion(nextQuestion);
    } else {
      handleEndSession();
    }
  };

  const startTimer = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = setInterval(() => {
      setTimer(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timerIntervalRef.current!);
          handleEndSession();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };

  const stopTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  const handleUserSendMessage = async (isGivingUp = false) => {
    const lastAiQuestionMsg = [...chatHistory].reverse().find(msg => msg.type === 'ai_question');
    if (!lastAiQuestionMsg) return;

    if (isRecording) {
      stopRecording();
    }

    const lastAiQuestion = lastAiQuestionMsg.text;
    const userAnswer = isGivingUp ? "I don't know." : userChatInput;

    if (!userAnswer.trim()) return;

    const responseTime = Math.round((Date.now() - questionStartTime) / 1000);

    const userMessage: ChatMessage = {
      type: 'user',
      text: userAnswer,
      timestamp: new Date(),
      responseTime,
      isVoiceInput: isRecording,
    };

    setChatHistory(prev => [...prev, userMessage]);
    setUserChatInput('');
    setAccumulatedTranscript('');
    setIsAiTyping(true);

    try {
      const idealAnswerResponse = await askQuestionBackend(lastAiQuestion);
      const aiIdealAnswer = idealAnswerResponse.answer;

      const analysis = isGivingUp ? 
        ({
          score: 0,
          coverage: 'None',
          strengths: [],
          improvements: ["Revealed the answer."],
          feedback: "You chose to see the ideal answer for this question.",
          key_points_missed: [],
          confidence_level: 0,
          response_time: responseTime 
        } as CompareResponse)
        : await compareAnswersWithLLM(userAnswer, aiIdealAnswer, lastAiQuestion, responseTime);

      if (analysis.score >= 7) {
        setCorrectAnswerCount(prev => prev + 1);
      }

      setSessionStats(prev => {
        const newAvgScore = ((prev.avgScore * (questionCount - 1)) + analysis.score) / questionCount;
        const newAvgResponseTime = ((prev.avgResponseTime * (questionCount - 1)) + responseTime) / questionCount;

        return {
          ...prev,
          avgScore: newAvgScore,
          avgResponseTime: newAvgResponseTime,
          improvementTrend: analysis.score - prev.avgScore
        };
      });

        setSessionHistory(prev => [...prev, {
            question: lastAiQuestion,
            userAnswer: userAnswer,
            idealAnswer: aiIdealAnswer,
            score: analysis.score,
            feedback: analysis.feedback,
        }]);

      const idealAnswerMessage: ChatMessage = {
        type: 'ai_ideal_answer',
        text: aiIdealAnswer,
        timestamp: new Date(),
        sources: idealAnswerResponse.sources,
      };

      const analysisMessage: ChatMessage = {
        type: 'ai_analysis',
        text: `**Feedback:** ${analysis.feedback}`,
        timestamp: new Date(),
        analysis: analysis,
        userAnswer,
        aiIdealAnswer,
      };

      setChatHistory(prev => [...prev, idealAnswerMessage, analysisMessage]);
      setCurrentAnalysis(analysis);
      setShowAnalysis(true);

    } catch (error) {
      console.error('Error during response processing:', error);
      setChatHistory(prev => [...prev, {
        type: 'ai_analysis',
        text: 'Sorry, I encountered an error processing your response. Please try again.',
        timestamp: new Date(),
      }]);
    } finally {
      setIsAiTyping(false);
    }
  };

  // --- NEW: Quiz Handlers ---
  const handleQuizAnswerSelect = (questionId: string, answer: string) => {
      setUserQuizAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmitQuiz = () => {
      let correct = 0;
      quizQuestions.forEach(q => {
          if (userQuizAnswers[q.question_id] === q.correct_answer) {
              correct++;
          }
      });
      setQuizScore(correct);
      handleEndSession();
  };


  // --- MODIFIED: Ends both session types and transitions to phase 3 ---
  const handleEndSession = () => {
    stopTimer();
    if (isRecording) {
        stopRecording();
    }
    
    // If it's a quiz that hasn't been submitted, calculate score now.
    if (sessionType === 'AI Quiz' && currentPhase === 2) {
        let correct = 0;
        quizQuestions.forEach(q => {
            if (userQuizAnswers[q.question_id] === q.correct_answer) {
                correct++;
            }
        });
        setQuizScore(correct);
    }
    
    setCurrentPhase(3);
  };
  
    const handleIDontKnow = () => {
        handleUserSendMessage(true);
    };

const handleDownloadReport = (): void => {
    if (!(window as any).jspdf) {
        console.error('jsPDF library not loaded. Please include the script tag.');
        alert('PDF library not loaded. Please refresh the page.');
        return;
    }

    const { jsPDF } = (window as any).jspdf;
    const doc: any = new jsPDF();

    const accentRed = '#F44336';
    const accentGreen = '#4CAF50';
    const accentYellow = '#FFC107';
    const textPrimary = '#212121';
    const textSecondary = '#757575';
    const borderLight = '#E0E0E0';
    const logoBase64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wgARCADIAMgDASIAAhEBAxEB/8QAGgABAAMBAQEAAAAAAAAAAAAAAAUHCAQGA//EABoBAQADAQEBAAAAAAAAAAAAAAAEBQcGCAP/2gAMAwEAAhADEAAAAfPjn/RoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADSGb9dTeFgeL3UfO4HIwpN4AAAAAAAAAAa6yLrqfn3fHyEfYZxkYUHogAAAAAAAAABrrIuup+fd8fIR9hnGRhQeiAAAAAAAAAAGusi66n593x8hH2GcZGFB6IAAAAAAAAAAa6yLaUrkL3j6f8AhM4yrRU7EAAAAAAAAAAvGjtby+L8Jy2vHzuFyMKbbgAAAAAAAAAF70Q+lVoPloZ9qgIvWAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf/EAB4QAAEFAQEBAQEAAAAAAAAAAAQAAwU0QAYWcBc1/9oACAEBAAEFAvkIfLxbgnk4lGcvFth5gKCkKGYCgpChmAoKQoZgKCkKGYCgpChmAoKQoZgKCkKGYCgpChmY719hn9CfT/ePvsZhOGCIE8ACiuFCZGzRn81SFDMH20ewJ7yNRXbx7wvyH//EACgRAAADCAECBwAAAAAAAAAAAAECAwAEBQYRMDNxMVDBEhMjQVKRof/aAAgBAwEBPwHpk0rrIES8o4l54GjJRB8FQvrG5+Q3Jvxo7HsyOQu7k340dj2ZHIXdyb8aOx7MjkLu5MUOeIgRMHcK0qycuREpwESfoXJmfF3RNMUD+GoiyUZiAnKArDcf4ahEQKVf2YssuBRqFfvp3//EAB4RAAEEAwEBAQAAAAAAAAAAAAEAAgMxBBEwUBIU/9oACAECAQE/AfMxgCTtFjdV0xbKNdMWyjXTFso10gkazf0jkR9MdocTtGFmq6MkMdL9L/O//8QAKhAAAQIEBAUEAwAAAAAAAAAAAgEDBEBzsQAQERIUUXGS0SIyNHAxM5H/2gAIAQEABj8C+oWDKERSIEVV3Ly64+GncXnD5jCIhCCqi7l5dZeGpjbKJplaXhqY2yiaZWl4amNsommVpeGpjbKJplaXhqY2yiaZWl4amNsommVpeGpjbKJplaXhqY2yiaZWl22+FbXYKD7lx8RvuXDjfCtpvFR13LLsuq6/qYIS6KnLpj9z/wDU8YdcR1/UAUvyniXhaQ2yiaZWl2GyF7cAIK6CnLrj2v8AYnnDzYi9qQKKelPP1F//xAAcEAABBQEBAQAAAAAAAAAAAAABEBFAUfAhMXD/2gAIAQEAAT8h+Q+rCMJIIGeaKOJBR2lRNq0fSom1aPpUTatH0qJtWj6VE2rR9KibVo+lRNq0fSom1aOAggAnowZHChEIBwcNHFLCRg5AoXE9hIFhwHjseqbVo/m0mJwAQI7YOjTkN8if/9oADAMBAAIAAwAAABAEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEF4EEEEEEEEEEED0EEEEEEEEEEED0EEEEEEEEEEED0EEEEEEEEEEEfEEEEEEEEEEEEP0EEEEEEEEEEFOAEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEH/8QAIhEBAAEDAwQDAAAAAAAAAAAAAREAMFExcYFQobHwIUGR/9oACAEDAQE/EOmO7Cykl8GsJRAww/Te56HFOyebnocU7J5uehxTsnm4E1NMoahGqYopkCPNvcTcpEfcBULApjO1yXiGpDGtDSmM8OOnf//EAB4RAAEEAgMBAAAAAAAAAAAAAAEAETAxIbFBUJGh/9oACAECAQE/EOsbw9J2x8EmqrJNVWSaqskMkVogEP8ADIPBdAljIaJ5olDY867/xAAgEAEBAAEEAQUAAAAAAAAAAAABESEAEEFwMUBQYcHw/9oACAEBAAE/EOoXxc46BccldhB6O09QOYwh2/GPRj0Y9GPRj0Y9GPRjwBmCkFTj41+S+tOqYAQyTHF9OYN+MKAvhXZxbaguWBnhT3AoeStd1UiPCmxAwNwNRFeFeov/2Q==';

    let yPosition: number = 20;
    const pageWidth: number = doc.internal.pageSize.getWidth();
    const margin: number = 20;
    const contentWidth: number = pageWidth - (margin * 2);

    const checkPageBreak = (requiredHeight: number): void => {
        if (yPosition + requiredHeight > 285) {
            addFooter(); doc.addPage(); addHeader(); yPosition = 40;
        }
    };

    const addHeader = (): void => {
        if (logoBase64) doc.addImage(logoBase64, 'PNG', margin, 15, 8, 8);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.setTextColor(textPrimary);
        doc.text('SpikedAI', margin + 11, 21);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(textSecondary);
        doc.text('Meeting Preparation Analytics', pageWidth - margin, 20, { align: 'right' });
        doc.setDrawColor(accentRed);
        doc.setLineWidth(0.5);
        doc.line(margin, 25, pageWidth - margin, 25);
    };

    const addFooter = (): void => {
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(8);
        doc.setTextColor(textSecondary);
        doc.text(`Page ${doc.internal.getCurrentPageInfo().pageNumber} of ${pageCount}`, pageWidth - margin, 290, { align: 'right' });
        doc.text('Confidential & Proprietary. All right reserved to SpikedAI', margin, 290);
    };
    
    const drawScoreBarChart = (x: number, y: number, w: number, h: number): void => {
        checkPageBreak(h + 20);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(textPrimary);
        doc.text("Score Progression (by question)", x, y);
        y += 5;

        doc.setDrawColor(borderLight);
        doc.setLineWidth(0.2);
        doc.line(x, y, x, y + h);
        doc.line(x, y + h, x + w, y + h);

        doc.setFontSize(8);
        doc.setTextColor(textSecondary);
        for (let i = 0; i <= 10; i += 2) {
            const labelY = y + h - (i / 10) * h;
            doc.text(`${i}`, x - 3, labelY + 2, { align: 'right' });
            doc.setDrawColor(borderLight);
            doc.line(x, labelY, x + w, labelY);
        }
        
        const barPadding = 4;
        const barWidth = (w / sessionHistory.length) - barPadding;
        sessionHistory.forEach((record, index) => {
            const barHeight = (record.score / 10) * h;
            const barX = x + (index * (barWidth + barPadding)) + (barPadding / 2);
            
            const barColor = record.score >= 8 ? accentGreen : record.score >= 5 ? accentYellow : accentRed;
            doc.setFillColor(barColor);
            doc.rect(barX, y + h - barHeight, barWidth, barHeight, 'F');

            doc.text(`Q${index + 1}`, barX + barWidth / 2, y + h + 5, { align: 'center' });
        });
        
        yPosition = y + h + 15;
    };

    addHeader();
    yPosition = 40;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(textPrimary);
    doc.text('Performance Summary', margin, yPosition);
    yPosition += 12;

    const successRate = questionCount > 0 ? Math.round((correctAnswerCount / questionCount) * 100) : 0;
    const stats = [
        { label: 'Overall Success', value: `${successRate}%` },
        { label: 'Average Score', value: `${sessionStats.avgScore.toFixed(1)}/10` },
        { label: 'Avg. Response', value: `${sessionStats.avgResponseTime.toFixed(0)}s` },
        { label: 'Total Questions', value: `${questionCount}` }
    ];
    
    const statBoxWidth = contentWidth / 4;
    stats.forEach((stat, index) => {
        const xPos = margin + (index * statBoxWidth);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(textSecondary);
        doc.text(stat.label, xPos, yPosition);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.setTextColor(accentRed);
        doc.text(stat.value, xPos, yPosition + 7);
    });
    yPosition += 25;

    if (sessionHistory.length > 0) {
        drawScoreBarChart(margin, yPosition, contentWidth, 50);
    }
    
    let trendText = "Not enough data to determine a trend.";
    if (sessionHistory.length > 1) {
        const midPoint = Math.ceil(sessionHistory.length / 2);
        const firstHalf = sessionHistory.slice(0, midPoint);
        const secondHalf = sessionHistory.slice(midPoint);

        const firstHalfAvg = firstHalf.reduce((sum, r) => sum + r.score, 0) / firstHalf.length;
        const secondHalfAvg = secondHalf.reduce((sum, r) => sum + r.score, 0) / secondHalf.length;

        if (secondHalfAvg > firstHalfAvg) {
            trendText = "You showed a positive trend, with scores improving in the second half of the session.";
        } else if (secondHalfAvg < firstHalfAvg) {
            trendText = "Scores tended to decrease in the second half. This could indicate fatigue or tougher questions.";
        } else {
            trendText = "You demonstrated consistent performance throughout the entire session.";
        }
    }
    checkPageBreak(20);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.setTextColor(textSecondary);
    const trendLines = doc.splitTextToSize(`Trend: ${trendText}`, contentWidth);
    doc.text(trendLines, margin, yPosition);
    yPosition += trendLines.length * 5 + 10;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(textPrimary);
    doc.text('Detailed Question Analysis', margin, yPosition);
    yPosition += 10;
    
    sessionHistory.forEach((record, index) => {
        checkPageBreak(80);

        doc.setDrawColor(borderLight);
        doc.setLineWidth(0.2);
        doc.line(margin, yPosition - 5, pageWidth - margin, yPosition - 5);

        const scoreX = pageWidth - margin;
        
        const circleRadius = 4;
        doc.setFillColor(accentRed);
        doc.circle(scoreX - 5, yPosition + 3.5, circleRadius, 'F');

        doc.setTextColor('#FFFFFF');
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');

        doc.text(
          `${record.score}`,
          scoreX - 5,
          yPosition + 3 + 0.5,
          { align: 'center', baseline: 'middle' }
        );
        
        doc.setFontSize(11);
        doc.setTextColor(textPrimary);
        const questionTitle = doc.splitTextToSize(`Q${index + 1}: ${record.question}`, contentWidth - 20);
        doc.text(questionTitle, margin, yPosition + 5);
        yPosition += (questionTitle.length * 5) + 8;
        
        checkPageBreak(20);
        doc.setFontSize(9);
        doc.setTextColor(textSecondary);
        doc.setFont('helvetica', 'bold');
        doc.text('YOUR ANSWER', margin, yPosition);
        yPosition += 5;

        doc.setFontSize(10);
        doc.setTextColor(textPrimary);
        doc.setFont('helvetica', 'normal');
        const answerLines = doc.splitTextToSize(record.userAnswer, contentWidth);
        doc.text(answerLines, margin, yPosition);
        yPosition += answerLines.length * 5 + 8;

        checkPageBreak(40);
        doc.setFontSize(9);
        doc.setTextColor(textSecondary);
        doc.setFont('helvetica', 'bold');
        doc.text('IDEAL ANSWER & FEEDBACK', margin, yPosition);
        yPosition += 5;

        doc.setFontSize(10);
        doc.setTextColor(textPrimary);
        doc.setFont('helvetica', 'normal');
        const idealLines = doc.splitTextToSize(record.idealAnswer, contentWidth);
        doc.text(idealLines, margin, yPosition);
        yPosition += idealLines.length * 5 + 3;

        if(record.feedback) {
            const feedbackLines = doc.splitTextToSize(record.feedback, contentWidth);
            doc.setTextColor(accentRed);
            doc.setFont('helvetica', 'italic');
            doc.text(feedbackLines, margin, yPosition + 2);
            yPosition += feedbackLines.length * 5 + 8;
            doc.setFont('helvetica', 'normal');
        }
    });

    addFooter();

    const fileName = `MeetingPrep_Report_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
};
    
  // --- EFFECTS ---
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.log('Speech recognition not supported in this browser.');
      setIsSupported(false);
      return;
    }

    setIsSupported(true);
    const recognition = new SpeechRecognition();
    speechRecognitionRef.current = recognition;

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let final_transcript = '';
      let interim_transcript = '';

      for (let i = 0; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final_transcript += event.results[i][0].transcript;
        } else {
          interim_transcript += event.results[i][0].transcript;
        }
      }
      setAccumulatedTranscript(final_transcript + interim_transcript);
    };
    
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error !== 'network' && event.error !== 'no-speech') {
        alert(`Speech recognition error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      if (isRecording) {
        console.log("Speech recognition service ended, restarting...");
        recognition.start();
      } else {
        if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current);
          recordingTimerRef.current = null;
        }
        const finalTranscript = accumulatedTranscript.trim();
        if(finalTranscript) {
          setUserChatInput(finalTranscript);
        }
      }
    };
    
    return () => {
        if (speechRecognitionRef.current) {
            speechRecognitionRef.current.stop();
        }
    };
  }, [isRecording]); 

  useEffect(() => {
    fetchExistingDocuments().then(setExistingDocuments);
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory, isAiTyping]);

  useEffect(() => {
    if (isRecording) {
      setUserChatInput(accumulatedTranscript);
    }
  }, [accumulatedTranscript, isRecording]);


  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // --- RENDER FUNCTIONS ---
  const renderLeftPanel = () => (
    <div className="flex flex-col h-full p-6 bg-white border-r border-gray-200 overflow-y-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <button onClick={handleBack} className={`p-2.5 rounded-xl transition-all duration-200 ${isDarkMode ? 'hover:bg-gray-800 text-gray-400 hover:text-white' : 'hover:bg-gray-200 text-gray-600 hover:text-gray-900'}`}>
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold text-gray-800">Configuration</h2>
        </div>
      </div>

        {/* Document Selection */}
        <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-500 mb-3">TRAINING MATERIALS</h3>
            <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="border-2 border-dashed rounded-lg p-4 text-center text-gray-500 mb-4"
            >
                <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">Drag & drop or <span className="text-blue-600 font-semibold cursor-pointer" onClick={() => fileInputRef.current?.click()}>browse</span></p>
                <input ref={fileInputRef} type="file" accept=".pdf,.docx,.pptx,.xlsx" onChange={handleFileUpload} className="hidden" />
            </div>
            <div className="space-y-2">
                {existingDocuments.map(doc => (
                    <div key={doc.doc_id} className="flex items-center text-sm">
                        <input type="checkbox" id={doc.doc_id} checked={selectedDocuments.has(doc.filename)} onChange={e => handleDocumentSelection(doc.filename, e.target.checked)} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                        <label htmlFor={doc.doc_id} className="ml-3 text-gray-700 truncate">{doc.filename}</label>
                    </div>
                ))}
                {uploadedDocuments.map(doc => (
                     <div key={doc.doc_id} className="flex items-center text-sm">
                        <input type="checkbox" id={doc.doc_id} checked={selectedDocuments.has(doc.filename)} onChange={e => handleDocumentSelection(doc.filename, e.target.checked)} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                        <label htmlFor={doc.doc_id} className="ml-3 text-gray-700 truncate">{doc.filename}</label>
                        <button onClick={() => deleteDocument(doc.doc_id)} className="ml-auto text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                ))}
                {isUploading && (
                    <div className="flex items-center text-sm p-2 text-gray-500">
                        <Loader2 className="w-4 h-4 mr-3 animate-spin" />
                        <span>Uploading document...</span>
                    </div>
                )}
            </div>
        </div>

        {/* Persona Selection */}
        <div className="mb-6">
             <h3 className="text-sm font-semibold text-gray-500 mb-3">TARGET AUDIENCE</h3>
             <div className="space-y-2">
                {personas.map(p => (
                    <button key={p.id} onClick={() => setSelectedPersona(p.id as Persona)} className={`w-full flex items-center p-3 rounded-md text-left transition-colors ${selectedPersona === p.id ? 'bg-blue-50 border-blue-200 border' : 'hover:bg-gray-50'}`}>
                        <p.icon className={`w-5 h-5 mr-3 ${selectedPersona === p.id ? 'text-blue-600' : 'text-gray-400'}`} />
                        <span className={`text-sm font-medium ${selectedPersona === p.id ? 'text-blue-700' : 'text-gray-600'}`}>{p.name}</span>
                    </button>
                ))}
             </div>
        </div>

        {/* --- NEW: Session Type Selection --- */}
        <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-500 mb-3">SESSION TYPE</h3>
            <div className="flex bg-gray-100 p-1 rounded-md">
                <button onClick={() => setSessionType('Q&A')} className={`w-1/2 py-1.5 text-sm font-semibold rounded flex items-center justify-center gap-2 ${sessionType === 'Q&A' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'}`}>
                    <MessageCircleQuestion className="w-4 h-4" /> Q&A
                </button>
                <button onClick={() => setSessionType('AI Quiz')} className={`w-1/2 py-1.5 text-sm font-semibold rounded flex items-center justify-center gap-2 ${sessionType === 'AI Quiz' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'}`}>
                    <BookCheck className="w-4 h-4" /> AI Quiz
                </button>
            </div>
        </div>
        
        {/* --- MODIFIED: Conditional Rendering for Q&A options --- */}
        {sessionType === 'Q&A' && (
          <>
            {/* AI Mode */}
            <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-500 mb-3">AI MODE</h3>
                <div className="flex bg-gray-100 p-1 rounded-md">
                    <button onClick={() => setAiMode('AI Auto')} className={`w-1/2 py-1.5 text-sm font-semibold rounded ${aiMode === 'AI Auto' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'}`}>Auto</button>
                    <button onClick={() => setAiMode('AI Custom')} className={`w-1/2 py-1.5 text-sm font-semibold rounded ${aiMode === 'AI Custom' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'}`}>Custom</button>
                </div>
                {aiMode === 'AI Custom' && (
                    <textarea 
                        value={customInstructions}
                        onChange={e => setCustomInstructions(e.target.value)}
                        placeholder="Add custom instructions..."
                        rows={3}
                        className="w-full mt-2 p-2 text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                )}
            </div>

            {/* Meeting Objective */}
            <div className="mb-6">
                 <h3 className="text-sm font-semibold text-gray-500 mb-3">MEETING OBJECTIVE (OPTIONAL)</h3>
                 <input
                    type="text"
                    value={meetingObjective}
                    onChange={(e) => setMeetingObjective(e.target.value)}
                    placeholder="e.g., Secure technical buy-in"
                    className="w-full p-2 text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                 />
            </div>
          </>
        )}
        
        {/* Session Duration */}
        <div className="mb-auto">
             <h3 className="text-sm font-semibold text-gray-500 mb-3">SESSION DURATION</h3>
             <div className="flex items-center">
                <input
                    type="range"
                    min="5"
                    max="60"
                    step="5"
                    value={sessionDuration}
                    onChange={(e) => setSessionDuration(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="ml-4 text-sm font-medium text-gray-700 w-12 text-right">{sessionDuration} min</span>
             </div>
        </div>


        {/* Action Button */}
        <div className="mt-6">
            {currentPhase === 1 && (
                 <button
                    onClick={handleStartSession}
                    disabled={!selectedPersona || selectedDocuments.size === 0 || isUploading || isStartingSession}
                    className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition-colors flex items-center justify-center"
                >
                    {isStartingSession ? (
                        <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            <span>Starting...</span>
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-5 h-5 mr-2" />
                            <span>Start Training</span>
                        </>
                    )}
                </button>
            )}
            {currentPhase === 2 && (
                 <button
                    onClick={handleEndSession}
                    className="w-full bg-red-600 text-white font-semibold py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
                >
                    <X className="w-5 h-5 mr-2" />
                    End Session
                </button>
            )}
            {currentPhase === 3 && (
                <button
                    onClick={() => window.location.reload()}
                    className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                    <Play className="w-5 h-5 mr-2" />
                    Start New Session
                </button>
            )}
        </div>
    </div>
  );

  const renderCenterPanel = () => {
    if(currentPhase === 1) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-10">
                <div className="bg-blue-600 p-5 rounded-2xl mb-6 inline-block">
                    <Gamepad2 className="w-12 h-12 text-white" />
                </div>
                <h1 className="text-4xl font-bold text-gray-800">AI Simulator & Quiz</h1>
                <p className="mt-4 max-w-lg text-lg text-gray-500">
                    Transform your sales performance. Choose Q&A for AI-powered roleplay or AI Quiz to test your knowledge with multiple-choice questions.
                </p>
                <p className="mt-8 text-gray-400">
                    Configure your session in the left panel to begin.
                </p>
            </div>
        )
    }

    if (currentPhase === 2) {
      // --- RENDER Q&A SESSION ---
      if (sessionType === 'Q&A') {
        return (
            <div className="flex flex-col h-full">
                <div ref={chatContainerRef} className="flex-1 p-8 overflow-y-auto space-y-6">
                    {chatHistory.map((msg, index) => {
                        if (msg.type === 'ai_question') {
                            return (
                                <div key={index} className="flex justify-start">
                                    <div className="p-5 rounded-lg max-w-2xl bg-gray-100">
                                        <div className="flex items-center mb-2">
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-200 mr-3">
                                                <MessageSquare className="w-4 h-4 text-gray-600" />
                                            </div>
                                            <span className="font-bold text-gray-800">AI Question</span>
                                        </div>
                                        <div className="prose prose-lg max-w-none text-gray-700"><ReactMarkdown>{msg.text}</ReactMarkdown></div>
                                    </div>
                                </div>
                            );
                        }
                        if (msg.type === 'user') {
                            return (
                                <div key={index} className="flex justify-end">
                                    <div className="p-5 rounded-lg max-w-2xl bg-blue-600 text-white">
                                         <div className="flex items-center mb-2">
                                            <span className="font-bold">Your Answer</span>
                                         </div>
                                        <p className="leading-relaxed">{msg.text}</p>
                                    </div>
                                </div>
                            );
                        }
                        return null; 
                    })}
                     {isAiTyping && (
                        <div className="flex justify-start">
                            <div className="p-4 rounded-lg bg-gray-100">
                               <div className="flex items-center space-x-2 text-sm">
                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                                    <span className="text-gray-600">AI is analyzing...</span>
                               </div>
                            </div>
                        </div>
                    )}
                </div>
                <div className="p-6 border-t border-gray-200">
                      <div className="flex items-center space-x-3">
                        <button
                            onClick={handleIDontKnow}
                            disabled={isAiTyping || showAnalysis || isRecording}
                            className="px-4 py-2 rounded-lg font-medium border border-yellow-400 text-yellow-600 bg-white shadow-sm hover:bg-yellow-400 hover:text-white hover:shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Skip this question"
                        >
                            Skip
                        </button>
                        <div className="relative flex-1">
                            <input
                                type="text"
                                placeholder={isRecording ? `Listening... (${formatTime(recordingDuration)})` : "Type your response or click the mic"}
                                value={userChatInput}
                                onChange={(e) => setUserChatInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && !isRecording && handleUserSendMessage()}
                                disabled={isAiTyping || showAnalysis}
                                className="w-full p-3 pr-24 rounded-lg border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            />
                            {isSupported && (
                                <button
                                    onClick={toggleListening}
                                    disabled={!isSupported || isAiTyping || showAnalysis}
                                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-lg transition-all duration-300 ${
                                        isRecording 
                                        ? 'bg-red-500 text-white animate-pulse hover:bg-red-600' 
                                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                    } ${!isSupported ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
                                    title={!isSupported ? 'Speech recognition not supported' : isRecording ? 'Stop listening' : 'Start voice input'}
                                >
                                    {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                                </button>
                            )}
                        </div>
                        <button
                            onClick={() => handleUserSendMessage(false)}
                            disabled={!userChatInput.trim() || isAiTyping || showAnalysis || isRecording}
                            className="px-5 py-3 rounded-lg font-semibold transition-colors bg-gray-800 text-white hover:bg-gray-700 disabled:bg-gray-300"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        )
      }

      // --- NEW: RENDER QUIZ SESSION ---
      if (sessionType === 'AI Quiz') {
        return (
          <div className="flex flex-col h-full bg-white">
            <div className="p-6 border-b">
              <h1 className="text-2xl font-bold text-gray-800">AI Knowledge Quiz</h1>
              <p className="text-gray-500">Answer the following questions based on the provided documents.</p>
            </div>
            <div className="flex-1 p-8 overflow-y-auto space-y-8">
              {quizQuestions.map((q, index) => (
                <div key={q.question_id}>
                  <p className="font-semibold text-gray-800 mb-3">{index + 1}. {q.question}</p>
                  <div className="space-y-2">
                    {q.options.map((option, i) => (
                      <label key={i} className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${userQuizAnswers[q.question_id] === option ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'}`}>
                        <input
                          type="radio"
                          name={q.question_id}
                          value={option}
                          checked={userQuizAnswers[q.question_id] === option}
                          onChange={() => handleQuizAnswerSelect(q.question_id, option)}
                          className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <span className="ml-3 text-sm text-gray-700">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 border-t">
              <button
                onClick={handleSubmitQuiz}
                disabled={Object.keys(userQuizAnswers).length < quizQuestions.length}
                className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
              >
                Submit Quiz
              </button>
            </div>
          </div>
        )
      }
    }

    if(currentPhase === 3) {
      // --- RENDER Q&A RESULTS ---
      if (sessionType === 'Q&A') {
        const finalScore = questionCount > 0 ? Math.round((correctAnswerCount / questionCount) * 100) : 0;
        const scoreColor = finalScore >= 75 ? 'text-green-500' : finalScore >= 60 ? 'text-yellow-500' : 'text-red-500';
        
        return (
             <div className="flex flex-col h-full bg-white overflow-y-auto">
                 <div className="p-10 text-center border-b">
                    <div className="mb-6">
                        <Award className="w-16 h-16 text-gray-800 mx-auto" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Training Session Complete</h1>
                    <p className={`text-6xl font-bold ${scoreColor} mb-4`}>
                        {finalScore}%
                    </p>
                    <p className="text-lg text-gray-600 mb-8">
                      Overall Success Rate (7+ Scores)
                    </p>
                     <div className="grid grid-cols-3 gap-6 w-full max-w-2xl mx-auto text-center mb-8">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-2xl font-bold text-gray-800">{questionCount}</p>
                            <p className="text-sm text-gray-500">Answered</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-2xl font-bold text-gray-800">{sessionStats.avgScore.toFixed(1)}</p>
                            <p className="text-sm text-gray-500">Avg. Score</p>
                        </div>
                         <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-2xl font-bold text-gray-800">{sessionStats.avgResponseTime.toFixed(0)}s</p>
                            <p className="text-sm text-gray-500">Avg. Time</p>
                        </div>
                     </div>
                     <div className="flex space-x-4 justify-center">
                         <button 
                            onClick={handleDownloadReport} 
                            className="px-5 py-2 rounded-lg font-semibold flex items-center space-x-2 bg-gray-200 text-gray-700 hover:bg-gray-300"
                         >
                            <Download className="w-4 h-4" />
                            <span>Download Report</span>
                        </button>
                     </div>
                 </div>

                <div className="p-8">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Detailed Review</h2>
                    <div className="space-y-2">
                        {sessionHistory.map((record, index) => (
                            <div key={index} className="border rounded-lg bg-gray-50 overflow-hidden">
                                <button
                                    onClick={() => setOpenAccordion(openAccordion === index ? null : index)}
                                    className="w-full flex justify-between items-center p-4 text-left font-semibold text-gray-700 hover:bg-gray-100 focus:outline-none"
                                >
                                    <span>Q{index + 1}: {record.question}</span>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className={`w-5 h-5 transition-transform duration-300 ${openAccordion === index ? 'rotate-180' : ''}`}
                                    >
                                        <polyline points="6 9 12 15 18 9"></polyline>
                                    </svg>
                                </button>

                                {openAccordion === index && (
                                    <div className="p-4 border-t border-gray-200 bg-white">
                                        <div className="mb-3">
                                            <p className="text-sm font-medium text-blue-700">Your Answer (Score: {record.score}/10)</p>
                                            <p className="text-sm text-gray-600 p-2 bg-blue-50 rounded-md mt-1">{record.userAnswer}</p>
                                        </div>
                                        <div className="mb-3">
                                            <p className="text-sm font-medium text-green-700">Ideal Answer</p>
                                            <p className="text-sm text-gray-600 p-2 bg-green-50 rounded-md mt-1">{record.idealAnswer}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-yellow-700">Feedback</p>
                                            <p className="text-sm text-gray-600 p-2 bg-yellow-50 rounded-md mt-1">{record.feedback}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                     </div>
                 </div>
             </div>
        );
      }
      
      // --- NEW: RENDER QUIZ RESULTS ---
      if (sessionType === 'AI Quiz') {
        const finalPercentage = quizQuestions.length > 0 ? Math.round((quizScore / quizQuestions.length) * 100) : 0;
        const scoreColor = finalPercentage >= 80 ? 'text-green-500' : finalPercentage >= 60 ? 'text-yellow-500' : 'text-red-500';
        return (
          <div className="flex flex-col h-full bg-white overflow-y-auto">
            <div className="p-10 text-center border-b">
              <Award className="w-16 h-16 text-gray-800 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Quiz Complete!</h1>
              <p className="text-lg text-gray-600 mb-4">You scored</p>
              <p className={`text-6xl font-bold ${scoreColor} mb-4`}>
                {quizScore} / {quizQuestions.length}
              </p>
            </div>
            <div className="p-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Detailed Quiz Review</h2>
              <div className="space-y-4">
                {quizQuestions.map((q, index) => {
                  const userAnswer = userQuizAnswers[q.question_id] || "Not Answered";
                  const isCorrect = userAnswer === q.correct_answer;
                  return (
                    <div key={q.question_id} className={`border rounded-lg p-4 ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                      <p className="font-semibold text-gray-800 mb-2">{index + 1}. {q.question}</p>
                      <p className={`text-sm ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                        Your answer: <span className="font-medium">{userAnswer}</span>
                        {!isCorrect && <span className="ml-2 font-medium">(Correct: {q.correct_answer})</span>}
                      </p>
                      <div className="mt-2 pt-2 border-t border-dashed">
                        <p className="text-xs font-semibold text-gray-500">EXPLANATION</p>
                        <p className="text-sm text-gray-700 mt-1">{q.explanation}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      }
    }

    return null;
  }
  
  const renderRightPanel = () => {
    // Show a placeholder in Phase 1
    if (currentPhase === 1) {
        return (
            <div className="flex flex-col h-full p-6 bg-white border-l border-gray-200 overflow-y-auto">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Session Preview</h2>
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                    <HelpCircle className="w-10 h-10 mb-4 text-gray-400" />
                    <p className="text-sm">Session progress and live feedback will appear here once the training begins.</p>
                </div>
            </div>
        );
    }

    // --- RENDER Q&A ANALYSIS PANEL ---
    if (sessionType === 'Q&A' && showAnalysis && currentAnalysis) {
        const { score, coverage, strengths, improvements } = currentAnalysis;
        return (
            <div className="flex flex-col h-full p-6 bg-white border-l border-gray-200 overflow-y-auto">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Feedback & Analysis</h2>
                 <div className="grid grid-cols-2 gap-4 mb-6 text-center">
                        <div className="p-4 rounded-lg bg-gray-50">
                          <div className={`text-2xl font-bold ${
                            score >= 8 ? 'text-green-500' : score >= 6 ? 'text-yellow-500' : score >= 4 ? 'text-orange-500' : 'text-red-500'
                          }`}>
                            {score}/10
                          </div>
                          <div className="text-sm font-medium text-gray-500">AI Score</div>
                        </div>
                        <div className="p-4 rounded-lg bg-gray-50">
                          <div className="text-lg font-bold text-gray-800">
                            {coverage}
                          </div>
                          <div className="text-sm font-medium text-gray-500">Coverage</div>
                        </div>
                </div>
                
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-700 mb-2">Ideal Answer</h4>
                  <div className="prose prose-sm max-w-none p-4 bg-green-50 text-green-800 rounded-md">
                      <ReactMarkdown>{chatHistory.find(m => m.type === 'ai_ideal_answer')?.text}</ReactMarkdown>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="font-semibold text-gray-700 mb-2">Strengths</h4>
                  <ul className="text-sm space-y-2">
                      {strengths.map((s, i) => <li key={i} className="flex items-start"><CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" /> <span className="text-gray-600">{s}</span></li>)}
                  </ul>
                </div>

                 <div className="mb-6">
                  <h4 className="font-semibold text-gray-700 mb-2">Improvements</h4>
                  <ul className="text-sm space-y-2">
                      {improvements.map((imp, i) => <li key={i} className="flex items-start"><Target className="w-4 h-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" /> <span className="text-gray-600">{imp}</span></li>)}
                  </ul>
                </div>

                 <div className="mt-auto">
                      <button
                        onClick={handleNextQuestion}
                        className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                    >
                        <ArrowRight className="w-5 h-5 mr-2" />
                        Next Question
                    </button>
                 </div>
            </div>
        )
    }

    // --- RENDER SESSION PROGRESS PANEL (FOR BOTH Q&A and QUIZ) ---
    if (currentPhase === 2) {
        return (
            <div className="flex flex-col h-full p-6 bg-white border-l border-gray-200 overflow-y-auto">
                 <h2 className="text-xl font-bold text-gray-800 mb-6">Session Progress</h2>

                 <div className="mb-6 text-center">
                    <p className="text-sm text-gray-500">TIME REMAINING</p>
                    <p className={`font-mono text-4xl font-bold ${timer < 120 ? 'text-red-500' : 'text-gray-800'}`}>
                        {formatTime(timer)}
                    </p>
                 </div>
                 
                 {sessionType === 'Q&A' && (
                     <div className="space-y-4">
                         <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">Progress</span>
                            <span className="font-semibold text-gray-800">{questionCount}/{generatedQuestions.length}</span>
                         </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${(questionCount / (generatedQuestions.length || 1)) * 100}%` }}></div>
                          </div>

                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">Success Rate (7+)</span>
                            <span className="font-semibold text-green-600">{questionCount > 0 ? Math.round((correctAnswerCount / questionCount) * 100) : 0}%</span>
                         </div>

                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">Avg. Score</span>
                            <span className="font-semibold text-gray-800">{sessionStats.avgScore.toFixed(1)}/10</span>
                         </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">Avg. Response Time</span>
                            <span className="font-semibold text-gray-800">{sessionStats.avgResponseTime.toFixed(0)}s</span>
                         </div>
                     </div>
                 )}

                 {sessionType === 'AI Quiz' && (
                     <div className="space-y-4">
                         <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">Progress</span>
                            <span className="font-semibold text-gray-800">{Object.keys(userQuizAnswers).length}/{quizQuestions.length}</span>
                         </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${(Object.keys(userQuizAnswers).length / (quizQuestions.length || 1)) * 100}%` }}></div>
                          </div>
                     </div>
                 )}

                 <div className="mt-8 pt-6 border-t border-gray-200">
                     <h3 className="text-sm font-semibold text-gray-500 mb-3">DOCUMENT CONTEXT</h3>
                     <div className="text-sm space-y-1">
                        {Array.from(selectedDocuments).map((filename, index) => (
                            <div key={index} className="flex items-center text-gray-600">
                                <File className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                                <span className="truncate">{filename}</span>
                            </div>
                        ))}
                     </div>
                 </div>
            </div>
        )
    }
    
    // Default to null if no other condition is met (should not happen in normal flow)
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      {/* Left Panel */}
      <div style={{ width: `${panelWidths.left}%` }} className="flex-shrink-0 h-full">
        {renderLeftPanel()}
      </div>

      <Resizer onMouseDown={handleMouseDown('left')} />

      {/* Center Panel */}
      <div className="flex-1 bg-gray-50 h-full flex flex-col">
        {isStartingSession && !isAiTyping ? 
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" /> 
            </div> 
            : renderCenterPanel()
        }
      </div>
      
      <Resizer onMouseDown={handleMouseDown('right')} />

      {/* Right Panel */}
      <div style={{ width: `${panelWidths.right}%` }} className="flex-shrink-0 h-full">
          {renderRightPanel()}
      </div>
    </div>
  );
};

export default MeetingPrep;