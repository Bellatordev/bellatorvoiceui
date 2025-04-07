
import { useState, useCallback } from 'react';
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
}

export const useConversation = ({
  generateSpeech,
  isMuted,
  autoStartMic,
  isPlaying,
  isGenerating,
  startListening,
  ttsError
}: UseConversationOptions) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const processUserInput = useCallback((text: string) => {
    if (!text.trim() || isProcessing) return;
    
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
      
      if (!isMuted && !ttsError) {
        if (generateSpeech) {
          try {
            generateSpeech(assistantResponse);
          } catch (err) {
            console.error("Failed to generate speech:", err);
          }
        }
      } else if (autoStartMic && !isPlaying && !isGenerating && startListening) {
        // Increased delay to wait for proper silence detection
        setTimeout(startListening, 1500);
      }
      
      setIsProcessing(false);
    }, 1000);
  }, [generateSpeech, isMuted, autoStartMic, isPlaying, isGenerating, startListening, ttsError, isProcessing]);

  // Initialize with welcome message - now a memoized function
  const initializeConversation = useCallback(() => {
    if (isInitialized) return; // Prevent reinitializing
    
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
    if (!isMuted && generateSpeech) {
      console.log("Generating speech for welcome message");
      try {
        generateSpeech(welcomeMessage.text);
      } catch (err) {
        console.error("Failed to generate speech for welcome message:", err);
      }
    }
  }, [generateSpeech, isMuted, isInitialized]);

  return {
    messages,
    setMessages,
    processUserInput,
    initializeConversation,
    isProcessing
  };
};

export default useConversation;
