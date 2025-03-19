
import React from 'react';
import VoiceAgent from '../components/VoiceAgent';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-agent-accent/10">
      <div className="container mx-auto px-4 py-8 flex-1 flex flex-col">
        <header className="mb-8">
          <h1 className="sr-only">Voice Assistant</h1>
        </header>
        
        <main className="max-w-2xl w-full mx-auto flex-1 flex flex-col">
          <VoiceAgent />
        </main>
        
        <footer className="mt-8 text-center text-sm text-gray-500">
          {/* Footer content removed */}
        </footer>
      </div>
    </div>
  );
};

export default Index;
