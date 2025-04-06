
import { useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Message } from '@/components/ConversationLog';

interface UseConversationOptions {
  generateSpeech?: (text: string) => Promise<void>;
  isMuted: boolean;
  autoStartMic: boolean;
  isPlaying: boolean;
  isGenerating: boolean;
  startListening?: () => Promise<void>;
  ttsError: string | null;
  active?: boolean; // Add active prop
}

export const useConversation = ({
  generateSpeech,
  isMuted,
  autoStartMic,
  isPlaying,
  isGenerating,
  startListening,
  ttsError,
  active = true // Default to true for backward compatibility
}: UseConversationOptions) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Reset state when active changes to false
  useEffect(() => {
    if (!active && isInitialized) {
      console.log("Conversation is no longer active, resetting state");
      setIsInitialized(false);
      setMessages([]);
      setIsProcessing(false);
    }
  }, [active, isInitialized]);

  const processUserInput = useCallback((text: string) => {
    if (!text.trim() || isProcessing || !active) return;
    
    setIsProcessing(true);
    
    const userMessage: Message = {
      id: uuidv4(),
      text: text,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    setTimeout(() => {
      const assistantResponse = "I understand you said: " + text + ". I'm here to help you with any questions or tasks.";
      const assistantMessage: Message = {
        id: uuidv4(),
        text: assistantResponse,
        sender: 'assistant',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      if (!isMuted && !ttsError && active) {
        if (generateSpeech) {
          try {
            generateSpeech(assistantResponse);
          } catch (err) {
            console.error("Failed to generate speech:", err);
          }
        }
      } else if (autoStartMic && !isPlaying && !isGenerating && startListening && active) {
        setTimeout(startListening, 300);
      }
      
      setIsProcessing(false);
    }, 1000);
  }, [generateSpeech, isMuted, autoStartMic, isPlaying, isGenerating, startListening, ttsError, isProcessing, active]);

  // Initialize with welcome message - now a memoized function
  const initializeConversation = useCallback(() => {
    if (isInitialized || !active) return; // Prevent reinitializing or initializing when inactive
    
    console.log("Initializing conversation with welcome message");
    const welcomeMessage: Message = {
      id: uuidv4(),
      text: "Hello! How can I help you today?",
      sender: 'assistant',
      timestamp: new Date(),
    };
    
    setMessages([welcomeMessage]);
    setIsInitialized(true);
    
    // Always generate speech for welcome message unless muted
    if (!isMuted && generateSpeech && active) {
      console.log("Generating speech for welcome message");
      try {
        generateSpeech(welcomeMessage.text);
      } catch (err) {
        console.error("Failed to generate speech for welcome message:", err);
      }
    }
  }, [generateSpeech, isMuted, isInitialized, active]);

  // Cleanup function to reset state
  const cleanupConversation = useCallback(() => {
    console.log("Cleaning up conversation resources");
    setIsInitialized(false);
    setMessages([]);
    setIsProcessing(false);
  }, []);

  return {
    messages,
    setMessages,
    processUserInput,
    initializeConversation,
    cleanupConversation,
    isProcessing
  };
};

export default useConversation;
