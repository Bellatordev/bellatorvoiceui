
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
          onClick={onRestartConversation}
        >
          <RefreshCw size={16} />
          Restart
        </Button>
      </div>
      <Button 
        variant="destructive" 
        size="sm" 
        className="flex gap-2 items-center"
        onClick={onEndConversation}
      >
        <X size={16} />
        End Conversation
      </Button>
    </div>
  );
};

export default ConversationControls;
