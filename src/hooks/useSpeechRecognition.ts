
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

  // Check for microphone permissions
  useEffect(() => {
    // Only check permissions if we're in a browser environment
    if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
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
    } else {
      console.error('MediaDevices API not supported in this browser');
      setIsRecognitionSupported(false);
    }
  }, []);

  // Initialize speech recognition on mount
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
        console.error('Speech recognition error', event);
        if (event.error === 'not-allowed') {
          console.error('Microphone access denied');
          setHasMicrophonePermission(false);
          
          toast({
            title: "Microphone Access Denied",
            description: "Please enable microphone access in your browser settings to use voice features.",
            variant: "destructive",
          });
        }
      };
      
      recognitionRef.current = recognitionInstance;
    } catch (error) {
      console.error('Error initializing speech recognition:', error);
      setIsRecognitionSupported(false);
    }
    
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          // Ignore errors when stopping during cleanup
        }
      }
    };
  }, [onTranscript, onFinalTranscript]);

  // Start/stop recognition based on listening state and mic mute state
  useEffect(() => {
    if (!recognitionRef.current || hasMicrophonePermission === false) return;
    
    const shouldBeListening = isListening && !isMicMuted;
    
    if (shouldBeListening) {
      try {
        console.log('Starting speech recognition');
        recognitionRef.current.start();
        console.log('Speech recognition started');
      } catch (error: any) {
        console.log('Speech recognition error on start:', error.message);
        
        // If it's already running, restart it
        try {
          recognitionRef.current.stop();
          setTimeout(() => {
            if (isListening && !isMicMuted && recognitionRef.current) {
              recognitionRef.current.start();
              console.log('Speech recognition restarted');
            }
          }, 100);
        } catch (stopError) {
          console.error('Error stopping speech recognition during restart:', stopError);
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
  }, [isListening, isMicMuted, hasMicrophonePermission, onTranscript]);

  return { 
    transcript, 
    isRecognitionSupported, 
    hasMicrophonePermission 
  };
};

export default useSpeechRecognition;
