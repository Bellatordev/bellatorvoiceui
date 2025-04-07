
import React from 'react';
import ConversationInterface from '../ConversationInterface';

interface VoiceAgentContentProps {
  apiKey: string;
  voiceId: string;
  onLogout?: () => void;
  webhookUrl?: string;
  agentName?: string;
}

const VoiceAgentContent: React.FC<VoiceAgentContentProps> = ({ 
  apiKey, 
  voiceId, 
  onLogout,
  webhookUrl,
  agentName 
}) => {
  return (
    <div className="agent-card mb-4 overflow-hidden">
      <ConversationInterface 
        apiKey={apiKey} 
        agentId={voiceId} 
        onLogout={onLogout}
        webhookUrl={webhookUrl}
        agentName={agentName}
      />
    </div>
  );
};

export default VoiceAgentContent;
