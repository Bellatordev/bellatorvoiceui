
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
  
  // Track whether we've shown an error for this session
  const hasDisplayedErrorThisSession = useRef(false);
  const lastVoiceIdRef = useRef<string | null>(null);
  
  useEffect(() => {
    if (!apiKey || !voiceId) {
      setState(prev => ({ ...prev, error: "Missing API key or voice ID" }));
      return;
    }

    const service = ElevenLabsService.getInstance();
    
    console.log(`useElevenLabs initialized with voice ID: ${voiceId}`);
    
    const unsubscribe = service.subscribe(setState);
    
    // Only reset error flag when voice ID changes
    if (lastVoiceIdRef.current !== voiceId) {
      console.log(`Voice ID changed from ${lastVoiceIdRef.current} to ${voiceId}, resetting error state`);
      lastVoiceIdRef.current = voiceId;
    }
    
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
    
    // Skip voice generation if we've already had an error in this session
    if (hasDisplayedErrorThisSession.current) {
      console.log('Skipping speech generation due to previous error this session');
      return;
    }
    
    try {
      console.log(`Generating speech for text: "${text.substring(0, 30)}..."`, `using voice ID: ${voiceId}`);
      const service = ElevenLabsService.getInstance();
      await service.generateSpeech({ text, voiceId, apiKey, modelId });
    } catch (error) {
      console.error('Error generating speech:', error);
      
      // Only show the error toast once for this entire session
      if (!hasDisplayedErrorThisSession.current) {
        hasDisplayedErrorThisSession.current = true;
        
        if (error instanceof Error) {
          let errorMessage = "Speech generation issue";
          let variant: "default" | "destructive" = "default";
          
          if (error.message.includes('voice_not_found')) {
            errorMessage = "Voice ID not found. Speech generation has been disabled.";
            variant = "destructive";
          } else if (error.message.includes('quota')) {
            errorMessage = "Voice generation has been disabled due to API quota limits.";
            variant = "destructive";
          }
          
          toast({
            title: "Speech Generation Error",
            description: errorMessage,
            variant: variant,
            duration: 3000, // Short duration to prevent UI blocking
          });
        }
      }
      
      // Set error state
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : "Issue with speech generation" 
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
