
import React from 'react';
import { Volume2, Volume1, VolumeX, MessageSquare } from 'lucide-react';
import { Button } from './ui/button';
import { AIVoiceInput } from './ui/ai-voice-input';

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
      {/* New AI Voice Input UI */}
      <div className="w-full">
        <AIVoiceInput 
          onStart={onListen}
          onStop={(duration) => {
            console.log(`Recording stopped after ${duration} seconds`);
            onStopListening();
          }}
          demoMode={false}
        />
      </div>

      {/* Microphone Mute Button */}
      <Button
        onClick={onMicMuteToggle}
        className={`px-6 py-2 rounded-full transition-colors focus-ring ${
          isMicMuted 
            ? 'bg-red-500 text-white hover:bg-red-600' 
            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
        }`}
        aria-label={isMicMuted ? "Unmute microphone" : "Mute microphone"}
        variant={isMicMuted ? "destructive" : "outline"}
      >
        {isMicMuted ? "Unmute" : "Mute"}
      </Button>
      
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
