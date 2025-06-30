
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, ChevronLeft } from 'lucide-react';
import AssistantChat from '@/components/AssistantChat';
import ApiKeyInput from '@/components/ApiKeyInput';

const Assistant = () => {
  const navigate = useNavigate();
  const [apiKey, setApiKey] = useState<string | null>(null);

  // Load API key from localStorage on mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem('openai_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  const handleApiKeySubmit = (key: string) => {
    localStorage.setItem('openai_api_key', key);
    setApiKey(key);
  };

  const handleLogout = () => {
    localStorage.removeItem('openai_api_key');
    setApiKey(null);
  };

  if (!apiKey) {
    return <ApiKeyInput onApiKeySubmit={handleApiKeySubmit} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-lg border-b border-border p-4 flex items-center justify-between">
        <button 
          onClick={() => navigate('/')} 
          className="p-2 rounded-full hover:bg-accent transition-colors flex items-center gap-2 group"
        >
          <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
        </button>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          Document Assistant
          <Bot className="w-5 h-5 text-primary animate-pulse" />
        </h1>
        <button
          onClick={handleLogout}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Disconnect
        </button>
      </header>

      {/* Chat Interface */}
      <div className="flex-1">
        <AssistantChat apiKey={apiKey} />
      </div>
    </div>
  );
};

export default Assistant;
