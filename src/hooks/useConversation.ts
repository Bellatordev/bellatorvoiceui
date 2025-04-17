import { useState, useCallback, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Message } from '@/components/ConversationLog';
import { toast } from '@/components/ui/use-toast';
import { sendWebhookRequest, processBinaryFile, createAudioFromBinaryFile } from '@/utils/webhookService';

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
  const initializedRef = useRef(false);

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
          let audioElement: HTMLAudioElement | null = null;
          
          const debugInfo = JSON.stringify(webhookResponse, null, 2);
          
          if (webhookResponse.kwargs && webhookResponse.kwargs.content) {
            responseText = webhookResponse.kwargs.content;
            responseMode = 'kwargs.content';
            console.log("Using kwargs.content for response:", responseText);
          }
          else if (webhookResponse.binaryFile) {
            const fileInfo = processBinaryFile(webhookResponse.binaryFile);
            
            if (webhookResponse.binaryFile.mimeType.startsWith('audio/')) {
              audioElement = createAudioFromBinaryFile(webhookResponse.binaryFile);
              if (audioElement && !isMuted) {
                audioElement.volume = 0.8;
                audioElement.play()
                  .then(() => {
                    console.log('Auto-playing received audio');
                    toast({
                      title: "Playing Audio",
                      description: "Playing received audio response",
                      duration: 2000,
                    });
                  })
                  .catch(err => {
                    console.error('Failed to auto-play audio file:', err);
                    toast({
                      title: "Auto-play Failed",
                      description: "Click the play button to listen to the response",
                      variant: "destructive"
                    });
                  });
              }
            }
            
            if (webhookResponse.output) {
              responseText = webhookResponse.output;
              responseMode = 'binary+text';
            } else if (webhookResponse.message) {
              responseText = webhookResponse.message;
              responseMode = 'binary+message';
            } else {
              if (webhookResponse.kwargs && webhookResponse.kwargs.content) {
                responseText = webhookResponse.kwargs.content;
              } else {
                responseText = "I've received your message.";
              }
              responseMode = 'binary-only';
            }
          } else if (webhookResponse.output) {
            responseText = webhookResponse.output;
            responseMode = 'object.output';
          } else if (webhookResponse.message) {
            responseText = webhookResponse.message;
            responseMode = 'object.message';
          } else if (Array.isArray(webhookResponse) && webhookResponse.length > 0 && webhookResponse[0].output) {
            responseText = webhookResponse[0].output;
            responseMode = 'array.output';
          } else {
            responseText = typeof webhookResponse === 'string' 
              ? webhookResponse 
              : JSON.stringify(webhookResponse);
            responseMode = 'last-resort';
            console.warn("Response format not recognized, displaying raw response:", webhookResponse);
          }
          
          console.log(`Final response text (${responseMode}):`, responseText);
          
          const assistantMessage: Message = {
            id: uuidv4(),
            text: responseText,
            sender: 'assistant',
            timestamp: new Date(),
            audioElement: audioElement,
            debugInfo: debugInfo,
            rawWebhookResponse: webhookResponse
          };
          
          setMessages(prev => [...prev, assistantMessage]);
          
          if (audioElement && !isMuted) {
            try {
              console.log("Audio file attached to response, ready for playback");
              toast({
                title: "Audio Response",
                description: "Received audio file with response",
                duration: 2000,
              });
            } catch (err) {
              console.error("Error with audio file:", err);
            }
          } else if (!isMuted && generateSpeech) {
            let speechText = responseText;
            
            try {
              generateSpeech(speechText);
            } catch (err) {
              console.error("Failed to generate speech:", err);
            }
          }
          
          if (autoStartMic && !isPlaying && !isGenerating && startListening) {
            setTimeout(() => {
              try {
                startListening();
              } catch (err) {
                console.error("Failed to auto-start listening:", err);
              }
            }, 1500);
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
      setIsProcessing(false);
    }
  }, [generateSpeech, isMuted, autoStartMic, isPlaying, isGenerating, startListening, ttsError, isProcessing, agentName]);

  const initializeConversation = useCallback(async () => {
    if (initializedRef.current) {
      console.log("Conversation already initialized, skipping");
      return;
    }
    
    console.log("Initializing conversation with welcome message");
    
    sessionIdRef.current = uuidv4();
    console.log("New session initialized with ID:", sessionIdRef.current);
    
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        id: uuidv4(),
        text: "Hello! How can I help you today?",
        sender: 'assistant',
        timestamp: new Date(),
      };
      
      setMessages([welcomeMessage]);
      
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
    }
    
    setIsInitialized(true);
    initializedRef.current = true;
  }, [generateSpeech, isMuted, messages.length]);

  const restartConversation = useCallback(async () => {
    console.log("Restarting conversation");
    
    sessionIdRef.current = uuidv4();
    console.log("Conversation restarted with new session ID:", sessionIdRef.current);
    
    initializedRef.current = false;
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
