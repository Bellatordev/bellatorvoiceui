
import { useState, useRef, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Message } from '@/components/ConversationLog';
import { useWebhookCommunication } from './useWebhookCommunication';
import { useFallbackResponses } from './useFallbackResponses';
import { useConversationLifecycle } from './useConversationLifecycle';

interface UseConversationOptions {
  generateSpeech?: (text: string) => Promise<void>;
  isMuted: boolean;
  autoStartMic: boolean;
  isPlaying: boolean;
  isGenerating: boolean;
  startListening?: () => Promise<void>;
  ttsError: string | null;
  webhookUrl?: string;
  agentName?: string;
}

export const useConversation = ({
  generateSpeech,
  isMuted,
  autoStartMic,
  isPlaying,
  isGenerating,
  startListening,
  ttsError,
  webhookUrl,
  agentName = 'Assistant'
}: UseConversationOptions) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const sessionIdRef = useRef<string>(uuidv4()); // Create a unique session ID when the hook initializes
  
  // Use our smaller hooks
  const { isProcessing, sendMessageToWebhook } = useWebhookCommunication({
    webhookUrl,
    sessionId: sessionIdRef.current,
    generateSpeech,
    isMuted,
    autoStartMic,
    isPlaying,
    isGenerating,
    startListening
  });
  
  const { generateFallbackResponse } = useFallbackResponses({
    generateSpeech,
    isMuted,
    autoStartMic,
    isPlaying,
    isGenerating,
    startListening
  });
  
  const { isInitialized, initializeConversation, restartConversation } = useConversationLifecycle({
    generateSpeech,
    isMuted,
    sessionIdRef
  });

  // Process user input and get a response
  const processUserInput = useCallback(async (text: string) => {
    if (!text.trim() || isProcessing) return;
    
    const userMessage: Message = {
      id: uuidv4(),
      text: text,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Send user message to webhook if configured and wait for response
    if (webhookUrl) {
      await sendMessageToWebhook(text, setMessages);
    } else {
      // Use fallback behavior when no webhook is configured
      const [setProcessing] = useState<boolean>(true);
      generateFallbackResponse(text, setMessages, setProcessing);
    }
  }, [isProcessing, webhookUrl, sendMessageToWebhook, generateFallbackResponse]);

  // Initialize the conversation wrapper for compatibility
  const initialize = useCallback(() => {
    initializeConversation(setMessages);
  }, [initializeConversation]);

  // Restart the conversation wrapper for compatibility
  const restart = useCallback(() => {
    restartConversation(setMessages);
  }, [restartConversation]);

  return {
    messages,
    setMessages,
    processUserInput,
    initializeConversation: initialize,
    restartConversation: restart,
    isProcessing,
    sessionId: sessionIdRef.current // Expose session ID in case it's needed elsewhere
  };
};

export default useConversation;
