
import { useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';

interface ErrorHandlerProps {
  setHasMicrophonePermission: (value: boolean) => void;
}

export const useSpeechRecognitionError = ({
  setHasMicrophonePermission
}: ErrorHandlerProps) => {
  const handleRecognitionError = useCallback((event: SpeechRecognitionErrorEvent) => {
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
  }, [setHasMicrophonePermission]);

  return { handleRecognitionError };
};
