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
  const sessionIdRef = useRef<string>(uuidv4()); // Create a unique session ID when the hook initializes
  
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
        // Send the user's message text and the session ID to the webhook
        const webhookResponse = await sendWebhookRequest(
          webhookUrlRef.current, 
          text,
          sessionIdRef.current
        );
        
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
            title: "Webhook Response Issue",
            description: "Could not process the response from the connected service",
            variant: "destructive"
          });
          console.error("Invalid webhook response:", webhookResponse);
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
    
    // Don't send welcome message to webhook since we're only sending user messages now
    
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
  }, [generateSpeech, isMuted]);

  // Function to restart the conversation
  const restartConversation = useCallback(async () => {
    console.log("Restarting conversation");
    
    // Generate a new session ID for the restarted conversation
    sessionIdRef.current = uuidv4();
    console.log("Conversation restarted with new session ID:", sessionIdRef.current);
    
    // No need to send restart event to webhook since we're only sending user messages
    
    setIsInitialized(false);
    setMessages([]);
    
    // Re-initialize with a slight delay to ensure clean state
    setTimeout(() => {
      initializeConversation();
    }, 300);
  }, [initializeConversation]);

  return {
    messages,
    setMessages,
    processUserInput,
    initializeConversation,
    restartConversation,
    isProcessing,
    sessionId: sessionIdRef.current // Expose session ID in case it's needed elsewhere
  };
};

export default useConversation;
