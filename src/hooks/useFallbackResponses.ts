
import { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Message } from '@/components/ConversationLog';

interface UseFallbackResponsesOptions {
  generateSpeech?: (text: string) => Promise<void>;
  isMuted: boolean;
  autoStartMic: boolean;
  isPlaying: boolean;
  isGenerating: boolean;
  startListening?: () => Promise<void>;
}

export const useFallbackResponses = ({
  generateSpeech,
  isMuted,
  autoStartMic,
  isPlaying,
  isGenerating,
  startListening
}: UseFallbackResponsesOptions) => {
  
  const generateFallbackResponse = useCallback((
    userText: string,
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
    setIsProcessing: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    // Simulate a delay in response
    setTimeout(() => {
      const assistantResponse = "I understand you said: " + userText + ". I'm here to help you with any questions or tasks.";
      const assistantMessage: Message = {
        id: uuidv4(),
        text: assistantResponse,
        sender: 'assistant',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      // Always generate speech for assistant responses unless muted
      if (!isMuted && generateSpeech) {
        try {
          generateSpeech(assistantResponse);
        } catch (err) {
          console.error("Failed to generate speech:", err);
        }
      } else if (autoStartMic && !isPlaying && !isGenerating && startListening) {
        setTimeout(startListening, 1500);
      }
      
      setIsProcessing(false);
    }, 1000);
  }, [generateSpeech, isMuted, autoStartMic, isPlaying, isGenerating, startListening]);

  return { generateFallbackResponse };
};
