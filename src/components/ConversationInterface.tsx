
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Volume2, VolumeX, MessageSquare } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import ConversationLog from './ConversationLog';
import { v4 as uuidv4 } from 'uuid';
import useElevenLabs from '../hooks/useElevenLabs';
import WaveformVisualizer from './WaveformVisualizer';
import { AIVoiceInput } from './ui/ai-voice-input';

interface ConversationInterfaceProps {
  apiKey: string;
  agentId: string;
  onLogout: () => void;
}

// Define Message type for the conversation
type Message = {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
};

const ConversationInterface: React.FC<ConversationInterfaceProps> = ({
  apiKey,
  agentId,
  onLogout,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark' || 
      (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  // ElevenLabs voice integration
  const { 
    generateSpeech, 
    stopAudio, 
    togglePlayback, 
    setVolume: setTtsVolume,
    isGenerating, 
    isPlaying 
  } = useElevenLabs({ 
    apiKey, 
    voiceId: 'EXAVITQu4vr4xnSDxMaL', // Using 'Sarah' voice by default
    modelId: 'eleven_multilingual_v2'
  });

  useEffect(() => {
    // Set volume for TTS
    setTtsVolume(isMuted ? 0 : volume);
  }, [volume, isMuted, setTtsVolume]);

  useEffect(() => {
    // Scroll to bottom on new message
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Add initial greeting message when component mounts
  useEffect(() => {
    const welcomeMessage: Message = {
      id: uuidv4(),
      sender: 'assistant',
      text: 'Hello, how can I help you today?',
      timestamp: new Date()
    };
    
    setMessages([welcomeMessage]);
    
    // Generate speech for welcome message
    if (!isMuted && volume > 0) {
      generateSpeech(welcomeMessage.text);
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
    
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Handle voice input start
  const handleListenStart = () => {
    setIsListening(true);
  };

  // Handle voice input stop
  const handleListenStop = async (duration: number) => {
    setIsListening(false);
    if (duration < 1) return; // Ignore very short recordings
    
    // In a real implementation, this would send audio to be transcribed
    // For now, we'll simulate with a mock transcription
    const mockTranscription = "This is a simulated voice message transcription.";
    await sendMessage(mockTranscription);
  };

  // Common function to handle sending messages to the agent
  const sendMessage = async (text: string) => {
    setIsLoading(true);
    
    // Add user message to conversation
    const userMessage: Message = { 
      id: uuidv4(),
      sender: 'user', 
      text: text,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      // Call ElevenLabs API
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
      const assistantMessage: Message = { 
        id: uuidv4(),
        sender: 'assistant', 
        text: responseText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
      
      // Generate speech for the response if not muted
      if (!isMuted && volume > 0) {
        generateSpeech(responseText);
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
  };

  const handleToggleAudio = (text: string) => {
    togglePlayback();
  };

  const toggleMic = () => {
    setIsMicMuted(!isMicMuted);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div className="flex flex-col h-full bg-white/5 dark:bg-gray-900/30 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
      <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Voice Assistant</h2>
        <Button variant="outline" size="sm" onClick={onLogout} className="text-gray-700 dark:text-white border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800">
          Logout
        </Button>
      </div>

      <div className="flex-1 flex flex-col p-4 overflow-hidden">
        <div className="flex-1 flex flex-col">
          <div ref={chatContainerRef} className="flex-1 overflow-y-auto mb-4">
            <ConversationLog 
              messages={messages}
              isGeneratingAudio={isGenerating}
              isPlayingAudio={isPlaying}
              onToggleAudio={handleToggleAudio}
            />
          </div>
          
          <div className="mt-auto">
            <div className="relative w-64 h-64 mx-auto flex items-center justify-center">
              {/* Animated gradient background */}
              <div 
                className={`absolute w-full h-full rounded-full overflow-hidden ${isListening ? "animate-pulse" : ""}`}
              >
                <div 
                  className={`absolute inset-0 rounded-full ${isListening ? "animate-gradient-shift" : ""} dark:bg-gradient-premium-dark bg-gradient-premium-light`}
                  style={{
                    backgroundSize: "300% 300%",
                  }}
                />
                
                {/* Inner animated pulse effect */}
                <div 
                  className={`absolute inset-0 rounded-full ${isListening ? "animate-breathe" : ""}`}
                  style={{
                    background: "radial-gradient(circle, transparent 30%, var(--gradient-center-color) 70%)",
                    mixBlendMode: "overlay"
                  }}
                />
              </div>
              
              {/* Center white pill with status text */}
              <AIVoiceInput 
                onStart={handleListenStart}
                onStop={handleListenStop}
                className={isListening ? '' : 'opacity-75 hover:opacity-100 transition-opacity'}
              />

              {/* Circular buttons for controls */}
              <Button
                onClick={toggleMic}
                className={`absolute bottom-0 right-0 z-20 rounded-full w-12 h-12 flex items-center justify-center transition-colors duration-300 ${
                  isMicMuted 
                    ? "bg-red-500 text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700" 
                    : "bg-white/80 text-gray-800 hover:bg-white/90 dark:bg-gray-800/80 dark:text-gray-100 dark:hover:bg-gray-800/90 border border-gray-200 dark:border-gray-700"
                }`}
                variant="ghost"
                size="icon"
                aria-label={isMicMuted ? "Unmute microphone" : "Mute microphone"}
              >
                {isMicMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </Button>
              
              <Button
                onClick={toggleMute}
                className={`absolute bottom-0 left-0 z-20 rounded-full w-12 h-12 flex items-center justify-center transition-colors duration-300 ${
                  isMuted 
                    ? "bg-red-500 text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700" 
                    : "bg-white/80 text-gray-800 hover:bg-white/90 dark:bg-gray-800/80 dark:text-gray-100 dark:hover:bg-gray-800/90 border border-gray-200 dark:border-gray-700"
                }`}
                variant="ghost"
                size="icon"
                aria-label={isMuted ? "Unmute speaker" : "Mute speaker"}
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </Button>
              
              <Button
                onClick={toggleDarkMode}
                className="absolute top-0 right-0 z-20 rounded-full w-12 h-12 flex items-center justify-center transition-colors duration-300 bg-white/80 text-gray-800 hover:bg-white/90 dark:bg-gray-800/80 dark:text-gray-100 dark:hover:bg-gray-800/90 border border-gray-200 dark:border-gray-700"
                variant="ghost"
                size="icon"
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? 
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg> : 
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                }
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationInterface;
