
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Zap } from 'lucide-react';
import PulsatingCircle from '@/components/ui/pulsating-circle';
import { PixelCanvas } from '@/components/ui/pixel-canvas';

const Holmes = () => {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    const existingScript = document.querySelector('script[src="https://elevenlabs.io/convai-widget/index.js"]');
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = 'https://elevenlabs.io/convai-widget/index.js';
      script.async = true;
      script.type = 'text/javascript';
      script.onload = () => {
        setIsLoaded(true);
      };
      document.body.appendChild(script);
      return () => {
        document.body.removeChild(script);
      };
    } else {
      setIsLoaded(true);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#121212] text-white relative overflow-hidden">
      <div className="fixed inset-0 z-0 opacity-70">
        <PixelCanvas gap={12} speed={25} colors={['#0EA5E9', '#6366f1', '#8B5CF6']} variant="default" noFocus={true} />
      </div>

      <header className="relative z-10 bg-black/40 backdrop-blur-lg border-b border-white/10 p-4 flex items-center justify-between">
        <button onClick={() => navigate('/')} className="p-2 rounded-full hover:bg-white/10 transition-colors flex items-center gap-2 group">
          <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
        </button>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          Holmes
          <Zap className="w-5 h-5 text-[#0EA5E9] animate-pulse" />
        </h1>
        <div className="w-10" />
      </header>

      <div className="flex-1 overflow-hidden relative z-10 px-4">
        <div className="container mx-auto py-8 h-full flex flex-col items-center justify-center">
          <div className="w-full flex justify-center mb-8">
            <div className="relative w-64 h-64 max-w-full">
              <PulsatingCircle />
            </div>
          </div>
          
          <div className="w-full flex justify-center mt-4">
            <div className="relative w-full max-w-[400px] h-[130px]">
              <div className="rounded-2xl overflow-hidden backdrop-blur-md bg-black/30 border border-white/10 shadow-2xl h-full">
                {isLoaded ? (
                  <elevenlabs-convai 
                    agent-id="5qz2KX4KuWwAIL3QErpF" 
                    className="rounded-xl overflow-hidden backdrop-filter w-full h-full" 
                    style={{
                      backgroundColor: 'transparent',
                      borderRadius: '16px',
                      width: '100%',
                      height: '100%',
                      display: 'block'
                    } as React.CSSProperties} 
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-white/70">
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
      </div>
    </div>
  );
};

export default Holmes;
