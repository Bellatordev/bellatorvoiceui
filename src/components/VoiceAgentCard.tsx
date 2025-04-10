
import React from 'react';
import { VoiceAgent } from '@/types/voiceAgent';
import { Card, CardContent } from '@/components/ui/card';
import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VoiceAgentCardProps {
  agent: VoiceAgent;
  isSelected: boolean;
  onClick: () => void;
  onEdit?: (agent: VoiceAgent) => void;
}

const VoiceAgentCard: React.FC<VoiceAgentCardProps> = ({
  agent,
  isSelected,
  onClick,
  onEdit
}) => {
  const handleEditClick = (e: React.MouseEvent) => {
    // Prevent the card click event from firing
    e.stopPropagation();
    if (onEdit) {
      onEdit(agent);
    }
  };

  return (
    <Card 
      className={`cursor-pointer transition-all ${
        isSelected 
          ? 'bg-primary/10 border-primary/60' 
          : 'hover:bg-muted/50'
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4 flex justify-between items-center">
        <div>
          <h3 className="font-medium">{agent.name}</h3>
          {agent.description && (
            <p className="text-sm text-muted-foreground">{agent.description}</p>
          )}
        </div>
        
        {onEdit && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleEditClick}
            className="h-8 w-8 ml-2"
          >
            <Pencil size={16} />
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default VoiceAgentCard;
