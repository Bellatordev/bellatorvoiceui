
import React, { useEffect } from 'react';
import useConversation from '@/hooks/useConversation';
import { toast } from '@/components/ui/use-toast';

interface ConversationHandlerProps {
  generateSpeech?: (text: string) => Promise<void>;
  isMuted: boolean;
  autoStartMic: boolean;
  isPlaying: boolean;
  isGenerating: boolean;
  startListening?: () => Promise<void>;
  ttsError: string | null;
  webhookUrl?: string;
  agentName?: string;
  children: (props: {
    messages: any[];
    setMessages: React.Dispatch<React.SetStateAction<any[]>>;
    processUserInput: (text: string) => void;
    isProcessing: boolean;
    initializeConversation: () => void;
    restartConversation: () => void;
  }) => React.ReactNode;
}

const ConversationHandler: React.FC<ConversationHandlerProps> = ({
  generateSpeech,
  isMuted,
  autoStartMic,
  isPlaying,
  isGenerating,
  startListening,
  ttsError,
  webhookUrl,
  agentName,
  children,
}) => {
  const {
    messages,
    setMessages,
    processUserInput,
    initializeConversation,
    restartConversation,
    isProcessing
  } = useConversation({
    generateSpeech,
    isMuted,
    autoStartMic,
    isPlaying,
    isGenerating,
    startListening,
    ttsError,
    webhookUrl,
    agentName
  });

  // Initialize the conversation when the component mounts
  useEffect(() => {
    // Clean up the storage to force initialization on page refresh
    if (window.location.pathname.includes('/conversation')) {
      sessionStorage.removeItem('conversation_initialized');
    }
    
    // Always initialize when this component mounts
    console.log("ConversationHandler mounted, initializing conversation");
    
    // Small delay to ensure all services are properly initialized before
    // triggering the welcome message with speech
    const timer = setTimeout(() => {
      initializeConversation();
    }, 300);
    
    return () => clearTimeout(timer);
  }, [initializeConversation]);

  return <>{children({ messages, setMessages, processUserInput, isProcessing, initializeConversation, restartConversation })}</>;
};

export default ConversationHandler;
