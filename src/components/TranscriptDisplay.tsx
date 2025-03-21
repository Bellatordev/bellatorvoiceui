
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
  if (!transcript || isMicMuted || !isListening) {
    return null;
  }

  return (
    <div className="px-4 py-2 mb-4 bg-agent-secondary/10 rounded-lg text-gray-600 italic">
      Listening: {transcript}
    </div>
  );
};

export default TranscriptDisplay;
