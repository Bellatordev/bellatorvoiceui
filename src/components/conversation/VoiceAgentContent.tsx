
import React from 'react';
import ConversationInterface from '../ConversationInterface';

interface VoiceAgentContentProps {
  apiKey: string;
  voiceId: string;
  onLogout?: () => void;
}

const VoiceAgentContent: React.FC<VoiceAgentContentProps> = ({ 
  apiKey, 
  voiceId, 
  onLogout 
}) => {
  return (
    <div className="agent-card mb-4 overflow-hidden">
      <ConversationInterface 
        apiKey={apiKey} 
        agentId={voiceId} 
        onLogout={onLogout}
      />
    </div>
  );
};

export default VoiceAgentContent;
