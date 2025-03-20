
import React from 'react';
import ConversationInterface from '../components/ConversationInterface';
import { useLocation, Navigate } from 'react-router-dom';

const Conversation = () => {
  const location = useLocation();
  const { apiKey, agentId } = location.state || {};
  
  // Redirect to login if no credentials provided
  if (!apiKey || !agentId) {
    return <Navigate to="/" replace />;
  }
  
  const handleLogout = () => {
    // Navigate back to the login page
    window.location.href = '/';
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-premium-dark to-gray-900">
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
