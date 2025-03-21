
/**
 * Utility functions for handling microphone permissions
 */

// Check if the user's browser supports the required APIs
export const isSpeechRecognitionSupported = (): boolean => {
  return typeof window !== 'undefined' && 
    (window.SpeechRecognition || window.webkitSpeechRecognition);
};

// Check if the user's browser supports audio APIs
export const isAudioSupported = (): boolean => {
  return typeof window !== 'undefined' && 
    typeof navigator !== 'undefined' && 
    navigator.mediaDevices && 
    typeof navigator.mediaDevices.getUserMedia === 'function';
};

// Request microphone access and return a promise
export const requestMicrophoneAccess = async (): Promise<boolean> => {
  if (!isAudioSupported()) {
    console.error('Audio input is not supported on this browser');
    return false;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    // Clean up the stream immediately as we only needed it to check permission
    stream.getTracks().forEach(track => track.stop());
    
    console.log('Microphone permission granted');
    return true;
  } catch (error) {
    console.error('Failed to get microphone permission:', error);
    return false;
  }
};

// Function to handle errors when speech recognition is not supported
export const handleSpeechRecognitionNotSupported = (): string => {
  if (typeof window === 'undefined') {
    return 'Speech recognition not available on server side';
  }
  
  if (!navigator.mediaDevices) {
    return 'Media devices API not available in this browser';
  }
  
  if (!navigator.mediaDevices.getUserMedia) {
    return 'getUserMedia not supported on this browser';
  }
  
  if (!(window.SpeechRecognition || window.webkitSpeechRecognition)) {
    return 'Speech recognition not supported in this browser';
  }
  
  return 'Speech recognition is unavailable for an unknown reason';
};
