
import React, { useState, useEffect } from 'react';
import { VoiceAgent } from '@/types/voiceAgent';
import { Card, CardContent } from '@/components/ui/card';
import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import EditVoiceAgentModal from './EditVoiceAgentModal';
import { updateVoiceAgent } from '@/utils/voiceAgentStorage';
import { useToast } from '@/hooks/use-toast';

interface VoiceAgentCardProps {
  agent: VoiceAgent;
  isSelected: boolean;
  onClick: () => void;
  onUpdate?: (agent: VoiceAgent) => void;
  onEdit?: () => void; // Add the onEdit prop that's expected in LoginScreen.tsx
}

const VoiceAgentCard: React.FC<VoiceAgentCardProps> = ({
  agent,
  isSelected,
  onClick,
  onUpdate,
  onEdit
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentAgent, setCurrentAgent] = useState<VoiceAgent>(agent);
  const { toast } = useToast();
  
  // Update the currentAgent when the agent prop changes
  useEffect(() => {
    setCurrentAgent(agent);
  }, [agent]);

  const handleEditClick = (e: React.MouseEvent) => {
    // Prevent the card click event from firing
    e.stopPropagation();
    
    // If an onEdit callback is provided, use it, otherwise open the edit modal directly
    if (onEdit) {
      onEdit();
    } else {
      setIsEditModalOpen(true);
    }
  };

  const handleSaveEditedAgent = (updatedAgent: VoiceAgent) => {
    // Update the agent in storage
    updateVoiceAgent(updatedAgent);
    
    // Update the local state to immediately reflect changes
    setCurrentAgent(updatedAgent);
    
    // Notify parent component if callback provided
    if (onUpdate) {
      onUpdate(updatedAgent);
    }
    
    toast({
      title: "Voice Agent Updated",
      description: `${updatedAgent.name} has been updated`
    });
  };

  return (
    <>
      <Card 
        className={`cursor-pointer transition-all ${
          isSelected 
            ? 'bg-primary/10 border-primary/60' 
            : 'hover:bg-muted/50'
        }`}
        onClick={onClick}
      >
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <h3 className="font-medium">{currentAgent.name}</h3>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={handleEditClick}
              className="h-8 w-8 ml-2"
            >
              <Pencil size={16} />
            </Button>
          </div>
          
          {currentAgent.description && (
            <p className="text-sm text-muted-foreground mt-1">{currentAgent.description}</p>
          )}
          
          {isSelected && (
            <div className="mt-3 pt-3 border-t text-sm">
              <div className="flex flex-col gap-2">
                <div>
                  <span className="font-medium">Voice ID:</span> 
                  <span className="text-muted-foreground ml-2">{currentAgent.voiceId}</span>
                </div>
                
                {currentAgent.webhookUrl && (
                  <div>
                    <span className="font-medium">Webhook:</span> 
                    <span className="text-muted-foreground ml-2 break-all">{currentAgent.webhookUrl}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <EditVoiceAgentModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSaveAgent={handleSaveEditedAgent}
        agent={currentAgent}
      />
    </>
  );
};

export default VoiceAgentCard;
