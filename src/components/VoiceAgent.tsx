
import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/components/ui/use-toast';
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
  const [transcript, setTranscript] = useState("");
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const hasRequestedMicPermission = useRef(false);

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

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        
        recognition.onstart = () => {
          console.log('Speech recognition started');
          setIsListening(true);
        };
        
        recognition.onend = () => {
          console.log('Speech recognition ended');
          setIsListening(false);
        };
        
        recognition.onresult = (event) => {
          const last = event.results.length - 1;
          const result = event.results[last];
          const text = result[0].transcript;
          setTranscript(text);
          
          // If this is a final result, process it
          if (result.isFinal) {
            processTranscript(text);
            setTranscript("");
          }
        };
        
        recognition.onerror = (event) => {
          console.error('Speech recognition error', event.error);
          setIsListening(false);
          toast({
            title: "Microphone Error",
            description: `Error: ${event.error}. Please check your microphone permissions.`,
            variant: "destructive"
          });
        };
        
        recognitionRef.current = recognition;
      } else {
        toast({
          title: "Browser Not Supported",
          description: "Speech recognition is not supported in this browser. Please try Chrome, Edge, or Safari.",
          variant: "destructive"
        });
      }
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const requestMicrophonePermission = async () => {
    if (hasRequestedMicPermission.current) return true;
    
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      hasRequestedMicPermission.current = true;
      return true;
    } catch (err) {
      console.error('Microphone permission denied:', err);
      toast({
        title: "Microphone Access Denied",
        description: "Please allow microphone access to use voice features.",
        variant: "destructive"
      });
      return false;
    }
  };

  const processTranscript = (text: string) => {
    if (!text.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: uuidv4(),
      text: text,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Simulate assistant response
    setTimeout(() => {
      const randomResponse = EXAMPLE_RESPONSES[Math.floor(Math.random() * EXAMPLE_RESPONSES.length)];
      const assistantMessage: Message = {
        id: uuidv4(),
        text: randomResponse,
        sender: 'assistant',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    }, 1000);
  };

  const handleListen = async () => {
    if (!recognitionRef.current) {
      toast({
        title: "Speech Recognition Unavailable",
        description: "Your browser doesn't support speech recognition.",
        variant: "destructive"
      });
      return;
    }
    
    const hasPermission = await requestMicrophonePermission();
    if (!hasPermission) return;
    
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'NotAllowedError') {
        toast({
          title: "Microphone Access Denied",
          description: "Please allow microphone access to use voice features.",
          variant: "destructive"
        });
      } else {
        console.error('Error starting speech recognition:', error);
        toast({
          title: "Error",
          description: "Failed to start voice recognition. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  const handleStopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
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
      
      {transcript && (
        <div className="px-4 py-2 mb-4 bg-agent-secondary/10 rounded-lg text-gray-600 italic">
          Listening: {transcript}
        </div>
      )}
      
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
