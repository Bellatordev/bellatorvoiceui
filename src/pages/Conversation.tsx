
import React, { useEffect, useState } from 'react';
import ConversationInterface from '../components/ConversationInterface';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import ThemeToggle from '@/components/ThemeToggle';

const Conversation = () => {
  const [apiKey, setApiKey] = useState('');
  const [agentId, setAgentId] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Get credentials from localStorage
    const storedApiKey = localStorage.getItem('voiceAgent_apiKey');
    const storedAgentId = localStorage.getItem('voiceAgent_agentId');
    
    // If credentials aren't available, redirect to login
    if (!storedApiKey || !storedAgentId) {
      toast({
        title: "Authentication required",
        description: "Please log in to access the voice assistant",
        variant: "destructive"
      });
      navigate('/');
      return;
    }
    
    setApiKey(storedApiKey);
    setAgentId(storedAgentId);
  }, [navigate]);

  const handleLogout = () => {
    // Clear credentials from localStorage
    localStorage.removeItem('voiceAgent_apiKey');
    localStorage.removeItem('voiceAgent_agentId');
    
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
    
    // Navigate back to login
    navigate('/');
  };

  // Only render the conversation interface if we have credentials
  if (!apiKey || !agentId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-agent-background via-agent-background to-agent-secondary/30 dark:from-gray-900 dark:via-gray-900 dark:to-agent-secondary/10">
        <div className="agent-card p-8 shadow-glow-sm dark:shadow-glow">
          <div className="animate-pulse">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-agent-background via-agent-background to-agent-secondary/30 transition-colors duration-300 dark:from-gray-900 dark:via-gray-900 dark:to-agent-secondary/10">
      <div className="container mx-auto px-4 py-8 flex-1 flex flex-col">
        <header className="mb-8 flex justify-between items-center">
          <h1 className="text-2xl font-serif font-bold text-gradient">
            Voice <span className="text-gradient-yellow">Assistant</span>
          </h1>
          <ThemeToggle />
        </header>
        
        <main className="max-w-2xl w-full mx-auto flex-1 flex flex-col">
          <div className="agent-card mb-4 overflow-hidden shadow-glow-sm dark:shadow-glow">
            <ConversationInterface 
              apiKey={apiKey} 
              agentId={agentId} 
              onLogout={handleLogout}
            />
          </div>
        </main>
        
        <footer className="mt-8 text-center text-sm text-agent-foreground/60">
          <p>© {new Date().getFullYear()} Voice Assistant</p>
        </footer>
      </div>
    </div>
  );
};

export default Conversation;
