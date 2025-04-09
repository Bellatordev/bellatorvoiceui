
import { useCallback, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Message } from '@/components/ConversationLog';

interface UseConversationLifecycleOptions {
  generateSpeech?: (text: string) => Promise<void>;
  isMuted: boolean;
  sessionIdRef: React.MutableRefObject<string>;
}

export const useConversationLifecycle = ({
  generateSpeech,
  isMuted,
  sessionIdRef
}: UseConversationLifecycleOptions) => {
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Initialize with welcome message
  const initializeConversation = useCallback(async (
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>
  ) => {
    console.log("Initializing conversation with welcome message");
    
    // Generate a new session ID for each new conversation
    sessionIdRef.current = uuidv4();
    console.log("New session initialized with ID:", sessionIdRef.current);
    
    // Clear existing messages
    setMessages([]);
    
    const welcomeMessage: Message = {
      id: uuidv4(),
      text: "Hello! How can I help you today?",
      sender: 'assistant',
      timestamp: new Date(),
    };
    
    setMessages([welcomeMessage]);
    setIsInitialized(true);
    
    // Generate speech for welcome message unless muted
    if (!isMuted && generateSpeech) {
      console.log("Generating speech for welcome message");
      setTimeout(() => {
        try {
          generateSpeech(welcomeMessage.text).catch(err => {
            console.error("Error generating welcome speech:", err);
          });
        } catch (err) {
          console.error("Failed to generate speech for welcome message:", err);
        }
      }, 300); // Small delay to ensure message is rendered first
    }
  }, [generateSpeech, isMuted, sessionIdRef]);

  // Function to restart the conversation
  const restartConversation = useCallback(async (
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>
  ) => {
    console.log("Restarting conversation");
    
    // Generate a new session ID for the restarted conversation
    sessionIdRef.current = uuidv4();
    console.log("Conversation restarted with new session ID:", sessionIdRef.current);
    
    setIsInitialized(false);
    setMessages([]);
    
    // Re-initialize with a slight delay to ensure clean state
    setTimeout(() => {
      initializeConversation(setMessages);
    }, 300);
  }, [initializeConversation, sessionIdRef]);

  return {
    isInitialized,
    initializeConversation,
    restartConversation
  };
};
