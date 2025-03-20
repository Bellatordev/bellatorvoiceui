
import React from 'react';
import { Mic, MicOff, Volume2, Volume1, VolumeX, MessageSquare } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import DarkModeToggle from './DarkModeToggle';

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
  isDarkMode: boolean;
  toggleDarkMode: () => void;
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
  isDarkMode,
  toggleDarkMode,
}) => {
  // Function to handle the tap-to-speak button click
  const handleTapToSpeakClick = () => {
    // If microphone is muted, unmute it first
    if (isMicMuted) {
      onMicMuteToggle();
    }
    
    // Then toggle listening state
    if (isListening) {
      onStopListening();
    } else {
      onListen();
    }
  };
  
  return (
    <div className="flex flex-col items-center space-y-8 w-full max-w-md mx-auto">
      {/* Dark mode toggle */}
      <div className="self-end mb-4">
        <DarkModeToggle
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
        />
      </div>

      <div className="relative w-64 h-64 flex items-center justify-center">
        {/* Animated gradient background - made perfectly circular and smoother animation */}
        <div 
          className={cn(
            "absolute w-full h-full rounded-full overflow-hidden",
            isListening ? "animate-pulse" : ""
          )}
        >
          <div 
            className={cn(
              "absolute inset-0 rounded-full",
              isListening ? "animate-gradient-shift" : "",
              "dark:bg-gradient-premium-dark bg-gradient-premium-light"
            )}
            style={{
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
              background: "radial-gradient(circle, transparent 30%, var(--gradient-center-color) 70%)",
              mixBlendMode: "overlay"
            }}
          />
        </div>
        
        {/* Center white pill with status text */}
        <div 
          className="relative z-10 px-6 py-3 bg-white/90 dark:bg-gray-900/90 rounded-full shadow-md cursor-pointer transition-all duration-300 hover:bg-white/100 dark:hover:bg-gray-900/100 hover:shadow-lg font-playfair"
          onClick={handleTapToSpeakClick}
        >
          <span className="text-gray-800 dark:text-gray-100 font-medium">
            {isListening ? "Listening" : "Tap to speak"}
          </span>
        </div>

        {/* Circular button for toggling microphone mute */}
        <Button
          onClick={onMicMuteToggle}
          className={cn(
            "absolute bottom-0 right-0 z-20 rounded-full w-12 h-12 flex items-center justify-center transition-colors duration-300",
            isMicMuted 
              ? "bg-red-500 text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700" 
              : "bg-white/80 text-gray-800 hover:bg-white/90 dark:bg-gray-800/80 dark:text-gray-100 dark:hover:bg-gray-800/90 border border-gray-200 dark:border-gray-700"
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
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus-ring"
            aria-label={isMuted ? "Unmute speaker" : "Mute speaker"}
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            ) : volume < 0.5 ? (
              <Volume1 className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            ) : (
              <Volume2 className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            )}
          </button>
          
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-agent-primary dark:[&::-webkit-slider-thumb]:bg-premium-accent"
            disabled={isMuted}
          />
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onSwitchToText}
          className="flex items-center gap-2 font-playfair dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
        >
          <MessageSquare className="w-4 h-4" />
          Type instead
        </Button>
      </div>
    </div>
  );
};

export default VoiceControls;
