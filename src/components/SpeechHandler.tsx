
import React, { useEffect, useCallback, useMemo } from 'react';
import useSpeechRecognition from '@/hooks/useSpeechRecognition';

interface SpeechHandlerProps {
  autoStartMic: boolean;
  isMicMuted: boolean;
  isPlaying: boolean;
  isGenerating: boolean;
  inputMode: 'voice' | 'text';
  active?: boolean;
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
  active = true,
  onFinalTranscript,
  children,
}) => {
  // Memoize speech recognition options to prevent re-renders
  const speechRecognitionOptions = useMemo(() => ({
    autoStartMic,
    isMicMuted,
    isPlaying,
    isGenerating,
    active,
    onFinalTranscript
  }), [autoStartMic, isMicMuted, isPlaying, isGenerating, active, onFinalTranscript]);

  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    toggleListening
  } = useSpeechRecognition(speechRecognitionOptions);

  // Immediately stop listening when active becomes false
  useEffect(() => {
    if (!active && isListening) {
      console.log('Conversation deactivated, immediately stopping microphone');
      stopListening();
    }
  }, [active, isListening, stopListening]);

  // This effect handles microphone state based on audio playback and active state
  useEffect(() => {
    // Only run this effect when the component is active
    if (!active) {
      // If conversation is not active, ensure microphone is stopped
      console.log('Conversation inactive, ensuring microphone is stopped');
      stopListening();
      return;
    }
    
    if (isGenerating || isPlaying) {
      // Stop listening immediately when audio is playing or generating
      stopListening();
    } else if (autoStartMic && !isListening && !isGenerating && !isPlaying && !isMicMuted && inputMode === 'voice' && active) {
      // Only auto-start the mic after audio stops, with a small delay, and if conversation is active
      console.log('Auto-starting microphone after audio playback complete');
      const timer = setTimeout(() => {
        if (active && !isMicMuted && !isGenerating && !isPlaying) {
          startListening();
        }
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [isGenerating, isPlaying, isListening, autoStartMic, isMicMuted, inputMode, startListening, stopListening, active]);

  // Ensure microphone is stopped when component unmounts
  useEffect(() => {
    return () => {
      console.log('SpeechHandler unmounting, stopping microphone');
      stopListening();
    };
  }, [stopListening]);

  // Memoize the props for children to prevent unnecessary re-renders
  const childProps = useMemo(() => ({
    isListening, 
    transcript, 
    startListening, 
    stopListening, 
    toggleListening
  }), [isListening, transcript, startListening, stopListening, toggleListening]);

  return <>{children(childProps)}</>;
};

export default React.memo(SpeechHandler);
