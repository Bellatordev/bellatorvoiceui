
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
  resetRecognition: () => void;
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
  const lastPlaybackEndTime = useRef<number>(0);
  
  const handleSpeechPause = useCallback((finalText: string) => {
    if (finalText.trim() && onFinalTranscript) {
      console.log('Final transcript detected:', finalText);
      onFinalTranscript(finalText);
      setTranscript("");
    }
  }, [onFinalTranscript]);

  // Effect to handle mic mute state changes
  useEffect(() => {
    if (isMicMuted && isListening && recognitionRef.current) {
      console.log('Stopping speech recognition because microphone is now muted');
      recognitionRef.current.abort(); // Use abort instead of stop for immediate termination
      setIsListening(false);
    }
  }, [isMicMuted, isListening]);

  // Effect to track when audio playback ends
  useEffect(() => {
    if (!isPlaying && !isGenerating) {
      lastPlaybackEndTime.current = Date.now();
    }
  }, [isPlaying, isGenerating]);

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
            
            // Only auto-restart if sufficient time has passed since audio playback ended
            // to avoid picking up the end of audio
            const timeSincePlaybackEnded = Date.now() - lastPlaybackEndTime.current;
            const shouldAutoStart = autoStartMic && !isMicMuted && !hasAttemptedSpeechRecognition.current && 
                                    !isPlaying && !isGenerating && timeSincePlaybackEnded > 1500;
            
            if (shouldAutoStart) {
              hasAttemptedSpeechRecognition.current = true;
              setTimeout(() => {
                console.log('Attempting to restart speech recognition');
                try {
                  if (!isMicMuted && !isPlaying && !isGenerating) { // Additional checks before restarting
                    recognition.start();
                  }
                } catch (e) {
                  console.error('Failed to restart speech recognition:', e);
                }
                setTimeout(() => {
                  hasAttemptedSpeechRecognition.current = false;
                }, 5000);
              }, 1500); // Increased delay to avoid picking up system sounds
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
                
                if (recognitionRef.current && isListening && !isMicMuted) {
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
        recognitionRef.current.abort(); // Use abort for cleanup
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
    
    await requestMicrophonePermission();
    
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
