
import React from 'react';

interface TranscriptDisplayProps {
  transcript: string;
  isMicMuted: boolean;
  isListening: boolean;
}

const TranscriptDisplay: React.FC<TranscriptDisplayProps> = ({ 
  transcript, 
  isMicMuted, 
  isListening 
}) => {
  // Show a different message when mic is muted
  if (isMicMuted) {
    return (
      <div className="px-4 py-2 mb-4 bg-red-100 rounded-lg text-gray-600 italic">
        Tap to speak
      </div>
    );
  }
  
  // Show active listening status when applicable
  if (!transcript && isListening) {
    return (
      <div className="px-4 py-2 mb-4 bg-agent-secondary/10 rounded-lg text-gray-600 italic">
        Listening... (waiting for speech)
      </div>
    );
  }
  
  // Show transcript when available
  if (transcript && isListening) {
    return (
      <div className="px-4 py-2 mb-4 bg-agent-secondary/10 rounded-lg text-gray-600 italic">
        <div className="flex items-center">
          <span className="flex-1">Listening: {transcript}</span>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse ml-2" 
               title="Recording in progress"></div>
        </div>
      </div>
    );
  }
  
  // Don't show anything when not listening and no transcript
  return null;
};

export default TranscriptDisplay;
