
import React, { useRef, useEffect } from 'react';
import { useConversation } from '@/contexts/ConversationContext';
import ConversationLog from './ConversationLog';

const ConversationContainer: React.FC = () => {
  const { messages, isGenerating, isPlaying, handleToggleAudio } = useConversation();
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom on new message
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div ref={chatContainerRef} className="flex-1 overflow-y-auto mb-4">
      <ConversationLog 
        messages={messages}
        isGeneratingAudio={isGenerating}
        isPlayingAudio={isPlaying}
        onToggleAudio={handleToggleAudio}
      />
    </div>
  );
};

export default ConversationContainer;
