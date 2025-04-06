
import { VoiceAgent } from '@/types/voiceAgent';

const STORAGE_KEY = 'voiceAgent_agents';

export const saveVoiceAgents = (agents: VoiceAgent[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(agents));
};

export const getVoiceAgents = (): VoiceAgent[] => {
  const storedAgents = localStorage.getItem(STORAGE_KEY);
  if (!storedAgents) return [];
  
  try {
    return JSON.parse(storedAgents);
  } catch (error) {
    console.error('Error parsing stored voice agents:', error);
    return [];
  }
};

export const addVoiceAgent = (agent: VoiceAgent): VoiceAgent[] => {
  const agents = getVoiceAgents();
  const updatedAgents = [...agents, agent];
  saveVoiceAgents(updatedAgents);
  return updatedAgents;
};

export const updateVoiceAgent = (agent: VoiceAgent): VoiceAgent[] => {
  const agents = getVoiceAgents();
  const updatedAgents = agents.map(a => a.id === agent.id ? agent : a);
  saveVoiceAgents(updatedAgents);
  return updatedAgents;
};

export const deleteVoiceAgent = (agentId: string): VoiceAgent[] => {
  const agents = getVoiceAgents();
  const updatedAgents = agents.filter(a => a.id !== agentId);
  saveVoiceAgents(updatedAgents);
  return updatedAgents;
};

// Get default voice IDs for each preset agent
export const getDefaultVoiceId = (agentName: string): string => {
  const defaultVoices: Record<string, string> = {
    'Alice': 'Xb7hH8MSUJpSbSDYk0k2',
    'Roger': 'CwhRBWXzGAHq8TQ4Fs17', 
    'Sarah': 'EXAVITQu4vr4xnSDxMaL',
    'Brian': 'nPczCjzI2devNBz1zQrb',
    'Jessica': 'cgSgspJ2msm6clMCkdW9',
    'Assistant': 'EXAVITQu4vr4xnSDxMaL' // Default
  };
  
  return defaultVoices[agentName] || 'EXAVITQu4vr4xnSDxMaL';
};
