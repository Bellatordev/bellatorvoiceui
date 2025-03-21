
import { useState } from 'react';
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

  const processUserInput = (text: string) => {
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
        setTimeout(startListening, 300);
      }
      
      setIsProcessing(false);
    }, 1000);
  };

  // Initialize with welcome message
  const initializeConversation = () => {
    const welcomeMessage: Message = {
      id: uuidv4(),
      text: "Hello! How can I help you today?",
      sender: 'assistant',
      timestamp: new Date(),
    };
    
    setMessages([welcomeMessage]);
    
    if (!isMuted && generateSpeech) {
      try {
        generateSpeech(welcomeMessage.text);
      } catch (err) {
        console.error("Failed to generate speech for welcome message:", err);
      }
    }
  };

  return {
    messages,
    setMessages,
    processUserInput,
    initializeConversation,
    isProcessing
  };
};

export default useConversation;
