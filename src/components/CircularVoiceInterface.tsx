import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { useConversation } from '@/contexts/ConversationContext';
import { cn } from '@/lib/utils';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/components/ui/use-toast';

const CircularVoiceInterface: React.FC = () => {
  const { toast } = useToast();
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);
  
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
    console.log(`CircularVoiceInterface - isListening: ${isListening}, isPlaying: ${isPlaying}, isGenerating: ${isGenerating}, isMicMuted: ${isMicMuted}, hasMicrophonePermission: ${hasMicrophonePermission}`);
  }, [isListening, isPlaying, isGenerating, isMicMuted, hasMicrophonePermission]);

  // Show permission prompt if microphone access is denied
  useEffect(() => {
    if (hasMicrophonePermission === false) {
      setShowPermissionPrompt(true);
      
      // Show toast notification
      toast({
        title: "Microphone Access Required",
        description: "Please allow microphone access in your browser settings to use voice features.",
        variant: "destructive",
        duration: 6000,
      });
    } else {
      setShowPermissionPrompt(false);
    }
  }, [hasMicrophonePermission, toast]);

  // Handle volume slider change
  const handleVolumeChange = (value: number[]) => {
    // If it was muted and we're changing volume, unmute
    if (isMuted && value[0] > 0) {
      toggleMute();
    }
    setVolume(value[0]);
  };

  // Handle mic toggle with improved feedback
  const handleMicToggle = () => {
    // Check if we have microphone permission before toggling
    if (hasMicrophonePermission === false) {
      // Prompt user to enable microphone
      toast({
        title: "Microphone Access Required",
        description: "Please allow microphone access in your browser settings to use voice features.",
        variant: "destructive",
        duration: 6000,
      });
      return;
    }
    
    toggleMic();
    
    // Provide visual feedback
    toast({
      title: isMicMuted ? "Microphone Enabled" : "Microphone Disabled",
      description: isMicMuted ? "Your microphone is now active." : "Your microphone has been muted.",
      duration: 2000,
    });
  };

  // Handle listen button click
  const handleListenButtonClick = () => {
    if (hasMicrophonePermission === false) {
      toast({
        title: "Microphone Access Required",
        description: "Please allow microphone access in your browser settings to use voice features.",
        variant: "destructive",
        duration: 6000,
      });
      return;
    }
    
    if (isMicMuted) {
      // If mic is muted, unmute it first
      toggleMic();
      setTimeout(() => handleListenStart(), 100);
    } else {
      // Otherwise just toggle listening state
      handleListenStart();
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* Voice circle interface */}
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
        
        {/* Microphone permission prompt */}
        {showPermissionPrompt && (
          <div className="absolute -top-16 w-96 max-w-full p-3 bg-red-50 dark:bg-red-900/30 backdrop-blur-md rounded-lg shadow-lg border border-red-200 dark:border-red-700/30 z-20 text-center transition-all animate-fade-in">
            <p className="text-sm text-red-700 dark:text-red-200 font-medium">
              Microphone access required
            </p>
            <p className="text-xs text-red-600 dark:text-red-300 mt-1">
              Please enable microphone access in your browser settings
            </p>
          </div>
        )}
        
        {/* Center listening button with enhanced styling */}
        <button
          onClick={handleListenButtonClick}
          className={cn(
            "relative z-10 px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 dark:border-white/5 rounded-full shadow-lg cursor-pointer transition-all duration-300 hover:bg-white/20 hover:shadow-xl",
            (isPlaying || isGenerating) ? "opacity-50 cursor-not-allowed" : "opacity-100",
            isListening && !isMicMuted ? "ring-2 ring-purple-400 dark:ring-premium-accent" : "",
            hasMicrophonePermission === false ? "bg-red-100/20 dark:bg-red-900/20 text-red-500 dark:text-red-300" : ""
          )}
          disabled={isPlaying || isGenerating}
        >
          <span className="text-blue-800 dark:text-premium-light font-medium">
            {hasMicrophonePermission === false 
              ? "Microphone Required" 
              : isMicMuted 
                ? "Unmute to Speak" 
                : isListening 
                  ? "Listening" 
                  : isPlaying 
                    ? "Playing..." 
                    : isGenerating 
                      ? "Generating..." 
                      : "Tap to speak"}
          </span>
        </button>

        {/* Mic control button with enhanced styling */}
        <Button
          onClick={handleMicToggle}
          className={cn(
            "absolute bottom-2 right-2 z-20 rounded-full w-10 h-10 flex items-center justify-center transition-all duration-300 shadow-md",
            isMicMuted 
              ? "bg-gradient-to-r from-red-500 to-red-600 text-white hover:bg-red-600" 
              : "bg-white/10 backdrop-blur-md text-blue-300 hover:bg-white/20 border border-white/10 dark:border-white/5"
          )}
          variant="ghost"
          size="icon"
          aria-label={isMicMuted ? "Unmute microphone" : "Mute microphone"}
        >
          {isMicMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </Button>
      </div>
      
      {/* Volume slider - moved outside the circle and positioned below it */}
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

