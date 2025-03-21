
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Volume2, VolumeX, AlertCircle } from 'lucide-react';
import { useConversation } from '@/contexts/ConversationContext';
import { cn } from '@/lib/utils';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from '@/components/ui/use-toast';

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
    setVolume,
    microphonePermission,
    requestMicrophoneAccess
  } = useConversation();

  // Log state changes for debugging
  useEffect(() => {
    console.log(`CircularVoiceInterface - isListening: ${isListening}, isPlaying: ${isPlaying}, isGenerating: ${isGenerating}, isMicMuted: ${isMicMuted}, micPermission: ${microphonePermission}`);
  }, [isListening, isPlaying, isGenerating, isMicMuted, microphonePermission]);

  // Handle volume slider change
  const handleVolumeChange = (value: number[]) => {
    // If it was muted and we're changing volume, unmute
    if (isMuted && value[0] > 0) {
      toggleMute();
    }
    setVolume(value[0]);
  };

  // Handle microphone permission request
  const handleMicrophonePermissionRequest = async () => {
    try {
      console.log("Requesting microphone permission from UI button");
      if (requestMicrophoneAccess) {
        const success = await requestMicrophoneAccess();
        if (success) {
          toast({
            title: "Microphone Access Granted",
            description: "You can now use voice features.",
          });
          // Start listening if permission was granted
          handleListenStart();
        }
      } else {
        // Fallback if requestMicrophoneAccess is not available
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        toast({
          title: "Microphone Access Granted",
          description: "You can now use voice features.",
        });
        // Start listening
        handleListenStart();
      }
    } catch (error) {
      console.error("Failed to get microphone permission:", error);
      toast({
        title: "Microphone Access Denied",
        description: "Please enable microphone access in your browser settings to use voice features.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* Microphone permission alert */}
      {microphonePermission === 'denied' && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Microphone Access Denied</AlertTitle>
          <AlertDescription>
            <p>Please enable microphone access in your browser settings to use voice features.</p>
            <div className="mt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleMicrophonePermissionRequest}
                className="mt-2"
              >
                Request Microphone Access
              </Button>
              <div className="mt-2 text-xs">
                <strong>Browser Instructions:</strong>
                <ul className="list-disc pl-5 mt-1">
                  <li>Chrome/Edge: Click the lock/camera icon in address bar → Site settings → Allow microphone</li>
                  <li>Safari: Preferences → Websites → Microphone → Allow for this website</li>
                  <li>Firefox: Click the shield icon in address bar → Allow microphone</li>
                  <li>Mobile: Check browser permissions in device settings</li>
                </ul>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}
      
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
        
        {/* Center listening button with enhanced styling */}
        <button
          onClick={
            microphonePermission === 'denied' 
              ? handleMicrophonePermissionRequest
              : isMicMuted ? toggleMic : handleListenStart
          }
          className={cn(
            "relative z-10 px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 dark:border-white/5 rounded-full shadow-lg cursor-pointer transition-all duration-300 hover:bg-white/20 hover:shadow-xl",
            (isPlaying || isGenerating) ? "opacity-50 cursor-not-allowed" : "opacity-100",
            isListening && !isMicMuted ? "ring-2 ring-purple-400 dark:ring-premium-accent" : ""
          )}
          disabled={isPlaying || isGenerating}
        >
          <span className="text-blue-800 dark:text-premium-light font-medium">
            {microphonePermission === 'denied' 
              ? "Enable Microphone" 
              : isMicMuted 
                ? "Unmute" 
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
      </div>
      
      {/* Volume slider - moved outside the circle and positioned below it */}
      <div className="mt-8 flex items-center space-x-2 w-48 bg-white/5 backdrop-blur-sm p-2 rounded-full border border-white/10 dark:border-gray-800/30">
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
