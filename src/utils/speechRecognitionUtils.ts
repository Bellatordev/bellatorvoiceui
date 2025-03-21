
/**
 * Utility functions for speech recognition
 */

// Check if speech recognition is supported in the browser
export const isSpeechRecognitionSupported = (): boolean => {
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
};

// Get the appropriate SpeechRecognition constructor
export const getSpeechRecognitionConstructor = (): typeof SpeechRecognition | null => {
  if (!isSpeechRecognitionSupported()) {
    return null;
  }
  return window.SpeechRecognition || window.webkitSpeechRecognition;
};

// Initialize a speech recognition instance with default settings
export const createSpeechRecognitionInstance = (): SpeechRecognition | null => {
  const SpeechRecognition = getSpeechRecognitionConstructor();
  
  if (!SpeechRecognition) {
    console.error('Speech recognition not available');
    return null;
  }

  try {
    const recognitionInstance = new SpeechRecognition();
    recognitionInstance.continuous = true;
    recognitionInstance.interimResults = true;
    recognitionInstance.lang = 'en-US';
    return recognitionInstance;
  } catch (error) {
    console.error('Error initializing speech recognition:', error);
    return null;
  }
};
