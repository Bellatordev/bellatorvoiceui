
import React, { useEffect, useState } from 'react';
import ConversationInterface from '../components/ConversationInterface';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import ThemeToggle from '@/components/ThemeToggle';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ElevenLabsService from '@/services/elevenLabsService';

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
    
    // Cleanup function to ensure all resources are released when component unmounts
    return () => {
      console.log('Conversation page unmounting, cleaning up resources');
      // Make sure to clean up the ElevenLabs service when unmounting
      ElevenLabsService.destroyInstance();
    };
  }, [navigate]);
  
  const handleLogout = () => {
    // First, clean up any active audio resources
    console.log('Logging out and cleaning up audio resources');
    
    // Make sure audio is stopped and completely cleaned up
    ElevenLabsService.getInstance().stopAudio();
    ElevenLabsService.getInstance().cleanup();
    ElevenLabsService.destroyInstance();
    
    // Clear credentials from localStorage
    localStorage.removeItem('voiceAgent_apiKey');
    localStorage.removeItem('voiceAgent_agentId');
    
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out"
    });

    // Navigate back to login
    navigate('/');
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
