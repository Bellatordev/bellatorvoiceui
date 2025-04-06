
import { useState, useEffect } from 'react';
import ElevenLabsService from '../services/elevenLabsService';
import { toast } from '@/components/ui/use-toast';

interface UseElevenLabsOptions {
  apiKey: string;
  voiceId: string;
  modelId?: string;
}

interface UseElevenLabsReturn {
  generateSpeech: (text: string) => Promise<void>;
  stopAudio: () => void;
  togglePlayback: () => void;
  isGenerating: boolean;
  isPlaying: boolean;
  error: string | null;
  cleanup: () => void;
}

export const useElevenLabs = ({ apiKey, voiceId, modelId }: UseElevenLabsOptions): UseElevenLabsReturn => {
  const [state, setState] = useState({
    isGenerating: false,
    isPlaying: false,
    error: null as string | null
  });

  useEffect(() => {
    if (!apiKey || !voiceId) {
      setState(prev => ({ ...prev, error: "Missing API key or voice ID" }));
      return;
    }

    const service = ElevenLabsService.getInstance();
    const unsubscribe = service.subscribe(setState);
    
    return () => {
      unsubscribe();
    };
  }, [apiKey, voiceId]);

  const generateSpeech = async (text: string): Promise<void> => {
    if (!text.trim()) return;
    
    try {
      const service = ElevenLabsService.getInstance();
      await service.generateSpeech({ text, voiceId, apiKey, modelId });
    } catch (error) {
      console.error('Error generating speech:', error);
      
      // Don't show toast for quota errors 
      if (error instanceof Error && !error.message.includes('quota')) {
        toast({
          title: "Speech Generation Note",
          description: error instanceof Error ? error.message : "An issue occurred with speech generation",
          variant: "default"
        });
      } else if (error instanceof Error && error.message.includes('quota')) {
        console.log('TTS quota exceeded, continuing without voice output');
      }
      
      // Set error state
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error 
          ? error.message 
          : "Issue with speech generation" 
      }));
    }
  };

  const stopAudio = (): void => {
    console.log('Stopping audio playback');
    const service = ElevenLabsService.getInstance();
    service.stopAudio();
  };

  const togglePlayback = (): void => {
    const service = ElevenLabsService.getInstance();
    service.togglePlayback();
  };

  const cleanup = (): void => {
    console.log('Cleaning up ElevenLabs service');
    ElevenLabsService.destroyInstance();
  };

  return {
    generateSpeech,
    stopAudio,
    togglePlayback,
    cleanup,
    ...state
  };
};

export default useElevenLabs;
