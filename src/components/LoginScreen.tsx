
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
    <div className="max-w-md w-full mx-auto">
      <div className="text-center mb-8">
        <p className="text-gray-600 dark:text-gray-400">Enter your credentials to start</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Eleven Labs API Key
          </label>
          <Input id="apiKey" type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="Enter your Eleven Labs API Key" className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 focus:border-yellows-accent focus:ring-yellows-accent" required />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="agentId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Voice Agent ID
          </label>
          <Input id="agentId" type="text" value={agentId} onChange={e => setAgentId(e.target.value)} placeholder="Enter your Voice Agent ID" className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 focus:border-yellows-accent focus:ring-yellows-accent" required />
        </div>
        
        <Button type="submit" className="w-full font-playfair dark:bg-premium-accent bg-yellows-accent hover:bg-yellows-deep text-black hover:text-white dark:text-white" disabled={isLoading}>
          {isLoading ? 'Connecting...' : 'Start Session'}
        </Button>
      </form>
    </div>
  );
};

export default LoginScreen;
