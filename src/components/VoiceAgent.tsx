
import React, { useState } from 'react';
import LoginScreen from './LoginScreen';
import ConversationInterface from './ConversationInterface';

const VoiceAgent: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [agentId, setAgentId] = useState('');

  const handleLogin = (key: string, id: string) => {
    setApiKey(key);
    setAgentId(id);
    setIsLoggedIn(true);
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
