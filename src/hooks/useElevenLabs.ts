
import { useState, useEffect, useCallback } from 'react';
import ElevenLabsService from '../services/elevenLabsService';
import { toast } from '@/components/ui/use-toast';

interface UseElevenLabsOptions {
  apiKey: string;
  voiceId: string;
  modelId?: string;
  active?: boolean; // Add active prop
}

interface UseElevenLabsReturn {
  generateSpeech: (text: string) => Promise<void>;
  stopAudio: () => void;
  togglePlayback: () => void;
  cleanup: () => void; // Add cleanup method
  isGenerating: boolean;
  isPlaying: boolean;
  error: string | null;
}

export const useElevenLabs = ({ 
  apiKey, 
  voiceId, 
  modelId,
  active = true // Default to true for backward compatibility
}: UseElevenLabsOptions): UseElevenLabsReturn => {
  const [state, setState] = useState({
    isGenerating: false,
    isPlaying: false,
    error: null as string | null
  });

  // Store unsubscribe function in a ref
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!apiKey || !voiceId) {
      setState(prev => ({ ...prev, error: "Missing API key or voice ID" }));
      return;
    }

    // Only initialize service if active
    if (active) {
      const service = ElevenLabsService.getInstance();
      const unsubscribe = service.subscribe(setState);
      unsubscribeRef.current = unsubscribe;
      
      return () => {
        if (unsubscribeRef.current) {
          unsubscribeRef.current();
          unsubscribeRef.current = null;
        }
        // Stop any audio when component unmounts
        service.stopAudio();
      };
    } else {
      // If not active, make sure to clean up
      cleanup();
    }
  }, [apiKey, voiceId, active]);

  const generateSpeech = async (text: string): Promise<void> => {
    if (!text.trim() || !active) return;
    
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

  // Add cleanup method to completely reset state and stop audio
  const cleanup = useCallback((): void => {
    console.log('Cleaning up ElevenLabs service');
    const service = ElevenLabsService.getInstance();
    service.stopAudio();
    
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
    
    setState({
      isGenerating: false,
      isPlaying: false,
      error: null
    });
  }, []);

  return {
    generateSpeech,
    stopAudio,
    togglePlayback,
    cleanup,
    ...state
  };
};

// Add missing useRef import at the top
import { useRef } from 'react';

export default useElevenLabs;
