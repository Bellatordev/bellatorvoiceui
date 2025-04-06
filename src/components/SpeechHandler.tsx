
import React, { useEffect } from 'react';
import useSpeechRecognition from '@/hooks/useSpeechRecognition';

interface SpeechHandlerProps {
  autoStartMic: boolean;
  isMicMuted: boolean;
  isPlaying: boolean;
  isGenerating: boolean;
  inputMode: 'voice' | 'text';
  onFinalTranscript: (text: string) => void;
  children: (props: {
    isListening: boolean;
    transcript: string;
    startListening: () => Promise<void>;
    stopListening: () => void;
    toggleListening: () => Promise<void>;
  }) => React.ReactNode;
}

const SpeechHandler: React.FC<SpeechHandlerProps> = ({
  autoStartMic,
  isMicMuted,
  isPlaying,
  isGenerating,
  inputMode,
  onFinalTranscript,
  children,
}) => {
  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    toggleListening
  } = useSpeechRecognition({
    autoStartMic,
    isMicMuted,
    isPlaying,
    isGenerating,
    onFinalTranscript
  });

  // This effect ensures that we stop the microphone when voice generation
  // starts or when the mic is muted
  useEffect(() => {
    if (isGenerating || isPlaying) {
      // Stop listening immediately when audio is playing or generating
      stopListening();
    } else if (isMicMuted && isListening) {
      // Stop listening when the mic is muted
      stopListening();
    } else if (autoStartMic && !isListening && !isGenerating && !isPlaying && !isMicMuted && inputMode === 'voice') {
      // Only auto-start the mic after audio stops, with a small delay
      console.log('Auto-starting microphone after audio playback complete');
      const timer = setTimeout(() => {
        startListening();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [isGenerating, isPlaying, isListening, autoStartMic, isMicMuted, inputMode, startListening, stopListening]);

  return <>{children({ isListening, transcript, startListening, stopListening, toggleListening })}</>;
};

export default SpeechHandler;
