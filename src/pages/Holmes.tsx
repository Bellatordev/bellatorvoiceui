
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
      {/* Background pixel effect - making sure it's visible with higher z-index and opacity */}
      <div className="fixed inset-0 z-0 opacity-50">
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
          <div className="w-full flex flex-col items-center justify-center">
            <div className="relative w-64 h-64 mb-8">
              <PulsatingCircle />
            </div>
            
            {/* Talk to Holmes button */}
            <Button 
              className="flex items-center gap-2 bg-white/10 hover:bg-white/15 backdrop-blur-md text-white rounded-full px-6 py-6 border border-white/20 shadow-lg transition-all"
              onClick={() => {
                const widget = document.querySelector('elevenlabs-convai');
                if (widget) {
                  // Trigger a click on the widget to open the conversation
                  widget.click();
                }
              }}
            >
              <div className="rounded-full bg-black p-1.5">
                <Phone size={16} className="text-white" />
              </div>
              <span>Talk to Holmes</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Fixed position for the ElevenLabs conversation widget in bottom right */}
      <div className="fixed bottom-6 right-6 z-50">
        {isLoaded ? (
          <elevenlabs-convai 
            agent-id="5qz2KX4KuWwAIL3QErpF"
            style={{
              width: '60px',
              height: '60px',
              display: 'block',
              borderRadius: '100px',
              overflow: 'hidden',
            } as React.CSSProperties}
          />
        ) : (
          <div className="flex items-center justify-center h-12 w-12 bg-black/50 rounded-full">
            <div className="animate-spin">
              <Zap className="w-6 h-6" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Holmes;
