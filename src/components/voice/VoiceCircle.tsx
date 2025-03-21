
import React from 'react';
import { Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface VoiceCircleProps {
  isListening: boolean;
  isMicMuted: boolean;
  isPlaying: boolean;
  isGenerating: boolean;
  currentTranscript: string;
  microphonePermission: PermissionState | null;
  onMicToggle: () => void;
  onListenStart: () => void;
  onRequestPermission: () => Promise<void>;
}

const VoiceCircle: React.FC<VoiceCircleProps> = ({
  isListening,
  isMicMuted,
  isPlaying,
  isGenerating,
  currentTranscript,
  microphonePermission,
  onMicToggle,
  onListenStart,
  onRequestPermission
}) => {
  return (
    <div className="relative w-64 h-64 mx-auto flex flex-col items-center justify-center">
      {/* Enhanced circular gradient background */}
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
        
        {/* Enhanced animated pulse effect */}
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
        
        {/* Additional animated rings */}
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
      
      {/* Center listening button */}
      <button
        onClick={
          microphonePermission === 'denied' 
            ? onRequestPermission
            : isMicMuted ? onMicToggle : onListenStart
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

      {/* Mic control button */}
      <Button
        onClick={onMicToggle}
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
  );
};

export default VoiceCircle;
