
import React, { useEffect, useRef } from 'react';
import { Zap } from 'lucide-react';

interface ElevenLabsWidgetProps {
  isLoaded: boolean;
  userInitiatedCall: boolean;
  sessionId?: string;
  agentId: string;
  onStartCall: () => void;
}

const ElevenLabsWidget: React.FC<ElevenLabsWidgetProps> = ({ 
  isLoaded, 
  userInitiatedCall, 
  sessionId, 
  agentId,
  onStartCall 
}) => {
  const widgetRef = useRef<HTMLElement | null>(null);

  // Set session ID on the widget when available
  useEffect(() => {
    if (isLoaded && sessionId && userInitiatedCall) {
      console.log('Setting session ID on widget:', sessionId);
      const widgetElement = document.querySelector('elevenlabs-convai');
      if (widgetElement) {
        widgetElement.setAttribute('session-id', sessionId);
        widgetRef.current = widgetElement as HTMLElement;
        console.log('Session ID set on widget');
      }
    }
  }, [isLoaded, sessionId, userInitiatedCall]);

  return (
    <div className="relative w-full max-w-[400px] h-[130px]">
      <div className="rounded-2xl overflow-hidden backdrop-blur-md bg-black/30 border border-white/10 shadow-2xl h-full">
        {isLoaded ? (
          <>
            {!userInitiatedCall && (
              <div 
                className="absolute inset-0 z-10 flex items-center justify-center cursor-pointer bg-black/60"
                onClick={onStartCall}
              >
                <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Click to Start Conversation
                </button>
              </div>
            )}
            <elevenlabs-convai 
              agent-id={agentId}
              className="rounded-xl overflow-hidden backdrop-filter w-full h-full" 
              style={{
                backgroundColor: 'transparent',
                borderRadius: '16px',
                width: '100%',
                height: '100%',
                display: 'block'
              } as React.CSSProperties} 
            />
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-white/70">
            <div className="animate-spin mr-2">
              <Zap className="w-6 h-6" />
            </div>
            Loading Mark...
          </div>
        )}
      </div>
    </div>
  );
};

export default ElevenLabsWidget;
