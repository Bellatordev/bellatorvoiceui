
export interface VoiceAgent {
  id: string;
  name: string;
  description?: string;
  voiceId: string;
  webhookUrl?: string;
  avatarUrl?: string;
}

export interface VoiceAgentFormData {
  name: string;
  description: string;
  voiceId: string;
  webhookUrl: string;
}
