
import React from 'react';
import { Button } from '@/components/ui/button';
import { ConversationProvider } from '@/contexts/ConversationContext';
import ConversationContainer from './ConversationContainer';
import CircularVoiceInterface from './CircularVoiceInterface';

interface ConversationInterfaceProps {
  apiKey: string;
  agentId: string;
  onLogout: () => void;
}

const ConversationInterface: React.FC<ConversationInterfaceProps> = ({
  apiKey,
  agentId,
  onLogout
}) => {
  return (
    <ConversationProvider apiKey={apiKey} agentId={agentId}>
      <div className="flex flex-col h-full bg-white/5 dark:bg-gray-900/30 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
        <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Voice Assistant</h2>
          <Button variant="outline" size="sm" onClick={onLogout} className="text-gray-700 dark:text-white border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800">
            Logout
          </Button>
        </div>

        <div className="flex-1 flex flex-col p-4 overflow-hidden">
          <div className="flex-1 flex flex-col">
            <ConversationContainer />
            
            <div className="mt-auto">
              <CircularVoiceInterface />
            </div>
          </div>
        </div>
      </div>
    </ConversationProvider>
  );
};

export default ConversationInterface;
