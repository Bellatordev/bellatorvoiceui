
import { useState, useRef, useCallback } from 'react';

interface UseRecognitionStateReturn {
  isListening: boolean;
  transcript: string;
  setIsListening: (isListening: boolean) => void;
  setTranscript: (transcript: string) => void;
  handleSpeechPause: (finalText: string) => void;
  pauseTimeoutRef: React.MutableRefObject<number | null>;
  recognitionRef: React.MutableRefObject<SpeechRecognition | null>;
  hasRequestedMicPermission: React.MutableRefObject<boolean>;
  hasAttemptedSpeechRecognition: React.MutableRefObject<boolean>;
  lastPlaybackEndTime: React.MutableRefObject<number>;
}

export const useRecognitionState = (
  onFinalTranscript?: (text: string) => void
): UseRecognitionStateReturn => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const hasRequestedMicPermission = useRef(false);
  const hasAttemptedSpeechRecognition = useRef(false);
  const pauseTimeoutRef = useRef<number | null>(null);
  const lastPlaybackEndTime = useRef<number>(0);
  
  const handleSpeechPause = useCallback((finalText: string) => {
    if (finalText.trim() && onFinalTranscript) {
      console.log('Final transcript detected:', finalText);
      
      // Make sure we're passing a string, not an object
      const cleanText = typeof finalText === 'string' ? finalText : '';
      
      if (cleanText) {
        onFinalTranscript(cleanText);
        setTranscript("");
      }
    }
  }, [onFinalTranscript]);
  
  return {
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
  };
};
