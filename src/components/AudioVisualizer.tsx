
import React from 'react';
import { Play, Pause, Loader2 } from 'lucide-react';

interface AudioVisualizerProps {
  isPlaying: boolean;
  isGenerating: boolean;
  onTogglePlayback: () => void;
  className?: string;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  isPlaying,
  isGenerating,
  onTogglePlayback,
  className = '',
}) => {
  const handleClick = (e: React.MouseEvent) => {
    // Ensure the event doesn't bubble up to parent elements
    e.preventDefault();
    e.stopPropagation();
    onTogglePlayback();
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <button
        onClick={handleClick}
        disabled={isGenerating}
        className={`p-2 rounded-full transition-colors focus-ring ${
          isPlaying 
            ? 'bg-agent-primary text-white' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
        aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
        type="button" // Explicitly set type to prevent form submission
      >
        {isGenerating ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isPlaying ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4" />
        )}
      </button>
      
      {isPlaying && (
        <div className="flex items-end space-x-1">
          <div className="w-1 h-3 bg-agent-primary rounded-full animate-sound-wave-1" />
          <div className="w-1 h-5 bg-agent-primary rounded-full animate-sound-wave-2" />
          <div className="w-1 h-7 bg-agent-primary rounded-full animate-sound-wave-3" />
          <div className="w-1 h-5 bg-agent-primary rounded-full animate-sound-wave-2" />
          <div className="w-1 h-3 bg-agent-primary rounded-full animate-sound-wave-1" />
        </div>
      )}
      
      {isGenerating && (
        <span className="text-xs text-gray-500">Generating audio...</span>
      )}
    </div>
  );
};

export default AudioVisualizer;
