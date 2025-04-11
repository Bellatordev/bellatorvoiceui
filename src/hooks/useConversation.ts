import { useState, useCallback, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Message } from '@/components/ConversationLog';
import { toast } from '@/components/ui/use-toast';
import { sendWebhookRequest, processBinaryFile } from '@/utils/webhookService';

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
  const sessionIdRef = useRef<string>(uuidv4());

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
    
    if (webhookUrlRef.current) {
      try {
        const webhookResponse = await sendWebhookRequest(
          webhookUrlRef.current, 
          text,
          sessionIdRef.current
        );
        
        if (webhookResponse) {
          let responseText = '';
          let responseMode = '';
          
          if (webhookResponse.binaryFile) {
            const fileInfo = processBinaryFile(webhookResponse.binaryFile);
            
            if (webhookResponse.output) {
              responseText = `${webhookResponse.output}\n\n${fileInfo}`;
              responseMode = 'binary+text';
            } else if (webhookResponse.message) {
              responseText = `${webhookResponse.message}\n\n${fileInfo}`;
              responseMode = 'binary+message';
            } else {
              responseText = fileInfo;
              responseMode = 'binary-only';
            }
          } else if (Array.isArray(webhookResponse) && webhookResponse.length > 0 && webhookResponse[0].output) {
            responseText = webhookResponse[0].output;
            responseMode = 'array.output';
          } else if (webhookResponse.output) {
            responseText = webhookResponse.output;
            responseMode = 'object.output';
          } else if (webhookResponse.message) {
            responseText = webhookResponse.message;
            responseMode = 'object.message';
          } else {
            responseText = typeof webhookResponse === 'string' 
              ? webhookResponse 
              : JSON.stringify(webhookResponse);
            responseMode = 'last-resort';
            console.warn("Response format not recognized, displaying raw response:", webhookResponse);
          }
          
          const formattedResponse = `${responseMode}: ${responseText}`;
          
          const assistantMessage: Message = {
            id: uuidv4(),
            text: formattedResponse,
            sender: 'assistant',
            timestamp: new Date(),
          };
          
          setMessages(prev => [...prev, assistantMessage]);
          
          if (!isMuted && generateSpeech) {
            let speechText = responseText;
            if (responseMode.includes('binary')) {
              speechText = responseText.split('\n\n')[0];
            }
            
            try {
              generateSpeech(speechText);
            } catch (err) {
              console.error("Failed to generate speech:", err);
            }
          } else if (autoStartMic && !isPlaying && !isGenerating && startListening) {
            setTimeout(startListening, 1500);
          }
        } else {
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
      setTimeout(() => {
        const assistantResponse = "I understand you said: " + text + ". I'm here to help you with any questions or tasks.";
        const formattedResponse = `fallback: ${assistantResponse}`;
        
        const assistantMessage: Message = {
          id: uuidv4(),
          text: formattedResponse,
          sender: 'assistant',
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        
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

  const initializeConversation = useCallback(async () => {
    console.log("Initializing conversation with welcome message");
    
    sessionIdRef.current = uuidv4();
    console.log("New session initialized with ID:", sessionIdRef.current);
    
    setMessages([]);
    
    const welcomeMessage: Message = {
      id: uuidv4(),
      text: "Hello! How can I help you today?",
      sender: 'assistant',
      timestamp: new Date(),
    };
    
    setMessages([welcomeMessage]);
    setIsInitialized(true);
    
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
      }, 300);
    }
  }, [generateSpeech, isMuted]);

  const restartConversation = useCallback(async () => {
    console.log("Restarting conversation");
    
    sessionIdRef.current = uuidv4();
    console.log("Conversation restarted with new session ID:", sessionIdRef.current);
    
    setIsInitialized(false);
    setMessages([]);
    
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
    sessionId: sessionIdRef.current
  };
};

export default useConversation;
