
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

  // Fix infinite loop by ensuring initialization only happens once
  useEffect(() => {
    // Only initialize once when the component mounts
    const initialized = sessionStorage.getItem('conversation_initialized');
    if (!initialized) {
      initializeConversation();
      sessionStorage.setItem('conversation_initialized', 'true');
    }
  }, []);  // Empty dependency array ensures this only runs once

  return <>{children({ messages, setMessages, processUserInput, isProcessing })}</>;
};

export default ConversationHandler;
