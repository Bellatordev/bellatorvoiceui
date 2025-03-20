
import { useState, useEffect, useCallback } from 'react';

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

  // Initialize speech recognition on mount
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.error('Speech recognition not supported in this browser');
      setIsRecognitionSupported(false);
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
        }
      };
      
      setRecognition(recognitionInstance);
    } catch (error) {
      console.error('Error initializing speech recognition:', error);
      setIsRecognitionSupported(false);
    }
  }, [onTranscript, onFinalTranscript]);

  // Start/stop recognition based on listening state and mic mute state
  useEffect(() => {
    if (!recognition) return;
    
    const shouldBeListening = isListening && !isMicMuted;
    
    if (shouldBeListening) {
      try {
        recognition.start();
        console.log('Speech recognition started');
      } catch (error) {
        // If it's already running, restart it
        recognition.stop();
        setTimeout(() => {
          if (isListening && !isMicMuted) { // Double-check state before restarting
            recognition.start();
            console.log('Speech recognition restarted');
          }
        }, 100);
      }
    } else {
      try {
        recognition.stop();
        console.log('Speech recognition stopped');
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
      }
    }
    
    return () => {
      try {
        recognition.stop();
      } catch (error) {
        // Ignore errors when stopping during cleanup
      }
    };
  }, [isListening, isMicMuted, recognition]);

  return { transcript, isRecognitionSupported };
};

export default useSpeechRecognition;
