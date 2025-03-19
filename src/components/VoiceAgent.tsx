
import React, { useState } from 'react';
import LoginScreen from './LoginScreen';
import ConversationInterface from './ConversationInterface';
import { toast } from '@/components/ui/use-toast';

const VoiceAgent: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [agentId, setAgentId] = useState('');

  const handleLogin = (key: string, id: string) => {
    // Basic validation before proceeding
    if (!key.trim() || !id.trim()) {
      toast({
        title: "Invalid credentials",
        description: "Both API key and Voice ID are required",
        variant: "destructive"
      });
      return;
    }
    
    setApiKey(key);
    setAgentId(id);
    setIsLoggedIn(true);
    
    // Show a welcome toast to indicate successful login
    toast({
      title: "Welcome",
      description: "Voice agent is ready to assist you",
    });
  };

  return (
    <div className="flex flex-col h-full">
      {!isLoggedIn ? (
        <LoginScreen onLogin={handleLogin} />
      ) : (
        <ConversationInterface apiKey={apiKey} agentId={agentId} />
      )}
    </div>
  );
};

export default VoiceAgent;
