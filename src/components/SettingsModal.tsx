import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { VoiceAgent } from '@/types/voiceAgent';
import VoiceAgentManager from './VoiceAgentManager';
import ElevenLabsService from '@/services/elevenLabsService';
import { getVoiceAgents, updateVoiceAgent } from '@/utils/voiceAgentStorage';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  
  // Function to refresh agents from storage
  const refreshAgents = () => {
    const currentAgents = getVoiceAgents();
    setLocalAgents(currentAgents);
  };
  
  // Update local agents when modal opens or when storage events happen
  useEffect(() => {
    if (isOpen) {
      refreshAgents();
    }
    
    // Listen for storage events (for cross-component communication)
    const handleStorageChange = () => {
      refreshAgents();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [isOpen]);

  // Update input API key when prop changes
  useEffect(() => {
    setInputApiKey(apiKey);
  }, [apiKey]);

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
      // Save API key to localStorage
      localStorage.setItem('voiceAgent_apiKey', inputApiKey);
      
      toast({
        title: "Settings Saved",
        description: "Your ElevenLabs API key has been updated",
        duration: 3000,
      });
      
      // Force refresh parent components
      window.dispatchEvent(new Event('storage'));
      onClose();
    }, 10);
  };
  
  const handleUpdateAgent = (updatedAgent: VoiceAgent) => {
    // Clean up any existing audio before updating agent
    safelyCleanupAudio();
    
    // Update the agent in storage
    const updatedAgents = updateVoiceAgent(updatedAgent);
    
    // Update local state
    setLocalAgents(updatedAgents);
    
    // If the updated agent is currently selected, notify parent
    if (updatedAgent.id === selectedAgentId) {
      // Use setTimeout to prevent UI freezing
      setTimeout(() => {
        onSelectAgent(updatedAgent);
      }, 10);
    }
    
    // Force refresh parent components
    window.dispatchEvent(new Event('storage'));
    
    toast({
      title: "Voice Agent Updated",
      description: `${updatedAgent.name} has been updated`,
      duration: 3000,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        // Clean up any existing audio before closing
        safelyCleanupAudio();
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-[500px] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>Configure and manage voice agents with n8n webhooks.</DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-1 pr-4 py-4">
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
                  // Force refresh parent components
                  window.dispatchEvent(new Event('storage'));
                }, 10);
              }} 
              onAddAgent={(agent) => {
                // Clean up any existing audio before adding agent
                safelyCleanupAudio();
                
                // Use setTimeout to prevent UI freezing
                setTimeout(() => {
                  onAddAgent(agent);
                  // Force refresh parent components
                  window.dispatchEvent(new Event('storage'));
                }, 10);
              }}
              onUpdateAgent={handleUpdateAgent}
            />
          </div>
        </ScrollArea>

        <DialogFooter className="mt-4 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsModal;
