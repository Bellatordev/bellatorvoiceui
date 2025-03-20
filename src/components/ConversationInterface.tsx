
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
      <div className="flex flex-col h-full bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-gray-950 rounded-xl overflow-hidden shadow-lg border border-blue-100 dark:border-blue-900/30">
        <div className="p-4 border-b border-blue-100 dark:border-blue-900/50 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-blue-800 dark:text-blue-300">Voice Assistant</h2>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onLogout} 
            className="text-blue-600 dark:text-blue-300 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/50"
          >
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
