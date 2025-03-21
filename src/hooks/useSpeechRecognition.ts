import { useState, useRef, useEffect, useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';
import { 
  requestMicrophoneAccess,
  isSpeechRecognitionSupported
} from '@/utils/microphonePermissions';

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
}

export const useSpeechRecognition = ({
  autoStartMic,
  isMicMuted,
  isPlaying,
  isGenerating,
  onFinalTranscript
}: UseSpeechRecognitionOptions): UseSpeechRecognitionReturn => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const hasRequestedMicPermission = useRef(false);
  const hasAttemptedSpeechRecognition = useRef(false);
  const pauseTimeoutRef = useRef<number | null>(null);
  
  const handleSpeechPause = useCallback((finalText: string) => {
    if (finalText.trim() && onFinalTranscript) {
      console.log('Final transcript detected:', finalText);
      onFinalTranscript(finalText);
      setTranscript("");
    }
  }, [onFinalTranscript]);

  useEffect(() => {
    const initializeSpeechRecognition = async () => {
      console.log('Initializing speech recognition...');
      
      try {
        await requestMicrophoneAccess();
      } catch (err) {
        console.error('Error requesting microphone access:', err);
      }
      
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = 'en-US';
          
          recognition.onstart = () => {
            console.log('Speech recognition started');
            setIsListening(true);
          };
          
          recognition.onend = () => {
            console.log('Speech recognition stopped');
            setIsListening(false);
            
            if (transcript.trim() && onFinalTranscript) {
              handleSpeechPause(transcript);
            }
            
            if (autoStartMic && !isMicMuted && !hasAttemptedSpeechRecognition.current) {
              hasAttemptedSpeechRecognition.current = true;
              setTimeout(() => {
                if (!isPlaying && !isGenerating) {
                  console.log('Attempting to restart speech recognition');
                  try {
                    recognition.start();
                  } catch (e) {
                    console.error('Failed to restart speech recognition:', e);
                  }
                  setTimeout(() => {
                    hasAttemptedSpeechRecognition.current = false;
                  }, 5000);
                }
              }, 1000);
            }
          };
          
          recognition.onresult = (event) => {
            const last = event.results.length - 1;
            const result = event.results[last];
            const text = result[0].transcript;
            setTranscript(text);
            
            if (pauseTimeoutRef.current) {
              clearTimeout(pauseTimeoutRef.current);
              pauseTimeoutRef.current = null;
            }
            
            if (result.isFinal) {
              pauseTimeoutRef.current = window.setTimeout(() => {
                handleSpeechPause(text);
                
                if (recognitionRef.current && isListening && !isMicMuted) {
                  try {
                    recognitionRef.current.stop();
                    setTimeout(() => {
                      if (recognitionRef.current && !isMicMuted) {
                        recognitionRef.current.start();
                      }
                    }, 200);
                  } catch (e) {
                    console.error('Error restarting recognition after final result:', e);
                  }
                }
              }, 1000);
            } else {
              pauseTimeoutRef.current = window.setTimeout(() => {
                handleSpeechPause(text);
              }, 2000);
            }
          };
          
          recognition.onerror = (event) => {
            console.error('Speech recognition error', event.error);
            setIsListening(false);
            
            if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
              toast({
                title: "Microphone Note",
                description: "Microphone access is needed for voice input. You can also use text input.",
                variant: "default"
              });
            } else {
              console.log(`Speech recognition error: ${event.error}`);
            }
          };
          
          recognitionRef.current = recognition;
        } catch (error) {
          console.error('Error setting up speech recognition:', error);
        }
      } else {
        console.log('SpeechRecognition not available in this browser');
        toast({
          title: "Browser Support Note",
          description: "Your browser may not fully support speech recognition. Text input is available.",
          variant: "default"
        });
      }
    };
    
    initializeSpeechRecognition();
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
        pauseTimeoutRef.current = null;
      }
    };
  }, [autoStartMic, isMicMuted, isPlaying, isGenerating, transcript, onFinalTranscript, handleSpeechPause]);

  const requestMicrophonePermission = async () => {
    if (hasRequestedMicPermission.current) return true;
    
    try {
      hasRequestedMicPermission.current = true;
      await requestMicrophoneAccess();
      return true;
    } catch (err) {
      console.error('Microphone permission error:', err);
      return true;
    }
  };

  const startListening = async () => {
    if (isPlaying || isGenerating || isMicMuted) {
      console.log('Cannot start listening: audio is active or mic is muted');
      return;
    }
    
    if (isListening) return;
    
    if (!recognitionRef.current) {
      console.log('Speech recognition not available, but allowing voice UI');
      return;
    }
    
    await requestMicrophonePermission();
    
    try {
      recognitionRef.current.start();
      console.log('Microphone activated');
    } catch (error) {
      console.error('Error starting speech recognition:', error);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
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

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    toggleListening
  };
};

export default useSpeechRecognition;
