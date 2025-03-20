
import React from 'react';
import LoginScreen from './LoginScreen';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

const VoiceAgent: React.FC = () => {
  const navigate = useNavigate();

  const handleLogin = (key: string, id: string) => {
    if (!key.trim() || !id.trim()) {
      toast({
        title: "Invalid credentials",
        description: "Both API key and Voice ID are required",
        variant: "destructive"
      });
      return;
    }
    
    // Navigate to conversation page with credentials
    navigate('/conversation', { 
      state: { 
        apiKey: key,
        agentId: id
      }
    });
    
    toast({
      title: "Welcome",
      description: "Voice agent is ready to assist you",
    });
  };

  return (
    <div className="flex flex-col h-full">
      <LoginScreen onLogin={handleLogin} />
    </div>
  );
};

export default VoiceAgent;
