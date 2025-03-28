
import React from 'react';

interface TranscriptDisplayProps {
  transcript: string;
  isMicMuted: boolean;
  isListening: boolean;
  isGeneratingVoice: boolean;
  inputMode?: 'voice' | 'text';
}

const TranscriptDisplay: React.FC<TranscriptDisplayProps> = ({
  transcript,
  isMicMuted,
  isListening,
  isGeneratingVoice,
  inputMode = 'voice'
}) => {
  let displayMessage = '';
  
  if (inputMode === 'text') {
    displayMessage = 'Type your message below';
  } else if (isGeneratingVoice) {
    displayMessage = 'Voice generation in progress...';
  } else if (isMicMuted) {
    displayMessage = 'Microphone is muted';
  } else if (isListening && transcript) {
    displayMessage = transcript;
  } else if (isListening) {
    displayMessage = 'Listening...';
  } else {
    displayMessage = 'Tap to speak';
  }

  return (
    <div className="py-3 px-4 text-foreground border-t border-border text-center bg-muted/20">
      {displayMessage}
    </div>
  );
};

export default TranscriptDisplay;
