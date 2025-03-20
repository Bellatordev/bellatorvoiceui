
import React, { useEffect, useState } from 'react';
import ConversationInterface from '../components/ConversationInterface';
import { useLocation, Navigate, useNavigate } from 'react-router-dom';

const Conversation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { apiKey, agentId } = location.state || {};
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark' || 
      (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);
  
  // Redirect to login if no credentials provided
  if (!apiKey || !agentId) {
    return <Navigate to="/" replace />;
  }
  
  const handleLogout = () => {
    // Navigate back to the index page
    navigate('/', { replace: true });
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 py-8 flex-1 flex flex-col">
        <div className="max-w-2xl w-full mx-auto my-8">
          <ConversationInterface 
            apiKey={apiKey} 
            agentId={agentId} 
            onLogout={handleLogout}
          />
        </div>
      </div>
    </div>
  );
};

export default Conversation;
