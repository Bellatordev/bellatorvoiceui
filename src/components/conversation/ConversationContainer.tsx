
import React from 'react';
import ConversationLog from '../ConversationLog';
import ConversationControls from './ConversationControls';

interface ConversationContainerProps {
  messages: any[];
  isGenerating: boolean;
  isPlaying: boolean;
  onToggleAudio: (text: string, audioElement?: HTMLAudioElement | null) => void;
  onRestartConversation: () => void;
  onEndConversation: () => void;
  onLogout?: () => void;
}

const ConversationContainer: React.FC<ConversationContainerProps> = ({
  messages,
  isGenerating,
  isPlaying,
  onToggleAudio,
  onRestartConversation,
  onEndConversation,
  onLogout
}) => {
  return (
    <div className="flex-1 agent-card mb-6 overflow-hidden" onClick={(e) => e.stopPropagation()}>
      <ConversationControls 
        onRestartConversation={onRestartConversation}
        onEndConversation={onEndConversation}
      />
      <ConversationLog 
        messages={messages} 
        isGeneratingAudio={isGenerating} 
        isPlayingAudio={isPlaying}
        onToggleAudio={(text, audioElement) => onToggleAudio(text, audioElement)}
        className="h-full" 
        onLogout={onLogout}
      />
    </div>
  );
};

export default ConversationContainer;
