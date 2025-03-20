
import { useState, useEffect } from 'react';
import ElevenLabsService from '../services/elevenLabsService';

interface UseElevenLabsOptions {
  apiKey: string;
  voiceId: string;
  modelId?: string;
}

interface UseElevenLabsReturn {
  generateSpeech: (text: string) => Promise<void>;
  stopAudio: () => void;
  togglePlayback: () => void;
  setVolume: (volume: number) => void;
  isGenerating: boolean;
  isPlaying: boolean;
  volume: number;
  error: string | null;
}

export const useElevenLabs = ({ apiKey, voiceId, modelId }: UseElevenLabsOptions): UseElevenLabsReturn => {
  const [state, setState] = useState({
    isGenerating: false,
    isPlaying: false,
    error: null as string | null,
    volume: 0.8
  });

  useEffect(() => {
    const service = ElevenLabsService.getInstance();
    const unsubscribe = service.subscribe(setState);
    
    return () => {
      unsubscribe();
    };
  }, []);

  const generateSpeech = async (text: string): Promise<void> => {
    const service = ElevenLabsService.getInstance();
    await service.generateSpeech({ text, voiceId, apiKey, modelId });
  };

  const stopAudio = (): void => {
    const service = ElevenLabsService.getInstance();
    service.stopAudio();
  };

  const togglePlayback = (): void => {
    const service = ElevenLabsService.getInstance();
    service.togglePlayback();
  };

  const setVolume = (volume: number): void => {
    const service = ElevenLabsService.getInstance();
    service.setVolume(volume);
  };

  return {
    generateSpeech,
    stopAudio,
    togglePlayback,
    setVolume,
    ...state
  };
};

export default useElevenLabs;
