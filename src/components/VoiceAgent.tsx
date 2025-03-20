
import React, { useState, useEffect } from 'react';
import LoginScreen from './LoginScreen';
import ConversationInterface from './ConversationInterface';
import DarkModeToggle from './DarkModeToggle';
import { toast } from '@/components/ui/use-toast';

const VoiceAgent: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [agentId, setAgentId] = useState('');
  
  // Add dark mode state
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check if user has a preference stored or prefers dark mode by default
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark' || 
      (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  // Handle dark mode toggle
  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
  };

  // Apply dark mode on component mount and when changed
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleLogin = (key: string, id: string) => {
    // Basic validation before proceeding
    if (!key.trim() || !id.trim()) {
      toast({
        title: "Invalid credentials",
        description: "Both API key and Voice ID are required",
        variant: "destructive"
      });
      return;
    }
    
    setApiKey(key);
    setAgentId(id);
    setIsLoggedIn(true);
    
    // Show a welcome toast to indicate successful login
    toast({
      title: "Welcome",
      description: "Voice agent is ready to assist you",
    });
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setApiKey('');
    setAgentId('');
    
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-end mb-4">
        <DarkModeToggle 
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
        />
      </div>
      
      {!isLoggedIn ? (
        <LoginScreen onLogin={handleLogin} />
      ) : (
        <ConversationInterface 
          apiKey={apiKey} 
          agentId={agentId} 
          onLogout={handleLogout}
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
        />
      )}
    </div>
  );
};

export default VoiceAgent;
