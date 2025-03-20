
import React from 'react';
import VoiceAgent from '../components/VoiceAgent';
import { Hero } from '@/components/ui/animated-hero';
import DarkModeToggle from '@/components/DarkModeToggle';
import { useEffect, useState } from 'react';
import { LampDemo } from '@/components/ui/lamp-demo';

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

  const scrollToForm = (e: React.MouseEvent) => {
    e.preventDefault();
    const lampSection = document.getElementById('lamp-section');
    if (lampSection) {
      lampSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-gray-200 dark:from-premium-dark dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 flex-1 flex flex-col">
        <header className="mb-8 flex justify-end">
          <DarkModeToggle isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
        </header>
        
        {/* Hero section */}
        <section className="mb-16">
          <Hero scrollHandler={scrollToForm} />
        </section>
        
        {/* Increased spacing between sections with a visual separator */}
        <div className="h-32 md:h-48 flex items-center justify-center">
          <div className="w-24 h-px bg-gray-300 dark:bg-gray-700"></div>
        </div>
        
        {/* Login section with lamp effect */}
        <section id="lamp-section" className="flex-1 flex flex-col items-center justify-center py-12 relative overflow-hidden bg-gray-950 rounded-3xl shadow-xl">
          <div className="w-full h-full absolute inset-0 overflow-hidden">
            <LampDemo />
          </div>
          <div className="max-w-2xl w-full mx-auto z-10 mt-48 md:mt-64 relative">
            <VoiceAgent />
          </div>
        </section>
        
        <footer className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          {/* Footer content removed */}
        </footer>
      </div>
    </div>
  );
};

export default Index;
