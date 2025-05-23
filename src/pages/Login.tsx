
import React, { useRef } from 'react';
import LoginScreen from '../components/LoginScreen';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import ThemeToggle from '@/components/ThemeToggle';
import { LampDemo } from '@/components/ui/lamp-demo';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();

  const handleLogin = (apiKey: string, agentId: string) => {
    // Basic validation before proceeding
    if (!apiKey.trim() || !agentId.trim()) {
      toast({
        title: "Invalid credentials",
        description: "Both API key and Voice ID are required",
        variant: "destructive"
      });
      return;
    }
    
    // Store credentials in localStorage so we can use them in the conversation page
    localStorage.setItem('voiceAgent_apiKey', apiKey);
    localStorage.setItem('voiceAgent_agentId', agentId);
    
    // Show a welcome toast to indicate successful login
    toast({
      title: "Welcome",
      description: "Voice agent is ready to assist you",
    });

    // Navigate to conversation page
    navigate('/conversation');
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5fa] dark:bg-[#1a1a24] text-gray-800 dark:text-white">
      {/* Back to Home Button in top left */}
      <div className="absolute top-6 left-6 z-10">
        <Button 
          variant="ghost" 
          onClick={handleBackToHome}
          className="flex items-center gap-2 text-gray-700 hover:text-black dark:text-gray-300 dark:hover:text-white"
        >
          <ArrowLeft size={18} />
          <span>Back to Home</span>
        </Button>
      </div>
      
      {/* Theme Toggle in top right */}
      <div className="absolute top-6 right-6 z-10">
        <ThemeToggle />
      </div>
      
      {/* Login Form with Lamp Component */}
      <div className="min-h-screen flex flex-col items-center">
        {/* Lamp Component - smaller height to ensure more space for content */}
        <div className="w-full h-[20vh] flex items-end">
          <LampDemo />
        </div>
        
        {/* Login Form - with height constraints to ensure proper scrolling */}
        <div className="w-full flex-grow flex items-start justify-center px-4 py-8">
          <div className="w-full max-w-md bg-white dark:bg-[#1b1b2e] rounded-xl p-8 border border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden flex flex-col h-auto mb-12">
            <h3 className="text-xl text-center font-serif text-gray-800 dark:text-gray-200 mb-8">Enter your credentials to start</h3>
            <LoginScreen onLogin={handleLogin} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
