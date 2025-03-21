
import { useState, useEffect, useRef } from 'react';
import { toast } from '@/components/ui/use-toast';
import { isSpeechRecognitionSupported, createSpeechRecognitionInstance } from '@/utils/speechRecognitionUtils';
import { useMicrophonePermission } from './useMicrophonePermission';
import { useTranscriptionHandler } from './useTranscriptionHandler';
import { useSpeechRecognitionError } from './useSpeechRecognitionError';

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
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isListeningRef = useRef<boolean>(false);

  // Initialize microphone permission handling
  const { hasMicrophonePermission, setHasMicrophonePermission } = useMicrophonePermission(isListening);

  // Initialize transcription handler
  const { handleTranscriptionResult } = useTranscriptionHandler({
    onTranscript,
    onFinalTranscript: (text) => {
      onFinalTranscript?.(text);
      setTranscript('');
    }
  });

  // Initialize error handler
  const { handleRecognitionError } = useSpeechRecognitionError({
    setHasMicrophonePermission
  });

  // Check for browser support first
  useEffect(() => {
    if (!isSpeechRecognitionSupported()) {
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

  // Initialize speech recognition
  useEffect(() => {
    // Skip if speech recognition is not supported
    if (!isRecognitionSupported) return;
    
    // Create recognition instance
    const recognitionInstance = createSpeechRecognitionInstance();
    if (!recognitionInstance) {
      setIsRecognitionSupported(false);
      return;
    }
    
    // Set up event handlers
    recognitionInstance.onresult = handleTranscriptionResult;
    recognitionInstance.onerror = handleRecognitionError;
    
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
  }, [isRecognitionSupported, isMicMuted, handleTranscriptionResult, handleRecognitionError]);

  // Start/stop recognition based on listening state and mic mute state
  useEffect(() => {
    console.log(`Speech recognition status update - isListening: ${isListening}, isMicMuted: ${isMicMuted}, hasMic: ${hasMicrophonePermission}`);
    
    // Store current listening state in ref for the onend handler
    isListeningRef.current = isListening;
    
    // Don't proceed if recognition not supported
    if (!recognitionRef.current || !isRecognitionSupported) {
      console.log('Cannot update speech recognition - not initialized or not supported');
      return;
    }
    
    // We should be listening if isListening is true and the mic is not muted
    const shouldBeListening = isListening && !isMicMuted;
    
    if (shouldBeListening) {
      // Don't try to start if we know we don't have permission
      if (hasMicrophonePermission === false) {
        console.log('Not starting speech recognition - no microphone permission');
        return;
      }
      
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
