
import React, { useState } from 'react';
import { ConversationProvider } from '@/contexts/ConversationContext';
import ConversationLog from './ConversationLog';
import { Button } from './ui/button';
import { Input } from '@/components/ui/input';
import { LogOut } from 'lucide-react';
import CircularVoiceInterface from './CircularVoiceInterface';
import { useConversation } from '@/contexts/ConversationContext';
import { Message } from '@/contexts/ConversationTypes';
import ApiQuotaAlert from './ApiQuotaAlert';

interface ConversationWrapperProps {
  onLogout: () => void;
}

const ConversationWrapper: React.FC<ConversationWrapperProps> = ({ onLogout }) => {
  const [inputText, setInputText] = useState('');
  const [isTextMode, setIsTextMode] = useState(false);
  
  const { 
    messages, 
    sendMessage, 
    isGenerating, 
    isPlaying,
    handleToggleAudio,
    error
  } = useConversation();

  const handleTextSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      sendMessage(inputText);
      setInputText('');
    }
  };

  const toggleInputMode = () => {
    setIsTextMode(!isTextMode);
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Display API Quota Alert if there's an error */}
      <ApiQuotaAlert error={error} />
      
      <div className="mb-6">
        <ConversationLog 
          messages={messages} 
          isGeneratingAudio={isGenerating}
          isPlayingAudio={isPlaying}
          onToggleAudio={handleToggleAudio}
          onLogout={onLogout}
        />
      </div>

      <div className="mt-auto">
        {isTextMode ? (
          <form onSubmit={handleTextSend} className="flex gap-2">
            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your message..."
              className="flex-1"
              disabled={isGenerating}
            />
            <Button 
              type="submit" 
              disabled={!inputText.trim() || isGenerating}
              className="bg-premium-accent hover:bg-premium-accent/90"
            >
              Send
            </Button>
            <Button 
              type="button"
              variant="outline"
              onClick={toggleInputMode}
            >
              Voice Mode
            </Button>
          </form>
        ) : (
          <div>
            <CircularVoiceInterface />
            <div className="flex justify-center mt-4">
              <Button 
                variant="outline"
                onClick={toggleInputMode}
                className="mx-auto"
              >
                Text Mode
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

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
      <ConversationWrapper onLogout={onLogout} />
    </ConversationProvider>
  );
};

export default ConversationInterface;
