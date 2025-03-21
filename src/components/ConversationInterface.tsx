
import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff } from 'lucide-react';
import ConversationLog, { Message } from './ConversationLog';
import useElevenLabs from '@/hooks/useElevenLabs';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/components/ui/use-toast';
import VoiceControls from './VoiceControls';

interface ConversationInterfaceProps {
  apiKey: string;
  agentId: string;
  onLogout?: () => void;
}

const ConversationInterface: React.FC<ConversationInterfaceProps> = ({ 
  apiKey, 
  agentId,
  onLogout 
}) => {
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [transcript, setTranscript] = useState("");
  const [inputMode, setInputMode] = useState<'voice' | 'text'>('voice');
  const [textInput, setTextInput] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [autoStartMic, setAutoStartMic] = useState(true);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const hasRequestedMicPermission = useRef(false);
  
  const { 
    generateSpeech, 
    isGenerating, 
    isPlaying, 
    error,
    stopAudio 
  } = useElevenLabs({
    apiKey,
    voiceId: agentId,
  });

  // Completely stop microphone when audio is playing or generating
  useEffect(() => {
    if (isGenerating || isPlaying) {
      if (recognitionRef.current) {
        console.log('Stopping microphone completely while audio is active');
        recognitionRef.current.stop();
        setIsListening(false);
      }
    } else if (autoStartMic && !isListening && !isGenerating && !isPlaying && !isMicMuted) {
      // Only auto-start mic if audio is not playing, we're not already listening, and mic is not muted
      console.log('Auto-starting microphone after audio playback complete');
      const timer = setTimeout(() => {
        startListening();
      }, 500); // Add a small delay to ensure audio is fully stopped
      
      return () => clearTimeout(timer);
    }
  }, [isGenerating, isPlaying, isListening, autoStartMic, isMicMuted]);

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
            
            // Important: Stop listening after processing input to prevent feedback
            if (recognitionRef.current) {
              recognitionRef.current.stop();
            }
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
    
    // Generate speech for welcome message only if not muted
    if (!isMuted) {
      generateSpeech(welcomeMessage.text);
    }
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
    
    // Stop listening immediately to avoid picking up the AI's response
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
    
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
      
      // Generate speech for assistant response if not muted
      if (!isMuted) {
        // When we're about to generate speech, ensure mic is off
        if (recognitionRef.current && isListening) {
          recognitionRef.current.stop();
        }
        generateSpeech(assistantResponse);
      } else if (autoStartMic) {
        // If muted but auto-start is on, start listening after a delay
        setTimeout(startListening, 500);
      }
    }, 1000);
  };

  const startListening = async () => {
    // Don't start if audio is playing or being generated or microphone is muted
    if (isPlaying || isGenerating || isMicMuted) {
      console.log('Cannot start listening: audio is active or mic is muted');
      return;
    }
    
    if (isListening) return;
    
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
      console.log('Microphone activated');
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      toast({
        title: "Error",
        description: "Failed to start voice recognition. Please try again.",
        variant: "destructive"
      });
    }
  };

  const toggleListening = async () => {
    if (isMicMuted) {
      console.log('Microphone is muted, cannot toggle listening');
      return;
    }
    
    // If audio is playing or generating, stop it first
    if (isPlaying || isGenerating) {
      stopAudio();
      await new Promise(resolve => setTimeout(resolve, 300)); // Short delay to ensure audio is stopped
    }
    
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    } else {
      await startListening();
    }
  };

  const handleMicMuteToggle = () => {
    const newMuteState = !isMicMuted;
    setIsMicMuted(newMuteState);
    
    // If we're unmuting and auto-start is enabled, try to start listening
    if (!newMuteState && autoStartMic && !isPlaying && !isGenerating) {
      setTimeout(startListening, 300);
    }
    
    // If we're muting and currently listening, stop listening
    if (newMuteState && isListening && recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim()) {
      processUserInput(textInput);
      setTextInput("");
    }
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
    if (isPlaying) {
      stopAudio();
    }
  };

  const handleVolumeChange = (value: number) => {
    setVolume(value);
    // In a real app, you'd also adjust audio volume
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 agent-card mb-6 overflow-hidden">
        <ConversationLog 
          messages={messages} 
          isGeneratingAudio={isGenerating} 
          isPlayingAudio={isPlaying}
          onToggleAudio={generateSpeech}
          onLogout={onLogout}
          className="h-full" 
        />
      </div>
      
      {transcript && !isMicMuted && (
        <div className="px-4 py-2 mb-4 bg-agent-secondary/10 rounded-lg text-gray-600 italic">
          Listening: {transcript}
        </div>
      )}
      
      {inputMode === 'voice' ? (
        <div className="flex justify-center py-4">
          <VoiceControls 
            isListening={isListening}
            isMuted={isMuted}
            volume={volume}
            onListen={toggleListening}
            onStopListening={toggleListening}
            onMuteToggle={handleMuteToggle}
            onVolumeChange={handleVolumeChange}
            onSwitchToText={() => setInputMode('text')}
            isMicMuted={isMicMuted}
            onMicMuteToggle={handleMicMuteToggle}
          />
        </div>
      ) : (
        <form onSubmit={handleTextSubmit} className="flex items-center space-x-2 p-4">
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-agent-primary"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-agent-primary text-white rounded-md hover:bg-agent-primary/90"
          >
            Send
          </button>
          <button
            type="button"
            onClick={() => setInputMode('voice')}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            Use Voice
          </button>
        </form>
      )}
    </div>
  );
};

export default ConversationInterface;
