// src/contexts/BotContext.tsx
import React, { createContext, useState, useContext, useEffect, useRef, useCallback } from "react";
import { TranscriptSegment } from "../types"; 

interface BotContextType {
  botStatus: "idle" | "starting" | "running" | "stopping" | "error";
  isTranscribing: boolean;
  isBotRunning: boolean;
  transcript: TranscriptSegment[];
  interimTranscript: string;
  startBot: (meetingUrl: string) => void;
  stopBot: () => void;
  toggleTranscription: () => void;
  saveTranscriptAsLog: () => void;
}

const BotContext = createContext<BotContextType | undefined>(undefined);
const service_url_recall = "https://recall-backend-822359826336.us-central1.run.app";

export const BotProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [botStatus, setBotStatus] = useState<"idle" | "starting" | "running" | "stopping" | "error">("idle");
  const [isTranscribing, setIsTranscribing] = useState(true);
  const [isBotRunning, setIsBotRunning] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptSegment[]>(() => {
    try {
      const savedTranscript = localStorage.getItem("transcript");
      return savedTranscript ? JSON.parse(savedTranscript) : [];
    } catch (error) {
      console.error("Failed to parse transcript from localStorage", error);
      return [];
    }
  });
  const [interimTranscript, setInterimTranscript] = useState<string>("");

  const transcriptEventSource = useRef<EventSource | null>(null);
  const processedMessageIds = useRef(new Set());
  const userStoppedBot = useRef(false);

  const createTranscriptSource = useCallback(() => {
    if (transcriptEventSource.current) {
      transcriptEventSource.current.close();
    }
    
    setBotStatus("running");
    const newTranscriptSource = new EventSource(`${service_url_recall}/transcripts`);
    
    newTranscriptSource.onmessage = (event) => {
      try {
        const { speaker, text, timestamp } = JSON.parse(event.data);
        const messageId = `${speaker}-${text}-${timestamp}`;
        if (processedMessageIds.current.has(messageId)) return;
        processedMessageIds.current.add(messageId);

        if (isTranscribing) {
          const newSegment = {
            id: Date.now() + Math.random(),
            start: Date.now(),
            end: Date.now(),
            language: "en-US",
            created_at: new Date(timestamp).toISOString(),
            text,
            speaker,
            absolute_start_time: new Date(timestamp).toISOString(),
            absolute_end_time: new Date(timestamp).toISOString(),
          };
          setTranscript((prev) => [...prev, newSegment]);
        }
      } catch (error) {
        console.error("Error processing transcript message:", error);
      }
    };
    newTranscriptSource.onerror = (error) => console.error("Transcript stream error:", error);
    transcriptEventSource.current = newTranscriptSource;
  }, [isTranscribing]);

  const startBot = useCallback(async (meetingUrl: string) => {
    if (isBotRunning || botStatus === "starting" || !meetingUrl) return;

    setBotStatus("starting");
    setIsBotRunning(true);
    userStoppedBot.current = false;

    try {
      const formData = new FormData();
      formData.append("meeting_url", meetingUrl);
      const response = await fetch(`${service_url_recall}/start`, { method: "POST", body: formData });
      if (!response.ok) throw new Error("Failed to start meeting recording.");

      console.log("✅ Bot started successfully.");
      createTranscriptSource();
      
    } catch (error) {
      console.error("Error starting bot:", error);
      setBotStatus("error");
      setIsBotRunning(false);
    }
  }, [botStatus, isBotRunning, createTranscriptSource]);

  const stopBot = useCallback(() => {
    setBotStatus("stopping");
    if (transcriptEventSource.current) {
      transcriptEventSource.current.close();
      transcriptEventSource.current = null;
    }
    setBotStatus("idle");
    setIsBotRunning(false);
    userStoppedBot.current = true;
    console.log("✅ Bot stopped.");
    setTranscript((prev) => [
      ...prev,
      {
        id: Date.now(),
        start: Date.now(),
        end: Date.now(),
        text: "Bot disconnected. Transcription stopped.",
        language: "en",
        created_at: new Date().toISOString(),
        speaker: "Spiked",
        absolute_start_time: new Date().toISOString(),
        absolute_end_time: new Date().toISOString(),
      },
    ]);
  }, []);

  const toggleTranscription = useCallback(() => {
    setIsTranscribing((prev) => !prev);
  }, []);

  const saveTranscriptAsLog = useCallback(() => {
    const logContent = transcript
      .map((segment) => {
        const date = new Date(segment.created_at).toLocaleString();
        return `[${date}] ${segment.speaker}: ${segment.text}`;
      })
      .join("\n");

    const blob = new Blob([logContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transcript-${new Date().toISOString()}.log`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [transcript]);


  // ✅ New useEffect to handle window focus and blur events
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isBotRunning && !userStoppedBot.current) {
        console.log("Window became visible. Re-establishing connection.");
        createTranscriptSource();
      } else if (document.visibilityState === 'hidden' && transcriptEventSource.current) {
        console.log("Window became hidden. Closing connection.");
        transcriptEventSource.current.close();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Cleanup function
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isBotRunning, createTranscriptSource]);

  // ✅ NEW: UseEffect to trigger log file saving every 5 seconds
  useEffect(() => {
    let intervalId: number | undefined;

    if (isBotRunning && transcript.length > 0) {
      intervalId = window.setInterval(() => {
        saveTranscriptAsLog();
      }, 5000); // 5000ms = 5 seconds
    }

    return () => {
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [isBotRunning, transcript, saveTranscriptAsLog]);

  // ✅ Persist transcript to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("transcript", JSON.stringify(transcript));
    } catch (error) {
      console.error("Failed to save transcript to localStorage", error);
    }
  }, [transcript]);

  // ✅ Cleanup EventSource on component unmount
  useEffect(() => {
    return () => {
      if (transcriptEventSource.current) {
        transcriptEventSource.current.close();
      }
    };
  }, []);

  const value = {
    botStatus,
    isTranscribing,
    isBotRunning,
    transcript,
    interimTranscript,
    startBot,
    stopBot,
    toggleTranscription,
    saveTranscriptAsLog,
  };

  return <BotContext.Provider value={value}>{children}</BotContext.Provider>;
};

export const useBot = () => {
  const context = useContext(BotContext);
  if (!context) {
    throw new Error("useBot must be used within a BotProvider");
  }
  return context;
};