
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { VoiceAgent } from '@/types/voiceAgent';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface VoiceAgentCardProps {
  agent: VoiceAgent;
  isSelected: boolean;
  onClick: () => void;
}

const VoiceAgentCard: React.FC<VoiceAgentCardProps> = ({ agent, isSelected, onClick }) => {
  return (
    <Card 
      className={`cursor-pointer transition-all ${
        isSelected 
          ? 'ring-2 ring-primary border-primary' 
          : 'hover:border-primary/50'
      }`}
      onClick={onClick}
    >
      <CardContent className="flex items-center p-4 gap-3">
        <Avatar className="h-12 w-12 border border-border">
          <AvatarFallback className="bg-secondary text-secondary-foreground">
            {agent.name.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <h3 className="font-medium">{agent.name}</h3>
          {agent.description && (
            <p className="text-sm text-muted-foreground line-clamp-1">{agent.description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default VoiceAgentCard;
