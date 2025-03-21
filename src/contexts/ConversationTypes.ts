
// Define Message type for the conversation
export type Message = {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
};

export interface ConversationContextType {
  apiKey: string;
  agentId: string;
  messages: Message[];
  isListening: boolean;
  setIsListening: (value: boolean) => void;
  isMicMuted: boolean;
  setIsMicMuted: (value: boolean) => void;
  isMuted: boolean;
  setIsMuted: (value: boolean) => void;
  volume: number;
  setVolume: (value: number) => void;
  isLoading: boolean;
  isDarkMode: boolean;
  setIsDarkMode: (value: boolean) => void;
  isGenerating: boolean;
  isPlaying: boolean;
  currentTranscript: string;
  error: string | null;
  sendMessage: (text: string) => Promise<void>;
  handleToggleAudio: (text: string) => void;
  handleListenStart: () => void;
  handleListenStop: (duration: number) => void;
  toggleDarkMode: () => void;
  toggleMic: () => void;
  toggleMute: () => void;
}
