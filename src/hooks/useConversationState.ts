
import { useState, useEffect, useCallback } from 'react';
import { Message } from '@/contexts/ConversationTypes';
import useElevenLabs from './useElevenLabs';
import useSpeechRecognition from './useSpeechRecognition';
import { toast } from '@/components/ui/use-toast';
import { createUserMessage, createAssistantMessage, createWelcomeMessage } from '@/utils/messageUtils';

interface UseConversationStateProps {
  apiKey: string;
  agentId: string;
}

export const useConversationState = ({ apiKey, agentId }: UseConversationStateProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isLoading, setIsLoading] = useState(false);
  const [shouldAutoListen, setShouldAutoListen] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === 'undefined') return false;
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

  // Speech recognition integration
  const { transcript } = useSpeechRecognition({
    isListening,
    isMicMuted,
    onTranscript: (text) => {
      setCurrentTranscript(text);
    },
    onFinalTranscript: (text) => {
      if (text.trim()) {
        console.log('Sending final transcript:', text);
        sendMessage(text);
        setIsListening(false);
      }
      setCurrentTranscript('');
    }
  });

  // Memoize the volume setting function to prevent infinite loops
  const updateTtsVolume = useCallback(() => {
    setTtsVolume(isMuted ? 0 : volume);
  }, [volume, isMuted, setTtsVolume]);

  useEffect(() => {
    // Set volume for TTS
    updateTtsVolume();
  }, [updateTtsVolume]);

  // Add initial greeting message when component mounts
  useEffect(() => {
    const welcomeMessage = createWelcomeMessage();
    setMessages([welcomeMessage]);
    
    // Generate speech for welcome message
    if (!isMuted && volume > 0) {
      generateSpeech(welcomeMessage.text);
    }
  }, []);

  // Enhanced auto-listen effect - improved to more reliably activate microphone after speech
  useEffect(() => {
    if (shouldAutoListen && !isPlaying && !isGenerating) {
      console.log('Auto-activating microphone after speech generation');
      setShouldAutoListen(false);
      
      // Wait a short time before activating the microphone
      const timer = setTimeout(() => {
        if (!isMicMuted) {
          console.log('Setting isListening to true after voice generation');
          setIsListening(true);
        } else {
          console.log('Not auto-activating mic because it is muted');
        }
      }, 750); // Slightly longer delay for more reliable activation
      
      return () => clearTimeout(timer);
    }
  }, [shouldAutoListen, isPlaying, isGenerating, isMicMuted]);

  // Add an effect to handle ending of speech playback
  useEffect(() => {
    // When speech stops playing, consider auto-activating the mic
    if (!isPlaying && !isGenerating && !isListening && !isMicMuted) {
      const timer = setTimeout(() => {
        if (!isListening && !isMicMuted) {
          console.log('Auto-activating microphone after playback ended');
          setIsListening(true);
        }
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [isPlaying, isGenerating, isListening, isMicMuted]);

  const toggleDarkMode = useCallback(() => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
    
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Handle voice input start
  const handleListenStart = useCallback(() => {
    setIsListening(true);
  }, []);

  // Handle voice input stop
  const handleListenStop = useCallback(async (duration: number) => {
    setIsListening(false);
    if (duration < 1) return; // Ignore very short recordings
    
    // Voice transcription is now handled by speech recognition
    // This function is kept for backward compatibility
  }, []);

  // Common function to handle sending messages to the agent
  const sendMessage = useCallback(async (text: string): Promise<void> => {
    if (!text.trim()) return;
    
    setIsLoading(true);
    
    // Add user message to conversation
    const userMessage = createUserMessage(text);
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
      const assistantMessage = createAssistantMessage(responseText);
      setMessages(prev => [...prev, assistantMessage]);
      
      // Generate speech for the response if not muted
      if (!isMuted && volume > 0) {
        await generateSpeech(responseText);
        // Set flag to auto-listen after speech generation
        setShouldAutoListen(true);
      } else {
        // Even if audio is muted, we should still auto-listen after a delay
        setTimeout(() => {
          if (!isMicMuted) {
            console.log('Setting isListening to true when audio is muted');
            setIsListening(true);
          }
        }, 1000);
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
  }, [apiKey, agentId, generateSpeech, isMuted, volume, isMicMuted]);

  const handleToggleAudio = useCallback((text: string) => {
    togglePlayback();
  }, [togglePlayback]);

  const toggleMic = useCallback(() => {
    setIsMicMuted(!isMicMuted);
    if (isListening && !isMicMuted) {
      // If we're turning the mic off and it's currently listening, stop listening
      setIsListening(false);
    }
  }, [isMicMuted, isListening]);

  const toggleMute = useCallback(() => {
    setIsMuted(!isMuted);
  }, [isMuted]);

  return {
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
    currentTranscript,
    sendMessage,
    handleToggleAudio,
    handleListenStart,
    handleListenStop,
    toggleDarkMode,
    toggleMic,
    toggleMute
  };
};
