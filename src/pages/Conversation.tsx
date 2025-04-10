
import React, { useEffect } from 'react';
import ConversationPage from '../components/conversation/ConversationPage';
import ElevenLabsService from '@/services/elevenLabsService';

const Conversation = () => {
  // Ensure thorough cleanup of any existing ElevenLabs service
  useEffect(() => {
    // Cleanup function that runs when component unmounts
    return () => {
      console.log('Conversation page unmounting, performing thorough cleanup');
      try {
        // Get instance first to avoid errors if it doesn't exist
        const elevenLabsInstance = ElevenLabsService.getInstance();
        // Stop any audio playback
        elevenLabsInstance.stopAudio();
        // Clean up any other resources
        elevenLabsInstance.cleanup();
        // Finally destroy the instance
        ElevenLabsService.destroyInstance();
      } catch (err) {
        console.error('Error during cleanup:', err);
      }
    };
  }, []);
  
  return <ConversationPage />;
};

export default Conversation;
