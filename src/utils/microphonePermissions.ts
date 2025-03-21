
/**
 * Utility functions for handling microphone permissions
 */

// Check if the user's browser supports the required APIs
export const isSpeechRecognitionSupported = (): boolean => {
  return typeof window !== 'undefined' && 
    !!(window.SpeechRecognition || window.webkitSpeechRecognition);
};

// Check if the user's browser supports audio APIs
export const isAudioSupported = (): boolean => {
  return typeof window !== 'undefined' && 
    typeof navigator !== 'undefined' && 
    navigator.mediaDevices && 
    typeof navigator.mediaDevices.getUserMedia === 'function';
};

// Function to enumerate available media devices and check for microphones
export const checkMicrophoneDevices = async (): Promise<boolean> => {
  if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
    console.log('enumerateDevices() not supported');
    return false;
  }

  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const hasMicrophone = devices.some(device => device.kind === 'audioinput');
    console.log('Microphone devices detected:', hasMicrophone);
    return hasMicrophone;
  } catch (err) {
    console.error('Error enumerating devices:', err);
    return false;
  }
};

// Request microphone access and return a promise
export const requestMicrophoneAccess = async (): Promise<boolean> => {
  if (!isAudioSupported()) {
    console.error('Audio input is not supported on this browser');
    return false;
  }

  // First check if any microphone devices exist
  const hasMicDevices = await checkMicrophoneDevices();
  if (!hasMicDevices) {
    console.log('No microphone devices detected on this system');
    // Return true to not block the UI from showing microphone options
    // since devices could be connected later
    return true;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    // Clean up the stream immediately as we only needed it to check permission
    stream.getTracks().forEach(track => track.stop());
    
    console.log('Microphone permission granted');
    return true;
  } catch (error) {
    // Handle specific errors
    if (error instanceof DOMException) {
      if (error.name === 'NotFoundError') {
        console.log('No microphone found on this device, but we can still proceed');
        // We return true here to allow the user to still use voice features if a device becomes available
        return true;
      } else if (error.name === 'NotAllowedError') {
        console.log('Microphone permission denied by user');
        // Return true to still show the UI - user can manually enable later if they change their mind
        return true;
      }
    }
    
    console.error('Failed to get microphone permission:', error);
    // Return true anyway to not block the UI
    return true;
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
