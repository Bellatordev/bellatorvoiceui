
import { useState, useCallback, useEffect } from 'react';
import useElevenLabs from './useElevenLabs';

interface UseAudioStateProps {
  apiKey: string;
}

export const useAudioState = ({ apiKey }: UseAudioStateProps) => {
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [shouldAutoListen, setShouldAutoListen] = useState(false);

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

  const updateTtsVolume = useCallback(() => {
    setTtsVolume(isMuted ? 0 : volume);
  }, [volume, isMuted, setTtsVolume]);

  useEffect(() => {
    updateTtsVolume();
  }, [updateTtsVolume]);

  const toggleMute = useCallback(() => {
    setIsMuted(!isMuted);
  }, [isMuted]);

  const handleToggleAudio = useCallback((text: string) => {
    togglePlayback();
  }, [togglePlayback]);

  return {
    isMuted,
    setIsMuted,
    volume,
    setVolume,
    isGenerating,
    isPlaying,
    error,
    generateSpeech,
    shouldAutoListen,
    setShouldAutoListen,
    toggleMute,
    handleToggleAudio
  };
};

export default useAudioState;
