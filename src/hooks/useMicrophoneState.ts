
import { useEffect } from 'react';
import { requestMicPermission } from '@/utils/speechRecognitionUtils';

interface UseMicrophoneStateProps {
  isMicMuted: boolean;
  isListening: boolean;
  isPlaying: boolean;
  isGenerating: boolean;
  autoStartMic: boolean;
  recognitionRef: React.MutableRefObject<SpeechRecognition | null>;
  hasRequestedMicPermission: React.MutableRefObject<boolean>;
  hasAttemptedSpeechRecognition: React.MutableRefObject<boolean>;
  lastPlaybackEndTime: React.MutableRefObject<number>;
  setIsListening: (isListening: boolean) => void;
}

export const useMicrophoneState = ({
  isMicMuted,
  isListening,
  isPlaying,
  isGenerating,
  autoStartMic,
  recognitionRef,
  hasRequestedMicPermission,
  hasAttemptedSpeechRecognition,
  lastPlaybackEndTime,
  setIsListening
}: UseMicrophoneStateProps): void => {
  // Effect to handle mic mute state changes
  useEffect(() => {
    if (isMicMuted && isListening && recognitionRef.current) {
      console.log('Stopping speech recognition because microphone is now muted');
      recognitionRef.current.abort(); // Use abort instead of stop for immediate termination
      setIsListening(false);
    }
  }, [isMicMuted, isListening, recognitionRef, setIsListening]);

  // Effect to track when audio playback ends
  useEffect(() => {
    if (!isPlaying && !isGenerating) {
      lastPlaybackEndTime.current = Date.now();
    }
  }, [isPlaying, isGenerating, lastPlaybackEndTime]);

  // Effect to handle auto-restart of microphone after audio finishes
  useEffect(() => {
    if (!recognitionRef.current) return;
    
    const handleAutoRestart = () => {
      // Only auto-restart if sufficient time has passed since audio playback ended
      const timeSincePlaybackEnded = Date.now() - lastPlaybackEndTime.current;
      const shouldAutoStart = autoStartMic && 
                              !isMicMuted && 
                              !hasAttemptedSpeechRecognition.current && 
                              !isPlaying && 
                              !isGenerating && 
                              timeSincePlaybackEnded > 1500;
      
      if (shouldAutoStart) {
        hasAttemptedSpeechRecognition.current = true;
        
        setTimeout(async () => {
          console.log('Attempting to restart speech recognition');
          try {
            await requestMicPermission(hasRequestedMicPermission.current);
            hasRequestedMicPermission.current = true;
            
            if (!isMicMuted && !isPlaying && !isGenerating && recognitionRef.current) {
              recognitionRef.current.start();
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
    
    // When speech recognition stops, check if we should auto-restart
    const handleRecognitionEnd = () => {
      handleAutoRestart();
    };
    
    if (recognitionRef.current) {
      recognitionRef.current.addEventListener('end', handleRecognitionEnd);
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.removeEventListener('end', handleRecognitionEnd);
      }
    };
  }, [
    autoStartMic, 
    isMicMuted, 
    isPlaying, 
    isGenerating, 
    recognitionRef,
    hasAttemptedSpeechRecognition,
    hasRequestedMicPermission,
    lastPlaybackEndTime
  ]);
};
