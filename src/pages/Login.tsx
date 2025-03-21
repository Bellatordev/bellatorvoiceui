
import React from 'react';
import LoginScreen from '../components/LoginScreen';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';

const Login = () => {
  const navigate = useNavigate();

  const handleLogin = (apiKey: string, agentId: string) => {
    // Basic validation before proceeding
    if (!apiKey.trim() || !agentId.trim()) {
      toast({
        title: "Invalid credentials",
        description: "Both API key and Voice ID are required",
        variant: "destructive"
      });
      return;
    }
    
    // Store credentials in localStorage so we can use them in the conversation page
    localStorage.setItem('voiceAgent_apiKey', apiKey);
    localStorage.setItem('voiceAgent_agentId', agentId);
    
    // Show a welcome toast to indicate successful login
    toast({
      title: "Welcome",
      description: "Voice agent is ready to assist you",
    });

    // Navigate to conversation page
    navigate('/conversation');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-agent-accent/10">
      <div className="container mx-auto px-4 py-8 flex-1 flex flex-col">
        <header className="mb-8">
          <h1 className="sr-only">Voice Assistant Login</h1>
        </header>
        
        <main className="max-w-2xl w-full mx-auto flex-1 flex flex-col">
          <LoginScreen onLogin={handleLogin} />
        </main>
        
        <footer className="mt-8 text-center text-sm text-gray-500">
          {/* Footer content removed */}
        </footer>
      </div>
    </div>
  );
};

export default Login;
