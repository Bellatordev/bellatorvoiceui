
import React from 'react';
import { Mic, MicOff, Volume2, Volume1, VolumeX } from 'lucide-react';
import WaveformVisualizer from './WaveformVisualizer';

type VoiceControlsProps = {
  isListening: boolean;
  isMuted: boolean;
  volume: number;
  onListen: () => void;
  onStopListening: () => void;
  onMuteToggle: () => void;
  onVolumeChange: (value: number) => void;
};

const VoiceControls: React.FC<VoiceControlsProps> = ({
  isListening,
  isMuted,
  volume,
  onListen,
  onStopListening,
  onMuteToggle,
  onVolumeChange,
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
        >
          {isListening ? (
            <MicOff className="w-8 h-8" />
          ) : (
            <Mic className="w-8 h-8" />
          )}
        </button>
        
        {/* Pulsing background effect when listening */}
        {isListening && (
          <div className="absolute inset-0 rounded-full bg-agent-primary/10 animate-breathe" />
        )}
      </div>

      <WaveformVisualizer isListening={isListening} className="h-12" />
      
      <div className="flex items-center space-x-4 mt-6">
        <button
          onClick={onMuteToggle}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors focus-ring"
          aria-label={isMuted ? "Unmute" : "Mute"}
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
    </div>
  );
};

export default VoiceControls;
