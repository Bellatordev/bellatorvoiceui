
import React, { useRef } from 'react';
import LoginScreen from '../components/LoginScreen';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import ThemeToggle from '@/components/ThemeToggle';
import { ArrowRight, Info } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const loginSectionRef = useRef<HTMLDivElement>(null);

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

  const scrollToLogin = () => {
    loginSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#1a1a24] text-white">
      {/* Hero Section */}
      <div className="min-h-screen flex flex-col items-center justify-center px-4 relative">
        <div className="absolute top-6 right-6">
          <ThemeToggle />
        </div>
        
        <div className="max-w-3xl text-center">
          <h1 className="text-7xl font-serif mb-8 text-[#a8a0f0] leading-tight">
            Meet your Agentic AI
            <br />
            <span className="text-white">that is</span>
            <br />
            <span className="text-white">smart</span>
          </h1>
          
          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
            I'm here to help you with your tasks, answer your questions, and assist you
            in making your workflow more efficient. Just ask me anything, and I'll do
            my best to provide helpful and relevant information.
          </p>
          
          <div className="flex gap-4 justify-center">
            <button 
              className="px-6 py-3 rounded-full bg-[#2b2a3d] text-white font-medium flex items-center gap-2 hover:bg-[#3a3952] transition-colors"
            >
              About Us <Info size={18} />
            </button>
            
            <button 
              onClick={scrollToLogin}
              className="px-6 py-3 rounded-full bg-gradient-to-r from-orange-400 to-purple-500 text-white font-medium flex items-center gap-2 hover:opacity-90 transition-opacity"
            >
              Get Started <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Login Section */}
      <div ref={loginSectionRef} className="min-h-screen flex flex-col items-center justify-center px-4 bg-[#1a1a24]">
        <div className="mb-16">
          <h2 className="text-6xl font-serif mb-2">
            <span className="text-[#a8a0f0]">Bellator</span>
            <span className="text-yellow-400">.ai</span>
          </h2>
        </div>
        
        <div className="w-full max-w-md bg-[#1b1b2e] rounded-xl p-8 border border-gray-800 shadow-xl">
          <LoginScreen onLogin={handleLogin} />
        </div>
      </div>
    </div>
  );
};

export default Login;
