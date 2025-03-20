
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface LoginScreenProps {
  onLogin: (apiKey: string, agentId: string) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({
  onLogin
}) => {
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
    <div className="max-w-md w-full mx-auto relative z-20 bg-gray-950/30 dark:bg-gray-900/30 p-8 rounded-xl backdrop-blur-sm border border-white/10">
      <div className="text-center mb-10">
        <p className="text-gray-200 dark:text-gray-300 font-medium">Enter your credentials to start</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="apiKey" className="block text-sm font-medium text-gray-200 dark:text-gray-300">
            Eleven Labs API Key
          </label>
          <Input 
            id="apiKey" 
            type="password" 
            value={apiKey} 
            onChange={e => setApiKey(e.target.value)} 
            placeholder="Enter your Eleven Labs API Key" 
            className="bg-gray-800/50 border-gray-700 text-gray-100 focus:border-premium-accent focus:ring-premium-accent" 
            required 
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="agentId" className="block text-sm font-medium text-gray-200 dark:text-gray-300">
            Voice Agent ID
          </label>
          <Input 
            id="agentId" 
            type="text" 
            value={agentId} 
            onChange={e => setAgentId(e.target.value)} 
            placeholder="Enter your Voice Agent ID" 
            className="bg-gray-800/50 border-gray-700 text-gray-100 focus:border-premium-accent focus:ring-premium-accent" 
            required 
          />
        </div>
        
        <Button 
          type="submit" 
          disabled={isLoading} 
          className="w-full font-playfair bg-premium-accent hover:bg-premium-accent/90 text-white dark:text-white font-bold"
        >
          {isLoading ? 'Connecting...' : 'Start Session'}
        </Button>
      </form>
    </div>
  );
};

export default LoginScreen;
