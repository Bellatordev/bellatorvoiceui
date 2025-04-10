
import React, { useEffect } from 'react';
import ConversationPage from '../components/conversation/ConversationPage';
import ElevenLabsService from '@/services/elevenLabsService';

const Conversation = () => {
  // Ensure cleanup of any existing ElevenLabs service when navigating to this page
  useEffect(() => {
    return () => {
      console.log('Conversation page unmounting, cleaning up resources');
      try {
        const elevenLabsInstance = ElevenLabsService.getInstance();
        elevenLabsInstance.stopAudio();
        elevenLabsInstance.cleanup();
        ElevenLabsService.destroyInstance();
      } catch (err) {
        console.error('Error during cleanup:', err);
      }
    };
  }, []);
  
  return <ConversationPage />;
};

export default Conversation;
