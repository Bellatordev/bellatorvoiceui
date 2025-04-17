
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Zap } from 'lucide-react';
import PulsatingCircle from '@/components/ui/pulsating-circle';
import { PixelCanvas } from '@/components/ui/pixel-canvas';

const Holmes = () => {
  const navigate = useNavigate();

  // Add a script dynamically to the document
  useEffect(() => {
    // Check if the script already exists to prevent duplication
    const existingScript = document.querySelector('script[src="https://elevenlabs.io/convai-widget/index.js"]');
    
    if (!existingScript) {
      // Create the script element
      const script = document.createElement('script');
      script.src = 'https://elevenlabs.io/convai-widget/index.js';
      script.async = true;
      script.type = 'text/javascript';
      
      // Append to document
      document.body.appendChild(script);
      
      // Clean up function to remove the script when component unmounts
      return () => {
        document.body.removeChild(script);
      };
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#121212] text-white relative overflow-hidden">
      {/* Animated Background Layer */}
      <div className="absolute inset-0">
        <PixelCanvas
          gap={20}
          speed={15}
          colors={['#0EA5E9', '#33C3F0', '#8B5CF6']}
          variant="default"
        />
      </div>

      {/* Content Layer */}
      <header className="relative z-10 bg-[#1a1a1a]/80 backdrop-blur-lg border-b border-[#333] p-4 flex items-center justify-between">
        <button 
          onClick={() => navigate('/')}
          className="p-2 rounded-full hover:bg-[#333] transition-colors flex items-center gap-2 group"
        >
          <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
        </button>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          Holmes
          <Zap className="w-5 h-5 text-[#0EA5E9] animate-pulse" />
        </h1>
        <div className="w-10" />
      </header>

      {/* Main Content with ElevenLabs */}
      <div className="flex-1 overflow-y-auto p-4 flex items-center justify-center relative">
        <PulsatingCircle />
        <div className="w-full max-w-2xl mx-auto relative z-10 glass">
          <elevenlabs-convai 
            agent-id="5qz2KX4KuWwAIL3QErpF"
            className="rounded-xl overflow-hidden backdrop-blur-sm bg-[#1a1a1a]/50 border border-[#333]"
          />
        </div>
      </div>
    </div>
  );
};

export default Holmes;
