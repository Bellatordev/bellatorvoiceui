
import { useState, useEffect, useCallback, useRef } from 'react';
import ElevenLabsService from '@/services/elevenLabsService';

interface UseElevenLabsOptions {
  apiKey: string;
  voiceId: string;
  modelId?: string;
  onPlaybackEnd?: () => void;
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

export const useElevenLabs = ({
  apiKey,
  voiceId,
  modelId = "eleven_multilingual_v2",
  onPlaybackEnd
}: UseElevenLabsOptions): UseElevenLabsReturn => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const serviceRef = useRef<ElevenLabsService | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const unsubscribePlaybackEndRef = useRef<(() => void) | null>(null);

  // Initialize service on mount
  useEffect(() => {
    try {
      const service = ElevenLabsService.getInstance();
      serviceRef.current = service;
      
      // Subscribe to state changes
      unsubscribeRef.current = service.subscribe(state => {
        setIsGenerating(state.isGenerating);
        setIsPlaying(state.isPlaying);
        setError(state.error);
      });
      
      // Subscribe to playback end events
      if (onPlaybackEnd) {
        unsubscribePlaybackEndRef.current = service.onPlaybackEnd(() => {
          console.log('Playback end detected in hook');
          onPlaybackEnd();
        });
      }
      
      return () => {
        // Unsubscribe on cleanup
        if (unsubscribeRef.current) {
          unsubscribeRef.current();
          unsubscribeRef.current = null;
        }
        
        if (unsubscribePlaybackEndRef.current) {
          unsubscribePlaybackEndRef.current();
          unsubscribePlaybackEndRef.current = null;
        }
      };
    } catch (error) {
      console.error('Error initializing ElevenLabs service:', error);
      setError('Failed to initialize speech service');
      return () => {};
    }
  }, [onPlaybackEnd]);

  // Generate speech method
  const generateSpeech = useCallback(async (text: string): Promise<void> => {
    if (!serviceRef.current) {
      console.error('ElevenLabs service not initialized');
      setError('Speech service not initialized');
      return;
    }
    
    setError(null);
    setIsGenerating(true);
    
    try {
      await serviceRef.current.generateSpeech({
        text,
        voiceId,
        apiKey,
        modelId
      });
    } catch (error) {
      console.error('Error generating speech:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error generating speech';
      setError(errorMessage);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  }, [apiKey, voiceId, modelId]);

  // Stop audio method
  const stopAudio = useCallback(() => {
    if (!serviceRef.current) return;
    
    console.log('Stopping audio playback from hook');
    serviceRef.current.stopAudio();
  }, []);

  // Toggle playback method
  const togglePlayback = useCallback(() => {
    if (!serviceRef.current) return;
    
    serviceRef.current.togglePlayback();
  }, []);

  // Cleanup method
  const cleanup = useCallback(() => {
    console.log('Cleaning up ElevenLabs service from hook');
    
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
    
    if (unsubscribePlaybackEndRef.current) {
      unsubscribePlaybackEndRef.current();
      unsubscribePlaybackEndRef.current = null;
    }
    
    if (serviceRef.current) {
      serviceRef.current.cleanup();
    }
  }, []);

  return {
    generateSpeech,
    stopAudio,
    togglePlayback,
    isGenerating,
    isPlaying,
    error,
    cleanup
  };
};

export default useElevenLabs;
