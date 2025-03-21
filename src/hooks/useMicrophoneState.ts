
import { useState, useCallback, useEffect } from 'react';
import useSpeechRecognition from './useSpeechRecognition';
import { toast } from '@/components/ui/use-toast';

interface UseMicrophoneStateProps {
  onTranscriptComplete: (text: string) => void;
}

export const useMicrophoneState = ({ onTranscriptComplete }: UseMicrophoneStateProps) => {
  const [isListening, setIsListening] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  
  const { 
    transcript, 
    isRecognitionSupported, 
    permissionState: microphonePermission,
    requestMicrophoneAccess
  } = useSpeechRecognition({
    isListening,
    isMicMuted,
    onTranscript: (text) => {
      setCurrentTranscript(text);
    },
    onFinalTranscript: (text) => {
      if (text.trim()) {
        console.log('Sending final transcript:', text);
        onTranscriptComplete(text);
        setIsListening(false);
      }
      setCurrentTranscript('');
    }
  });

  useEffect(() => {
    if (!isRecognitionSupported) {
      toast({
        title: "Speech Recognition Unavailable",
        description: "Your browser doesn't support speech recognition. Try Chrome, Edge, or Safari.",
        variant: "destructive",
      });
    }
  }, [isRecognitionSupported]);

  const handleListenStart = useCallback(() => {
    if (microphonePermission !== 'denied') {
      setIsListening(true);
    } else if (requestMicrophoneAccess) {
      // Use the explicit request function from useSpeechRecognition
      requestMicrophoneAccess().then(success => {
        if (success) {
          setIsListening(true);
        }
      });
    } else {
      // Fallback to old method if requestMicrophoneAccess is not available
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(() => {
          setIsListening(true);
        })
        .catch(err => {
          console.error('Failed to get microphone permission:', err);
          toast({
            title: "Microphone Access Required",
            description: "Please enable microphone access in your browser settings.",
            variant: "destructive",
          });
        });
    }
  }, [microphonePermission, requestMicrophoneAccess]);

  const handleListenStop = useCallback(async (duration: number) => {
    setIsListening(false);
    if (duration < 1) return;
  }, []);

  const toggleMic = useCallback(() => {
    const newMutedState = !isMicMuted;
    setIsMicMuted(newMutedState);
    
    if (newMutedState && isListening) {
      console.log('Stopping listening because mic was muted');
      setIsListening(false);
      setCurrentTranscript('');
    }
  }, [isMicMuted, isListening]);

  return {
    isListening,
    setIsListening,
    isMicMuted,
    setIsMicMuted,
    currentTranscript,
    microphonePermission,
    requestMicrophoneAccess,
    handleListenStart,
    handleListenStop,
    toggleMic
  };
};

export default useMicrophoneState;
