
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Zap } from 'lucide-react';
import PulsatingCircle from '@/components/ui/pulsating-circle';
import { PixelCanvas } from '@/components/ui/pixel-canvas';
import TranscriptChatWindow from '@/components/TranscriptChatWindow';
import { toast } from '@/components/ui/use-toast';
import ElevenLabsWidget from '@/components/ElevenLabsWidget';
import { useElevenLabsConversation } from '@/hooks/useElevenLabsConversation';

const AGENT_ID = "K6sb3ZDw0wg0oK8OzFEg";

const Mark = () => {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  const [userInitiatedCall, setUserInitiatedCall] = useState(false);
  
  // Use the new custom hook for conversation
  const { 
    messages, 
    isCallActive, 
    startSession, 
    clearMessages, 
    sessionId 
  } = useElevenLabsConversation({
    agentId: AGENT_ID
  });

  useEffect(() => {
    // Only load the script once
    const existingScript = document.querySelector('script[src="https://elevenlabs.io/convai-widget/index.js"]');
    if (!existingScript && !isLoaded) {
      const script = document.createElement('script');
      script.src = 'https://elevenlabs.io/convai-widget/index.js';
      script.async = true;
      script.type = 'text/javascript';
      script.onload = () => {
        setIsLoaded(true);
        console.log('ElevenLabs widget script loaded');
      };
      document.body.appendChild(script);
      return () => {
        document.body.removeChild(script);
      };
    } else if (isLoaded) {
      console.log('ElevenLabs widget script already loaded');
    }
  }, [isLoaded]);

  // Start call and initialize conversation
  const handleStartCall = () => {
    if (!userInitiatedCall) {
      setUserInitiatedCall(true);
      
      // Start the session
      startSession();
      
      // Dispatch a custom event to simulate clicking the widget
      setTimeout(() => {
        const widgetElement = document.querySelector('elevenlabs-convai');
        if (widgetElement) {
          widgetElement.dispatchEvent(new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
          }));
        }
      }, 100);
    }
  };

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
          Mark
          <Zap className="w-5 h-5 text-[#0EA5E9] animate-pulse" />
        </h1>
        <button 
          onClick={clearMessages}
          className="text-xs text-white/60 hover:text-white/90 transition-colors p-2"
        >
          Clear Chat
        </button>
      </header>

      <div className="flex-1 overflow-hidden relative z-10 px-4">
        <div className="container mx-auto py-8 h-full flex flex-col items-center">
          {/* Visualization */}
          <div className="w-full flex justify-center mb-8">
            <div className="relative w-64 h-64 max-w-full">
              <PulsatingCircle />
            </div>
          </div>
          
          {/* ElevenLabs Widget Component */}
          <div className="w-full flex justify-center">
            <ElevenLabsWidget
              isLoaded={isLoaded}
              userInitiatedCall={userInitiatedCall}
              sessionId={sessionId || undefined}
              agentId={AGENT_ID}
              onStartCall={handleStartCall}
            />
          </div>
          
          {/* Status Indicator */}
          <div className="mt-4 text-center">
            <span className={`inline-block px-3 py-1 text-sm rounded-full ${
              isCallActive && userInitiatedCall ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-300'
            }`}>
              {isCallActive && userInitiatedCall ? 'Call Active' : 'Call Inactive'}
            </span>
          </div>
          
          {/* Transcript Chat Window */}
          <div className="w-full flex justify-center mt-4">
            <div className="w-full max-w-[500px]">
              <div className="text-sm text-white/50 mb-2 text-center">
                Message count: {messages.length} (Using ElevenLabs SDK)
              </div>
              <TranscriptChatWindow 
                messages={messages} 
                className=""
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Mark;
