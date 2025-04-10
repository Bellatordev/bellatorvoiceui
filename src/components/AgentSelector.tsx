
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

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
    <div className="relative">
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className="flex items-center gap-2 z-10"
          >
            {selectedAgent.name}
            <ChevronDown size={16} />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-64 p-3 shadow-lg backdrop-blur-md bg-popover/90 border border-agent-primary/10 rounded-lg animate-fade-in"
          side="top"
          align="center"
          sideOffset={5}
          style={{ zIndex: 100 }}
        >
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gradient">{selectedAgent.name}</h4>
            {selectedAgent.description && (
              <p className="text-xs text-muted-foreground font-light">{selectedAgent.description}</p>
            )}
            <div className="pt-1 space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <div className="font-medium text-agent-primary">Voice ID:</div>
                <div className="text-muted-foreground truncate font-light" title={selectedAgent.voiceId}>
                  {selectedAgent.voiceId}
                </div>
              </div>
              
              {selectedAgent.webhookUrl && (
                <div className="flex items-center gap-2 text-xs">
                  <div className="font-medium text-agent-primary">Webhook:</div>
                  <div className="text-muted-foreground truncate font-light" title={selectedAgent.webhookUrl}>
                    {selectedAgent.webhookUrl}
                  </div>
                </div>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="absolute inset-0 opacity-0 cursor-pointer" />
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
  );
};

export default AgentSelector;
