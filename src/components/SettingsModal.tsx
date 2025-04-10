
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { VoiceAgent } from '@/types/voiceAgent';
import VoiceAgentManager from './VoiceAgentManager';
import ElevenLabsService from '@/services/elevenLabsService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveApiKey: (apiKey: string) => void;
  agents: VoiceAgent[];
  selectedAgentId: string | null;
  onSelectAgent: (agent: VoiceAgent) => void;
  onAddAgent: (agent: VoiceAgent) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  onSaveApiKey,
  agents,
  selectedAgentId,
  onSelectAgent,
  onAddAgent
}) => {
  const [inputApiKey, setInputApiKey] = useState(apiKey);
  const [localAgents, setLocalAgents] = useState<VoiceAgent[]>(agents);
  const { toast } = useToast();
  
  // Update local agents when props change
  useEffect(() => {
    setLocalAgents(agents);
  }, [agents]);

  // Safely clean up audio resources
  const safelyCleanupAudio = () => {
    try {
      const elevenLabsInstance = ElevenLabsService.getInstance();
      elevenLabsInstance.stopAudio();
    } catch (err) {
      console.error('Error stopping audio in settings:', err);
    }
  };

  const handleSave = () => {
    // Clean up any existing audio before saving changes
    safelyCleanupAudio();
    
    // Use setTimeout to prevent UI freezing
    setTimeout(() => {
      onSaveApiKey(inputApiKey);
      toast({
        title: "Settings Saved",
        description: "Your ElevenLabs API key has been updated",
        duration: 3000,
      });
      onClose();
    }, 10);
  };
  
  const handleUpdateAgent = (updatedAgent: VoiceAgent) => {
    // Clean up any existing audio before updating agent
    safelyCleanupAudio();
    
    // Update the local list of agents
    const updatedAgents = localAgents.map(agent => 
      agent.id === updatedAgent.id ? updatedAgent : agent
    );
    setLocalAgents(updatedAgents);
    
    // If the updated agent is currently selected, notify parent
    if (updatedAgent.id === selectedAgentId) {
      // Use setTimeout to prevent UI freezing
      setTimeout(() => {
        onSelectAgent(updatedAgent);
      }, 10);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        // Clean up any existing audio before closing
        safelyCleanupAudio();
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>Configure and manage voice agents with n8n webhooks.</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="apiKey" className="text-sm font-medium leading-none">
              ElevenLabs API Key
            </label>
            <Input 
              id="apiKey" 
              value={inputApiKey} 
              onChange={e => setInputApiKey(e.target.value)} 
              placeholder="Enter your ElevenLabs API key" 
              type="password" 
            />
          </div>
          
          <VoiceAgentManager 
            agents={localAgents} 
            selectedAgentId={selectedAgentId} 
            onSelectAgent={(agent) => {
              // Clean up any existing audio before selecting agent
              safelyCleanupAudio();
              
              // Use setTimeout to prevent UI freezing
              setTimeout(() => {
                onSelectAgent(agent);
              }, 10);
            }} 
            onAddAgent={(agent) => {
              // Clean up any existing audio before adding agent
              safelyCleanupAudio();
              
              // Use setTimeout to prevent UI freezing
              setTimeout(() => {
                onAddAgent(agent);
              }, 10);
            }}
            onUpdateAgent={handleUpdateAgent}
          />
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsModal;
