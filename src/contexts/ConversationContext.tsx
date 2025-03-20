
import React, { createContext, useContext } from 'react';
import { ConversationContextType } from './ConversationTypes';
import { useConversationState } from '@/hooks/useConversationState';

export const ConversationContext = createContext<ConversationContextType | undefined>(undefined);

export const useConversation = () => {
  const context = useContext(ConversationContext);
  if (!context) {
    throw new Error('useConversation must be used within a ConversationProvider');
  }
  return context;
};

interface ConversationProviderProps {
  children: React.ReactNode;
  apiKey: string;
  agentId: string;
}

export const ConversationProvider: React.FC<ConversationProviderProps> = ({ 
  children, 
  apiKey, 
  agentId 
}) => {
  // Use our extracted hook to manage all the conversation state
  const conversationState = useConversationState({ apiKey, agentId });

  return (
    <ConversationContext.Provider value={conversationState}>
      {children}
    </ConversationContext.Provider>
  );
};

// Re-export Message type for convenience
export type { Message } from './ConversationTypes';
