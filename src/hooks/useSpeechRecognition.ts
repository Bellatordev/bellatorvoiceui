
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
  active?: boolean;
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
  active = true,
  onFinalTranscript
}: UseSpeechRecognitionOptions): UseSpeechRecognitionReturn => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const hasRequestedMicPermission = useRef(false);
  const hasAttemptedSpeechRecognition = useRef(false);
  const pauseTimeoutRef = useRef<number | null>(null);
  const isInitializedRef = useRef(false);
  
  const handleSpeechPause = useCallback((finalText: string) => {
    if (finalText.trim() && onFinalTranscript && active) {
      console.log('Final transcript detected:', finalText);
      onFinalTranscript(finalText);
      setTranscript("");
    }
  }, [onFinalTranscript, active]);

  // Define the requestMicrophonePermission function before it's used
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

  // Define startListening before it's used in useEffect
  const startListening = async () => {
    if (isPlaying || isGenerating || isMicMuted || !active) {
      console.log('Cannot start listening: audio is active, mic is muted, or conversation is inactive');
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

  // Define stopListening before it's used in useEffect
  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      console.log('Explicitly stopping speech recognition');
      recognitionRef.current.stop();
    }
    
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
      pauseTimeoutRef.current = null;
    }
  }, [isListening]);

  // Define toggleListening before it's used in useEffect
  const toggleListening = async () => {
    if (isMicMuted || !active) {
      console.log('Microphone is muted or conversation is inactive, cannot toggle listening');
      return;
    }
    
    if (isListening) {
      stopListening();
    } else {
      await startListening();
    }
  };

  // Stop listening if active state changes to false
  useEffect(() => {
    if (!active && isListening && recognitionRef.current) {
      console.log('Conversation inactive, stopping speech recognition');
      recognitionRef.current.abort();
      setIsListening(false);
      setTranscript("");
    }
  }, [active, isListening]);

  // Initialize speech recognition once
  useEffect(() => {
    // Only initialize if active and not already initialized
    if (!active || isInitializedRef.current) return;
    
    console.log('Initializing speech recognition...');
    isInitializedRef.current = true;
    
    const initializeSpeechRecognition = async () => {
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
            
            if (transcript.trim() && onFinalTranscript && active) {
              handleSpeechPause(transcript);
            }
            
            // Only auto-restart if the conversation is active and not manually stopped
            if (autoStartMic && !isMicMuted && !isPlaying && !isGenerating && active) {
              if (!hasAttemptedSpeechRecognition.current) {
                hasAttemptedSpeechRecognition.current = true;
                setTimeout(() => {
                  console.log('Attempting to restart speech recognition');
                  try {
                    if (active && recognitionRef.current) {
                      recognitionRef.current.start();
                    }
                  } catch (e) {
                    console.error('Failed to restart speech recognition:', e);
                  }
                  setTimeout(() => {
                    hasAttemptedSpeechRecognition.current = false;
                  }, 5000);
                }, 1000);
              }
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
                
                if (recognitionRef.current && isListening && !isMicMuted && active) {
                  try {
                    recognitionRef.current.stop();
                    setTimeout(() => {
                      if (recognitionRef.current && !isMicMuted && !isPlaying && !isGenerating && active) {
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
          
          // Auto-start mic if needed and conversation is active
          if (autoStartMic && !isMicMuted && !isPlaying && !isGenerating && active) {
            // Now we can safely use startListening because it's defined above
            setTimeout(() => {
              startListening();
            }, 1000);
          }
          
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
        console.log('Cleaning up speech recognition on unmount');
        recognitionRef.current.abort();
      }
      
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
        pauseTimeoutRef.current = null;
      }
    };
  }, [active, autoStartMic, isMicMuted, isPlaying, isGenerating, handleSpeechPause, transcript]);

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    toggleListening
  };
};

export default useSpeechRecognition;
