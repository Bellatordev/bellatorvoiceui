
import React from 'react';
import VoiceAgent from '../components/VoiceAgent';
import { Hero } from '@/components/ui/animated-hero';
import DarkModeToggle from '@/components/DarkModeToggle';
import { useEffect, useState } from 'react';

const Index = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark' || 
      (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-gray-200 dark:from-premium-dark dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 flex-1 flex flex-col">
        <header className="mb-8 flex justify-end">
          <DarkModeToggle isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
        </header>
        
        <Hero />
        
        <div className="h-24 md:h-32"></div> {/* Added spacing between sections */}
        
        <main className="max-w-2xl w-full mx-auto flex-1 flex flex-col">
          <VoiceAgent />
        </main>
        
        <footer className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          {/* Footer content removed */}
        </footer>
      </div>
    </div>
  );
};

export default Index;
