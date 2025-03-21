
import { useState, useCallback, useEffect } from 'react';

export const useAudioState = () => {
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [shouldAutoListen, setShouldAutoListen] = useState(false);

  const toggleMic = useCallback(() => {
    setIsMicMuted(prev => !prev);
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  return {
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
  };
};
