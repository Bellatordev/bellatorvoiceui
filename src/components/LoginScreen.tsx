
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Settings, Plus } from 'lucide-react';
import { VoiceAgent } from '@/types/voiceAgent';
import VoiceAgentCard from './VoiceAgentCard';
import SettingsModal from './SettingsModal';
import { getVoiceAgents, addVoiceAgent, updateVoiceAgent, deleteVoiceAgent, getDefaultVoiceId } from '@/utils/voiceAgentStorage';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { ScrollArea } from '@/components/ui/scroll-area';

interface LoginScreenProps {
  onLogin: (apiKey: string, agentId: string) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({
  onLogin
}) => {
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [agents, setAgents] = useState<VoiceAgent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<VoiceAgent | null>(null);
  const { toast } = useToast();

  // Function to refresh agents from storage
  const refreshAgents = () => {
    const savedAgents = getVoiceAgents();
    setAgents(savedAgents);
    
    // If no agents are selected yet but we have agents, select the first one
    if (!selectedAgent && savedAgents.length > 0) {
      setSelectedAgent(savedAgents[0]);
    }
    // If current selected agent was deleted, select the first available one
    else if (selectedAgent && !savedAgents.find(a => a.id === selectedAgent.id) && savedAgents.length > 0) {
      setSelectedAgent(savedAgents[0]);
    }
    // If current agent is selected but was updated, refresh the selected agent too
    else if (selectedAgent) {
      const updatedAgent = savedAgents.find(a => a.id === selectedAgent.id);
      if (updatedAgent) {
        setSelectedAgent(updatedAgent);
      }
    }
  };

  // Load saved agents on mount and listen for changes
  useEffect(() => {
    refreshAgents();
    
    // Only create a default agent if there are absolutely no agents in storage
    if (agents.length === 0 && getVoiceAgents().length === 0) {
      const defaultAgent: VoiceAgent = {
        id: uuidv4(),
        name: 'Assistant',
        description: 'A helpful AI assistant',
        voiceId: getDefaultVoiceId('Assistant'),
      };
      
      const updatedAgents = addVoiceAgent(defaultAgent);
      setAgents(updatedAgents);
      setSelectedAgent(defaultAgent);
    }
    
    // If API key is in storage, retrieve it
    const storedApiKey = localStorage.getItem('voiceAgent_apiKey');
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
    
    // Listen for storage events (for cross-component communication)
    const handleStorageChange = () => {
      refreshAgents();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim() || !selectedAgent) {
      toast({
        title: "Missing Information",
        description: "Please provide your API key and select a voice agent",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    // Simulate validation
    setTimeout(() => {
      onLogin(apiKey.trim(), selectedAgent.voiceId);
      // Also store the agent ID
      localStorage.setItem('voiceAgent_agentName', selectedAgent.name);
      localStorage.setItem('voiceAgent_agentId', selectedAgent.id);
      setIsLoading(false);
    }, 500);
  };

  const handleAddAgent = (agent: VoiceAgent) => {
    const updatedAgents = addVoiceAgent(agent);
    setAgents(updatedAgents);
    
    // If no agent is selected yet, select this one
    if (!selectedAgent) {
      setSelectedAgent(agent);
    }
  };

  const handleUpdateAgent = (updatedAgent: VoiceAgent) => {
    const updatedAgents = updateVoiceAgent(updatedAgent);
    setAgents(updatedAgents);
    
    // If the updated agent is currently selected, update the selection
    if (selectedAgent && selectedAgent.id === updatedAgent.id) {
      setSelectedAgent(updatedAgent);
    }
    
    toast({
      title: "Voice Agent Updated",
      description: `${updatedAgent.name} has been updated`
    });
  };

  const handleDeleteAgent = (agentId: string) => {
    // Get the agent being deleted
    const agentToDelete = agents.find(agent => agent.id === agentId);
    
    // Delete the agent
    const updatedAgents = deleteVoiceAgent(agentId);
    
    // Update local state
    setAgents(updatedAgents);
    
    // If the deleted agent was selected, select another one
    if (selectedAgent && selectedAgent.id === agentId) {
      if (updatedAgents.length > 0) {
        setSelectedAgent(updatedAgents[0]);
      } else {
        setSelectedAgent(null);
      }
    }
    
    toast({
      title: "Voice Agent Deleted",
      description: agentToDelete ? `${agentToDelete.name} has been deleted` : "Agent has been deleted",
      variant: "default"
    });
  };

  const handleSaveApiKey = (newApiKey: string) => {
    setApiKey(newApiKey);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-medium text-gray-800 dark:text-white">Select Voice Agent</h2>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsSettingsOpen(true)}
          className="text-gray-700 hover:text-black dark:text-gray-300 dark:hover:text-white"
        >
          <Settings size={20} />
        </Button>
      </div>
      
      {/* Updated agent list with fixed height to ensure scrollability */}
      <ScrollArea className="flex-1 mb-6" style={{ height: '280px' }}>
        <div className="grid gap-3">
          {agents.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-lg bg-gray-100 dark:bg-[#282838]">
              <p className="text-gray-600 dark:text-gray-400 mb-3">No voice agents configured yet</p>
              <Button onClick={() => setIsSettingsOpen(true)}>
                <Plus size={16} className="mr-2" /> Add Your First Agent
              </Button>
            </div>
          ) : (
            agents.map(agent => (
              <VoiceAgentCard
                key={agent.id}
                agent={agent}
                isSelected={selectedAgent?.id === agent.id}
                onClick={() => setSelectedAgent(agent)}
                onUpdate={handleUpdateAgent}
                onDelete={agents.length > 1 ? handleDeleteAgent : undefined}
                hideControls={true} // Hide the edit and delete buttons on the login screen
              />
            ))
          )}
        </div>
      </ScrollArea>
      
      {/* Form with API key input and submit button */}
      <form onSubmit={handleSubmit} className="mt-auto pt-4 space-y-6">
        <div className="space-y-2">
          <label htmlFor="apiKey" className="block text-gray-700 dark:text-gray-300 text-sm font-medium font-sans">
            Eleven Labs API Key
          </label>
          <Input 
            id="apiKey" 
            type="password" 
            value={apiKey} 
            onChange={e => setApiKey(e.target.value)} 
            placeholder="Enter your Eleven Labs API Key" 
            className="bg-white border-gray-300 text-gray-800 dark:bg-[#282838] dark:border-gray-700 dark:text-white font-sans placeholder:text-gray-500 rounded-md" 
            required 
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full py-6 rounded-md bg-amber-500 hover:bg-amber-600 dark:bg-[#9583f4] dark:hover:bg-[#8070e6] text-white font-medium font-sans text-lg" 
          disabled={isLoading || !selectedAgent}
        >
          {isLoading ? 'Connecting...' : `Connect to ${selectedAgent?.name || 'Voice Agent'}`}
        </Button>
      </form>
      
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiKey={apiKey}
        onSaveApiKey={handleSaveApiKey}
        agents={agents}
        selectedAgentId={selectedAgent?.id || null}
        onSelectAgent={setSelectedAgent}
        onAddAgent={handleAddAgent}
      />
    </div>
  );
};

export default LoginScreen;
