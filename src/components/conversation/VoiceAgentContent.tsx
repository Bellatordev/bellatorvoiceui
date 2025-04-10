
import React, { useEffect } from 'react';
import ConversationInterface from '../ConversationInterface';
import ElevenLabsService from '@/services/elevenLabsService';

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
  // Cleanup and reinitialize when voice ID changes
  useEffect(() => {
    // Clean up previous voice resources when changing agents
    try {
      const service = ElevenLabsService.getInstance();
      service.stopAudio();
    } catch (err) {
      console.error('Error stopping audio when agent changed:', err);
    }
    
    // Log agent changes for debugging purposes
    console.log('VoiceAgentContent received new agent configuration:');
    console.log('- Voice ID:', voiceId);
    console.log('- Agent Name:', agentName);
    console.log('- Webhook URL:', webhookUrl || 'None');
    
    return () => {
      // Clean up on unmount
      try {
        const service = ElevenLabsService.getInstance();
        service.stopAudio();
      } catch (err) {
        console.error('Error during VoiceAgentContent cleanup:', err);
      }
    };
  }, [voiceId, agentName, webhookUrl]);

  return (
    <div className="agent-card mb-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
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
