// src/BotContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface BotContextType {
  botId: string | null;
  setBotId: (id: string | null) => void;
}

const BotContext = createContext<BotContextType | undefined>(undefined);

export const BotProvider = ({ children }: { children: ReactNode }) => {
  const [botId, setBotId] = useState<string | null>(null);

  const value = {
    botId,
    setBotId,
  };

  return <BotContext.Provider value={value}>{children}</BotContext.Provider>;
};

export const useBot = () => {
  const context = useContext(BotContext);
  if (context === undefined) {
    throw new Error('useBot must be used within a BotProvider');
  }
  return context;
};