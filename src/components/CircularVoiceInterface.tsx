import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { useConversation } from '@/contexts/ConversationContext';
import { cn } from '@/lib/utils';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/components/ui/use-toast';

const CircularVoiceInterface: React.FC = () => {
  const { toast } = useToast();
  
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
    setVolume,
    hasMicrophonePermission
  } = useConversation();

  // Log state changes for debugging
  useEffect(() => {
    console.log(`CircularVoiceInterface - States: isListening: ${isListening}, isMicMuted: ${isMicMuted}, hasMic: ${hasMicrophonePermission}`);
  }, [isListening, isMicMuted, hasMicrophonePermission]);

  // Handle volume slider change
  const handleVolumeChange = (value: number[]) => {
    // If it was muted and we're changing volume, unmute
    if (isMuted && value[0] > 0) {
      toggleMute();
    }
    setVolume(value[0]);
  };

  // Handle the tap-to-speak button click
  const handleTapToSpeakClick = () => {
    console.log("Tap to speak clicked, isMicMuted:", isMicMuted);
    
    // If we're already listening, stop listening
    if (isListening) {
      handleListenStop(0);
      return;
    }
    
    // If microphone is muted, unmute it first
    if (isMicMuted) {
      toggleMic(); // This will unmute the mic
      
      // Small delay before starting listening to allow toggle to take effect
      setTimeout(() => {
        console.log("Starting listening after unmuting");
        handleListenStart();
      }, 100);
    } else {
      // Otherwise just start listening
      handleListenStart();
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* Voice circle interface */}
      <div className="relative w-64 h-64 mx-auto flex flex-col items-center justify-center">
        {/* Gradient background */}
        <div className="absolute w-full h-full rounded-full overflow-hidden">
          <div 
            className={cn(
              "absolute inset-0 rounded-full",
              isListening && !isMicMuted ? "animate-pulse-slow" : ""
            )}
            style={{
              background: "radial-gradient(circle, var(--gradient-center-color) 0%, #6E59A5 50%, #403E43 100%)",
              backgroundSize: "300% 300%",
            }}
          />
        </div>
        
        {/* Live transcription display */}
        {isListening && !isMicMuted && currentTranscript && (
          <div className="absolute -top-16 w-96 max-w-full p-3 bg-white/10 dark:bg-gray-800/80 backdrop-blur-md rounded-lg shadow-lg border border-white/10 dark:border-gray-700/30 z-20 text-center">
            <p className="text-sm text-gray-700 dark:text-gray-200 italic">
              {currentTranscript ? currentTranscript : "Listening..."}
            </p>
          </div>
        )}
        
        {/* Center listening button */}
        <button
          onClick={handleTapToSpeakClick}
          className={cn(
            "relative z-10 px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 dark:border-white/5 rounded-full shadow-lg cursor-pointer transition-all duration-300 hover:bg-white/20 hover:shadow-xl",
            (isPlaying || isGenerating) ? "opacity-50 cursor-not-allowed" : "opacity-100",
            isListening && !isMicMuted ? "ring-2 ring-purple-400 dark:ring-purple-500" : ""
          )}
          disabled={isPlaying || isGenerating}
        >
          <span className="text-blue-800 dark:text-blue-300 font-medium">
            {isMicMuted 
              ? "Tap to unmute" 
              : isListening 
                ? "Listening" 
                : isPlaying 
                  ? "Playing..." 
                  : isGenerating 
                    ? "Generating..." 
                    : "Tap to speak"}
          </span>
        </button>

        {/* Mic control button */}
        <Button
          onClick={toggleMic}
          className={cn(
            "absolute bottom-2 right-2 z-20 rounded-full w-10 h-10 flex items-center justify-center transition-all duration-300 shadow-md",
            isMicMuted 
              ? "bg-red-500 text-white hover:bg-red-600" 
              : "bg-white/10 backdrop-blur-md text-blue-300 hover:bg-white/20 border border-white/10"
          )}
          variant="ghost"
          size="icon"
          aria-label={isMicMuted ? "Unmute microphone" : "Mute microphone"}
        >
          {isMicMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </Button>
      </div>
      
      {/* Volume slider */}
      <div className="mt-8 flex items-center space-x-2 w-48 bg-white/5 backdrop-blur-sm p-2 rounded-full border border-white/10 dark:border-gray-800/30">
        <Button
          onClick={toggleMute}
          variant="ghost"
          size="icon"
          className="h-6 w-6 p-0"
        >
          {isMuted 
            ? <VolumeX className="w-4 h-4 text-red-500" /> 
            : <Volume2 className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          }
        </Button>
        <Slider
          value={[isMuted ? 0 : volume]}
          min={0}
          max={1}
          step={0.01}
          onValueChange={handleVolumeChange}
          className="w-full"
          aria-label="Volume"
        />
      </div>
    </div>
  );
};

export default CircularVoiceInterface;
