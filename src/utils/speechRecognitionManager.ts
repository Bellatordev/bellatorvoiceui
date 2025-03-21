
/**
 * Creates and configures a new SpeechRecognition instance
 */
export const createSpeechRecognition = (): SpeechRecognition | null => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    console.error('Speech recognition not supported in this browser');
    return null;
  }

  try {
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    return recognition;
  } catch (error) {
    console.error('Error initializing speech recognition:', error);
    return null;
  }
};

/**
 * Safely starts speech recognition
 */
export const safelyStartRecognition = (recognition: SpeechRecognition | null): void => {
  if (!recognition) return;
  
  try {
    recognition.start();
    console.log('Speech recognition started');
  } catch (error) {
    console.error('Error starting speech recognition:', error);
    // If it's already running, restart it
    try {
      recognition.stop();
      setTimeout(() => {
        recognition.start();
        console.log('Speech recognition restarted');
      }, 100);
    } catch (innerError) {
      console.error('Error restarting speech recognition:', innerError);
    }
  }
};

/**
 * Safely stops speech recognition
 */
export const safelyStopRecognition = (recognition: SpeechRecognition | null): void => {
  if (!recognition) return;
  
  try {
    recognition.stop();
    console.log('Speech recognition stopped');
  } catch (error) {
    console.error('Error stopping speech recognition:', error);
  }
};
