
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, ChevronLeft } from 'lucide-react';

const Assistant = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground relative">
      {/* Header with back button */}
      <header className="relative z-10 bg-background/80 backdrop-blur-lg border-b border-border p-4 flex items-center justify-between">
        <button 
          onClick={() => navigate('/')} 
          className="p-2 rounded-full hover:bg-accent transition-colors flex items-center gap-2 group"
        >
          <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
        </button>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          Assistant
          <Bot className="w-5 h-5 text-primary animate-pulse" />
        </h1>
        <div className="w-10" />
      </header>

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
