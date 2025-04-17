
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import PulsatingCircle from '@/components/ui/pulsating-circle';

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
    <div className="min-h-screen flex flex-col bg-[#121212] text-white">
      {/* Header Bar */}
      <header className="bg-[#1a1a1a] border-b border-[#333] p-4 flex items-center justify-between">
        <button 
          onClick={() => navigate('/')}
          className="p-2 rounded-full hover:bg-[#333] transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold">Holmes</h1>
        <div className="w-10"> {/* Empty div for symmetrical spacing */}
        </div>
      </header>

      {/* Main Content - ElevenLabs Widget */}
      <div className="flex-1 overflow-y-auto p-4 flex items-center justify-center relative">
        <PulsatingCircle />
        <div className="w-full max-w-2xl mx-auto relative z-10">
          <elevenlabs-convai agent-id="5qz2KX4KuWwAIL3QErpF"></elevenlabs-convai>
        </div>
      </div>
    </div>
  );
};

export default Holmes;
