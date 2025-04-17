import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Zap, Phone } from 'lucide-react';
import PulsatingCircle from '@/components/ui/pulsating-circle';
import { PixelCanvas } from '@/components/ui/pixel-canvas';
import { Button } from '@/components/ui/button';

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
        <PixelCanvas
          gap={12}
          speed={25}
          colors={['#0EA5E9', '#6366f1', '#8B5CF6']}
          variant="default"
          noFocus={true}
        />
      </div>

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

      <div className="flex-1 overflow-hidden relative z-10">
        <div className="container mx-auto px-4 py-8 h-full flex flex-col items-center justify-center">
          <div className="w-full max-w-md mx-auto mb-8">
            <PulsatingCircle />
          </div>
          
          <Button 
            size="lg"
            className="bg-[#0EA5E9] hover:bg-[#0EA5E9]/90 text-white rounded-full px-8 py-6 mb-8 flex items-center gap-3 shadow-lg shadow-[#0EA5E9]/20"
            onClick={() => {
              const embedElement = document.querySelector('elevenlabs-convai');
              if (embedElement) {
                embedElement.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            <Phone className="w-5 h-5" />
            <span>Call Holmes</span>
          </Button>

          <div className="w-full max-w-2xl mx-auto">
            <div className="relative rounded-2xl overflow-hidden backdrop-blur-md bg-black/30 border border-white/10 shadow-2xl">
              {isLoaded ? (
                <elevenlabs-convai 
                  agent-id="5qz2KX4KuWwAIL3QErpF"
                  className="rounded-xl overflow-hidden backdrop-filter"
                  style={{
                    backgroundColor: 'transparent',
                    borderRadius: '16px',
                    minHeight: '500px',
                    display: 'block',
                    width: '100%',
                  } as React.CSSProperties}
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
    </div>
  );
};

export default Holmes;
