// src/BotIdContext.tsx
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

interface BotIdContextType {
  botId: string | null;
  setBotId: React.Dispatch<React.SetStateAction<string | null>>;
}

const BotIdContext = createContext<BotIdContextType | undefined>(undefined);

interface BotIdProviderProps {
  children: ReactNode;
}

export const BotIdProvider: React.FC<BotIdProviderProps> = ({ children }) => {
  // 1. Initialize state from sessionStorage on first render
  const [botId, setBotId] = useState<string | null>(() => {
    try {
      const storedBotId = sessionStorage.getItem('spikedai_bot_id');
      return storedBotId ? JSON.parse(storedBotId) : null;
    } catch (e) {
      console.error("Failed to parse botId from sessionStorage", e);
      return null;
    }
  });

  // 2. Add useEffect to listen for changes to botId and update sessionStorage
  useEffect(() => {
    try {
      if (botId) {
        sessionStorage.setItem('spikedai_bot_id', JSON.stringify(botId));
      } else {
        sessionStorage.removeItem('spikedai_bot_id');
      }
    } catch (e) {
      console.error("Failed to save botId to sessionStorage", e);
    }
  }, [botId]);

  // 3. Add a second useEffect to listen for 'storage' events from other tabs
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'spikedai_bot_id' && event.newValue !== null) {
        try {
          const newBotId = JSON.parse(event.newValue);
          // Only update if the value is different to avoid a loop
          if (newBotId !== botId) {
            setBotId(newBotId);
          }
        } catch (e) {
          console.error("Failed to parse new botId from storage event", e);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Cleanup the event listener when the component unmounts
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [botId]); // Re-run effect if local state changes to get the latest value

  const value = { botId, setBotId };

  return (
    <BotIdContext.Provider value={value}>
      {children}
    </BotIdContext.Provider>
  );
};

export const useBotId = () => {
  const context = useContext(BotIdContext);
  if (context === undefined) {
    throw new Error('useBotId must be used within a BotIdProvider');
  }
  return context;
};