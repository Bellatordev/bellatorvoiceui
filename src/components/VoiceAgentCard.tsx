
import React, { useState } from 'react';
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
}

const VoiceAgentCard: React.FC<VoiceAgentCardProps> = ({
  agent,
  isSelected,
  onClick,
  onUpdate
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { toast } = useToast();

  const handleEditClick = (e: React.MouseEvent) => {
    // Prevent the card click event from firing
    e.stopPropagation();
    setIsEditModalOpen(true);
  };

  const handleSaveEditedAgent = (updatedAgent: VoiceAgent) => {
    // Update the agent in storage
    updateVoiceAgent(updatedAgent);
    
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
            <h3 className="font-medium">{agent.name}</h3>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={handleEditClick}
              className="h-8 w-8 ml-2"
            >
              <Pencil size={16} />
            </Button>
          </div>
          
          {agent.description && (
            <p className="text-sm text-muted-foreground mt-1">{agent.description}</p>
          )}
          
          {isSelected && (
            <div className="mt-3 pt-3 border-t text-sm">
              <div className="flex flex-col gap-2">
                <div>
                  <span className="font-medium">Voice ID:</span> 
                  <span className="text-muted-foreground ml-2">{agent.voiceId}</span>
                </div>
                
                {agent.webhookUrl && (
                  <div>
                    <span className="font-medium">Webhook:</span> 
                    <span className="text-muted-foreground ml-2 break-all">{agent.webhookUrl}</span>
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
        agent={agent}
      />
    </>
  );
};

export default VoiceAgentCard;
