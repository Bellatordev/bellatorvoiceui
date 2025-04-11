
import React from 'react';
import { Play, Pause, Loader2, Music } from 'lucide-react';

interface AudioVisualizerProps {
  isPlaying: boolean;
  isGenerating: boolean;
  onTogglePlayback: (e: React.MouseEvent) => void;
  className?: string;
  hasAttachedAudio?: boolean;
  showCompactUI?: boolean;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  isPlaying,
  isGenerating,
  onTogglePlayback,
  className = '',
  hasAttachedAudio = false,
  showCompactUI = false,
}) => {
  const handleClick = (e: React.MouseEvent) => {
    // Ensure the event doesn't bubble up to parent elements
    e.preventDefault();
    e.stopPropagation();
    onTogglePlayback(e);
  };

  if (showCompactUI) {
    return (
      <button
        onClick={handleClick}
        disabled={isGenerating}
        className={`p-2 rounded-full ${isPlaying ? 'bg-agent-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} transition-colors focus-ring ${className}`}
        aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
        type="button"
      >
        {isGenerating ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isPlaying ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4" />
        )}
      </button>
    );
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <button
        onClick={handleClick}
        disabled={isGenerating}
        className={`p-2 rounded-full transition-colors focus-ring ${
          isPlaying 
            ? 'bg-agent-primary text-white' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        } ${hasAttachedAudio ? 'border border-blue-300' : ''}`}
        aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
        type="button" // Explicitly set type to prevent form submission
      >
        {isGenerating ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isPlaying ? (
          <Pause className="w-4 h-4" />
        ) : hasAttachedAudio ? (
          <Music className="w-4 h-4" />
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
      
      {!isPlaying && !isGenerating && hasAttachedAudio && (
        <span className="text-xs text-blue-500">Audio available</span>
      )}
    </div>
  );
};

export default AudioVisualizer;
