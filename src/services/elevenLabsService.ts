
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
    this.audioElement.addEventListener('play', () => this.updateState({ isPlaying: true }));
    this.audioElement.addEventListener('ended', () => this.updateState({ isPlaying: false }));
    this.audioElement.addEventListener('pause', () => this.updateState({ isPlaying: false }));
    this.audioElement.addEventListener('error', () => {
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
      this.updateState({ error: 'Missing required parameters' });
      return;
    }

    try {
      this.updateState({ isGenerating: true, error: null });
      
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
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || `Error: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      if (this.audioElement) {
        this.audioElement.src = audioUrl;
        this.audioElement.play();
      }
      
      this.updateState({ isGenerating: false });
    } catch (error) {
      console.error('Error generating speech:', error);
      this.updateState({ 
        isGenerating: false, 
        error: error instanceof Error ? error.message : 'Error generating speech' 
      });
    }
  }

  public stopAudio(): void {
    if (this.audioElement && !this.audioElement.paused) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
    }
  }

  public togglePlayback(): void {
    if (!this.audioElement) return;
    
    if (this.audioElement.paused) {
      this.audioElement.play();
    } else {
      this.audioElement.pause();
    }
  }

  public getState(): ElevenLabsState {
    return { ...this.state };
  }
}

export default ElevenLabsService;
