
import { useState, useEffect, useRef } from 'react';
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
  const hasDisplayedVoiceError = useRef(false);

  useEffect(() => {
    if (!apiKey || !voiceId) {
      setState(prev => ({ ...prev, error: "Missing API key or voice ID" }));
      return;
    }

    const service = ElevenLabsService.getInstance();
    
    // Log voice ID for debugging
    console.log(`useElevenLabs initialized with voice ID: ${voiceId}`);
    
    const unsubscribe = service.subscribe(setState);
    
    // Reset error flag when voice ID changes
    hasDisplayedVoiceError.current = false;
    
    return () => {
      console.log('useElevenLabs hook unmounting, cleaning up subscription');
      unsubscribe();
    };
  }, [apiKey, voiceId]);

  const generateSpeech = async (text: string): Promise<void> => {
    if (!text || !text.trim()) {
      console.log('Empty text provided to generateSpeech, skipping');
      return;
    }
    
    // Skip voice generation if we've already had a voice error
    if (hasDisplayedVoiceError.current) {
      console.log('Skipping speech generation due to previous voice error');
      return;
    }
    
    try {
      console.log(`Generating speech for text: "${text.substring(0, 30)}..."`, `using voice ID: ${voiceId}`);
      const service = ElevenLabsService.getInstance();
      await service.generateSpeech({ text, voiceId, apiKey, modelId });
    } catch (error) {
      console.error('Error generating speech:', error);
      
      // Only show the error toast once per voice ID
      if (!hasDisplayedVoiceError.current) {
        if (error instanceof Error && error.message.includes('voice_not_found')) {
          toast({
            title: "Speech Generation Error",
            description: "Voice ID not found. Speech generation has been disabled.",
            variant: "destructive"
          });
          
          // Mark that we've shown the error for this voice ID
          hasDisplayedVoiceError.current = true;
        } else if (error instanceof Error && !error.message.includes('quota')) {
          toast({
            title: "Speech Generation Issue",
            description: error.message,
            variant: "default"
          });
        } else if (error instanceof Error && error.message.includes('quota')) {
          console.log('TTS quota exceeded, continuing without voice output');
          toast({
            title: "API Quota Exceeded",
            description: "Voice generation has been disabled due to API quota limits.",
            variant: "destructive"
          });
          
          // Mark that we've shown the quota error
          hasDisplayedVoiceError.current = true;
        }
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
    console.log('Stopping audio playback from hook');
    const service = ElevenLabsService.getInstance();
    service.stopAudio();
  };

  const togglePlayback = (): void => {
    console.log('Toggling audio playback from hook');
    const service = ElevenLabsService.getInstance();
    service.togglePlayback();
  };

  // Enhanced cleanup that ensures complete audio shutdown
  const cleanup = (): void => {
    console.log('Cleaning up ElevenLabs service from hook');
    
    // First stop any playing audio
    try {
      const service = ElevenLabsService.getInstance();
      service.stopAudio();
      service.cleanup();
    } catch (error) {
      console.error('Error during ElevenLabs cleanup:', error);
    }
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
