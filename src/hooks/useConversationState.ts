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

  const { 
    generateSpeech, 
    stopAudio, 
    togglePlayback, 
    setVolume: setTtsVolume,
    isGenerating, 
    isPlaying,
    error 
  } = useElevenLabs({ 
    apiKey, 
    voiceId: 'EXAVITQu4vr4xnSDxMaL', // Using 'Sarah' voice by default
    modelId: 'eleven_multilingual_v2'
  });

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

  const updateTtsVolume = useCallback(() => {
    setTtsVolume(isMuted ? 0 : volume);
  }, [volume, isMuted, setTtsVolume]);

  useEffect(() => {
    updateTtsVolume();
  }, [updateTtsVolume]);

  useEffect(() => {
    const welcomeMessage = createWelcomeMessage();
    setMessages([welcomeMessage]);
    
    const playWelcomeMessage = async () => {
      console.log('Attempting to play welcome message');
      if (!isMuted && volume > 0) {
        try {
          await new Promise(resolve => setTimeout(resolve, 500));
          await generateSpeech(welcomeMessage.text);
          console.log('Welcome message speech generated successfully');
          setShouldAutoListen(true);
        } catch (error) {
          console.error('Failed to generate welcome message speech:', error);
          
          if (!isMicMuted) {
            setTimeout(() => {
              setIsListening(true);
            }, 1000);
          }
        }
      }
    };
    
    playWelcomeMessage();
  }, []);

  useEffect(() => {
    if (shouldAutoListen && !isPlaying && !isGenerating) {
      console.log('Auto-activating microphone after speech generation');
      setShouldAutoListen(false);
      
      const timer = setTimeout(() => {
        if (!isMicMuted) {
          console.log('Setting isListening to true after voice generation');
          setIsListening(true);
        } else {
          console.log('Not auto-activating mic because it is muted');
        }
      }, 750);
      
      return () => clearTimeout(timer);
    }
  }, [shouldAutoListen, isPlaying, isGenerating, isMicMuted]);

  useEffect(() => {
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

  const handleListenStart = useCallback(() => {
    setIsListening(true);
  }, []);

  const handleListenStop = useCallback(async (duration: number) => {
    setIsListening(false);
    if (duration < 1) return;
  }, []);

  const sendMessage = useCallback(async (text: string): Promise<void> => {
    if (!text.trim()) return;
    
    setIsLoading(true);
    
    const userMessage = createUserMessage(text);
    setMessages(prev => [...prev, userMessage]);

    try {
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
        const errorData = await response.json();
        if (errorData?.detail?.status === 'quota_exceeded') {
          throw new Error(`ElevenLabs API quota exceeded: ${errorData.detail.message}`);
        }
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      const responseText = data.choices[0].message.content;
      
      const assistantMessage = createAssistantMessage(responseText);
      setMessages(prev => [...prev, assistantMessage]);
      
      if (!isMuted && volume > 0) {
        console.log('Generating speech for response:', responseText);
        await generateSpeech(responseText);
        setShouldAutoListen(true);
      } else {
        console.log('Audio is muted, not generating speech');
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
      
      setTimeout(() => {
        if (!isMicMuted) {
          console.log('Setting isListening to true after error');
          setIsListening(true);
        }
      }, 1000);
    } finally {
      setIsLoading(false);
    }
  }, [apiKey, agentId, generateSpeech, isMuted, volume, isMicMuted]);

  const handleToggleAudio = useCallback((text: string) => {
    togglePlayback();
  }, [togglePlayback]);

  const toggleMic = useCallback(() => {
    const newMutedState = !isMicMuted;
    setIsMicMuted(newMutedState);
    
    if (newMutedState && isListening) {
      console.log('Stopping listening because mic was muted');
      setIsListening(false);
      setCurrentTranscript('');
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
    error,
    sendMessage,
    handleToggleAudio,
    handleListenStart,
    handleListenStop,
    toggleDarkMode,
    toggleMic,
    toggleMute
  };
};
