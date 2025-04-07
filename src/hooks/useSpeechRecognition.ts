
import { useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';
import { requestMicrophoneAccess } from '@/utils/microphonePermissions';
import { useRecognitionState } from './useRecognitionState';
import { useSpeechRecognitionEvents } from './useSpeechRecognitionEvents';
import { useMicrophoneState } from './useMicrophoneState';
import { requestMicPermission } from '@/utils/speechRecognitionUtils';

interface UseSpeechRecognitionOptions {
  autoStartMic: boolean;
  isMicMuted: boolean;
  isPlaying: boolean;
  isGenerating: boolean;
  onFinalTranscript?: (text: string) => void;
}

interface UseSpeechRecognitionReturn {
  isListening: boolean;
  transcript: string;
  startListening: () => Promise<void>;
  stopListening: () => void;
  toggleListening: () => Promise<void>;
  resetRecognition: () => void;
}

export const useSpeechRecognition = ({
  autoStartMic,
  isMicMuted,
  isPlaying,
  isGenerating,
  onFinalTranscript
}: UseSpeechRecognitionOptions): UseSpeechRecognitionReturn => {
  const {
    isListening,
    transcript,
    setIsListening,
    setTranscript,
    handleSpeechPause,
    pauseTimeoutRef,
    recognitionRef,
    hasRequestedMicPermission,
    hasAttemptedSpeechRecognition,
    lastPlaybackEndTime,
  } = useRecognitionState(onFinalTranscript);

  // Initialize recognition with event handlers
  useSpeechRecognitionEvents({
    recognitionRef,
    setIsListening,
    setTranscript,
    handleSpeechPause,
    pauseTimeoutRef,
    isMicMuted,
    isPlaying,
    isGenerating
  });

  // Manage microphone state and automatic restarting
  useMicrophoneState({
    isMicMuted,
    isListening,
    isPlaying,
    isGenerating,
    autoStartMic,
    recognitionRef,
    hasRequestedMicPermission,
    hasAttemptedSpeechRecognition,
    lastPlaybackEndTime,
    setIsListening
  });

  const startListening = async () => {
    // Don't start listening if audio is playing or generating
    if (isPlaying || isGenerating || isMicMuted) {
      console.log('Cannot start listening: audio is active or mic is muted');
      return;
    }
    
    // Check if enough time has passed since audio finished playing
    const timeSincePlaybackEnded = Date.now() - lastPlaybackEndTime.current;
    if (timeSincePlaybackEnded < 1000) {
      console.log('Not starting microphone yet - too soon after audio playback');
      return;
    }
    
    if (isListening) return;
    
    if (!recognitionRef.current) {
      console.log('Speech recognition not available, but allowing voice UI');
      return;
    }
    
    await requestMicPermission(hasRequestedMicPermission.current);
    hasRequestedMicPermission.current = true;
    
    try {
      recognitionRef.current.start();
      console.log('Microphone activated');
    } catch (error) {
      console.error('Error starting speech recognition:', error);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      if (isListening) {
        try {
          console.log('Stopping speech recognition');
          recognitionRef.current.stop();
        } catch (e) {
          console.error('Error stopping speech recognition, using abort instead:', e);
          recognitionRef.current.abort();
        }
      }
    }
    
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
      pauseTimeoutRef.current = null;
    }
  };

  const toggleListening = async () => {
    if (isMicMuted) {
      console.log('Microphone is muted, cannot toggle listening');
      return;
    }
    
    if (isListening) {
      stopListening();
    } else {
      await startListening();
    }
  };

  const resetRecognition = () => {
    console.log('Aborting and resetting speech recognition');
    stopListening();
    setTranscript("");
    if (recognitionRef.current) {
      // Use abort() to terminate immediately rather than stop()
      recognitionRef.current.abort();
    }
  };

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    toggleListening,
    resetRecognition
  };
};

export default useSpeechRecognition;
