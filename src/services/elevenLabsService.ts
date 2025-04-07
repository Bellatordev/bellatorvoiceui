
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
  private state: ElevenLabsState = {
    isGenerating: false,
    isPlaying: false,
    error: null
  };
  private stateListeners: ((state: ElevenLabsState) => void)[] = [];

  private constructor() {
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
      // Notify audio has ended - listeners will handle auto-start microphone
    });
    
    this.audioElement.addEventListener('pause', () => {
      console.log('Audio paused');
      this.updateState({ isPlaying: false });
    });
    
    this.audioElement.addEventListener('error', (e) => {
      console.error('Audio playback error:', e);
      this.updateState({ 
        isPlaying: false, 
        error: 'Error playing audio' 
      });
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

    // Stop any currently playing audio first
    this.stopAudio();

    try {
      this.updateState({ isGenerating: true, error: null });
      console.log(`Attempting to generate speech with voice ID: ${voiceId}`);
      
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
        } catch (parseError) {
          errorMessage += await response.text() || 'Unknown error';
        }
        
        throw new Error(errorMessage);
      }

      const audioBlob = await response.blob();
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
        
        this.audioElement.src = audioUrl;
        this.audioElement.play().catch(error => {
          console.error('Error playing audio:', error);
          this.updateState({ error: 'Failed to play audio' });
        });
      }
      
      this.updateState({ isGenerating: false });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error generating speech';
      console.error('Error generating speech:', error);
      this.updateState({ 
        isGenerating: false, 
        error: errorMsg
      });
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
      this.audioElement.play().catch(error => {
        console.error('Error playing audio:', error);
        this.updateState({ error: 'Failed to play audio' });
      });
    } else {
      console.log('Pausing audio playback');
      this.audioElement.pause();
    }
  }

  public getState(): ElevenLabsState {
    return { ...this.state };
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
