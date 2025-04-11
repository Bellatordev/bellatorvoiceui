
// Service to handle Eleven Labs TTS API integration

interface TTSOptions {
  text: string;
  voiceId: string;
  apiKey: string;
  modelId?: string;
}

interface ElevenLabsState {
  isGenerating: boolean;
  isPlaying: boolean;
  error: string | null;
}

class ElevenLabsService {
  private static instance: ElevenLabsService;
  private audioElement: HTMLAudioElement | null = null;
  private currentVoiceId: string | null = null;
  private currentApiKey: string | null = null;
  private state: ElevenLabsState = {
    isGenerating: false,
    isPlaying: false,
    error: null
  };
  private stateListeners: ((state: ElevenLabsState) => void)[] = [];
  private playbackEndListeners: (() => void)[] = [];

  private constructor() {
    console.log('Creating new ElevenLabsService instance');
    this.audioElement = new Audio();
    this.setupAudioEventListeners();
  }
  
  private setupAudioEventListeners() {
    if (!this.audioElement) return;
    
    this.audioElement.addEventListener('play', () => {
      console.log('Audio started playing');
      this.updateState({ isPlaying: true });
    });
    
    this.audioElement.addEventListener('ended', () => {
      console.log('Audio finished playing');
      this.updateState({ isPlaying: false });
      // Notify listeners that playback has ended
      this.playbackEndListeners.forEach(listener => listener());
    });
    
    this.audioElement.addEventListener('pause', () => {
      console.log('Audio paused');
      this.updateState({ isPlaying: false });
      // Check if we're at the end of the audio
      if (this.audioElement && this.audioElement.currentTime >= this.audioElement.duration - 0.1) {
        // Notify listeners that playback has ended
        this.playbackEndListeners.forEach(listener => listener());
      }
    });
    
    this.audioElement.addEventListener('error', (e) => {
      console.error('Audio playback error:', e);
      this.updateState({ 
        isPlaying: false, 
        error: 'Error playing audio' 
      });
      // Also notify listeners about end on error
      this.playbackEndListeners.forEach(listener => listener());
    });
    
    // Add a canplaythrough event to ensure audio can play
    this.audioElement.addEventListener('canplaythrough', () => {
      console.log('Audio can play through without buffering');
    });
  }

  public static getInstance(): ElevenLabsService {
    if (!ElevenLabsService.instance) {
      ElevenLabsService.instance = new ElevenLabsService();
    }
    return ElevenLabsService.instance;
  }

  public subscribe(listener: (state: ElevenLabsState) => void): () => void {
    this.stateListeners.push(listener);
    listener({ ...this.state });
    
    return () => {
      this.stateListeners = this.stateListeners.filter(l => l !== listener);
    };
  }
  
  public onPlaybackEnd(listener: () => void): () => void {
    this.playbackEndListeners.push(listener);
    
    return () => {
      this.playbackEndListeners = this.playbackEndListeners.filter(l => l !== listener);
    };
  }

  private updateState(partialState: Partial<ElevenLabsState>) {
    this.state = { ...this.state, ...partialState };
    this.stateListeners.forEach(listener => listener({ ...this.state }));
  }

  public async generateSpeech({ text, voiceId, apiKey, modelId = "eleven_multilingual_v2" }: TTSOptions): Promise<void> {
    if (!text || !voiceId || !apiKey) {
      const errorMsg = 'Missing required parameters for speech generation';
      console.error(errorMsg);
      this.updateState({ error: errorMsg });
      return;
    }

    // Store current voice and API key
    this.currentVoiceId = voiceId;
    this.currentApiKey = apiKey;

    // Stop any currently playing audio first
    this.stopAudio();

    try {
      this.updateState({ isGenerating: true, error: null });
      console.log(`Generating speech with voice ID: ${voiceId}`);
      
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey
        },
        body: JSON.stringify({
          text,
          model_id: modelId,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5
          }
        })
      });

      if (!response.ok) {
        let errorMessage = `Error ${response.status}: `;
        
        try {
          const errorData = await response.json();
          errorMessage += errorData.detail?.message || JSON.stringify(errorData);
          console.error('Response error data:', errorData);
          
          // Specific handling for voice not found errors
          if (errorData.detail?.status === 'voice_not_found') {
            errorMessage = `Voice ID "${voiceId}" was not found. Please check your voice configuration.`;
          }
          // Add specific handling for quota errors
          else if (errorData.detail?.message?.includes('quota')) {
            errorMessage = `API quota exceeded. Voice generation is temporarily unavailable.`;
          }
        } catch (parseError) {
          errorMessage += await response.text() || 'Unknown error';
        }
        
        throw new Error(errorMessage);
      }

      const audioBlob = await response.blob();
      console.log('Audio blob received:', audioBlob.size, 'bytes');
      
      // Test if blob is valid
      if (audioBlob.size === 0) {
        throw new Error('Received empty audio data from API');
      }
      
      const audioUrl = URL.createObjectURL(audioBlob);
      
      if (this.audioElement) {
        // Ensure we're not playing anything before starting
        this.audioElement.pause();
        this.audioElement.currentTime = 0;
        
        // Remove old source if it exists
        const oldSrc = this.audioElement.src;
        if (oldSrc && oldSrc.startsWith('blob:')) {
          try {
            URL.revokeObjectURL(oldSrc);
          } catch (e) {
            console.error('Error revoking old audio URL:', e);
          }
        }
        
        console.log('Setting audio source and attempting to play');
        this.audioElement.src = audioUrl;
        
        try {
          // Add explicit loading
          this.audioElement.load();
          
          // Set volume to ensure it's audible
          this.audioElement.volume = 1.0;
          
          // Use the play() promise to catch any autoplay issues
          const playPromise = this.audioElement.play();
          
          if (playPromise !== undefined) {
            playPromise.catch(error => {
              console.error('Error playing audio:', error);
              this.updateState({ 
                isGenerating: false,
                error: 'Failed to play audio: ' + error.message 
              });
            });
          }
        } catch (playError) {
          console.error('Exception during audio playback:', playError);
          this.updateState({ 
            isGenerating: false,
            error: 'Exception during playback: ' + playError.message
          });
        }
      }
      
      this.updateState({ isGenerating: false });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error generating speech';
      console.error('Error generating speech:', error);
      this.updateState({ 
        isGenerating: false, 
        error: errorMsg
      });
      
      throw error; // Re-throw to let callers handle the error
    }
  }

  public stopAudio(): void {
    if (!this.audioElement) return;
    
    console.log('Stopping audio playback');
    try {
      // Force pause and reset
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
      
      // Release the audio source
      const src = this.audioElement.src;
      this.audioElement.src = '';
      
      if (src && src.startsWith('blob:')) {
        try {
          URL.revokeObjectURL(src);
        } catch (e) {
          console.error('Error revoking audio URL:', e);
        }
      }
      
      this.updateState({ isPlaying: false, isGenerating: false });
    } catch (err) {
      console.error('Error stopping audio:', err);
    }
  }

  public togglePlayback(): void {
    if (!this.audioElement) return;
    
    if (this.audioElement.paused) {
      console.log('Resuming audio playback');
      if (this.audioElement.src) {
        try {
          this.audioElement.play().catch(error => {
            console.error('Error playing audio:', error);
            this.updateState({ error: 'Failed to play audio: ' + error.message });
          });
        } catch (e) {
          console.error('Exception during play:', e);
        }
      } else {
        console.warn('Cannot resume playback - no audio source set');
      }
    } else {
      console.log('Pausing audio playback');
      this.audioElement.pause();
    }
  }

  public getState(): ElevenLabsState {
    return { ...this.state };
  }

  public getCurrentVoiceId(): string | null {
    return this.currentVoiceId;
  }

  // Add a cleanup method to properly dispose of the service
  public cleanup(): void {
    console.log('Cleaning up ElevenLabs service resources');
    
    // First stop any playing audio
    this.stopAudio();
    
    if (this.audioElement) {
      // Remove all event listeners to prevent memory leaks
      try {
        const element = this.audioElement;
        element.onplay = null;
        element.onpause = null;
        element.onended = null;
        element.onerror = null;
        element.oncanplaythrough = null;
        
        // Release audio resources
        const src = element.src;
        element.src = '';
        if (src && src.startsWith('blob:')) {
          URL.revokeObjectURL(src);
        }
      } catch (e) {
        console.error('Error cleaning up audio element:', e);
      }
      
      // Set to null to allow garbage collection
      this.audioElement = null;
    }
    
    // Clear all listeners
    this.stateListeners = [];
    
    // Reset state
    this.updateState({
      isGenerating: false,
      isPlaying: false,
      error: null
    });
    
    // Reset voice details
    this.currentVoiceId = null;
    this.currentApiKey = null;
  }
  
  // Method to destroy the singleton instance
  public static destroyInstance(): void {
    if (ElevenLabsService.instance) {
      try {
        ElevenLabsService.instance.cleanup();
      } catch (e) {
        console.error('Error destroying ElevenLabs instance:', e);
      } finally {
        ElevenLabsService.instance = null;
      }
    }
    console.log('ElevenLabs service instance destroyed');
  }
}

export default ElevenLabsService;
