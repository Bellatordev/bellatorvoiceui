
import React from 'react';
import VoiceAgent from '../components/VoiceAgent';
import { Hero } from '@/components/ui/animated-hero';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-gray-200 dark:from-premium-dark dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 flex-1 flex flex-col">
        <header className="mb-8">
          <h1 className="sr-only">Voice Assistant</h1>
        </header>
        
        <Hero />
        
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
