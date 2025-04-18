
import React from 'react';
import { RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ConversationControlsProps {
  onRestartConversation: () => void;
  onEndConversation: () => void;
}

const ConversationControls: React.FC<ConversationControlsProps> = ({
  onRestartConversation,
  onEndConversation
}) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex gap-2 items-center"
          onClick={(e) => {
            // Prevent any event bubbling or multiple triggers
            e.preventDefault();
            e.stopPropagation();
            onRestartConversation();
          }}
          type="button"
        >
          <RefreshCw size={16} />
          Restart
        </Button>
      </div>
      <Button 
        variant="destructive" 
        size="sm" 
        className="flex gap-2 items-center"
        onClick={(e) => {
          // Prevent any event bubbling or multiple triggers
          e.preventDefault();
          e.stopPropagation();
          onEndConversation();
        }}
        type="button"
      >
        <X size={16} />
        End Conversation
      </Button>
    </div>
  );
};

export default ConversationControls;
