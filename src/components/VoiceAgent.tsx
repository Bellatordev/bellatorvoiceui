
import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import VoiceControls from './VoiceControls';
import ConversationLog, { Message } from './ConversationLog';
import Settings, { VoiceOption } from './Settings';

// Mock voice options
const VOICE_OPTIONS: VoiceOption[] = [
  { 
    id: 'voice-1', 
    name: 'Aria', 
    description: 'Warm and professional female voice' 
  },
  { 
    id: 'voice-2', 
    name: 'Roger', 
    description: 'Clear and authoritative male voice' 
  },
  { 
    id: 'voice-3', 
    name: 'Sarah', 
    description: 'Friendly and approachable female voice' 
  },
  { 
    id: 'voice-4', 
    name: 'George', 
    description: 'Deep and calm male voice' 
  },
];

// Example welcome messages from the assistant
const WELCOME_MESSAGES = [
  "Hello! How can I help you today?",
  "Hi there! I'm your voice assistant. What can I do for you?",
  "Welcome! I'm here to assist. What would you like to talk about?",
  "Hello! I'm ready to help. What's on your mind?",
];

// Example responses for demo purposes
const EXAMPLE_RESPONSES = [
  "I found several results for that. Would you like me to summarize them?",
  "That's an interesting question. Based on my knowledge, there are a few things to consider...",
  "I'd be happy to help with that. Let me gather some information for you.",
  "Great question! Here's what I know about that topic.",
];

const VoiceAgent: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [selectedVoice, setSelectedVoice] = useState(VOICE_OPTIONS[0].id);
  const [messages, setMessages] = useState<Message[]>([]);

  // Add a welcome message when the component mounts
  useEffect(() => {
    const randomWelcome = WELCOME_MESSAGES[Math.floor(Math.random() * WELCOME_MESSAGES.length)];
    setMessages([
      {
        id: uuidv4(),
        text: randomWelcome,
        sender: 'assistant',
        timestamp: new Date(),
      },
    ]);
  }, []);

  const handleListen = () => {
    setIsListening(true);
    
    // Simulating user speech recognition
    setTimeout(() => {
      const userMessage: Message = {
        id: uuidv4(),
        text: "Can you tell me more about this topic?",
        sender: 'user',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      // Simulate processing time
      setTimeout(() => {
        const randomResponse = EXAMPLE_RESPONSES[Math.floor(Math.random() * EXAMPLE_RESPONSES.length)];
        const assistantMessage: Message = {
          id: uuidv4(),
          text: randomResponse,
          sender: 'assistant',
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        setIsListening(false);
      }, 1000);
    }, 2000);
  };

  const handleStopListening = () => {
    setIsListening(false);
  };

  const handleMuteToggle = () => {
    setIsMuted(prev => !prev);
  };

  const handleVolumeChange = (value: number) => {
    setVolume(value);
    if (value > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const handleVoiceChange = (voiceId: string) => {
    setSelectedVoice(voiceId);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Voice Assistant</h1>
        <Settings 
          voiceOptions={VOICE_OPTIONS} 
          selectedVoice={selectedVoice} 
          onVoiceChange={handleVoiceChange} 
        />
      </div>
      
      <div className="flex-1 agent-card mb-6 overflow-hidden">
        <ConversationLog messages={messages} className="h-full" />
      </div>
      
      <div className="agent-card py-8">
        <VoiceControls
          isListening={isListening}
          isMuted={isMuted}
          volume={volume}
          onListen={handleListen}
          onStopListening={handleStopListening}
          onMuteToggle={handleMuteToggle}
          onVolumeChange={handleVolumeChange}
        />
      </div>
    </div>
  );
};

export default VoiceAgent;
