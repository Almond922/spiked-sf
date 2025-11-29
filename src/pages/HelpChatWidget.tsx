import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2, Minimize2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useAuth } from "../AuthContext"; 

interface Message {
  role: "user" | "assistant";
  content: string;
}

// Define the type for position
interface Position {
  x: number;
  y: number;
}

const BASE_URL = "https://spikedai-production-application-409019309412.us-central1.run.app";

const HelpChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello! I'm your SpikedAI Agent. How can I help you manage the platform today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { session } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // State for positioning and dragging
  const [position, setPosition] = useState<Position>({ x: 24, y: 24 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const widgetRef = useRef<HTMLDivElement>(null);


  // --- Auto-scroll and Drag Handlers ---

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, isLoading]);

  const handleDragStart = (e: React.MouseEvent) => {
    if (isMinimized) return;

    const widgetRect = widgetRef.current?.getBoundingClientRect();
    if (!widgetRect) return;

    setDragOffset({
        x: e.clientX - widgetRect.left,
        y: e.clientY - widgetRect.top,
    });
    setIsDragging(true);
  };

  const handleDrag = (e: MouseEvent) => {
    if (!isDragging || !widgetRef.current) return;
    
    const widgetWidth = widgetRef.current.offsetWidth;
    const widgetHeight = widgetRef.current.offsetHeight;
    
    let newX = window.innerWidth - (e.clientX - dragOffset.x + widgetWidth);
    let newY = window.innerHeight - (e.clientY - dragOffset.y + widgetHeight);

    const margin = 24;
    newX = Math.min(Math.max(margin, newX), window.innerWidth - widgetWidth - margin);
    newY = Math.min(Math.max(margin, newY), window.innerHeight - widgetHeight - margin);
    
    setPosition({ x: newX, y: newY });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
        document.addEventListener('mousemove', handleDrag);
        document.addEventListener('mouseup', handleDragEnd);
    } else {
        document.removeEventListener('mousemove', handleDrag);
        document.removeEventListener('mouseup', handleDragEnd);
    }
    return () => {
        document.removeEventListener('mousemove', handleDrag);
        document.removeEventListener('mouseup', handleDragEnd);
    };
  }, [isDragging, dragOffset]); 


  // --- Message Sending Logic (Omitted for brevity, assumed correct) ---

  const handleSendMessage = async () => {
      if (!input.trim() || isLoading) return;

      const userMsg = input.trim();
      setInput("");
      
      const newHistory = [...messages, { role: "user" as const, content: userMsg }];
      setMessages(newHistory);
      setIsLoading(true);

      try {
          const response = await fetch(`${BASE_URL}/help/chat`, {
              method: "POST",
              headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${session?.access_token}`
              },
              body: JSON.stringify({
                  message: userMsg,
                  history: newHistory.slice(-6)
              })
          });

          if (!response.ok) throw new Error("Network response was not ok");
          if (!response.body) throw new Error("No response body");

          setMessages(prev => [...prev, { role: "assistant", content: "" }]);

          const reader = response.body.getReader();
          const decoder = new TextDecoder("utf-8");
          let done = false;

          while (!done) {
              const { value, done: doneReading } = await reader.read();
              done = doneReading;
              
              if (value) {
                  const chunk = decoder.decode(value, { stream: true });
                  
                  setMessages(prev => {
                      const updated = [...prev];
                      const lastMsgIndex = updated.length - 1;
                      
                      if (updated[lastMsgIndex].role === "assistant") {
                          updated[lastMsgIndex] = {
                              ...updated[lastMsgIndex],
                              content: updated[lastMsgIndex].content + chunk
                          };
                      }
                      return updated;
                  });
              }
          }
      } catch (error) {
          console.error("Chat error:", error);
          setMessages(prev => [...prev, {
              role: "assistant",
              content: "Sorry, I'm having trouble connecting to the server right now."
          }]);
      } finally {
          setIsLoading(false);
      }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
    }
  };

  // --- Conditional Render Logic ---

  // 1. RENDER BLUE HIDING TAB (When isHidden is true)
  if (isHidden) {
    return (
      <div 
        onClick={() => {
            setIsHidden(false); 
            setIsOpen(false);
        }}
        // --- MODIFIED CLASS AND STYLE TO USE position.y ---
        className="fixed right-0 w-4 h-32 bg-blue-600/70 hover:bg-blue-600 rounded-l-lg shadow-lg z-50 transition-all duration-200 cursor-pointer flex items-center justify-center group"
        style={{
            bottom: `${position.y}px`, // Align the bottom edge with the floating circle's bottom edge
        }}
        title="Show System Help"
      >
        <MessageCircle size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    );
  }

  // 2. RENDER FLOATING CIRCLE (When isHidden is false but chat is closed)
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 hover:scale-105 transition-all z-50 group"
      >
        <MessageCircle size={28} />
        <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity">
            System Help
        </span>
      </button>
    );
  }

  // 3. RENDER FULL/MINIMIZED WIDGET (When isOpen is true)
  return (
    <div
      ref={widgetRef}
      className={`fixed bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-2xl rounded-2xl z-50 flex flex-col transition-all duration-300 ${isMinimized ? "w-72 h-14" : "w-80 sm:w-96 h-[500px]"} ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      style={{
        right: `${position.x}px`,
        bottom: `${position.y}px`,
      }}
    >
      {/* Header (Drag Handle) */}
      <div 
        className="flex items-center justify-between p-4 border-b dark:border-gray-700 bg-blue-600 text-white rounded-t-2xl select-none"
        onMouseDown={handleDragStart} // Enables dragging
      >
        <div className="flex items-center space-x-2">
            <MessageCircle size={20} />
            <span className="font-semibold">SpikedAI Agent</span>
        </div>
        <div className="flex items-center space-x-1">
            {/* Minimize Button: Revert to floating circle */}
            <button 
                onClick={() => { setIsOpen(false); setIsMinimized(false); }} 
                className="p-1 hover:bg-blue-500 rounded"
            >
                <Minimize2 size={16} />
            </button>
            {/* Hide Button: Sets isOpen=false and isHidden=true */}
            <button 
                onClick={() => { setIsOpen(false); setIsHidden(true); }}
                className="p-1 hover:bg-blue-500 rounded"
            >
                <X size={16} />
            </button>
        </div>
      </div>

      {/* Chat Area */}
      {!isMinimized && (
        <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900/50">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-lg p-3 text-sm ${
                            msg.role === 'user' 
                            ? 'bg-blue-600 text-white rounded-br-none' 
                            : 'bg-white dark:bg-gray-700 border dark:border-gray-600 text-gray-800 dark:text-gray-200 rounded-bl-none shadow-sm'
                        }`}>
                            {msg.role === 'assistant' ? (
                                <div className="prose prose-sm dark:prose-invert max-w-none break-words">
                                    <ReactMarkdown>
                                        {msg.content}
                                    </ReactMarkdown>
                                </div>
                            ) : (
                                <p>{msg.content}</p>
                            )}
                        </div>
                    </div>
                ))}
                
                {/* Loading Indicator */}
                {isLoading && messages[messages.length - 1].role === 'user' && (
                    <div className="flex justify-start">
                        <div className="bg-white dark:bg-gray-700 p-3 rounded-lg rounded-bl-none shadow-sm border dark:border-gray-600">
                            <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 border-t dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-2xl">
                <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask about system config..."
                        className="flex-1 bg-gray-100 dark:bg-gray-700 border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                        disabled={isLoading}
                    />
                    <button 
                        onClick={handleSendMessage}
                        disabled={isLoading || !input.trim()}
                        className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send size={16} />
                    </button>
                </div>
            </div>
        </>
      )}
    </div>
  );
};

export default HelpChatWidget;