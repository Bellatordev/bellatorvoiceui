
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatedHero } from '@/components/ui/animated-hero';
import ThemeToggle from '@/components/ThemeToggle';
import { RainbowButton } from '@/components/ui/rainbow-button';
import { ArrowRight, UserRound, Brain } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/login');
  };

  const handleSheldonClick = () => {
    navigate('/caller');
  };

  const handleHolmesClick = () => {
    navigate('/holmes');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Theme Toggle in top right */}
      <div className="absolute top-6 right-6 z-10">
        <ThemeToggle />
      </div>
      
      {/* Hero Section with Animated Text */}
      <div className="min-h-screen flex flex-col items-center justify-center px-4 relative">
        <div className="max-w-3xl text-center">
          <h1 className="text-6xl md:text-7xl font-serif mb-8 text-primary leading-tight">
            Meet your Agentic AI
            <br />
            <span className="text-foreground">that is</span>
          </h1>
          
          {/* Words that would animate here - simplified for this example */}
          <div className="h-20 md:h-24 mb-8 flex justify-center">
            <span className="text-foreground text-6xl md:text-7xl font-serif">
              intelligent
            </span>
          </div>
          
          <p className="text-xl font-sans text-muted-foreground mb-12 max-w-2xl mx-auto">
            I'm here to help you with your tasks, answer your questions, and assist you
            in making your workflow more efficient. Just ask me anything, and I'll do
            my best to provide helpful and relevant information.
          </p>
          
          <div className="flex flex-col gap-4 items-center">
            <div className="flex gap-4 justify-center">
              <button 
                className="px-6 py-3 rounded-full bg-secondary text-secondary-foreground font-medium flex items-center gap-2 hover:bg-secondary/90 transition-colors"
              >
                About AI
              </button>
              
              <RainbowButton 
                onClick={handleGetStarted}
                className="h-12 rounded-full font-medium flex items-center gap-2"
              >
                Get Started <ArrowRight size={18} />
              </RainbowButton>
            </div>
            
            <div className="flex gap-4 mt-4">
              <button 
                onClick={handleSheldonClick}
                className="px-6 py-3 rounded-full bg-amber-500 hover:bg-amber-600 dark:bg-[#9583f4] dark:hover:bg-[#8070e6] text-white font-medium flex items-center gap-2 transition-colors"
              >
                <UserRound size={18} />
                Sheldon
              </button>
              
              <button 
                onClick={handleHolmesClick}
                className="px-6 py-3 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium flex items-center gap-2 transition-colors"
              >
                <Brain size={18} />
                Holmes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
