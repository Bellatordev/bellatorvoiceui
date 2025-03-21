
import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';
import { 
  checkMicrophonePermission, 
  requestMicrophoneAccess as requestAccess,
  showMicrophonePermissionError,
  PermissionStateType
} from '@/utils/microphonePermissions';
import {
  createSpeechRecognition,
  safelyStartRecognition,
  safelyStopRecognition
} from '@/utils/speechRecognitionManager';

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
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [permissionState, setPermissionState] = useState<PermissionStateType>(null);

  // Check for microphone permissions
  useEffect(() => {
    const initPermissions = async () => {
      const permission = await checkMicrophonePermission();
      setPermissionState(permission);
      
      // Set up permission change listener if available
      if (navigator.permissions) {
        try {
          const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
          permissionStatus.onchange = () => {
            console.log('Permission status changed to:', permissionStatus.state);
            setPermissionState(permissionStatus.state);
            
            if (permissionStatus.state === 'granted') {
              console.log('Microphone permission granted');
              initializeRecognition();
            } else if (permissionStatus.state === 'denied') {
              console.log('Microphone permission denied');
              toast({
                title: "Microphone Access Denied",
                description: "Please enable microphone access in your browser settings to use voice features.",
                variant: "destructive",
              });
            }
          };
        } catch (err) {
          console.error('Error setting up permission listener:', err);
        }
      }
    };
    
    initPermissions();
  }, []);

  // Initialize speech recognition
  const initializeRecognition = useCallback(() => {
    const recognitionInstance = createSpeechRecognition();
    
    if (!recognitionInstance) {
      setIsRecognitionSupported(false);
      toast({
        title: "Speech Recognition Unavailable",
        description: "Your browser doesn't support speech recognition. Try using Chrome, Edge, or Safari.",
        variant: "destructive",
      });
      return;
    }

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
      console.error('Speech recognition error', event.error);
      if (event.error === 'not-allowed') {
        setPermissionState('denied');
      }
      showMicrophonePermissionError(event.error);
    };
    
    setRecognition(recognitionInstance);
  }, [onTranscript, onFinalTranscript]);

  // Initialize recognition on mount
  useEffect(() => {
    initializeRecognition();
  }, [initializeRecognition]);

  // Wrapper for the external request microphone access function
  const requestMicrophoneAccess = useCallback(async () => {
    const success = await requestAccess();
    if (success) {
      setPermissionState('granted');
    } else {
      setPermissionState('denied');
    }
    return success;
  }, []);

  // Request microphone access explicitly when user attempts to listen
  useEffect(() => {
    if (isListening && !isMicMuted) {
      // Always request permission explicitly when starting to listen
      requestMicrophoneAccess().then(success => {
        if (success && recognition) {
          try {
            safelyStartRecognition(recognition);
            console.log('Speech recognition started after explicit permission request');
          } catch (err) {
            console.error('Failed to start recognition after permission:', err);
          }
        }
      });
    }
  }, [isListening, isMicMuted, requestMicrophoneAccess, recognition]);

  // Start/stop recognition based on listening state and mic mute state
  useEffect(() => {
    if (!recognition) return;
    
    const shouldBeListening = isListening && !isMicMuted && permissionState !== 'denied';
    
    if (shouldBeListening) {
      safelyStartRecognition(recognition);
    } else {
      safelyStopRecognition(recognition);
      
      // Clear transcript when stopping
      setTranscript('');
      onTranscript?.('');
    }
    
    return () => {
      safelyStopRecognition(recognition);
    };
  }, [isListening, isMicMuted, recognition, onTranscript, permissionState]);

  return { 
    transcript, 
    isRecognitionSupported,
    permissionState,
    requestMicrophoneAccess 
  };
};

export default useSpeechRecognition;
