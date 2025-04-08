
import { useState, useCallback, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Message } from '@/components/ConversationLog';
import { toast } from '@/components/ui/use-toast';
import { sendWebhookRequest } from '@/utils/webhookService';

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
  const [isProcessing, setIsProcessing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const webhookUrlRef = useRef<string | undefined>(webhookUrl);
  
  // Update the webhook URL ref when it changes
  useEffect(() => {
    webhookUrlRef.current = webhookUrl;
  }, [webhookUrl]);

  const processUserInput = useCallback(async (text: string) => {
    if (!text.trim() || isProcessing) return;
    
    setIsProcessing(true);
    
    const userMessage: Message = {
      id: uuidv4(),
      text: text,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Send user message to webhook if configured and wait for response
    if (webhookUrlRef.current) {
      try {
        const webhookResponse = await sendWebhookRequest(webhookUrlRef.current, {
          type: 'user_message',
          message: text,
          messageId: userMessage.id,
          agent: agentName
        });
        
        if (webhookResponse && webhookResponse.message) {
          // Use the response from the webhook
          const assistantMessage: Message = {
            id: uuidv4(),
            text: webhookResponse.message,
            sender: 'assistant',
            timestamp: new Date(),
          };
          
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
        } else {
          // Handle case where webhook didn't return a valid response
          toast({
            title: "Error",
            description: "No valid response received from the webhook",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("Error processing webhook request:", error);
        toast({
          title: "Error",
          description: "Failed to get response from webhook",
          variant: "destructive"
        });
      } finally {
        setIsProcessing(false);
      }
    } else {
      // Fallback behavior when no webhook is configured
      setTimeout(() => {
        const assistantResponse = "I understand you said: " + text + ". I'm here to help you with any questions or tasks.";
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
    }
  }, [generateSpeech, isMuted, autoStartMic, isPlaying, isGenerating, startListening, ttsError, isProcessing, agentName]);

  // Initialize with welcome message - now a memoized function
  const initializeConversation = useCallback(async () => {
    console.log("Initializing conversation with welcome message");
    
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
    
    // Send welcome message to webhook if configured
    if (webhookUrlRef.current) {
      try {
        await sendWebhookRequest(webhookUrlRef.current, {
          type: 'conversation_start',
          message: welcomeMessage.text,
          messageId: welcomeMessage.id,
          agent: agentName
        });
      } catch (error) {
        console.error("Error sending initial webhook request:", error);
      }
    }
    
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
  }, [generateSpeech, isMuted, agentName]);

  // Function to restart the conversation
  const restartConversation = useCallback(async () => {
    console.log("Restarting conversation");
    
    // Generate a unique ID for the restart event
    const restartId = uuidv4();
    const restartMessage = "Conversation restarted";
    
    // Send conversation_restart event to webhook if configured
    if (webhookUrlRef.current) {
      try {
        await sendWebhookRequest(webhookUrlRef.current, {
          type: 'conversation_restart',
          message: restartMessage,
          messageId: restartId,
          messageCount: messages.length,
          agent: agentName
        });
      } catch (error) {
        console.error("Error sending restart webhook request:", error);
      }
    }
    
    setIsInitialized(false);
    setMessages([]);
    
    // Re-initialize with a slight delay to ensure clean state
    setTimeout(() => {
      initializeConversation();
    }, 300);
  }, [initializeConversation, messages.length, agentName]);

  return {
    messages,
    setMessages,
    processUserInput,
    initializeConversation,
    restartConversation,
    isProcessing
  };
};

export default useConversation;
