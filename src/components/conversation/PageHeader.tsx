
import React from 'react';
import { VoiceAgent } from '@/types/voiceAgent';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ThemeToggle from '@/components/ThemeToggle';
import AgentSelector from '@/components/AgentSelector';

interface PageHeaderProps {
  agents: VoiceAgent[];
  selectedAgent: VoiceAgent | null;
  onSelectAgent: (agent: VoiceAgent) => void;
  onLogout: () => void;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  agents,
  selectedAgent,
  onSelectAgent,
  onLogout
}) => {
  return (
    <header className="mb-8 flex justify-between items-center">
      <h1 className="text-3xl font-serif font-bold text-foreground">
        <span className="text-gradient">Bellator</span>
        <span className="text-gradient-yellow">.ai</span>
      </h1>
      
      <div className="flex items-center gap-3">
        <AgentSelector 
          agents={agents}
          selectedAgent={selectedAgent}
          onSelectAgent={onSelectAgent}
        />
        
        <Button 
          variant="ghost" 
          size="icon"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onLogout();
          }}
          className="text-foreground"
          type="button"
        >
          <LogOut className="h-5 w-5" />
        </Button>
        <ThemeToggle />
      </div>
    </header>
  );
};

export default PageHeader;
