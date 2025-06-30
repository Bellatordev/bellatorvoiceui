
import React from 'react';
import { Bot } from 'lucide-react';

const Assistant = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground relative">
      {/* Main content area */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Assistant Page</h1>
          <p className="text-lg text-muted-foreground">Welcome to your AI assistant page</p>
        </div>
      </div>
      
      {/* Assistant button in bottom left */}
      <button className="fixed bottom-6 left-6 p-4 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg">
        <Bot size={24} />
      </button>
    </div>
  );
};

export default Assistant;
