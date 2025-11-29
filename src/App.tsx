// src\App.tsx

import React, { useState, useCallback, useEffect } from 'react';
import { Routes, Route, Navigate, Outlet, useNavigate, useLocation } from "react-router-dom"; // <<-- IMPORT useLocation
import { useAuth } from "./AuthContext";
import { useBotId, BotIdProvider } from "./BotIdContext"; // Import useBotId
import { useTheme } from './ThemeContext'; // Import the useTheme hook

// --- Import the new NavBar component ---
import AppHeader from "./components/NavBar"; 

// --- Import Your Page Components ---
import AuthPages from "./login";
import SpikedAIrecall from "./components/SpikedAI_recall";
import DocumentsPage from "./pages/documents";
import SpikedAISettings from "./pages/settings";
import MeetingPrep from "./pages/meeting-prep";
import DashboardPage from "./pages/notetaker";
import AdminPage from "./pages/admin";
import SpikedAIvexa from "./pages/SpikedAI_vexa";
import ProtectedRoute from "./ProtectedRoute";
import Integrations from './pages/Integrations';
import TutorialsHub from "./pages/TutorialsHub";
import KnowledgeBase from "./pages/knowledge_base";
import JiraDashboard from './pages/JiraDashboard';


// ==============================================================================
// --- PLACEHOLDERS for external dependencies (MUST be defined in your project) ---
// ==============================================================================

// Replace with your actual service URL
const service_url_recall = "https://recall-backend-production-409019309412.us-central1.run.app"; 

// Define your Transcript and Sentiment types
interface TranscriptItem {
    id: number;
    start: number;
    end: number;
    text: string;
    language: string;
    created_at: string;
    speaker: string;
    absolute_start_time: string;
    absolute_end_time: string;
}

const initialSentimentData = { 
    // Define the structure of your initial sentiment data
    positive: 0,
    negative: 0,
    neutral: 0,
}; 

// Define your SSE connection function
const establishSseConnections = async (botId: string) => {
    // NOTE: In a real app, this is where you would instantiate an EventSource.
    console.log(`[MainLayout] Establishing SSE for botId: ${botId}`);
    // Example: new EventSource(`${service_url_recall}/stream/${botId}`);
    // You would need to handle the event listeners and cleanup in a robust way.
};

// Define your staggered fetch function
const fetchSentimentDataStaggered = () => {
    console.log('[MainLayout] Simulating staggered sentiment data fetch...');
    // Implement API calls to fetch updated sentiment data
};


const MainLayout = () => {
    // Hooks for Global State
    const { isDarkMode } = useTheme();
    const navigate = useNavigate();
    const location = useLocation(); // <<-- Get current location
    const { session } = useAuth(); // Assuming useAuth provides 'session' with 'access_token'
    const { botId, setBotId } = useBotId(); // Use context for botId
    
    // Condition to hide the NavBar on the main SpikedAIrecall page
    const shouldShowNavBar = location.pathname !== '/'; 

    // --- Bot Connection State & Handlers (REAL LOGIC MOVED HERE from SpikedAIrecall.tsx) ---
    const [meetingUrl, setMeetingUrl] = useState('');
    const [botStatus, setBotStatus] = useState<'idle' | 'starting' | 'running' | 'stopping' | 'error'>('idle');
    const [apiStatus, setApiStatus] = useState<'online' | 'offline' | 'pending'>('online');
    const isBotRunning = botStatus === 'running';

    // State previously local to SpikedAIrecall (now lifted/used here)
    const [isConnected, setIsConnected] = useState(false); // Used to set UI state internally
    const [isTranscribing, setIsTranscribing] = useState(false); // Used to set UI state internally
    const [sentimentData, setSentimentData] = useState(initialSentimentData); // Used to set UI state internally
    const [transcript, setTranscript] = useState<TranscriptItem[]>([]); // Used to set UI state internally

    // REAL startBot function
    const startBot = useCallback(async () => {
        if (!meetingUrl) return;

        try {
            console.log("[MainLayout] Starting bot with URL:", meetingUrl);
            setBotStatus("starting");

            const formData = new FormData();
            formData.append("meeting_url", meetingUrl);

            console.log("[MainLayout] Sending request to backend...");
            const response = await fetch(`${service_url_recall}/start`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${session?.access_token ?? ""}`,
                },
                body: formData,
            });

            console.log("[MainLayout] Response status:", response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error("[MainLayout] Backend error:", errorText);
                throw new Error(`Failed to start bot: ${response.status} - ${errorText}`);
            }

            const responseData = await response.json();
            const newBotId = responseData.id;

            console.log("[MainLayout] Received bot ID:", newBotId);

            if (newBotId && typeof newBotId === 'string' && newBotId.length > 0) {
                // 1. Set the global/context botId (The key action that triggers SSE via useEffect)
                setBotId(newBotId); 

                // 2. Update local component state for UI feedback
                setBotStatus("running");
                setIsConnected(true);
                setIsTranscribing(true);
                setSentimentData(initialSentimentData);

                setTranscript([
                    {
                        id: Date.now(),
                        start: 0, end: 0, language: "en", speaker: "Spiked",
                        text: "Bot connected successfully. Real-time transcription active.",
                        created_at: new Date().toISOString(),
                        absolute_start_time: new Date().toISOString(),
                        absolute_end_time: new Date().toISOString(),
                    },
                ]);

                // 🌟 ADDED POP-UP LOGIC HERE 🌟
                alert("The bot has started and transcription is active. Click the 'Analyser' button (Notebook 📝 symbol) at the top right of the website to view real-time analysis."); 
                // 🌟 ------------------------ 🌟

                setTimeout(() => {
                    fetchSentimentDataStaggered();
                }, 5000);

            } else {
                throw new Error("No valid bot ID received from backend");
            }
        } catch (error) {
            console.error("[MainLayout] Error starting bot:", error);
            
            // 3. Reset the global state on error
            setBotId(null); 

            // Reset local component state
            setBotStatus("error");
            setIsConnected(false);
            setIsTranscribing(false);

            alert(`Failed to start bot: ${
                error instanceof Error ? error.message : String(error)
            }`);
        }
    }, [meetingUrl, session?.access_token, setBotId]);


    // REAL stopBot function 
    const stopBot = useCallback(() => {
        setBotStatus('stopping');
        setBotId(null); // Clear botId globally, which will trigger SSE cleanup in SpikedAIrecall.tsx
        // Simulate API call delay (or replace with actual API call to stop the bot)
        setTimeout(() => setBotStatus('idle'), 1000); 
    }, [setBotId]);

    // This is the function passed to NavBar.tsx
    const handleConnectClick = () => {
        startBot();
    };

    // useEffect from SpikedAIrecall.tsx snippet, now in MainLayout: 
    // Activates SSE connections when the global botId is set.
    useEffect(() => {
        if (botId) {
            console.log(`[MainLayout/useEffect] Bot ID detected: ${botId}. Activating SSE connections.`);
            establishSseConnections(botId);
        } else {
            console.log('[MainLayout/useEffect] Bot ID is null. SSE connections likely disconnected.');
            // In a real scenario, a cleanup function would be returned here to close EventSource
        }
    }, [botId]);


    // --- Other Handlers (Layout, Jira) ---
    const [layout, setLayout] = useState('default');

    const handleLayoutChange = useCallback((newLayout: string) => {
        setLayout(newLayout);
        console.log(`Layout changed to: ${newLayout}`);
    }, []);

    const fetchSelectedJiraTasks = useCallback(() => {
        console.log('[MainLayout] Fetching selected Jira tasks...');
    }, []);


    return (
        <div className="app-layout min-h-screen flex flex-col">
            {/* 1. Conditional Global Navigation Bar */}
            {shouldShowNavBar && ( // <<-- Conditionally render NavBar
                <AppHeader 
                    isDarkMode={isDarkMode}
                    apiStatus={apiStatus}
                    meetingUrl={meetingUrl}
                    setMeetingUrl={setMeetingUrl}
                    isBotRunning={isBotRunning}
                    botStatus={botStatus === 'error' ? 'stopping' : botStatus}
                    stopBot={stopBot} // Real stop logic
                    handleConnectClick={handleConnectClick} // Real start logic
                    layout={layout}
                    handleLayoutChange={handleLayoutChange}
                    fetchSelectedJiraTasks={fetchSelectedJiraTasks}
                />
            )}
            
            {/* 2. Page Content Outlet */}
            <main className="content flex-grow">
                <Outlet /> {/* Renders the current page component */}
            </main>
        </div>
    );
};

const NotFoundPage = () => {
    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            <h1>404 - Page Not Found</h1>
            <p>The page you are looking for does not exist.</p>
        </div>
    );
};

function App() {
    return (
        
        <BotIdProvider> {/* Wrap the entire app with the BotProvider */}
            <Routes>
                <Route path="/login" element={<AuthPages />} />
                
                {/* All protected routes, including the main app */}
                <Route element={<ProtectedRoute />}>
                    <Route element={<MainLayout />}> {/* MainLayout includes the global NavBar */}
                        <Route path="/" element={<SpikedAIrecall />} />
                        <Route path="/documents" element={<DocumentsPage />} />
                        <Route path="/settings" element={<SpikedAISettings />} />
                        <Route path="/meeting-prep" element={<MeetingPrep />} />
                        <Route path="/note-taker" element={<DashboardPage />} />
                        <Route path="/admin" element={<AdminPage />} />
                        <Route path="/vexa" element={<SpikedAIvexa />} />
                        <Route path="/integrations" element={<Integrations />} />
                        <Route path="/integrations/jira" element={<JiraDashboard />} />
                        <Route path="/tutorial" element={<TutorialsHub />} />
                        <Route path="/knowledge_base" element={<KnowledgeBase/>}/>
                    </Route>
                </Route>

                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </BotIdProvider>
    );
}

export default App;