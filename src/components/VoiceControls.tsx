
import React, { useEffect, useState } from 'react';
import { Mic, MicOff, Volume2, Volume1, VolumeX, MessageSquare } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { toast } from './ui/use-toast';
import { requestMicrophoneAccess, isSpeechRecognitionSupported, checkMicrophoneDevices } from '@/utils/microphonePermissions';

type VoiceControlsProps = {
  isListening: boolean;
  isMuted: boolean;
  volume: number;
  onListen: () => void;
  onStopListening: () => void;
  onMuteToggle: () => void;
  onVolumeChange: (value: number) => void;
  onSwitchToText: () => void;
  isMicMuted: boolean;
  onMicMuteToggle: () => void;
};

const VoiceControls: React.FC<VoiceControlsProps> = ({
  isListening,
  isMuted,
  volume,
  onListen,
  onStopListening,
  onMuteToggle,
  onVolumeChange,
  onSwitchToText,
  isMicMuted,
  onMicMuteToggle,
}) => {
  const [isMicAvailable, setIsMicAvailable] = useState<boolean>(true);
  const [isCheckingMic, setIsCheckingMic] = useState(false);

  useEffect(() => {
    const checkMicrophoneAccess = async () => {
      try {
        setIsCheckingMic(true);
        await checkMicrophoneDevices();
        await requestMicrophoneAccess();
        setIsMicAvailable(true);
        setIsCheckingMic(false);
      } catch (error) {
        console.error('Error checking microphone:', error);
        setIsMicAvailable(false);
        setIsCheckingMic(false);
      }
    };
    
    checkMicrophoneAccess();
  }, []);
  
  const handleTapToSpeakClick = () => {
    // If mic is muted, don't do anything
    if (isMicMuted) {
      toast({
        title: "Microphone is muted",
        description: "Unmute the microphone to speak",
        variant: "default"
      });
      return;
    }
    
    if (isListening) {
      onStopListening();
    } else {
      onListen();
    }
  };
  
  const handleMicMuteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // If currently listening and toggling to muted, make sure to stop listening first
    if (isListening && !isMicMuted) {
      console.log("Stopping listening before muting microphone");
      onStopListening();
      
      // Small delay to ensure stopping completes before toggling
      setTimeout(() => {
        onMicMuteToggle();
      }, 100);
    } else {
      onMicMuteToggle();
    }
  };
  
  const getStatusText = () => {
    if (isCheckingMic) return "Checking mic...";
    if (isMicMuted) return "Mic is muted";
    return "Tap to speak";
  };
  
  return (
    <div className="flex flex-col items-center space-y-8 w-full max-w-md mx-auto">
      <div className="relative w-64 h-64 flex items-center justify-center">
        <div 
          className={cn(
            "absolute w-full h-full rounded-full overflow-hidden",
            isListening && !isMicMuted ? "animate-pulse" : ""
          )}
        >
          <div 
            className={cn(
              "absolute inset-0 rounded-full",
              isListening && !isMicMuted ? "animate-gradient-shift" : ""
            )}
            style={{
              background: "linear-gradient(135deg, #0EA5E9, #33C3F0, #0FA0CE, #D3E4FD)",
              backgroundSize: "300% 300%",
            }}
          />
          
          <div 
            className={cn(
              "absolute inset-0 rounded-full",
              isListening && !isMicMuted ? "animate-breathe" : ""
            )}
            style={{
              background: "radial-gradient(circle, transparent 30%, #0EA5E9 70%)",
              mixBlendMode: "overlay"
            }}
          />
        </div>
        
        <div 
          className={cn(
            "relative z-10 px-6 py-3 rounded-full shadow-md cursor-pointer transition-all duration-300 hover:shadow-lg",
            isMicMuted ? "bg-red-100 hover:bg-red-200" : "bg-white/90 hover:bg-white/100"
          )}
          onClick={handleTapToSpeakClick}
        >
          <span className="text-gray-800 font-medium">
            {getStatusText()}
          </span>
        </div>

        <Button
          onClick={handleMicMuteToggle}
          className={cn(
            "absolute bottom-0 right-0 z-20 rounded-full w-12 h-12 flex items-center justify-center transition-colors duration-300",
            isMicMuted 
              ? "bg-red-500 text-white hover:bg-red-600" 
              : "bg-white/80 text-gray-800 hover:bg-white/90 border border-gray-200"
          )}
          variant="ghost"
          size="icon"
          aria-label={isMicMuted ? "Unmute microphone" : "Mute microphone"}
        >
          {isMicMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </Button>
      </div>
      
      <div className="flex flex-col items-center space-y-4 w-full">
        <div className="flex items-center space-x-4">
          <button
            onClick={onMuteToggle}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors focus-ring"
            aria-label={isMuted ? "Unmute speaker" : "Mute speaker"}
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5 text-gray-400" />
            ) : volume < 0.5 ? (
              <Volume1 className="w-5 h-5 text-gray-600" />
            ) : (
              <Volume2 className="w-5 h-5 text-gray-600" />
            )}
          </button>
          
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            className="w-32 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-agent-primary"
            disabled={isMuted}
          />
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onSwitchToText}
          className="flex items-center gap-2"
        >
          <MessageSquare className="w-4 h-4" />
          Type instead
        </Button>
      </div>
    </div>
  );
};

export default VoiceControls;
