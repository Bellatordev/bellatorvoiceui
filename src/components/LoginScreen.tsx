
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
    <div className="max-w-md w-full mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Voice Assistant</h1>
        <p className="text-gray-600">Enter your credentials to start</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700">
            Eleven Labs API Key
          </label>
          <Input
            id="apiKey"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your Eleven Labs API Key"
            required
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="agentId" className="block text-sm font-medium text-gray-700">
            Voice Agent ID
          </label>
          <Input
            id="agentId"
            type="text"
            value={agentId}
            onChange={(e) => setAgentId(e.target.value)}
            placeholder="Enter your Voice Agent ID"
            required
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isLoading}
        >
          {isLoading ? 'Connecting...' : 'Start Session'}
        </Button>
      </form>
    </div>
  );
};

export default LoginScreen;
