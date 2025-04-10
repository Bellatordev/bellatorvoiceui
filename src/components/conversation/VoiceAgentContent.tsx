
import React, { useEffect } from 'react';
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
  // Log agent changes for debugging purposes
  useEffect(() => {
    console.log('VoiceAgentContent received new agent configuration:');
    console.log('- Voice ID:', voiceId);
    console.log('- Agent Name:', agentName);
    console.log('- Webhook URL:', webhookUrl || 'None');
  }, [voiceId, agentName, webhookUrl]);

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
