
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { VoiceAgent } from '@/types/voiceAgent';
import { getVoiceAgents } from '@/utils/voiceAgentStorage';
import ElevenLabsService from '@/services/elevenLabsService';
import VoiceAgentContent from './VoiceAgentContent';
import PageHeader from './PageHeader';
import PageFooter from './PageFooter';
import SettingsModal from '@/components/SettingsModal';

const ConversationPage = () => {
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

  // Show loading state if necessary data is missing
  if (!apiKey || !voiceId) {
    return <ConversationLoading />;
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/30 transition-colors duration-300">
      <div className="container mx-auto px-4 py-8 flex-1 flex flex-col">
        <PageHeader 
          agents={agents}
          selectedAgent={selectedAgent}
          onSelectAgent={handleChangeAgent}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onLogout={handleLogout}
        />
        
        <main className="max-w-2xl w-full mx-auto flex-1 flex flex-col">
          <VoiceAgentContent 
            apiKey={apiKey} 
            voiceId={voiceId} 
            onLogout={handleLogout}
          />
        </main>
        
        <PageFooter />
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

export default ConversationPage;
