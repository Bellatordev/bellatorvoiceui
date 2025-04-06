
import React, { useEffect } from 'react';
import useConversation from '@/hooks/useConversation';

interface ConversationHandlerProps {
  generateSpeech?: (text: string) => Promise<void>;
  isMuted: boolean;
  autoStartMic: boolean;
  isPlaying: boolean;
  isGenerating: boolean;
  ttsError: string | null;
  active: boolean; // Add new prop to track if conversation is active
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
  active, // Add active prop
  children,
}) => {
  const {
    messages,
    setMessages,
    processUserInput,
    initializeConversation,
    isProcessing,
    cleanupConversation
  } = useConversation({
    generateSpeech,
    isMuted,
    autoStartMic,
    isPlaying,
    isGenerating,
    ttsError,
    active // Pass active state to hook
  });

  // Initialize the conversation when the component mounts
  useEffect(() => {
    // Clean up the storage to force initialization on page refresh
    if (window.location.pathname.includes('/conversation')) {
      sessionStorage.removeItem('conversation_initialized');
    }
    
    // Only initialize when active
    if (active) {
      console.log("ConversationHandler mounted, initializing conversation");
      initializeConversation();
    }
    
    // Cleanup when component unmounts or becomes inactive
    return () => {
      console.log("ConversationHandler unmounting or inactive, cleaning up resources");
      cleanupConversation();
    };
  }, [initializeConversation, active, cleanupConversation]);

  return <>{children({ messages, setMessages, processUserInput, isProcessing })}</>;
};

export default ConversationHandler;
