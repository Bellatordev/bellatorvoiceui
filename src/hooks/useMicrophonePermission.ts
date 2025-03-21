
import { useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';

export const useMicrophonePermission = (shouldCheck: boolean = false) => {
  const [hasMicrophonePermission, setHasMicrophonePermission] = useState<boolean | null>(null);

  useEffect(() => {
    // Only check if we're explicitly told to check and don't already know
    if (shouldCheck && hasMicrophonePermission === null) {
      console.log('Checking microphone permission...');
      
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
      }
    }
  }, [shouldCheck, hasMicrophonePermission]);

  return { hasMicrophonePermission, setHasMicrophonePermission };
};
