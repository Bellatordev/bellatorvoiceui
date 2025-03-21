
import React, { useEffect, useState } from 'react';
import ConversationInterface from '../components/ConversationInterface';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';

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
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-agent-accent/10">
      <div className="container mx-auto px-4 py-8 flex-1 flex flex-col">
        <header className="mb-8">
          <h1 className="sr-only">Voice Assistant</h1>
        </header>
        
        <main className="max-w-2xl w-full mx-auto flex-1 flex flex-col">
          <ConversationInterface 
            apiKey={apiKey} 
            agentId={agentId} 
            onLogout={handleLogout}
          />
        </main>
        
        <footer className="mt-8 text-center text-sm text-gray-500">
          {/* Footer content removed */}
        </footer>
      </div>
    </div>
  );
};

export default Conversation;
