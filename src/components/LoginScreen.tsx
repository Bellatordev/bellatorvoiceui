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
  return <div>
      
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="apiKey" className="block text-gray-300 text-sm font-medium font-sans">
            Eleven Labs API Key
          </label>
          <Input id="apiKey" type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="Enter your Eleven Labs API Key" className="bg-[#282838] border-gray-700 text-white font-sans placeholder:text-gray-500 rounded-md" required />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="agentId" className="block text-gray-300 text-sm font-medium font-sans">
            Voice Agent ID
          </label>
          <Input id="agentId" type="text" value={agentId} onChange={e => setAgentId(e.target.value)} placeholder="Enter your Voice Agent ID" className="bg-[#282838] border-gray-700 text-white font-sans placeholder:text-gray-500 rounded-md" required />
        </div>
        
        <Button type="submit" className="w-full py-6 rounded-md bg-[#9583f4] hover:bg-[#8070e6] text-white font-medium font-sans text-lg" disabled={isLoading}>
          {isLoading ? 'Connecting...' : 'Start Session'}
        </Button>
      </form>
    </div>;
};
export default LoginScreen;