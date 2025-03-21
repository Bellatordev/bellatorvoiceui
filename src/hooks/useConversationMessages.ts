
import { useState, useCallback } from 'react';
import { Message } from '@/contexts/ConversationTypes';
import { createUserMessage, createAssistantMessage, createWelcomeMessage } from '@/utils/messageUtils';
import { toast } from '@/components/ui/use-toast';

interface UseConversationMessagesProps {
  apiKey: string;
  agentId: string;
  generateSpeech: (text: string) => Promise<void>;
  isMuted: boolean;
  volume: number;
  isMicMuted: boolean;
  hasMicrophonePermission: boolean | null;
  setIsListening: (value: boolean) => void;
  setShouldAutoListen: (value: boolean) => void;
}

export const useConversationMessages = ({
  apiKey,
  agentId,
  generateSpeech,
  isMuted,
  volume,
  isMicMuted,
  hasMicrophonePermission,
  setIsListening,
  setShouldAutoListen
}: UseConversationMessagesProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize with welcome message
  const initializeMessages = useCallback(async () => {
    const welcomeMessage = createWelcomeMessage();
    setMessages([welcomeMessage]);
    
    // Generate speech for welcome message
    if (!isMuted && volume > 0) {
      await generateSpeech(welcomeMessage.text);
    }
  }, [generateSpeech, isMuted, volume]);

  // Send message to the agent
  const sendMessage = useCallback(async (text: string): Promise<void> => {
    if (!text.trim()) return;
    
    setIsLoading(true);
    
    // Add user message to conversation
    const userMessage = createUserMessage(text);
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await fetch(`https://api.elevenlabs.io/v1/agents/${agentId}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: text }],
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      const responseText = data.choices[0].message.content;
      
      // Add agent response to conversation
      const assistantMessage = createAssistantMessage(responseText);
      setMessages(prev => [...prev, assistantMessage]);
      
      // Generate speech for the response if not muted
      if (!isMuted && volume > 0) {
        await generateSpeech(responseText);
        // Set flag to auto-listen after speech generation
        setShouldAutoListen(true);
      } else {
        // Even if audio is muted, we should still auto-listen after a delay
        setTimeout(() => {
          if (!isMicMuted && hasMicrophonePermission) {
            setIsListening(true);
          }
        }, 1000);
      }
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [apiKey, agentId, generateSpeech, isMuted, volume, isMicMuted, hasMicrophonePermission, setIsListening, setShouldAutoListen]);

  return {
    messages,
    isLoading,
    sendMessage,
    initializeMessages
  };
};
