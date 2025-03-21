
import React, { useEffect } from 'react';
import { useConversation } from '@/contexts/ConversationContext';
import { toast } from '@/components/ui/use-toast';
import MicrophonePermissionAlert from './voice/MicrophonePermissionAlert';
import VoiceCircle from './voice/VoiceCircle';
import VolumeControl from './voice/VolumeControl';

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
        <MicrophonePermissionAlert 
          onRequestPermission={handleMicrophonePermissionRequest} 
        />
      )}
      
      {/* Voice circle interface */}
      <VoiceCircle 
        isListening={isListening}
        isMicMuted={isMicMuted}
        isPlaying={isPlaying}
        isGenerating={isGenerating}
        currentTranscript={currentTranscript}
        microphonePermission={microphonePermission}
        onMicToggle={toggleMic}
        onListenStart={handleListenStart}
        onRequestPermission={handleMicrophonePermissionRequest}
      />
      
      {/* Volume slider */}
      <VolumeControl 
        isMuted={isMuted}
        volume={volume}
        onVolumeChange={handleVolumeChange}
      />
    </div>
  );
};

export default CircularVoiceInterface;
