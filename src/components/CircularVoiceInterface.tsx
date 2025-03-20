
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { AIVoiceInput } from './ui/ai-voice-input';
import { useConversation } from '@/contexts/ConversationContext';
import { cn } from '@/lib/utils';
import DarkModeToggle from './DarkModeToggle';

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
    toggleDarkMode,
    isPlaying,
    isGenerating,
    currentTranscript
  } = useConversation();

  // Log state changes for debugging
  useEffect(() => {
    console.log(`CircularVoiceInterface - isListening: ${isListening}, isPlaying: ${isPlaying}, isGenerating: ${isGenerating}`);
  }, [isListening, isPlaying, isGenerating]);

  return (
    <div className="relative w-64 h-64 mx-auto flex items-center justify-center">
      {/* Dark mode toggle - moved to the absolutely positioned container */}
      <div className="absolute top-0 right-0 z-30 -mt-12 -mr-12">
        <DarkModeToggle
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
        />
      </div>

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
      
      {/* Live transcription display */}
      {isListening && currentTranscript && (
        <div className="absolute -top-16 w-96 max-w-full p-3 bg-white/90 dark:bg-gray-800/90 rounded-lg shadow-md z-20 text-center">
          <p className="text-sm text-gray-700 dark:text-gray-200 italic">
            {currentTranscript}
          </p>
        </div>
      )}
      
      {/* Center listening button */}
      <button
        onClick={handleListenStart}
        className={cn(
          "relative z-10 px-6 py-3 bg-white/90 rounded-full shadow-md cursor-pointer transition-all duration-300 hover:bg-white/100 hover:shadow-lg",
          (isPlaying || isGenerating) ? "opacity-50 cursor-not-allowed" : "opacity-100"
        )}
        disabled={isPlaying || isGenerating}
      >
        <span className="text-blue-800 font-medium">
          {isListening ? "Listening" : isPlaying ? "Playing..." : isGenerating ? "Generating..." : "Tap to speak"}
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
    </div>
  );
};

export default CircularVoiceInterface;
