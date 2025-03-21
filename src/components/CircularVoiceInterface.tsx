
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { AIVoiceInput } from './ui/ai-voice-input';
import { useConversation } from '@/contexts/ConversationContext';
import { cn } from '@/lib/utils';
import { Slider } from '@/components/ui/slider';

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
      {/* Circular blue gradient background */}
      <div className="absolute w-full h-full rounded-full overflow-hidden">
        <div 
          className={cn(
            "absolute inset-0 rounded-full",
            isListening && !isMicMuted ? "animate-pulse-slow" : ""
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
            isListening && !isMicMuted ? "animate-breathe" : ""
          )}
          style={{
            background: "radial-gradient(circle, transparent 30%, rgba(255, 255, 255, 0.2) 70%)",
            mixBlendMode: "overlay"
          }}
        />
      </div>
      
      {/* Live transcription display */}
      {isListening && !isMicMuted && (
        <div className="absolute -top-16 w-96 max-w-full p-3 bg-white/90 dark:bg-gray-800/90 rounded-lg shadow-md z-20 text-center">
          <p className="text-sm text-gray-700 dark:text-gray-200 italic">
            {currentTranscript ? currentTranscript : "Listening..."}
          </p>
        </div>
      )}
      
      {/* Center listening button */}
      <button
        onClick={isMicMuted ? toggleMic : handleListenStart}
        className={cn(
          "relative z-10 px-6 py-3 bg-white/90 rounded-full shadow-md cursor-pointer transition-all duration-300 hover:bg-white/100 hover:shadow-lg",
          (isPlaying || isGenerating) ? "opacity-50 cursor-not-allowed" : "opacity-100"
        )}
        disabled={isPlaying || isGenerating}
      >
        <span className="text-blue-800 font-medium">
          {isMicMuted ? "Unmute" : isListening ? "Listening" : isPlaying ? "Playing..." : isGenerating ? "Generating..." : "Tap to speak"}
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
      
      {/* Volume slider (positioned below the circle) */}
      <div className="mt-20 flex items-center space-x-2 w-48">
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
