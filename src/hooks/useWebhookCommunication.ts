
import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/components/ui/use-toast';
import { sendWebhookRequest } from '@/utils/webhookService';
import { Message } from '@/components/ConversationLog';

interface UseWebhookCommunicationOptions {
  webhookUrl?: string;
  sessionId: string;
  generateSpeech?: (text: string) => Promise<void>;
  isMuted: boolean;
  autoStartMic: boolean;
  isPlaying: boolean;
  isGenerating: boolean;
  startListening?: () => Promise<void>;
}

export const useWebhookCommunication = ({
  webhookUrl,
  sessionId,
  generateSpeech,
  isMuted,
  autoStartMic,
  isPlaying,
  isGenerating,
  startListening
}: UseWebhookCommunicationOptions) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const sendMessageToWebhook = useCallback(async (
    text: string,
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>
  ) => {
    if (!webhookUrl) {
      return null;
    }

    setIsProcessing(true);
    
    try {
      console.log(`Processing user input: "${text}" with session ID: ${sessionId}`);
      
      // Send the user's message text and the session ID to the webhook
      const webhookResponse = await sendWebhookRequest(
        webhookUrl, 
        text,
        sessionId
      );
      
      if (webhookResponse) {
        if (webhookResponse.message) {
          // Use the response from the webhook
          const assistantMessage: Message = {
            id: uuidv4(),
            text: webhookResponse.message,
            sender: 'assistant',
            timestamp: new Date(),
          };
          
          console.log('Adding assistant message:', assistantMessage.text);
          setMessages(prev => [...prev, assistantMessage]);
          
          // Generate speech for the response if not muted
          if (!isMuted && generateSpeech) {
            try {
              generateSpeech(assistantMessage.text);
            } catch (err) {
              console.error("Failed to generate speech:", err);
            }
          } else if (autoStartMic && !isPlaying && !isGenerating && startListening) {
            setTimeout(startListening, 1500);
          }
          
          return assistantMessage;
        } else {
          // Handle case where response doesn't have a message property
          console.error("Webhook response missing message property:", webhookResponse);
          toast({
            title: "Unexpected Response",
            description: "The service response didn't contain a message",
            variant: "destructive"
          });
          
          // Add a fallback message
          const fallbackMessage: Message = {
            id: uuidv4(),
            text: "I received your message but couldn't generate a proper response. Please try again.",
            sender: 'assistant',
            timestamp: new Date(),
          };
          
          setMessages(prev => [...prev, fallbackMessage]);
          return fallbackMessage;
        }
      } else {
        // Handle case where webhook didn't return a valid response
        toast({
          title: "Communication Error",
          description: "Could not connect to the service. Please check your internet connection.",
          variant: "destructive"
        });
        console.error("No webhook response received");
        
        // Add a fallback message
        const fallbackMessage: Message = {
          id: uuidv4(),
          text: "I'm sorry, I couldn't connect to the service. Please check your internet connection and try again.",
          sender: 'assistant',
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, fallbackMessage]);
        return fallbackMessage;
      }
    } catch (error) {
      console.error("Error processing webhook request:", error);
      toast({
        title: "Error",
        description: "Failed to get response from webhook",
        variant: "destructive"
      });
      
      // Add a fallback message
      const fallbackMessage: Message = {
        id: uuidv4(),
        text: "I encountered an error while processing your request. Please try again.",
        sender: 'assistant',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, fallbackMessage]);
      return fallbackMessage;
    } finally {
      setIsProcessing(false);
    }
  }, [webhookUrl, sessionId, generateSpeech, isMuted, autoStartMic, isPlaying, isGenerating, startListening]);

  return {
    isProcessing,
    sendMessageToWebhook
  };
};
