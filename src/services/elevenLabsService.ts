
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
  volume: number;
}

class ElevenLabsService {
  private static instance: ElevenLabsService;
  private audioElement: HTMLAudioElement | null = null;
  private state: ElevenLabsState = {
    isGenerating: false,
    isPlaying: false,
    error: null,
    volume: 0.8
  };
  private stateListeners: ((state: ElevenLabsState) => void)[] = [];

  private constructor() {
    this.audioElement = new Audio();
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
    
    // Set initial volume
    if (this.audioElement) {
      this.audioElement.volume = this.state.volume;
    }
    
    // Add canplaythrough event to ensure audio is fully loaded before playing
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
      console.log(`Attempting to generate speech with voice ID: ${voiceId}, model: ${modelId}`);
      console.log(`Text to generate: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`);
      
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
          console.error('Response error data:', errorData);
          
          // Check for quota exceeded error
          if (errorData?.detail?.status === 'quota_exceeded') {
            errorMessage = `ElevenLabs API quota exceeded: ${errorData.detail.message}`;
          } else {
            errorMessage += errorData.detail?.message || JSON.stringify(errorData);
          }
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
        
        // Set up audio element
        this.audioElement.src = audioUrl;
        
        // Try to play the audio with retries
        let retries = 3;
        const attemptPlay = async () => {
          try {
            console.log('Attempting to play audio...');
            await this.audioElement?.play();
            console.log('Audio playing successfully');
          } catch (error) {
            console.error('Error playing audio:', error);
            if (retries > 0) {
              retries--;
              console.log(`Retrying playback, ${retries} attempts left`);
              setTimeout(attemptPlay, 300);
            } else {
              this.updateState({ 
                isGenerating: false,
                error: 'Failed to play audio after multiple attempts'
              });
            }
          }
        };
        
        // Start playback attempt
        attemptPlay();
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
    if (this.audioElement) {
      console.log('Stopping audio playback');
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
      this.updateState({ isPlaying: false });
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

  public setVolume(volume: number): void {
    // Ensure volume is within valid range
    if (volume < 0) volume = 0;
    if (volume > 1) volume = 1;
    
    console.log(`Setting audio volume to ${volume}`);
    
    // Always update the state, even if volume is 0
    this.updateState({ volume });
    
    // Update the audio element volume
    if (this.audioElement) {
      this.audioElement.volume = volume;
    }
  }

  public getState(): ElevenLabsState {
    return { ...this.state };
  }
}

export default ElevenLabsService;
