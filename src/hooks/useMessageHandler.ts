
import { useState, useCallback } from 'react';
import { Message } from '@/contexts/ConversationTypes';
import { toast } from '@/components/ui/use-toast';
import { createUserMessage, createAssistantMessage } from '@/utils/messageUtils';

interface UseMessageHandlerProps {
  apiKey: string;
  agentId: string;
  generateSpeech: (text: string) => Promise<void>;
  isMuted: boolean;
  volume: number;
  setShouldAutoListen: (value: boolean) => void;
  isMicMuted: boolean;
  microphonePermission: PermissionState | null;
  setIsListening: (value: boolean) => void;
}

export const useMessageHandler = ({
  apiKey,
  agentId,
  generateSpeech,
  isMuted,
  volume,
  setShouldAutoListen,
  isMicMuted,
  microphonePermission,
  setIsListening
}: UseMessageHandlerProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(async (text: string): Promise<void> => {
    if (!text.trim()) return;
    
    setIsLoading(true);
    
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
        const errorData = await response.json();
        if (errorData?.detail?.status === 'quota_exceeded') {
          throw new Error(`ElevenLabs API quota exceeded: ${errorData.detail.message}`);
        }
        if (response.status === 404) {
          throw new Error(`ElevenLabs agent not found: The agent ID "${agentId}" does not exist or is incorrect.`);
        }
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      const responseText = data.choices[0].message.content;
      
      const assistantMessage = createAssistantMessage(responseText);
      setMessages(prev => [...prev, assistantMessage]);
      
      if (!isMuted && volume > 0) {
        console.log('Generating speech for response:', responseText);
        await generateSpeech(responseText);
        setShouldAutoListen(true);
      } else {
        console.log('Audio is muted, not generating speech');
        setTimeout(() => {
          if (!isMicMuted && microphonePermission !== 'denied') {
            console.log('Setting isListening to true when audio is muted');
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
      
      setTimeout(() => {
        if (!isMicMuted && microphonePermission !== 'denied') {
          console.log('Setting isListening to true after error');
          setIsListening(true);
        }
      }, 1000);
    } finally {
      setIsLoading(false);
    }
  }, [apiKey, agentId, generateSpeech, isMuted, volume, isMicMuted, microphonePermission, setIsListening, setShouldAutoListen]);

  const addWelcomeMessage = useCallback(async (welcomeMessage: Message) => {
    setMessages([welcomeMessage]);
    
    if (!isMuted && volume > 0) {
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        await generateSpeech(welcomeMessage.text);
        console.log('Welcome message speech generated successfully');
        setShouldAutoListen(true);
      } catch (error) {
        console.error('Failed to generate welcome message speech:', error);
        
        if (!isMicMuted) {
          setTimeout(() => {
            setIsListening(true);
          }, 1000);
        }
      }
    }
  }, [generateSpeech, isMuted, volume, isMicMuted, setIsListening, setShouldAutoListen]);

  return {
    messages,
    isLoading,
    sendMessage,
    addWelcomeMessage
  };
};

export default useMessageHandler;
