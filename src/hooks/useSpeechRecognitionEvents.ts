
import { useEffect } from 'react';
import { createSpeechRecognition, handleRecognitionError } from '@/utils/speechRecognitionUtils';

interface UseSpeechRecognitionEventsProps {
  recognitionRef: React.MutableRefObject<SpeechRecognition | null>;
  setIsListening: (isListening: boolean) => void;
  setTranscript: (transcript: string) => void;
  handleSpeechPause: (finalText: string) => void;
  pauseTimeoutRef: React.MutableRefObject<number | null>;
  isMicMuted: boolean;
  isPlaying: boolean;
  isGenerating: boolean;
}

export const useSpeechRecognitionEvents = ({
  recognitionRef,
  setIsListening,
  setTranscript,
  handleSpeechPause,
  pauseTimeoutRef,
  isMicMuted,
  isPlaying,
  isGenerating
}: UseSpeechRecognitionEventsProps): void => {
  useEffect(() => {
    const recognition = createSpeechRecognition();
    if (!recognition) return;
    
    recognition.onstart = () => {
      console.log('Speech recognition started');
      setIsListening(true);
    };
    
    recognition.onend = () => {
      console.log('Speech recognition stopped');
      setIsListening(false);
      
      // Handle any remaining transcript when recognition ends
      const currentTranscript = recognitionRef.current ? recognitionRef.current.toString() : '';
      if (currentTranscript.trim() && handleSpeechPause) {
        handleSpeechPause(currentTranscript);
      }
    };
    
    recognition.onresult = (event) => {
      const last = event.results.length - 1;
      const result = event.results[last];
      const text = result[0].transcript;
      
      // Filter out very short or likely noise inputs
      if (text.trim().length < 2) {
        console.log('Ignoring very short input that might be noise');
        return;
      }
      
      setTranscript(text);
      
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
        pauseTimeoutRef.current = null;
      }
      
      if (result.isFinal) {
        // Longer pause detection for final results to ensure the user has finished speaking
        pauseTimeoutRef.current = window.setTimeout(() => {
          handleSpeechPause(text);
          
          if (recognitionRef.current && !isMicMuted && !isPlaying && !isGenerating) {
            try {
              recognitionRef.current.stop();
              setTimeout(() => {
                if (recognitionRef.current && !isMicMuted && !isPlaying && !isGenerating) {
                  recognitionRef.current.start();
                }
              }, 800); // Longer delay before restarting
            } catch (e) {
              console.error('Error restarting recognition after final result:', e);
            }
          }
        }, 1500); // Longer pause detection (1.5 seconds)
      } else {
        // Wait for natural pause in speech
        pauseTimeoutRef.current = window.setTimeout(() => {
          handleSpeechPause(text);
        }, 2500); // Even longer pause for interim results (2.5 seconds)
      }
    };
    
    recognition.onerror = (event) => {
      handleRecognitionError(event.error);
      setIsListening(false);
    };
    
    recognitionRef.current = recognition;
    
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (error) {
          console.error('Error cleaning up speech recognition:', error);
        }
      }
      
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
        pauseTimeoutRef.current = null;
      }
    };
  }, [
    recognitionRef,
    setIsListening,
    setTranscript,
    handleSpeechPause,
    pauseTimeoutRef,
    isMicMuted,
    isPlaying,
    isGenerating
  ]);
};
