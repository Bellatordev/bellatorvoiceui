
import React, { useEffect } from 'react';
import useConversation from '@/hooks/useConversation';

interface ConversationHandlerProps {
  generateSpeech?: (text: string) => Promise<void>;
  isMuted: boolean;
  autoStartMic: boolean;
  isPlaying: boolean;
  isGenerating: boolean;
  ttsError: string | null;
  children: (props: {
    messages: any[];
    setMessages: React.Dispatch<React.SetStateAction<any[]>>;
    processUserInput: (text: string) => void;
    isProcessing: boolean;
  }) => React.ReactNode;
}

const ConversationHandler: React.FC<ConversationHandlerProps> = ({
  generateSpeech,
  isMuted,
  autoStartMic,
  isPlaying,
  isGenerating,
  ttsError,
  children,
}) => {
  const {
    messages,
    setMessages,
    processUserInput,
    initializeConversation,
    isProcessing
  } = useConversation({
    generateSpeech,
    isMuted,
    autoStartMic,
    isPlaying,
    isGenerating,
    ttsError
  });

  // Initialize the conversation when the component mounts
  useEffect(() => {
    // Clean up the storage to force initialization on page refresh
    if (window.location.pathname.includes('/conversation')) {
      sessionStorage.removeItem('conversation_initialized');
    }
    
    // Always initialize when this component mounts
    console.log("ConversationHandler mounted, initializing conversation");
    initializeConversation();
  }, [initializeConversation]);

  return <>{children({ messages, setMessages, processUserInput, isProcessing })}</>;
};

export default ConversationHandler;
