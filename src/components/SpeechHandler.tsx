
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

  useEffect(() => {
    if (isGenerating || isPlaying) {
      stopListening();
    } else if (autoStartMic && !isListening && !isGenerating && !isPlaying && !isMicMuted && inputMode === 'voice') {
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
