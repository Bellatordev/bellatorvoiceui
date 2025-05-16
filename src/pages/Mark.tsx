
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Zap } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useConversation } from '@11labs/react';
import PulsatingCircle from '@/components/ui/pulsating-circle';
import { PixelCanvas } from '@/components/ui/pixel-canvas';
import TranscriptChatWindow from '@/components/TranscriptChatWindow';
import { MessageType } from '@/components/TranscriptChatWindow';

const Mark = () => {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  const [messages, setMessages] = useState<MessageType[]>([]);
  
  // Initialize the ElevenLabs conversation hook with the agent ID
  const conversation = useConversation({
    onMessage: (props) => {
      // The useConversation hook provides a different message structure
      // Convert it to our internal format
      const { message, source } = props;
      
      // Only add messages from user or ai to the chat
      // The @11labs/react library uses 'ai' for assistant messages
      if (source === 'user' || source === 'ai') {
        const newMessage: MessageType = {
          id: uuidv4(),
          text: message,
          sender: source === 'user' ? 'user' : 'assistant', // Map 'ai' to 'assistant' for our MessageType
          timestamp: new Date(),
        };
        
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        console.log('New message added:', newMessage);
      }
    },
    onConnect: () => {
      console.log('Connected to ElevenLabs conversation');
    },
    onDisconnect: () => {
      console.log('Disconnected from ElevenLabs conversation');
    },
    onError: (error) => {
      console.error('ElevenLabs conversation error:', error);
    }
  });
  
  useEffect(() => {
    // Start the conversation with the Mark agent ID when the component mounts
    const initConversation = async () => {
      try {
        // Start the conversation with the agent ID
        await conversation.startSession({ 
          agentId: 'K6sb3ZDw0wg0oK8OzFEg'
        });
        console.log('Conversation started with Mark agent');
      } catch (error) {
        console.error('Error starting conversation:', error);
      }
    };
    
    // Load the ElevenLabs widget script
    const existingScript = document.querySelector('script[src="https://elevenlabs.io/convai-widget/index.js"]');
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = 'https://elevenlabs.io/convai-widget/index.js';
      script.async = true;
      script.type = 'text/javascript';
      script.onload = () => {
        setIsLoaded(true);
        console.log('ElevenLabs widget script loaded');
        // Initialize the conversation after the widget is loaded
        initConversation();
      };
      document.body.appendChild(script);
      return () => {
        document.body.removeChild(script);
        // End the conversation when component unmounts
        conversation.endSession();
      };
    } else {
      setIsLoaded(true);
      console.log('ElevenLabs widget script already loaded');
      // Initialize the conversation if widget is already loaded
      initConversation();
    }
    
    return () => {
      // End the conversation when component unmounts
      conversation.endSession();
    };
  }, [conversation]);
  
  // Helper function to clear the conversation history
  const clearConversation = () => {
    setMessages([]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#121212] text-white relative overflow-hidden">
      <div className="fixed inset-0 z-0 opacity-70">
        <PixelCanvas gap={12} speed={25} colors={['#0EA5E9', '#6366f1', '#8B5CF6']} variant="default" noFocus={true} />
      </div>

      <header className="relative z-10 bg-black/40 backdrop-blur-lg border-b border-white/10 p-4 flex items-center justify-between">
        <button onClick={() => navigate('/')} className="p-2 rounded-full hover:bg-white/10 transition-colors flex items-center gap-2 group">
          <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
        </button>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          Mark
          <Zap className="w-5 h-5 text-[#0EA5E9] animate-pulse" />
        </h1>
        <button 
          onClick={clearConversation}
          className="text-xs text-white/60 hover:text-white/90 transition-colors p-2"
        >
          Clear Chat
        </button>
      </header>

      <div className="flex-1 overflow-hidden relative z-10 px-4">
        <div className="container mx-auto py-8 h-full flex flex-col items-center">
          <div className="w-full flex justify-center mb-8">
            <div className="relative w-64 h-64 max-w-full">
              <PulsatingCircle />
            </div>
          </div>
          
          <div className="w-full flex justify-center">
            <div className="relative w-full max-w-[400px] h-[130px]">
              <div className="rounded-2xl overflow-hidden backdrop-blur-md bg-black/30 border border-white/10 shadow-2xl h-full">
                {isLoaded ? (
                  <elevenlabs-convai 
                    agent-id="K6sb3ZDw0wg0oK8OzFEg" 
                    className="rounded-xl overflow-hidden backdrop-filter w-full h-full" 
                    style={{
                      backgroundColor: 'transparent',
                      borderRadius: '16px',
                      width: '100%',
                      height: '100%',
                      display: 'block'
                    } as React.CSSProperties} 
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-white/70">
                    <div className="animate-spin mr-2">
                      <Zap className="w-6 h-6" />
                    </div>
                    Loading Mark...
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Transcript Chat Window */}
          <div className="w-full flex justify-center mt-8">
            <div className="w-full max-w-[500px]">
              <TranscriptChatWindow messages={messages} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Mark;
