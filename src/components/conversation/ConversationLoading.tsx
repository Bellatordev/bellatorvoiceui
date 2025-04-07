
import React from 'react';

const ConversationLoading: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-background to-muted/30">
      <div className="agent-card p-8 shadow-lg">
        <div className="animate-pulse">Loading...</div>
      </div>
    </div>
  );
};

export default ConversationLoading;
