
import React from 'react';
import { Mic, MicOff, Volume2, Volume1, VolumeX, MessageSquare } from 'lucide-react';
import WaveformVisualizer from './WaveformVisualizer';
import { Button } from './ui/button';

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
  return (
    <div className="flex flex-col items-center space-y-8 w-full max-w-md mx-auto">
      <div className="relative">
        <button
          className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 focus-ring ${
            isListening
              ? 'bg-agent-primary text-white shadow-lg shadow-agent-primary/20'
              : 'bg-white text-agent-primary border border-agent-primary/20 hover:bg-agent-primary/5'
          }`}
          onClick={isListening ? onStopListening : onListen}
          aria-label={isListening ? "Stop listening" : "Start listening"}
          disabled={isMicMuted}
        >
          {isListening ? (
            <Mic className="w-8 h-8 animate-pulse" />
          ) : (
            <Mic className="w-8 h-8" />
          )}
        </button>
        
        {/* Pulsing background effect when listening */}
        {isListening && (
          <div className="absolute inset-0 rounded-full bg-agent-primary/10 animate-breathe" />
        )}
      </div>

      {/* Microphone Mute Button */}
      <button
        onClick={onMicMuteToggle}
        className={`p-4 rounded-full transition-colors focus-ring ${
          isMicMuted 
            ? 'bg-red-500 text-white hover:bg-red-600' 
            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
        }`}
        aria-label={isMicMuted ? "Unmute microphone" : "Mute microphone"}
      >
        {isMicMuted ? (
          <MicOff className="w-6 h-6" />
        ) : (
          <Mic className="w-6 h-6" />
        )}
      </button>

      <WaveformVisualizer isListening={isListening && !isMicMuted} className="h-12" />
      
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
