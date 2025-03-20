
import React from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { AIVoiceInput } from './ui/ai-voice-input';
import { useConversation } from '@/contexts/ConversationContext';
import { cn } from '@/lib/utils';

const CircularVoiceInterface: React.FC = () => {
  const { 
    isListening,
    isMicMuted,
    isMuted,
    handleListenStart,
    handleListenStop,
    toggleMic,
    toggleMute,
    isDarkMode,
    toggleDarkMode
  } = useConversation();

  return (
    <div className="relative w-64 h-64 mx-auto flex items-center justify-center">
      {/* Circular blue gradient background */}
      <div className="absolute w-full h-full rounded-full overflow-hidden">
        <div 
          className={cn(
            "absolute inset-0 rounded-full",
            isListening ? "animate-pulse-slow" : ""
          )}
          style={{
            background: "radial-gradient(circle, #33C3F0 0%, #1EAEDB 50%, #0FA0CE 100%)",
            backgroundSize: "300% 300%",
          }}
        />
        
        {/* Inner animated pulse effect */}
        <div 
          className={cn(
            "absolute inset-0 rounded-full",
            isListening ? "animate-breathe" : ""
          )}
          style={{
            background: "radial-gradient(circle, transparent 30%, rgba(255, 255, 255, 0.2) 70%)",
            mixBlendMode: "overlay"
          }}
        />
      </div>
      
      {/* Center listening button */}
      <button
        onClick={handleListenStart}
        className="relative z-10 px-6 py-3 bg-white/90 rounded-full shadow-md cursor-pointer transition-all duration-300 hover:bg-white/100 hover:shadow-lg"
      >
        <span className="text-blue-800 font-medium">
          {isListening ? "Listening" : "Tap to speak"}
        </span>
      </button>

      {/* Control buttons */}
      <Button
        onClick={toggleMic}
        className={cn(
          "absolute bottom-2 right-2 z-20 rounded-full w-10 h-10 flex items-center justify-center transition-colors duration-300",
          isMicMuted 
            ? "bg-red-500 text-white hover:bg-red-600" 
            : "bg-white/80 text-blue-800 hover:bg-white/90 border border-blue-200"
        )}
        variant="ghost"
        size="icon"
        aria-label={isMicMuted ? "Unmute microphone" : "Mute microphone"}
      >
        {isMicMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
      </Button>
      
      <Button
        onClick={toggleMute}
        className={cn(
          "absolute bottom-2 left-2 z-20 rounded-full w-10 h-10 flex items-center justify-center transition-colors duration-300",
          isMuted 
            ? "bg-red-500 text-white hover:bg-red-600" 
            : "bg-white/80 text-blue-800 hover:bg-white/90 border border-blue-200"
        )}
        variant="ghost"
        size="icon"
        aria-label={isMuted ? "Unmute speaker" : "Mute speaker"}
      >
        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
      </Button>
      
      <Button
        onClick={toggleDarkMode}
        className="absolute top-2 right-2 z-20 rounded-full w-10 h-10 flex items-center justify-center transition-colors duration-300 bg-white/80 text-blue-800 hover:bg-white/90 border border-blue-200"
        variant="ghost"
        size="icon"
        aria-label="Toggle dark mode"
      >
        {isDarkMode ? 
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
          </svg> : 
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        }
      </Button>
    </div>
  );
};

export default CircularVoiceInterface;
