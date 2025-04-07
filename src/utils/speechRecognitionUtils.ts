
import { toast } from '@/components/ui/use-toast';
import { requestMicrophoneAccess } from '@/utils/microphonePermissions';

// Initialize the speech recognition instance
export const createSpeechRecognition = (): SpeechRecognition | null => {
  if (typeof window === 'undefined') return null;
  
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    console.log('SpeechRecognition not available in this browser');
    return null;
  }
  
  try {
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    return recognition;
  } catch (error) {
    console.error('Error setting up speech recognition:', error);
    return null;
  }
};

// Handle various speech recognition errors
export const handleRecognitionError = (error: string): void => {
  console.error('Speech recognition error', error);
  
  if (error === 'not-allowed' || error === 'service-not-allowed') {
    toast({
      title: "Microphone Note",
      description: "Microphone access is needed for voice input. You can also use text input.",
      variant: "default"
    });
  } else {
    console.log(`Speech recognition error: ${error}`);
  }
};

// Request microphone permission
export const requestMicPermission = async (hasRequestedPermission: boolean): Promise<boolean> => {
  if (hasRequestedPermission) return true;
  
  try {
    await requestMicrophoneAccess();
    return true;
  } catch (err) {
    console.error('Microphone permission error:', err);
    return true;
  }
};
