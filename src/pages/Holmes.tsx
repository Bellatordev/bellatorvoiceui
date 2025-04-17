
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Zap } from 'lucide-react';
import PulsatingCircle from '@/components/ui/pulsating-circle';
import { PixelCanvas } from '@/components/ui/pixel-canvas';

const Holmes = () => {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);

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
      
      // Set loaded state when script loads
      script.onload = () => {
        setIsLoaded(true);
      };
      
      // Append to document
      document.body.appendChild(script);
      
      // Clean up function to remove the script when component unmounts
      return () => {
        document.body.removeChild(script);
      };
    } else {
      setIsLoaded(true);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#121212] text-white relative overflow-hidden">
      {/* Pixel Canvas Background - Fixed to be visible */}
      <div className="fixed inset-0 z-0 opacity-70">
        <PixelCanvas
          gap={12}
          speed={25}
          colors={['#0EA5E9', '#6366f1', '#8B5CF6']}
          variant="default"
          noFocus={true}
        />
      </div>

      {/* Content Layer */}
      <header className="relative z-10 bg-black/40 backdrop-blur-lg border-b border-white/10 p-4 flex items-center justify-between">
        <button 
          onClick={() => navigate('/')}
          className="p-2 rounded-full hover:bg-white/10 transition-colors flex items-center gap-2 group"
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
      <div className="flex-1 overflow-hidden p-6 flex items-center justify-center relative z-10">
        <div className="relative">
          <PulsatingCircle />
        </div>
        
        <div className="w-full max-w-2xl mx-auto">
          <div className="relative z-10 rounded-2xl overflow-hidden backdrop-blur-md bg-black/30 border border-white/10 shadow-2xl">
            {isLoaded ? (
              <elevenlabs-convai 
                agent-id="5qz2KX4KuWwAIL3QErpF"
                className="rounded-xl overflow-hidden backdrop-filter"
                style={{
                  '--theme-color': '#0EA5E9',
                  '--button-color': '#0EA5E9',
                  '--button-text-color': '#FFFFFF',
                  '--background-color': 'transparent',
                  '--bubble-background-color': 'rgba(14, 165, 233, 0.1)',
                  '--bubble-text-color': '#FFFFFF',
                  '--border-radius': '16px',
                  minHeight: '500px',
                  display: 'block',
                  width: '100%'
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-[500px] text-white/70">
                <div className="animate-spin mr-2">
                  <Zap className="w-6 h-6" />
                </div>
                Loading Holmes...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Holmes;
