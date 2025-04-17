import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatedHero } from '@/components/ui/animated-hero';
import ThemeToggle from '@/components/ThemeToggle';
const Index = () => {
  const navigate = useNavigate();
  const handleGetStarted = () => {
    navigate('/login');
  };
  const handleHolmesClick = () => {
    navigate('/holmes');
  };
  return <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Theme Toggle in top right */}
      <div className="absolute top-6 right-6 z-10">
        <ThemeToggle />
      </div>
      
      <AnimatedHero onScrollToLogin={handleGetStarted} />
      
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2">
        <button onClick={handleHolmesClick} className="px-6 py-3 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium flex items-center gap-2 transition-colors">Meet Holmes</button>
      </div>
    </div>;
};
export default Index;