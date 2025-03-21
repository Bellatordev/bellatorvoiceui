
import React from 'react';
import ConversationInterface from './ConversationInterface';

interface VoiceAgentProps {
  apiKey: string;
  agentId: string;
  onLogout?: () => void;
}

const VoiceAgent: React.FC<VoiceAgentProps> = ({ apiKey, agentId, onLogout }) => {
  return (
    <div className="flex flex-col h-full">
      <ConversationInterface 
        apiKey={apiKey} 
        agentId={agentId} 
        onLogout={onLogout}
      />
    </div>
  );
};

export default VoiceAgent;
