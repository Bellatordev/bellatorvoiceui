
import { v4 as uuidv4 } from 'uuid';
import { Message } from '@/contexts/ConversationTypes';

export const createUserMessage = (text: string): Message => {
  return {
    id: uuidv4(),
    sender: 'user', 
    text: text,
    timestamp: new Date()
  };
};

export const createAssistantMessage = (text: string): Message => {
  return { 
    id: uuidv4(),
    sender: 'assistant', 
    text: text,
    timestamp: new Date()
  };
};

export const createWelcomeMessage = (): Message => {
  return {
    id: uuidv4(),
    sender: 'assistant',
    text: 'Hello, how can I help you today?',
    timestamp: new Date()
  };
};
