
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Zap } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import PulsatingCircle from '@/components/ui/pulsating-circle';
import { PixelCanvas } from '@/components/ui/pixel-canvas';
import TranscriptChatWindow from '@/components/TranscriptChatWindow';
import { MessageType } from '@/components/TranscriptChatWindow';

const Mark = () => {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [isCallActive, setIsCallActive] = useState(false);
  const [userInitiatedCall, setUserInitiatedCall] = useState(false);

  // Reference to prevent duplicate message processing
  const processedMessagesRef = useRef<Set<string>>(new Set());
  // Ref to track if the conversation has been initialized
  const conversationInitializedRef = useRef<boolean>(false);
  
  useEffect(() => {
    // Only load the script once
    const existingScript = document.querySelector('script[src="https://elevenlabs.io/convai-widget/index.js"]');
    if (!existingScript && !isLoaded) {
      const script = document.createElement('script');
      script.src = 'https://elevenlabs.io/convai-widget/index.js';
      script.async = true;
      script.type = 'text/javascript';
      script.onload = () => {
        setIsLoaded(true);
        console.log('ElevenLabs widget script loaded');
      };
      document.body.appendChild(script);
      return () => {
        document.body.removeChild(script);
        setIsCallActive(false);
        setUserInitiatedCall(false);
      };
    } else if (isLoaded) {
      console.log('ElevenLabs widget script already loaded');
    }
  }, [isLoaded]);

  // Add listener for call state changes from the widget
  useEffect(() => {
    if (!isLoaded) return;

    // Custom event handlers for the widget's status
    const handleCallStart = () => {
      console.log('Call started');
      setIsCallActive(true);
    };

    const handleCallEnd = () => {
      console.log('Call ended');
      setIsCallActive(false);
    };

    // Set up custom event listeners for the widget
    window.addEventListener('elevenlabs-call-start', handleCallStart);
    window.addEventListener('elevenlabs-call-end', handleCallEnd);

    return () => {
      window.removeEventListener('elevenlabs-call-start', handleCallStart);
      window.removeEventListener('elevenlabs-call-end', handleCallEnd);
    };
  }, [isLoaded]);

  // Add listener for clicks on the widget to ensure user initiated the conversation
  useEffect(() => {
    if (!isLoaded) return;

    const handleWidgetClick = () => {
      if (!userInitiatedCall) {
        console.log('User clicked on widget, initiating conversation');
        setUserInitiatedCall(true);
      }
    };

    // Target the widget container that gets created dynamically
    const widgetCheck = setInterval(() => {
      const widgetElement = document.querySelector('elevenlabs-convai');
      if (widgetElement) {
        clearInterval(widgetCheck);
        widgetElement.addEventListener('click', handleWidgetClick);
      }
    }, 500);

    return () => {
      clearInterval(widgetCheck);
      const widgetElement = document.querySelector('elevenlabs-convai');
      if (widgetElement) {
        widgetElement.removeEventListener('click', handleWidgetClick);
      }
    };
  }, [isLoaded]);
  
  // Custom event listeners for capturing conversation messages
  useEffect(() => {
    if (!isLoaded || !userInitiatedCall) return;

    const captureConversation = () => {
      // Listen for custom events from the widget
      const handleUserMessage = (event: CustomEvent) => {
        if (!event.detail || !event.detail.text || !isCallActive) return;
        
        const messageText = event.detail.text;
        // Check if we've already processed this message
        if (processedMessagesRef.current.has(messageText)) return;
        
        console.log('User message captured:', messageText);
        processedMessagesRef.current.add(messageText);
        
        const userMessage: MessageType = {
          id: uuidv4(),
          text: messageText,
          sender: 'user',
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, userMessage]);
      };
      
      const handleAssistantMessage = (event: CustomEvent) => {
        if (!event.detail || !event.detail.text || !isCallActive) return;
        
        const messageText = event.detail.text;
        // Check if we've already processed this message
        if (processedMessagesRef.current.has(messageText)) return;
        
        console.log('Assistant message captured:', messageText);
        processedMessagesRef.current.add(messageText);
        
        const assistantMessage: MessageType = {
          id: uuidv4(),
          text: messageText,
          sender: 'assistant',
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, assistantMessage]);
      };
      
      // Add event listeners
      window.addEventListener('elevenlabs-user-message', handleUserMessage as EventListener);
      window.addEventListener('elevenlabs-assistant-message', handleAssistantMessage as EventListener);
      
      return () => {
        window.removeEventListener('elevenlabs-user-message', handleUserMessage as EventListener);
        window.removeEventListener('elevenlabs-assistant-message', handleAssistantMessage as EventListener);
      };
    };
    
    return captureConversation();
  }, [isLoaded, userInitiatedCall, isCallActive]);
  
  // Helper function to clear the conversation history
  const clearConversation = () => {
    setMessages([]);
    processedMessagesRef.current.clear();
  };

  // Function to start the call
  const startCall = () => {
    if (!userInitiatedCall) {
      setUserInitiatedCall(true);
      
      // Dispatch a custom event to simulate clicking the widget
      setTimeout(() => {
        const widgetElement = document.querySelector('elevenlabs-convai');
        if (widgetElement) {
          widgetElement.dispatchEvent(new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
          }));
        }
      }, 100);
    }
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
          {/* Visualization */}
          <div className="w-full flex justify-center mb-8">
            <div className="relative w-64 h-64 max-w-full">
              <PulsatingCircle />
            </div>
          </div>
          
          {/* Widget Container (Completely Independent) */}
          <div className="w-full flex justify-center">
            <div className="relative w-full max-w-[400px] h-[130px]">
              <div className="rounded-2xl overflow-hidden backdrop-blur-md bg-black/30 border border-white/10 shadow-2xl h-full">
                {isLoaded ? (
                  <>
                    {!userInitiatedCall && (
                      <div 
                        className="absolute inset-0 z-10 flex items-center justify-center cursor-pointer bg-black/60"
                        onClick={startCall}
                      >
                        <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                          <Zap className="w-5 h-5" />
                          Click to Start Conversation
                        </button>
                      </div>
                    )}
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
                  </>
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
          
          {/* Status Indicator */}
          <div className="mt-4 text-center">
            <span className={`inline-block px-3 py-1 text-sm rounded-full ${
              isCallActive && userInitiatedCall ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-300'
            }`}>
              {isCallActive && userInitiatedCall ? 'Call Active' : 'Call Inactive'}
            </span>
          </div>
          
          {/* Transcript Chat Window (Completely Independent) */}
          <div className="w-full flex justify-center mt-4">
            <div className="w-full max-w-[500px]">
              <TranscriptChatWindow 
                messages={messages} 
                className={isCallActive && userInitiatedCall ? '' : 'opacity-60'}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Mark;
