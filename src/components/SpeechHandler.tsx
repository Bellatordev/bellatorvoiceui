
import React, { useEffect } from 'react';
import useSpeechRecognition from '@/hooks/useSpeechRecognition';

interface SpeechHandlerProps {
  autoStartMic: boolean;
  isMicMuted: boolean;
  isPlaying: boolean;
  isGenerating: boolean;
  inputMode: 'voice' | 'text';
  active?: boolean; // Add active prop
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
  active = true, // Default to true for backward compatibility
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
    active, // Pass active state to hook
    onFinalTranscript
  });

  // Immediately stop listening when active becomes false
  useEffect(() => {
    if (!active && isListening) {
      console.log('Conversation deactivated, immediately stopping microphone');
      stopListening();
    }
  }, [active, isListening, stopListening]);

  // This effect ensures that we stop the microphone when voice generation
  // starts and resume it after completion or stop when inactive
  useEffect(() => {
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
        startListening();
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

  return <>{children({ isListening, transcript, startListening, stopListening, toggleListening })}</>;
};

export default SpeechHandler;
