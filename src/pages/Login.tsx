
import React, { useRef } from 'react';
import LoginScreen from '../components/LoginScreen';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import ThemeToggle from '@/components/ThemeToggle';
import { ArrowRight, Info } from 'lucide-react';
import { AnimatedHero } from '@/components/ui/animated-hero';
import { LampDemo } from '@/components/ui/lamp-demo';

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
      {/* Theme Toggle in top right */}
      <div className="absolute top-6 right-6 z-10">
        <ThemeToggle />
      </div>
      
      {/* Hero Section with Animated Text */}
      <AnimatedHero onScrollToLogin={scrollToLogin} />
      
      {/* Lamp Component */}
      <div className="w-full">
        <LampDemo />
      </div>
      
      {/* Login Section with increased spacing from the hero section */}
      <div 
        ref={loginSectionRef} 
        className="min-h-screen flex flex-col items-center justify-center px-4 py-20 bg-[#1a1a24]"
      >
        <div className="w-full max-w-md bg-[#1b1b2e] rounded-xl p-8 border border-gray-800 shadow-xl">
          <LoginScreen onLogin={handleLogin} />
        </div>
      </div>
    </div>
  );
};

export default Login;
