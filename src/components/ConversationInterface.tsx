
import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Mic, Send, User, Bot, Volume2, VolumeX } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import ConversationLog from './ConversationLog';
import { v4 as uuidv4 } from 'uuid';
import useElevenLabs from '../hooks/useElevenLabs';
import VoiceControls from './VoiceControls';
import WaveformVisualizer from './WaveformVisualizer';
import { AIVoiceInput } from './ui/ai-voice-input';

interface ConversationInterfaceProps {
  apiKey: string;
  agentId: string;
  onLogout: () => void;
}

// Define Message type for the conversation
type Message = {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
};

const ConversationInterface: React.FC<ConversationInterfaceProps> = ({
  apiKey,
  agentId,
  onLogout,
}) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isVoiceMode, setIsVoiceMode] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark' || 
      (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  // ElevenLabs voice integration
  const { 
    generateSpeech, 
    stopAudio, 
    togglePlayback, 
    setVolume: setTtsVolume,
    isGenerating, 
    isPlaying 
  } = useElevenLabs({ 
    apiKey, 
    voiceId: 'EXAVITQu4vr4xnSDxMaL', // Using 'Sarah' voice by default
    modelId: 'eleven_multilingual_v2'
  });

  useEffect(() => {
    // Set volume for TTS
    setTtsVolume(isMuted ? 0 : volume);
  }, [volume, isMuted, setTtsVolume]);

  useEffect(() => {
    // Scroll to bottom on new message
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
    
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Handle sending text message
  const sendTextMessage = async () => {
    if (!message.trim()) return;
    
    await sendMessage(message.trim());
    setMessage('');
  };

  // Handle voice input start
  const handleListenStart = () => {
    setIsListening(true);
  };

  // Handle voice input stop
  const handleListenStop = async (duration: number) => {
    setIsListening(false);
    if (duration < 1) return; // Ignore very short recordings
    
    // In a real implementation, this would send audio to be transcribed
    // For now, we'll simulate with a mock transcription
    const mockTranscription = "This is a simulated voice message transcription.";
    await sendMessage(mockTranscription);
  };

  // Common function to handle sending messages to the agent
  const sendMessage = async (text: string) => {
    setIsLoading(true);
    
    // Add user message to conversation
    const userMessage: Message = { 
      id: uuidv4(),
      sender: 'user', 
      text: text,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      // Call ElevenLabs API
      const response = await fetch(`https://api.elevenlabs.io/v1/agents/${agentId}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: text }],
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      const responseText = data.choices[0].message.content;
      
      // Add agent response to conversation
      const assistantMessage: Message = { 
        id: uuidv4(),
        sender: 'assistant', 
        text: responseText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
      
      // Generate speech for the response if not muted
      if (!isMuted && volume > 0) {
        generateSpeech(responseText);
      }
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleAudio = (text: string) => {
    togglePlayback();
  };

  const switchToTextMode = () => {
    setIsVoiceMode(false);
    if (isListening) {
      setIsListening(false);
    }
  };

  const switchToVoiceMode = () => {
    setIsVoiceMode(true);
  };

  return (
    <div className="flex flex-col h-full bg-white/5 dark:bg-gray-900/30 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
      <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Voice Assistant</h2>
        <Button variant="outline" size="sm" onClick={onLogout} className="text-gray-700 dark:text-white border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800">
          Logout
        </Button>
      </div>

      <div className="flex-1 flex flex-col p-4 overflow-hidden">
        {isVoiceMode ? (
          // Voice Mode
          <div className="flex-1 flex flex-col">
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto mb-4">
              <ConversationLog 
                messages={messages}
                isGeneratingAudio={isGenerating}
                isPlayingAudio={isPlaying}
                onToggleAudio={handleToggleAudio}
              />
            </div>
            
            <div className="mt-auto">
              <VoiceControls 
                isListening={isListening}
                isMuted={isMuted}
                volume={volume}
                onListen={handleListenStart}
                onStopListening={() => setIsListening(false)}
                onMuteToggle={() => setIsMuted(!isMuted)}
                onVolumeChange={setVolume}
                onSwitchToText={switchToTextMode}
                isMicMuted={isMicMuted}
                onMicMuteToggle={() => setIsMicMuted(!isMicMuted)}
                isDarkMode={isDarkMode}
                toggleDarkMode={toggleDarkMode}
              />
              
              <div className="py-4">
                <AIVoiceInput 
                  onStart={handleListenStart}
                  onStop={handleListenStop}
                  className={isListening ? '' : 'opacity-50'}
                />
              </div>
            </div>
          </div>
        ) : (
          // Text Mode
          <div className="flex-1 flex flex-col">
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto mb-4">
              <ConversationLog 
                messages={messages}
                isGeneratingAudio={isGenerating}
                isPlayingAudio={isPlaying}
                onToggleAudio={handleToggleAudio}
              />
            </div>
            
            <div className="p-4 border-t dark:border-gray-700 mt-auto">
              <div className="flex items-center gap-2 mb-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={switchToVoiceMode}
                  className="flex items-center gap-2"
                >
                  <Mic className="w-4 h-4" />
                  Voice mode
                </Button>
                
                <Button
                  variant={isMuted ? "destructive" : "outline"}
                  size="sm"
                  onClick={() => setIsMuted(!isMuted)}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
              </div>
              
              <div className="flex items-center space-x-2">
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 resize-none border rounded-md py-2 px-3 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700"
                  rows={3}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendTextMessage();
                    }
                  }}
                />
                <Button 
                  onClick={sendTextMessage} 
                  disabled={isLoading || !message.trim()} 
                  className="bg-agent-primary hover:bg-agent-primary/90 text-white"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationInterface;
