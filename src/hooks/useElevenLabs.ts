
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
      toast({
        title: "Speech Generation Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
      
      // Set error state
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error 
          ? error.message 
          : "Failed to generate speech" 
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

  return {
    generateSpeech,
    stopAudio,
    togglePlayback,
    ...state
  };
};

export default useElevenLabs;
