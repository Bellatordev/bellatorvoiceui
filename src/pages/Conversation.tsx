import React, { useEffect, useState } from 'react';
import ConversationInterface from '../components/ConversationInterface';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import ThemeToggle from '@/components/ThemeToggle';
import { LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ElevenLabsService from '@/services/elevenLabsService';
import SettingsModal from '@/components/SettingsModal';
import { VoiceAgent } from '@/types/voiceAgent';
import { getVoiceAgents } from '@/utils/voiceAgentStorage';
import AgentSelector from '@/components/AgentSelector';

const Conversation = () => {
  const [apiKey, setApiKey] = useState('');
  const [voiceId, setVoiceId] = useState('');
  const [agentId, setAgentId] = useState('');
  const [agentName, setAgentName] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [agents, setAgents] = useState<VoiceAgent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<VoiceAgent | null>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Get credentials from localStorage
    const storedApiKey = localStorage.getItem('voiceAgent_apiKey');
    const storedAgentId = localStorage.getItem('voiceAgent_agentId');
    const storedAgentName = localStorage.getItem('voiceAgent_agentName') || 'Assistant';

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
    setAgentName(storedAgentName);
    
    // Load the voice agents
    const savedAgents = getVoiceAgents();
    setAgents(savedAgents);
    
    // Find the current agent
    const currentAgent = savedAgents.find(agent => agent.id === storedAgentId);
    if (currentAgent) {
      setSelectedAgent(currentAgent);
      setVoiceId(currentAgent.voiceId);
    } else if (savedAgents.length > 0) {
      // Fallback to first agent if the stored one isn't found
      setSelectedAgent(savedAgents[0]);
      setVoiceId(savedAgents[0].voiceId);
    }
    
    // Cleanup function to ensure all resources are released when component unmounts
    return () => {
      console.log('Conversation page unmounting, cleaning up resources');
      // Make sure to clean up the ElevenLabs service when unmounting
      try {
        const elevenLabsInstance = ElevenLabsService.getInstance();
        elevenLabsInstance.stopAudio();
        elevenLabsInstance.cleanup();
        ElevenLabsService.destroyInstance();
      } catch (err) {
        console.error('Error during cleanup:', err);
      }
    };
  }, [navigate]);
  
  const handleLogout = () => {
    // First, thoroughly clean up any active audio resources
    console.log('Logging out and cleaning up audio resources');
    
    try {
      // Get the instance and make sure it's completely shut down
      const elevenLabsInstance = ElevenLabsService.getInstance();
      
      // Stop any current audio playback
      elevenLabsInstance.stopAudio();
      
      // Run the full cleanup procedure
      elevenLabsInstance.cleanup();
      
      // Destroy the singleton instance to prevent any lingering resources
      ElevenLabsService.destroyInstance();
    } catch (err) {
      console.error('Error during logout cleanup:', err);
    }
    
    // Clear all credentials from localStorage
    localStorage.removeItem('voiceAgent_apiKey');
    localStorage.removeItem('voiceAgent_agentId');
    localStorage.removeItem('voiceAgent_agentName');
    
    // Show logout toast notification
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out"
    });

    // Navigate back to login only after cleanup is complete
    setTimeout(() => {
      navigate('/');
    }, 100);
  };

  const handleChangeAgent = (agent: VoiceAgent) => {
    setSelectedAgent(agent);
    setVoiceId(agent.voiceId);
    setAgentName(agent.name);
    
    // Store the new agent ID
    localStorage.setItem('voiceAgent_agentId', agent.id);
    localStorage.setItem('voiceAgent_agentName', agent.name);
    
    toast({
      title: "Agent Changed",
      description: `Now talking to ${agent.name}`
    });
  };

  const handleSaveApiKey = (newApiKey: string) => {
    setApiKey(newApiKey);
    localStorage.setItem('voiceAgent_apiKey', newApiKey);
  };

  // Only render the conversation interface if we have credentials
  if (!apiKey || !voiceId) {
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
            <AgentSelector 
              agents={agents}
              selectedAgent={selectedAgent}
              onSelectAgent={handleChangeAgent}
              onOpenSettings={() => setIsSettingsOpen(true)}
            />
            
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
              agentId={voiceId} 
              onLogout={handleLogout}
            />
          </div>
        </main>
        
        <footer className="mt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Voice Assistant</p>
        </footer>
      </div>
      
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiKey={apiKey}
        onSaveApiKey={handleSaveApiKey}
        agents={agents}
        selectedAgentId={selectedAgent?.id || null}
        onSelectAgent={handleChangeAgent}
        onAddAgent={(agent) => {
          setAgents(prev => [...prev, agent]);
        }}
      />
    </div>
  );
};

export default Conversation;
