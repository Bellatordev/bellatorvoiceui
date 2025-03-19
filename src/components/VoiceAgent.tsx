
import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import VoiceControls from './VoiceControls';
import ConversationLog, { Message } from './ConversationLog';
import Settings, { VoiceOption } from './Settings';
import ApiKeyForm from './ApiKeyForm';
import useElevenLabs from '@/hooks/useElevenLabs';

// Mock voice options with Eleven Labs voice IDs
const VOICE_OPTIONS: VoiceOption[] = [
  { 
    id: '9BWtsMINqrJLrRacOk9x', 
    name: 'Aria', 
    description: 'Warm and professional female voice' 
  },
  { 
    id: 'CwhRBWXzGAHq8TQ4Fs17', 
    name: 'Roger', 
    description: 'Clear and authoritative male voice' 
  },
  { 
    id: 'EXAVITQu4vr4xnSDxMaL', 
    name: 'Sarah', 
    description: 'Friendly and approachable female voice' 
  },
  { 
    id: 'JBFqnCBsd6RMkjVDRZzb', 
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

const LOCAL_STORAGE_KEY = 'elevenlabs-api-key';

const VoiceAgent: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [selectedVoice, setSelectedVoice] = useState(VOICE_OPTIONS[0].id);
  const [messages, setMessages] = useState<Message[]>([]);
  const [transcript, setTranscript] = useState("");
  const [apiKey, setApiKey] = useState(() => {
    return typeof window !== 'undefined' 
      ? localStorage.getItem(LOCAL_STORAGE_KEY) || ''
      : '';
  });
  const [showTextInput, setShowTextInput] = useState(false);
  const [userInput, setUserInput] = useState("");
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const hasRequestedMicPermission = useRef(false);
  const textInputRef = useRef<HTMLInputElement>(null);

  const { 
    generateSpeech, 
    isGenerating, 
    isPlaying, 
    error 
  } = useElevenLabs({
    apiKey,
    voiceId: selectedVoice,
  });

  // Handle TTS errors
  useEffect(() => {
    if (error) {
      toast({
        title: "Speech Generation Error",
        description: error,
        variant: "destructive"
      });
    }
  }, [error]);

  // Save API key to localStorage
  useEffect(() => {
    if (apiKey) {
      localStorage.setItem(LOCAL_STORAGE_KEY, apiKey);
    }
  }, [apiKey]);

  // Add a welcome message when the component mounts
  useEffect(() => {
    const randomWelcome = WELCOME_MESSAGES[Math.floor(Math.random() * WELCOME_MESSAGES.length)];
    const welcomeMessage: Message = {
      id: uuidv4(),
      text: randomWelcome,
      sender: 'assistant',
      timestamp: new Date(),
    };
    
    setMessages([welcomeMessage]);
    
    // Generate speech for welcome message if API key exists
    if (apiKey) {
      generateSpeech(randomWelcome);
    }
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
            processUserInput(text);
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
      // If mic permission denied, show text input
      setShowTextInput(true);
      return false;
    }
  };

  const processUserInput = (text: string) => {
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
      
      // Generate speech if API key exists
      if (apiKey) {
        generateSpeech(randomResponse);
      }
    }, 1000);
  };

  const handleListen = async () => {
    if (!recognitionRef.current) {
      toast({
        title: "Speech Recognition Unavailable",
        description: "Your browser doesn't support speech recognition.",
        variant: "destructive"
      });
      // If speech recognition unavailable, show text input
      setShowTextInput(true);
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
        // If mic permission denied, show text input
        setShowTextInput(true);
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

  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    toast({
      title: "API Key Saved",
      description: "Your Eleven Labs API key has been saved successfully.",
    });
  };

  const handleTextInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userInput.trim()) {
      processUserInput(userInput);
      setUserInput('');
      
      // Focus back on input after submission
      setTimeout(() => {
        textInputRef.current?.focus();
      }, 0);
    }
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
      
      <ApiKeyForm 
        onSaveApiKey={handleSaveApiKey}
        hasApiKey={!!apiKey}
      />
      
      <div className="flex-1 agent-card mb-6 overflow-hidden">
        <ConversationLog 
          messages={messages} 
          isGeneratingAudio={isGenerating} 
          isPlayingAudio={isPlaying}
          onToggleAudio={generateSpeech}
          className="h-full" 
        />
      </div>
      
      {transcript && (
        <div className="px-4 py-2 mb-4 bg-agent-secondary/10 rounded-lg text-gray-600 italic">
          Listening: {transcript}
        </div>
      )}
      
      <div className="agent-card py-6">
        {showTextInput ? (
          <form onSubmit={handleTextInputSubmit} className="flex w-full items-center space-x-2">
            <input
              ref={textInputRef}
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Type your message here..."
              className="agent-input flex-1"
            />
            <Button type="submit">Send</Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setShowTextInput(false)}
            >
              Use Voice
            </Button>
          </form>
        ) : (
          <>
            <VoiceControls
              isListening={isListening}
              isMuted={isMuted}
              volume={volume}
              onListen={handleListen}
              onStopListening={handleStopListening}
              onMuteToggle={handleMuteToggle}
              onVolumeChange={handleVolumeChange}
              onSwitchToText={() => setShowTextInput(true)}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default VoiceAgent;
