import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2, Minimize2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useAuth } from "../AuthContext"; 

interface Message {
  role: "user" | "assistant";
  content: string;
}

const HelpChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello! I'm your SpikedAI Agent. How can I help you manage the platform today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { session } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, isLoading]);

  const handleSendMessage = async () => {
      if (!input.trim() || isLoading) return;

      const userMsg = input.trim();
      setInput("");
      
      // 1. Add user message to state immediately
      const newHistory = [...messages, { role: "user" as const, content: userMsg }];
      setMessages(newHistory);
      setIsLoading(true);

      try {
          const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/help/chat`, {
              method: "POST",
              headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${session?.access_token}`
              },
              body: JSON.stringify({
                  message: userMsg,
                  history: newHistory.slice(-6) // Context window
              })
          });

          if (!response.ok) throw new Error("Network response was not ok");
          if (!response.body) throw new Error("No response body");

          // 2. Prepare empty assistant message for streaming
          setMessages(prev => [...prev, { role: "assistant", content: "" }]);

          const reader = response.body.getReader();
          const decoder = new TextDecoder("utf-8");
          let done = false;

          // 3. Read stream loop
          while (!done) {
              const { value, done: doneReading } = await reader.read();
              done = doneReading;
              
              if (value) {
                  const chunk = decoder.decode(value, { stream: true });
                  
                  setMessages(prev => {
                      const updated = [...prev];
                      const lastMsgIndex = updated.length - 1;
                      
                      // Ensure we append to the correct assistant message
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

  return (
    <div className={`fixed bottom-6 right-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-2xl rounded-2xl z-50 flex flex-col transition-all duration-300 ${isMinimized ? "w-72 h-14" : "w-80 sm:w-96 h-[500px]"}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b dark:border-gray-700 bg-blue-600 text-white rounded-t-2xl">
        <div className="flex items-center space-x-2">
            <MessageCircle size={20} />
            <span className="font-semibold">SpikedAI Agent</span>
        </div>
        <div className="flex items-center space-x-1">
            <button onClick={() => setIsMinimized(!isMinimized)} className="p-1 hover:bg-blue-500 rounded">
                <Minimize2 size={16} />
            </button>
            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-blue-500 rounded">
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
                
                {/* Loading Indicator (only show if we are waiting for the FIRST chunk) */}
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