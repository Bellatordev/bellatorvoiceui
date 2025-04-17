
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatedHero } from '@/components/ui/animated-hero';
import ThemeToggle from '@/components/ThemeToggle';
import { FlipButton } from '@/components/ui/flip-button';

const Index = () => {
  const navigate = useNavigate();
  const handleGetStarted = () => {
    navigate('/login');
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
      
      <AnimatedHero onScrollToLogin={handleGetStarted} />
      
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2">
        <FlipButton 
          frontText="Meet Holmes" 
          backText="Let's go!" 
          onClick={handleHolmesClick}
          className="px-8 py-4 text-lg gradient-button"
          frontClassName="bg-blue-600 text-white hover:bg-blue-700"
          backClassName="bg-blue-700 text-white"
        />
      </div>
    </div>
  );
};

export default Index;

