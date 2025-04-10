
import React, { useState } from 'react';
import { VoiceAgent } from '@/types/voiceAgent';
import VoiceAgentCard from './VoiceAgentCard';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import AddVoiceAgentModal from './AddVoiceAgentModal';
import { useToast } from '@/hooks/use-toast';
import { deleteVoiceAgent } from '@/utils/voiceAgentStorage';

interface VoiceAgentManagerProps {
  agents: VoiceAgent[];
  selectedAgentId: string | null;
  onSelectAgent: (agent: VoiceAgent) => void;
  onAddAgent: (agent: VoiceAgent) => void;
  onUpdateAgent?: (agent: VoiceAgent) => void;
}

const VoiceAgentManager: React.FC<VoiceAgentManagerProps> = ({
  agents,
  selectedAgentId,
  onSelectAgent,
  onAddAgent,
  onUpdateAgent
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { toast } = useToast();

  const handleAddAgent = (agent: VoiceAgent) => {
    onAddAgent(agent);
    setIsAddModalOpen(false);
    toast({
      title: "Voice Agent Added",
      description: `${agent.name} has been added to your agents`
    });
  };
  
  const handleDeleteAgent = (agentId: string) => {
    // Get agent details before deletion for the toast
    const agentToDelete = agents.find(agent => agent.id === agentId);
    
    // Delete from storage
    const updatedAgents = deleteVoiceAgent(agentId);
    
    // Notify the user
    toast({
      title: "Voice Agent Deleted",
      description: agentToDelete ? `${agentToDelete.name} has been deleted` : "Agent has been deleted"
    });
    
    // If the deleted agent was selected, select another one
    if (agentId === selectedAgentId && updatedAgents.length > 0) {
      onSelectAgent(updatedAgents[0]);
    }
    
    // Force a refresh of the parent component by passing an empty event
    // This ensures the agents state in parent components gets updated
    setTimeout(() => {
      window.dispatchEvent(new Event('storage'));
    }, 100);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-medium">Voice Agents</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1"
        >
          <Plus size={16} /> Add Agent
        </Button>
      </div>

      {agents.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-lg bg-muted/30">
          <p className="text-muted-foreground mb-3">No voice agents configured yet</p>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus size={16} className="mr-2" /> Add Your First Agent
          </Button>
        </div>
      ) : (
        <div className="grid gap-3">
          {agents.map(agent => (
            <VoiceAgentCard
              key={agent.id}
              agent={agent}
              isSelected={agent.id === selectedAgentId}
              onClick={() => onSelectAgent(agent)}
              onUpdate={onUpdateAgent}
              onDelete={agents.length > 1 ? handleDeleteAgent : undefined}
            />
          ))}
        </div>
      )}

      <AddVoiceAgentModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onAddAgent={handleAddAgent} 
      />
    </div>
  );
};

export default VoiceAgentManager;
