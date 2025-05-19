
import { useState, useRef, useEffect } from 'react';
import { useConversation } from '@11labs/react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/components/ui/use-toast';
import { MessageType } from '@/components/TranscriptChatWindow';

interface UseElevenLabsConversationOptions {
  agentId: string;
}

interface UseElevenLabsConversationReturnType {
  messages: MessageType[];
  isCallActive: boolean;
  conversationInitialized: boolean;
  startSession: () => void;
  endSession: () => void;
  clearMessages: () => void;
  sessionId: string | null;
  conversation: ReturnType<typeof useConversation>;
}

export const useElevenLabsConversation = ({ agentId }: UseElevenLabsConversationOptions): UseElevenLabsConversationReturnType => {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [isCallActive, setIsCallActive] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const conversationInitializedRef = useRef<boolean>(false);

  // Initialize the ElevenLabs conversation hook
  const conversation = useConversation({
    onMessage: ({ message, source, isFinal }) => {
      console.log(`[MARK SDK] Received ${source} message:`, message, '| Final:', isFinal);
      
      if ((source === 'user' || source === 'ai') && isFinal) {
        console.log(`Message received from ${source}:`, message);
        
        const newMessage: MessageType = {
          id: uuidv4(),
          text: message,
          sender: source === 'user' ? 'user' : 'assistant',
          timestamp: new Date(),
        };
        
        setMessages((prev) => [...prev, newMessage]);
      }
    },
    onConnect: () => {
      console.log('Connected to ElevenLabs');
      setIsCallActive(true);
    },
    onDisconnect: () => {
      console.log('Disconnected from ElevenLabs');
      setIsCallActive(false);
    },
    onError: (err) => {
      console.error('ElevenLabs error:', err);
      toast({
        title: "Connection Error",
        description: "There was a problem connecting to the voice service.",
        variant: "destructive"
      });
    },
  });

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (conversationInitializedRef.current) {
        console.log('Ending ElevenLabs conversation session');
        conversation.endSession().catch(err => {
          console.error('Error ending conversation:', err);
        });
      }
    };
  }, [conversation]);

  const startSession = () => {
    if (conversationInitializedRef.current) {
      console.log('Conversation already initialized');
      return;
    }
    
    console.log('Starting ElevenLabs conversation session');
    
    // Start a conversation session with the agent ID
    conversation.startSession({ 
      agentId 
    }).then(id => {
      console.log('Conversation session started with ID:', id);
      setSessionId(id);
      conversationInitializedRef.current = true;
      
      // Add a welcome message from Mark to the transcript
      const welcomeMessage: MessageType = {
        id: uuidv4(),
        text: "Hello! I'm Mark, your virtual assistant. How can I help you today?",
        sender: 'assistant',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, welcomeMessage]);
    }).catch(err => {
      console.error('Failed to start conversation:', err);
      toast({
        title: "Connection Failed",
        description: "Could not connect to the voice service. Please try again.",
        variant: "destructive"
      });
    });
  };

  const endSession = () => {
    if (conversationInitializedRef.current) {
      conversation.endSession().then(() => {
        console.log('Ended ElevenLabs conversation session');
        conversationInitializedRef.current = false;
        setSessionId(null);
      }).catch(err => {
        console.error('Error ending conversation:', err);
      });
    }
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return {
    messages,
    isCallActive,
    conversationInitialized: conversationInitializedRef.current,
    startSession,
    endSession,
    clearMessages,
    sessionId,
    conversation
  };
};
