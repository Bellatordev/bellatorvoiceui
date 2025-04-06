
import React, { useEffect, useState } from 'react';
import ConversationInterface from '../components/ConversationInterface';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import ThemeToggle from '@/components/ThemeToggle';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Conversation = () => {
  const [apiKey, setApiKey] = useState('');
  const [agentId, setAgentId] = useState('');
  const [isActive, setIsActive] = useState(true);
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
    
    // Re-enable conversation if returning to page
    setIsActive(true);
  }, [navigate]);
  
  // Add cleanup effect when component unmounts
  useEffect(() => {
    return () => {
      // Ensure conversation is deactivated when navigating away
      setIsActive(false);
      console.log("Conversation page unmounting, ensuring conversation is inactive");
    };
  }, []);
  
  const handleLogout = () => {
    // First set active to false to stop all ongoing processes
    setIsActive(false);
    
    // Give a moment for cleanup to happen
    setTimeout(() => {
      // Clear credentials from localStorage
      localStorage.removeItem('voiceAgent_apiKey');
      localStorage.removeItem('voiceAgent_agentId');
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out"
      });
  
      // Navigate back to login
      navigate('/');
    }, 500);
  };

  // Only render the conversation interface if we have credentials
  if (!apiKey || !agentId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-background to-muted/30">
        <div className="agent-card p-8 shadow-lg">
          <div className="animate-pulse">Loading...</div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/30 transition-colors duration-300">
      <div className="container mx-auto px-4 py-8 flex-1 flex flex-col">
        <header className="mb-8 flex justify-between items-center">
          <h1 className="text-2xl font-serif font-bold text-foreground">
            <span className="text-gradient">Bellator</span>
            <span className="text-gradient-yellow">.ai</span>
          </h1>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleLogout}
              className="text-foreground"
            >
              <LogOut className="h-5 w-5" />
            </Button>
            <ThemeToggle />
          </div>
        </header>
        
        <main className="max-w-2xl w-full mx-auto flex-1 flex flex-col">
          <div className="agent-card mb-4 overflow-hidden">
            <ConversationInterface 
              apiKey={apiKey} 
              agentId={agentId} 
              onLogout={handleLogout}
              active={isActive}
            />
          </div>
        </main>
        
        <footer className="mt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Voice Assistant</p>
        </footer>
      </div>
    </div>
  );
};

export default Conversation;
