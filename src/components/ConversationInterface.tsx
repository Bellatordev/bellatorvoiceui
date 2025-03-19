
import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff } from 'lucide-react';
import ConversationLog, { Message } from './ConversationLog';
import useElevenLabs from '@/hooks/useElevenLabs';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/components/ui/use-toast';

interface ConversationInterfaceProps {
  apiKey: string;
  agentId: string;
}

const ConversationInterface: React.FC<ConversationInterfaceProps> = ({ apiKey, agentId }) => {
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const hasRequestedMicPermission = useRef(false);
  
  const { 
    generateSpeech, 
    isGenerating, 
    isPlaying, 
    error 
  } = useElevenLabs({
    apiKey,
    voiceId: agentId,
  });

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

  // Handle TTS errors
  useEffect(() => {
    if (error) {
      toast({
        title: "Speech Generation Error",
        description: error,
        variant: "destructive"
      });
      
      // Add a system message about the error
      const errorMessage: Message = {
        id: uuidv4(),
        text: `I'm having trouble with my voice. Please check if the Voice ID is correct. Error: ${error}`,
        sender: 'assistant',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    }
  }, [error]);

  // Welcome message
  useEffect(() => {
    const welcomeMessage: Message = {
      id: uuidv4(),
      text: "Hello! How can I help you today?",
      sender: 'assistant',
      timestamp: new Date(),
    };
    
    setMessages([welcomeMessage]);
    
    // Generate speech for welcome message
    generateSpeech(welcomeMessage.text);
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
    
    // Simulate assistant response - in a real app, this would call your AI backend
    setTimeout(() => {
      const assistantResponse = "I understand you said: " + text + ". I'm here to help you with any questions or tasks.";
      const assistantMessage: Message = {
        id: uuidv4(),
        text: assistantResponse,
        sender: 'assistant',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      // Generate speech for assistant response
      generateSpeech(assistantResponse);
    }, 1000);
  };

  const toggleListening = async () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
    } else {
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
        console.error('Error starting speech recognition:', error);
        toast({
          title: "Error",
          description: "Failed to start voice recognition. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
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
      
      <div className="flex justify-center py-8">
        <button
          className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 focus-ring ${
            isListening
              ? 'bg-agent-primary text-white shadow-lg shadow-agent-primary/20'
              : 'bg-white text-agent-primary border border-agent-primary/20 hover:bg-agent-primary/5'
          }`}
          onClick={toggleListening}
          aria-label={isListening ? "Stop listening" : "Start listening"}
        >
          {isListening ? (
            <MicOff className="w-8 h-8 animate-pulse" />
          ) : (
            <Mic className="w-8 h-8" />
          )}
          
          {/* Pulsing background effect when listening */}
          {isListening && (
            <div className="absolute inset-0 rounded-full bg-agent-primary/10 animate-breathe" />
          )}
        </button>
      </div>
    </div>
  );
};

export default ConversationInterface;
