
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';
import { VoiceAgent } from '@/types/voiceAgent';

interface AgentSelectorProps {
  agents: VoiceAgent[];
  selectedAgent: VoiceAgent | null;
  onSelectAgent: (agent: VoiceAgent) => void;
}

const AgentSelector: React.FC<AgentSelectorProps> = ({
  agents,
  selectedAgent,
  onSelectAgent
}) => {
  if (!selectedAgent) {
    return (
      <Button variant="outline">
        No Agents Available
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          {selectedAgent.name}
          <ChevronDown size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        <DropdownMenuLabel>Select Agent</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {agents.map(agent => (
          <DropdownMenuItem 
            key={agent.id}
            onClick={() => onSelectAgent(agent)}
            className={agent.id === selectedAgent.id ? "bg-accent text-accent-foreground" : ""}
          >
            {agent.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AgentSelector;
