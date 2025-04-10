
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
import { ChevronDown, Info } from 'lucide-react';
import { VoiceAgent } from '@/types/voiceAgent';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

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
  if (!agents || agents.length === 0) {
    return (
      <Button variant="outline">
        No Agents Available
      </Button>
    );
  }

  // If the selected agent is not in the list, select the first one
  if (!selectedAgent || !agents.find(a => a.id === selectedAgent.id)) {
    return (
      <Button variant="outline" onClick={() => onSelectAgent(agents[0])}>
        Select Agent
      </Button>
    );
  }

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div>
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
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">{selectedAgent.name}</h4>
          {selectedAgent.description && (
            <p className="text-sm text-muted-foreground">{selectedAgent.description}</p>
          )}
          <div className="pt-2">
            <div className="grid grid-cols-[1fr_2fr] gap-2 text-sm">
              <div className="font-medium">Voice ID:</div>
              <div className="text-muted-foreground truncate" title={selectedAgent.voiceId}>
                {selectedAgent.voiceId}
              </div>
              
              {selectedAgent.webhookUrl && (
                <>
                  <div className="font-medium">Webhook:</div>
                  <div className="text-muted-foreground truncate" title={selectedAgent.webhookUrl}>
                    {selectedAgent.webhookUrl}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

export default AgentSelector;
