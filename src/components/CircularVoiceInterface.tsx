
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { AIVoiceInput } from './ui/ai-voice-input';
import { useConversation } from '@/contexts/ConversationContext';
import { cn } from '@/lib/utils';
import { Slider } from '@/components/ui/slider';
import { RainbowButton } from './ui/rainbow-button';

const CircularVoiceInterface: React.FC = () => {
  const { 
    isListening,
    isMicMuted,
    isMuted,
    handleListenStart,
    handleListenStop,
    toggleMic,
    toggleMute,
    isPlaying,
    isGenerating,
    currentTranscript,
    volume,
    setVolume
  } = useConversation();

  // Log state changes for debugging
  useEffect(() => {
    console.log(`CircularVoiceInterface - isListening: ${isListening}, isPlaying: ${isPlaying}, isGenerating: ${isGenerating}, isMicMuted: ${isMicMuted}`);
  }, [isListening, isPlaying, isGenerating, isMicMuted]);

  // Handle volume slider change
  const handleVolumeChange = (value: number[]) => {
    // If it was muted and we're changing volume, unmute
    if (isMuted && value[0] > 0) {
      toggleMute();
    }
    setVolume(value[0]);
  };

  return (
    <div className="relative w-64 h-64 mx-auto flex flex-col items-center justify-center">
      {/* Enhanced circular gradient background with improved colors for dark mode */}
      <div className="absolute w-full h-full rounded-full overflow-hidden">
        <div 
          className={cn(
            "absolute inset-0 rounded-full",
            isListening && !isMicMuted ? "animate-pulse-slow" : ""
          )}
          style={{
            background: "radial-gradient(circle, var(--gradient-center-color) 0%, #6E59A5 50%, #403E43 100%)",
            backgroundSize: "300% 300%",
            animation: isListening && !isMicMuted ? "gradient-shift 5s ease-in-out infinite, pulse 3s ease-in-out infinite" : "none"
          }}
        />
        
        {/* Enhanced animated pulse effect with better blending */}
        <div 
          className={cn(
            "absolute inset-0 rounded-full",
            isListening && !isMicMuted ? "animate-breathe" : ""
          )}
          style={{
            background: "radial-gradient(circle, rgba(155, 135, 245, 0.2) 30%, rgba(155, 135, 245, 0.4) 70%)",
            mixBlendMode: "overlay"
          }}
        />
        
        {/* Additional animated rings for enhanced visual effect */}
        {isListening && !isMicMuted && (
          <>
            <div 
              className="absolute inset-0 rounded-full animate-breathe"
              style={{
                borderWidth: "2px",
                borderStyle: "solid",
                borderColor: "rgba(155, 135, 245, 0.3)",
                animationDelay: "0.5s",
                scale: "0.8",
              }}
            />
            <div 
              className="absolute inset-0 rounded-full animate-breathe"
              style={{
                borderWidth: "2px",
                borderStyle: "solid",
                borderColor: "rgba(214, 188, 250, 0.2)",
                animationDelay: "1s",
                scale: "0.9",
              }}
            />
          </>
        )}
      </div>
      
      {/* Live transcription display */}
      {isListening && !isMicMuted && (
        <div className="absolute -top-16 w-96 max-w-full p-3 bg-white/10 dark:bg-gray-800/80 backdrop-blur-md rounded-lg shadow-lg border border-white/10 dark:border-gray-700/30 z-20 text-center transition-all animate-fade-in">
          <p className="text-sm text-gray-700 dark:text-gray-200 italic">
            {currentTranscript ? currentTranscript : "Listening..."}
          </p>
        </div>
      )}
      
      {/* Center listening button with enhanced styling */}
      <button
        onClick={isMicMuted ? toggleMic : handleListenStart}
        className={cn(
          "relative z-10 px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 dark:border-white/5 rounded-full shadow-lg cursor-pointer transition-all duration-300 hover:bg-white/20 hover:shadow-xl",
          (isPlaying || isGenerating) ? "opacity-50 cursor-not-allowed" : "opacity-100",
          isListening && !isMicMuted ? "ring-2 ring-purple-400 dark:ring-premium-accent" : ""
        )}
        disabled={isPlaying || isGenerating}
      >
        <span className="text-blue-800 dark:text-premium-light font-medium">
          {isMicMuted ? "Unmute" : isListening ? "Listening" : isPlaying ? "Playing..." : isGenerating ? "Generating..." : "Tap to speak"}
        </span>
      </button>

      {/* Mic control button with enhanced styling */}
      <Button
        onClick={toggleMic}
        className={cn(
          "absolute bottom-2 right-2 z-20 rounded-full w-10 h-10 flex items-center justify-center transition-all duration-300 shadow-md",
          isMicMuted 
            ? "bg-gradient-to-r from-red-500 to-red-600 text-white hover:bg-red-600 animate-rainbow" 
            : "bg-white/10 backdrop-blur-md text-blue-300 hover:bg-white/20 border border-white/10 dark:border-white/5"
        )}
        variant="ghost"
        size="icon"
        aria-label={isMicMuted ? "Unmute microphone" : "Mute microphone"}
      >
        {isMicMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
      </Button>
      
      {/* Volume slider (positioned below the circle) with enhanced styling */}
      <div className="mt-20 flex items-center space-x-2 w-48 bg-white/5 backdrop-blur-sm p-2 rounded-full border border-white/10 dark:border-gray-800/30">
        <Volume2 className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        <Slider
          value={[isMuted ? 0 : volume]}
          min={0}
          max={1}
          step={0.01}
          onValueChange={handleVolumeChange}
          className="w-full"
          aria-label="Volume"
        />
        {isMuted && (
          <VolumeX className="w-4 h-4 text-red-500" />
        )}
      </div>
    </div>
  );
};

export default CircularVoiceInterface;
