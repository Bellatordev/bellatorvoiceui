
import { useState, useEffect, useCallback } from 'react';
import useElevenLabs from './useElevenLabs';
import useSpeechRecognition from './useSpeechRecognition';
import { useConversationMessages } from './useConversationMessages';
import { useAudioState } from './useAudioState';
import { useThemeState } from './useThemeState';

interface UseConversationStateProps {
  apiKey: string;
  agentId: string;
}

export const useConversationState = ({ apiKey, agentId }: UseConversationStateProps) => {
  const [isListening, setIsListening] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [hasMicrophonePermission, setHasMicrophonePermission] = useState<boolean | null>(null);

  // Initialize audio state management
  const {
    isMicMuted,
    setIsMicMuted,
    isMuted,
    setIsMuted,
    volume,
    setVolume,
    shouldAutoListen,
    setShouldAutoListen,
    toggleMic,
    toggleMute
  } = useAudioState();

  // Initialize theme state management
  const { isDarkMode, setIsDarkMode, toggleDarkMode } = useThemeState();

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
    voiceId: 'EXAVITQu4vr4xnSDxMaL',
    modelId: 'eleven_multilingual_v2'
  });

  // Initialize conversation messages management
  const {
    messages,
    isLoading,
    sendMessage,
    initializeMessages
  } = useConversationMessages({
    apiKey,
    agentId,
    generateSpeech,
    isMuted,
    volume,
    isMicMuted,
    hasMicrophonePermission,
    setIsListening,
    setShouldAutoListen
  });

  // Speech recognition integration
  const { transcript, isRecognitionSupported, hasMicrophonePermission: micPermission } = useSpeechRecognition({
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

  // Update microphone permission state
  useEffect(() => {
    setHasMicrophonePermission(micPermission);
  }, [micPermission]);

  // Memoize the volume setting function
  const updateTtsVolume = useCallback(() => {
    setTtsVolume(isMuted ? 0 : volume);
  }, [volume, isMuted, setTtsVolume]);

  useEffect(() => {
    updateTtsVolume();
  }, [updateTtsVolume]);

  // Initialize conversation with welcome message
  useEffect(() => {
    initializeMessages();
  }, [initializeMessages]);

  // Handle voice input start
  const handleListenStart = useCallback(() => {
    if (hasMicrophonePermission === false) {
      return;
    }
    setIsListening(true);
  }, [hasMicrophonePermission]);

  // Handle voice input stop
  const handleListenStop = useCallback(async (duration: number) => {
    setIsListening(false);
    if (duration < 1) return;
  }, []);

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
    hasMicrophonePermission,
    sendMessage,
    handleToggleAudio: togglePlayback,
    handleListenStart,
    handleListenStop,
    toggleDarkMode,
    toggleMic,
    toggleMute
  };
};
