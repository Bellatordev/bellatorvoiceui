
import { useEffect } from 'react';
import { Message } from '@/contexts/ConversationTypes';
import useAudioState from './useAudioState';
import useMicrophoneState from './useMicrophoneState';
import useUIPreferences from './useUIPreferences';
import useMessageHandler from './useMessageHandler';
import { createWelcomeMessage } from '@/utils/messageUtils';

interface UseConversationStateProps {
  apiKey: string;
  agentId: string;
}

export const useConversationState = ({ apiKey, agentId }: UseConversationStateProps) => {
  const uiPreferences = useUIPreferences();
  
  const audioState = useAudioState({ 
    apiKey 
  });
  
  const messageHandler = useMessageHandler({
    apiKey,
    agentId,
    generateSpeech: audioState.generateSpeech,
    isMuted: audioState.isMuted,
    volume: audioState.volume,
    setShouldAutoListen: audioState.setShouldAutoListen,
    isMicMuted: false, // Initialized before microphoneState
    microphonePermission: null, // Initialized before microphoneState
    setIsListening: () => {} // Placeholder, updated after microphoneState is initialized
  });
  
  const microphoneState = useMicrophoneState({
    onTranscriptComplete: (text) => messageHandler.sendMessage(text)
  });

  // Override the placeholder functions with actual functions
  Object.assign(messageHandler, {
    isMicMuted: microphoneState.isMicMuted,
    microphonePermission: microphoneState.microphonePermission,
    setIsListening: microphoneState.setIsListening
  });

  // Play welcome message on mount
  useEffect(() => {
    const welcomeMessage = createWelcomeMessage();
    messageHandler.addWelcomeMessage(welcomeMessage);
  }, []);

  // Auto-activate microphone after speech generation
  useEffect(() => {
    if (audioState.shouldAutoListen && !audioState.isPlaying && !audioState.isGenerating) {
      console.log('Auto-activating microphone after speech generation');
      audioState.setShouldAutoListen(false);
      
      const timer = setTimeout(() => {
        if (!microphoneState.isMicMuted && microphoneState.microphonePermission !== 'denied') {
          console.log('Setting isListening to true after voice generation');
          microphoneState.setIsListening(true);
        } else {
          console.log('Not auto-activating mic because it is muted or permission is denied');
        }
      }, 750);
      
      return () => clearTimeout(timer);
    }
  }, [
    audioState.shouldAutoListen, 
    audioState.isPlaying, 
    audioState.isGenerating, 
    audioState.setShouldAutoListen,
    microphoneState.isMicMuted, 
    microphoneState.microphonePermission,
    microphoneState.setIsListening
  ]);

  // Auto-activate microphone after playback ended
  useEffect(() => {
    if (!audioState.isPlaying && !audioState.isGenerating && !microphoneState.isListening && 
        !microphoneState.isMicMuted && microphoneState.microphonePermission !== 'denied') {
      const timer = setTimeout(() => {
        if (!microphoneState.isListening && !microphoneState.isMicMuted) {
          console.log('Auto-activating microphone after playback ended');
          microphoneState.setIsListening(true);
        }
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [
    audioState.isPlaying, 
    audioState.isGenerating, 
    microphoneState.isListening, 
    microphoneState.isMicMuted, 
    microphoneState.microphonePermission,
    microphoneState.setIsListening
  ]);

  return {
    apiKey,
    agentId,
    ...messageHandler,
    ...microphoneState,
    ...audioState,
    ...uiPreferences
  };
};

export default useConversationState;
