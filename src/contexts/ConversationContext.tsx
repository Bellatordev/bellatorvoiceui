
import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import useElevenLabs from '../hooks/useElevenLabs';
import { toast } from '@/components/ui/use-toast';

// Define Message type for the conversation
export type Message = {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
};

interface ConversationContextType {
  apiKey: string;
  agentId: string;
  messages: Message[];
  isListening: boolean;
  setIsListening: (value: boolean) => void;
  isMicMuted: boolean;
  setIsMicMuted: (value: boolean) => void;
  isMuted: boolean;
  setIsMuted: (value: boolean) => void;
  volume: number;
  setVolume: (value: number) => void;
  isLoading: boolean;
  isDarkMode: boolean;
  setIsDarkMode: (value: boolean) => void;
  isGenerating: boolean;
  isPlaying: boolean;
  sendMessage: (text: string) => Promise<void>;
  handleToggleAudio: (text: string) => void;
  handleListenStart: () => void;
  handleListenStop: (duration: number) => void;
  toggleDarkMode: () => void;
  toggleMic: () => void;
  toggleMute: () => void;
}

export const ConversationContext = createContext<ConversationContextType | undefined>(undefined);

export const useConversation = () => {
  const context = useContext(ConversationContext);
  if (!context) {
    throw new Error('useConversation must be used within a ConversationProvider');
  }
  return context;
};

interface ConversationProviderProps {
  children: React.ReactNode;
  apiKey: string;
  agentId: string;
}

export const ConversationProvider: React.FC<ConversationProviderProps> = ({ 
  children, 
  apiKey, 
  agentId 
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isLoading, setIsLoading] = useState(false);
  const [shouldAutoListen, setShouldAutoListen] = useState(false);
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

  // Auto-listen after speech generation is complete
  useEffect(() => {
    if (shouldAutoListen && !isPlaying && !isGenerating) {
      console.log('Auto-activating microphone after speech generation');
      setShouldAutoListen(false);
      if (!isMicMuted) {
        setTimeout(() => {
          setIsListening(true);
        }, 500); // Small delay to ensure smooth transition
      }
    }
  }, [shouldAutoListen, isPlaying, isGenerating, isMicMuted]);

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
        // Set flag to auto-listen after speech generation
        setShouldAutoListen(true);
      } else {
        // If audio is muted, we should still auto-listen
        setShouldAutoListen(true);
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

  const value = {
    apiKey,
    agentId,
    messages,
    isListening,
    setIsListening,
    isMicMuted,
    setIsMicMuted,
    isMuted,
    setIsMuted,
    volume,
    setVolume,
    isLoading,
    isDarkMode,
    setIsDarkMode,
    isGenerating,
    isPlaying,
    sendMessage,
    handleToggleAudio,
    handleListenStart,
    handleListenStop,
    toggleDarkMode,
    toggleMic,
    toggleMute
  };

  return (
    <ConversationContext.Provider value={value}>
      {children}
    </ConversationContext.Provider>
  );
};
