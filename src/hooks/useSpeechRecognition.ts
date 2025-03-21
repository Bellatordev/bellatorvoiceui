
import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from '@/components/ui/use-toast';

interface UseSpeechRecognitionProps {
  isListening: boolean;
  isMicMuted: boolean;
  onTranscript?: (text: string) => void;
  onFinalTranscript?: (text: string) => void;
}

export const useSpeechRecognition = ({
  isListening,
  isMicMuted,
  onTranscript,
  onFinalTranscript
}: UseSpeechRecognitionProps) => {
  const [transcript, setTranscript] = useState('');
  const [isRecognitionSupported, setIsRecognitionSupported] = useState(true);
  const [hasMicrophonePermission, setHasMicrophonePermission] = useState<boolean | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isListeningRef = useRef<boolean>(false);

  // Check for browser support first
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.error('Speech recognition not supported in this browser');
      setIsRecognitionSupported(false);
      
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser doesn't support speech recognition. Try using Chrome, Edge, or Safari.",
        variant: "destructive",
      });
    } else {
      console.log("Speech recognition is supported by this browser");
    }
  }, []);

  // Check for microphone permissions - but only do this check once
  useEffect(() => {
    // Skip if we've already determined permission status
    if (hasMicrophonePermission !== null) return;

    // Only check permissions if we're in a browser environment with mediaDevices API
    if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
      console.log('Checking microphone permission...');
      
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(() => {
          console.log('Microphone permission granted');
          setHasMicrophonePermission(true);
        })
        .catch((error) => {
          console.error('Microphone permission denied:', error);
          setHasMicrophonePermission(false);
          
          toast({
            title: "Microphone Access Denied",
            description: "Please enable microphone access in your browser settings to use voice features.",
            variant: "destructive",
          });
        });
    }
  }, [hasMicrophonePermission]);

  // Initialize speech recognition
  useEffect(() => {
    // Skip if speech recognition is not supported
    if (!isRecognitionSupported) return;
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.error('Speech recognition not available');
      return;
    }

    try {
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';
      
      recognitionInstance.onresult = (event) => {
        let currentTranscript = '';
        let isFinal = false;
        
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          currentTranscript += event.results[i][0].transcript;
          isFinal = event.results[i].isFinal;
        }
        
        console.log('Speech recognition result:', currentTranscript, isFinal);
        setTranscript(currentTranscript);
        
        // Always call onTranscript with the current transcript for real-time display
        onTranscript?.(currentTranscript);
        
        if (isFinal) {
          console.log('Final transcript:', currentTranscript);
          onFinalTranscript?.(currentTranscript);
          setTranscript('');
        }
      };
      
      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        
        if (event.error === 'not-allowed') {
          console.error('Microphone access denied');
          setHasMicrophonePermission(false);
          
          toast({
            title: "Microphone Access Denied",
            description: "Please enable microphone access in your browser settings to use voice features.",
            variant: "destructive",
          });
        } else if (event.error === 'no-speech') {
          console.log('No speech detected');
          // This is a common error that doesn't indicate a problem
        } else {
          toast({
            title: "Speech Recognition Error",
            description: `Error: ${event.error}. Try refreshing the page.`,
            variant: "destructive",
          });
        }
      };
      
      recognitionInstance.onend = () => {
        console.log('Speech recognition ended');
        
        // If we're still supposed to be listening, restart
        if (isListeningRef.current && !isMicMuted) {
          console.log('Restarting speech recognition because it ended unexpectedly');
          try {
            recognitionInstance.start();
            console.log('Speech recognition restarted');
          } catch (error) {
            console.error('Error restarting speech recognition:', error);
          }
        }
      };
      
      recognitionRef.current = recognitionInstance;
      console.log('Speech recognition initialized');
    } catch (error) {
      console.error('Error initializing speech recognition:', error);
      setIsRecognitionSupported(false);
    }
    
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
          console.log('Speech recognition stopped during cleanup');
        } catch (error) {
          // Ignore errors when stopping during cleanup
        }
      }
    };
  }, [onTranscript, onFinalTranscript, isRecognitionSupported, isMicMuted]);

  // Start/stop recognition based on listening state and mic mute state
  useEffect(() => {
    console.log(`Speech recognition status update - isListening: ${isListening}, isMicMuted: ${isMicMuted}, hasMic: ${hasMicrophonePermission}`);
    
    // Store current listening state in ref for the onend handler
    isListeningRef.current = isListening;
    
    // Don't proceed if recognition not supported or no mic permission
    if (!recognitionRef.current || !isRecognitionSupported) {
      console.log('Cannot update speech recognition - not initialized or not supported');
      return;
    }
    
    const shouldBeListening = isListening && !isMicMuted;
    
    if (shouldBeListening) {
      try {
        console.log('Starting speech recognition');
        recognitionRef.current.start();
        console.log('Speech recognition started successfully');
      } catch (error: any) {
        // Most likely error is "recognition already started"
        console.log('Speech recognition error on start:', error.message);
        
        if (error.message && error.message.includes('already started')) {
          // Already running - this is fine
          console.log('Speech recognition was already running');
        } else {
          // For other errors, try stopping and restarting
          try {
            recognitionRef.current.stop();
            console.log('Stopped existing speech recognition');
            
            setTimeout(() => {
              if (isListening && !isMicMuted && recognitionRef.current) {
                recognitionRef.current.start();
                console.log('Speech recognition restarted after error');
              }
            }, 100);
          } catch (stopError) {
            console.error('Error stopping speech recognition during restart:', stopError);
          }
        }
      }
    } else {
      try {
        if (recognitionRef.current) {
          recognitionRef.current.stop();
          console.log('Speech recognition stopped due to:', isMicMuted ? 'mic muted' : 'listening off');
        }
        
        // Clear transcript when stopping
        setTranscript('');
        onTranscript?.('');
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
      }
    }
  }, [isListening, isMicMuted, hasMicrophonePermission, isRecognitionSupported, onTranscript]);

  return { 
    transcript, 
    isRecognitionSupported, 
    hasMicrophonePermission 
  };
};

export default useSpeechRecognition;
