// src/BotIdContext.tsx
import React, { createContext, useState, useContext, ReactNode } from 'react';

// 1. Define the type for the context value
interface BotIdContextType {
  botId: string | null;
  setBotId: React.Dispatch<React.SetStateAction<string | null>>;
}

// 2. Create the Context with the defined type and a default value
const BotIdContext = createContext<BotIdContextType | undefined>(undefined);

// 3. Create the Provider component
interface BotIdProviderProps {
  children: ReactNode;
}

export const BotIdProvider: React.FC<BotIdProviderProps> = ({ children }) => {
  const [botId, setBotId] = useState<string | null>(null);

  // The value is an object that matches the BotIdContextType interface
  const value = { botId, setBotId };

  return (
    <BotIdContext.Provider value={value}>
      {children}
    </BotIdContext.Provider>
  );
};

// 4. Create a custom hook to consume the context
export const useBotId = () => {
  const context = useContext(BotIdContext);
  if (context === undefined) {
    throw new Error('useBotId must be used within a BotIdProvider');
  }
  return context;
};