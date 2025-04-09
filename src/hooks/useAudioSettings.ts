
import { useState, useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';

interface UseAudioSettingsOptions {
  stopAudio: () => void;
}

export const useAudioSettings = ({ stopAudio }: UseAudioSettingsOptions) => {
  const [inputMode, setInputMode] = useState<'voice' | 'text'>('voice');
  const [isMuted, setIsMuted] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [autoStartMic, setAutoStartMic] = useState(true);

  const handleMuteToggle = useCallback(() => {
    setIsMuted(!isMuted);
    if (stopAudio) {
      stopAudio();
    }
  }, [isMuted, stopAudio]);

  const handleVolumeChange = useCallback((value: number) => {
    console.log('Setting audio volume to', value);
    setVolume(value);
  }, []);

  const handleSwitchToTextMode = useCallback(() => {
    setIsMicMuted(true);
    setInputMode('text');
  }, []);

  const handleSwitchToVoiceMode = useCallback(() => {
    setIsMicMuted(false);
    setInputMode('voice');
  }, []);

  const handleMicMuteToggle = useCallback(() => {
    const newMuteState = !isMicMuted;
    console.log(`Microphone mute toggled to: ${newMuteState ? 'muted' : 'unmuted'}`);
    setIsMicMuted(newMuteState);
  }, [isMicMuted]);

  return {
    inputMode,
    isMuted,
    isMicMuted,
    volume,
    autoStartMic,
    handleMuteToggle,
    handleVolumeChange,
    handleSwitchToTextMode,
    handleSwitchToVoiceMode,
    handleMicMuteToggle,
    setAutoStartMic
  };
};

export default useAudioSettings;
