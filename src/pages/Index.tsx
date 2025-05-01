
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatedHero } from '@/components/ui/animated-hero';
import ThemeToggle from '@/components/ThemeToggle';
import { GradientFlipButton } from '@/components/ui/gradient-flip-button';

const Index = () => {
  const navigate = useNavigate();
  const handleGetStarted = () => {
    navigate('/login');
  };
  const handleHolmesClick = () => {
    navigate('/holmes');
  };
  const handleMarkClick = () => {
    navigate('/mark');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Theme Toggle in top right */}
      <div className="absolute top-6 right-6 z-10">
        <ThemeToggle />
      </div>
      
      <AnimatedHero onScrollToLogin={handleGetStarted} />
      
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex gap-4">
        <GradientFlipButton
          frontText="Meet Holmes"
          backText="Let's go!"
          onClick={handleHolmesClick}
          className="px-8 py-4 text-lg"
          frontVariant="default"
          backVariant="variant"
        />
        <GradientFlipButton
          frontText="Meet Mark"
          backText="Let's go!"
          onClick={handleMarkClick}
          className="px-8 py-4 text-lg"
          frontVariant="default"
          backVariant="variant"
        />
      </div>
    </div>
  );
};

export default Index;
