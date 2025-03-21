
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface LoginScreenProps {
  onLogin: (apiKey: string, agentId: string) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [apiKey, setApiKey] = useState('');
  const [agentId, setAgentId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim() || !agentId.trim()) return;
    
    setIsLoading(true);
    // Simulate validation
    setTimeout(() => {
      onLogin(apiKey.trim(), agentId.trim());
      setIsLoading(false);
    }, 500);
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="apiKey" className="block text-sm font-medium">
            Eleven Labs API Key
          </label>
          <Input
            id="apiKey"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your Eleven Labs API Key"
            className="agent-input"
            required
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="agentId" className="block text-sm font-medium">
            Voice <span className="text-agent-yellow">Agent ID</span>
          </label>
          <Input
            id="agentId"
            type="text"
            value={agentId}
            onChange={(e) => setAgentId(e.target.value)}
            placeholder="Enter your Voice Agent ID"
            className="agent-input"
            required
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full bg-agent-primary hover:bg-agent-primary/90 text-white font-medium rounded-full"
          disabled={isLoading}
        >
          {isLoading ? 'Connecting...' : 'Start Session'}
        </Button>
      </form>
    </div>
  );
};

export default LoginScreen;
