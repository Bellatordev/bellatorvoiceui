
import { toast } from '@/components/ui/use-toast';

export type PermissionStateType = PermissionState | null;

/**
 * Checks the current microphone permission state using the Permissions API if available
 * or falls back to getUserMedia
 */
export const checkMicrophonePermission = async (): Promise<PermissionStateType> => {
  try {
    // First check if permissions API is supported
    if (navigator.permissions) {
      console.log('Checking microphone permission via Permissions API');
      const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      console.log('Permission state from Permissions API:', permissionStatus.state);
      return permissionStatus.state;
    } else {
      // Fallback for browsers that don't support permissions API
      console.log('Permissions API not supported, trying getUserMedia fallback');
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop()); // Clean up
        console.log('Microphone access granted via getUserMedia');
        return 'granted';
      } catch (error) {
        console.error('Microphone access denied via getUserMedia:', error);
        return 'denied';
      }
    }
  } catch (error) {
    console.error('Error checking microphone permission:', error);
    return null;
  }
};

/**
 * Explicitly requests microphone access
 */
export const requestMicrophoneAccess = async (): Promise<boolean> => {
  console.log('Explicitly requesting microphone access...');
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    console.log('Microphone permission explicitly granted');
    // Don't stop the tracks immediately for browsers that need persistent permission
    setTimeout(() => {
      stream.getTracks().forEach(track => track.stop());
    }, 500);
    return true;
  } catch (error) {
    console.error('Failed to get microphone permission:', error);
    toast({
      title: "Microphone Access Denied",
      description: "Please check your browser settings and ensure microphone access is allowed for this site.",
      variant: "destructive",
    });
    return false;
  }
};

/**
 * Shows error toast for microphone permission issues
 */
export const showMicrophonePermissionError = (errorType: string): void => {
  if (errorType === 'not-allowed') {
    toast({
      title: "Microphone Access Denied",
      description: "Please enable microphone access in your browser settings.",
      variant: "destructive",
    });
  } else if (errorType === 'audio-capture') {
    toast({
      title: "No Microphone Found",
      description: "Please connect a microphone to use voice features.",
      variant: "destructive",
    });
  } else if (errorType !== 'no-speech') { // Don't show for no-speech as it's common
    toast({
      title: "Speech Recognition Error",
      description: `Error: ${errorType}. Please try again.`,
      variant: "destructive",
    });
  }
};
