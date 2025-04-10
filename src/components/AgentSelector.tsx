
import React, { useState } from 'react';
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  const [infoAgent, setInfoAgent] = useState<VoiceAgent | null>(null);

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
      <Button 
        variant="outline" 
        className="flex items-center gap-2"
      >
        {selectedAgent.name}
        <ChevronDown size={16} />
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="absolute inset-0 opacity-0 cursor-pointer" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[240px]">
          <DropdownMenuLabel>Select Agent</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {agents.map(agent => (
            <div key={agent.id} className="flex items-center justify-between pr-2">
              <DropdownMenuItem 
                onClick={() => onSelectAgent(agent)}
                className={`flex-grow ${agent.id === selectedAgent.id ? "bg-accent text-accent-foreground" : ""}`}
              >
                {agent.name}
              </DropdownMenuItem>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Popover>
                      <PopoverTrigger asChild onClick={(e) => {
                        e.stopPropagation();
                        setInfoAgent(agent);
                      }}>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        >
                          <Info size={14} />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-80 p-3 shadow-lg backdrop-blur-md bg-popover/90 border border-agent-primary/10 rounded-lg"
                        side="right"
                        align="start"
                        sideOffset={5}
                      >
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold text-gradient">{agent.name}</h4>
                          {agent.description && (
                            <p className="text-xs text-muted-foreground font-light">{agent.description}</p>
                          )}
                          <div className="pt-1 space-y-2">
                            <div className="flex flex-col gap-1 text-xs">
                              <div className="font-medium text-agent-primary">Voice ID:</div>
                              <div className="text-muted-foreground font-light break-all">
                                {agent.voiceId}
                              </div>
                            </div>
                            
                            {agent.webhookUrl && (
                              <div className="flex flex-col gap-1 text-xs">
                                <div className="font-medium text-agent-primary">Webhook:</div>
                                <div className="text-muted-foreground font-light break-all">
                                  {agent.webhookUrl}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    View agent details
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default AgentSelector;
