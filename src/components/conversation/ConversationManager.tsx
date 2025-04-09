
import React, { useCallback } from 'react';
import ConversationContainer from './ConversationContainer';
import { toast } from '@/components/ui/use-toast';

interface ConversationManagerProps {
  messages: any[];
  isGenerating: boolean;
  isPlaying: boolean;
  generateSpeech: (text: string) => Promise<void>;
  stopAudio: () => void;
  cleanup: () => void;
  resetSpeech: () => void;
  stopListening: () => void;
  restartConversation: () => void;
  onLogout?: () => void;
}

const ConversationManager: React.FC<ConversationManagerProps> = ({
  messages,
  isGenerating,
  isPlaying,
  generateSpeech,
  stopAudio,
  cleanup,
  resetSpeech,
  stopListening,
  restartConversation,
  onLogout
}) => {
  const handleEndConversation = useCallback(() => {
    console.log("Ending conversation and shutting down all audio services");
    stopAudio();
    resetSpeech();
    stopListening();
    cleanup();
    toast({
      title: "Conversation Ended",
      description: "The conversation has been reset. You can start a new one."
    });
  }, [stopAudio, resetSpeech, stopListening, cleanup]);

  const handleRestartConversation = useCallback(() => {
    console.log("Restarting conversation");
    stopAudio();
    resetSpeech();
    restartConversation();
    toast({
      title: "Conversation Restarted",
      description: "Starting a new conversation."
    });
  }, [stopAudio, resetSpeech, restartConversation]);

  return (
    <ConversationContainer 
      messages={messages} 
      isGenerating={isGenerating} 
      isPlaying={isPlaying}
      onToggleAudio={generateSpeech}
      onRestartConversation={handleRestartConversation}
      onEndConversation={handleEndConversation}
      onLogout={onLogout}
    />
  );
};

export default ConversationManager;
