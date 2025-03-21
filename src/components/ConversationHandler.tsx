
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

  useEffect(() => {
    initializeConversation();
  }, [initializeConversation]);

  return <>{children({ messages, setMessages, processUserInput, isProcessing })}</>;
};

export default ConversationHandler;
