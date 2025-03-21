
import React from 'react';
import LoginScreen from '../components/LoginScreen';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import ThemeToggle from '@/components/ThemeToggle';

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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-agent-background via-agent-background to-agent-secondary/30 transition-colors duration-300">
      <div className="container mx-auto px-4 py-8 flex-1 flex flex-col">
        <header className="mb-8 flex justify-end">
          <ThemeToggle />
        </header>
        
        <main className="max-w-md w-full mx-auto flex-1 flex flex-col">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-serif font-bold mb-4 text-agent-primary">
              Voice <span className="text-agent-yellow">Assistant</span>
            </h1>
            <p className="text-agent-foreground/80">Your AI voice companion</p>
          </div>
          
          <div className="agent-card mb-8">
            <LoginScreen onLogin={handleLogin} />
          </div>
        </main>
        
        <footer className="mt-8 text-center text-sm text-agent-foreground/60">
          <p>© {new Date().getFullYear()} Voice Assistant</p>
        </footer>
      </div>
    </div>
  );
};

export default Login;
