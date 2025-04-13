
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Mic, MicOff, Send, Volume2, Volume1, VolumeX } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

// Custom hook to handle speech recognition
const useSpeechRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event) => {
          const current = event.resultIndex;
          const result = event.results[current];
          const transcriptText = result[0].transcript;
          setTranscript(transcriptText);
        };

        recognitionRef.current.onerror = (event) => {
          console.error('Speech recognition error', event.error);
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const startListening = () => {
    setTranscript('');
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error('Error starting speech recognition:', error);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  return { isListening, transcript, startListening, stopListening, setTranscript };
};

// Message type definition
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'holmes';
  timestamp: Date;
}

const Holmes = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isListening, transcript, startListening, stopListening, setTranscript } = useSpeechRecognition();

  // Audio related states and refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // ElevenLabs voice synthesis function
  const synthesizeSpeech = async (text: string) => {
    if (isMuted) return;
    
    try {
      // Replace with your ElevenLabs API key and voice ID
      const apiKey = localStorage.getItem('elevenLabsApiKey');
      const voiceId = 'bIHbv24MWmeRgasZH58o'; // Will - default ElevenLabs voice
      
      if (!apiKey) {
        console.error('ElevenLabs API key not found');
        return;
      }

      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': apiKey
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75
          }
        })
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error synthesizing speech:', error);
      toast({
        title: 'Speech Synthesis Error',
        description: 'Failed to generate speech. Please check your API key.',
        variant: 'destructive'
      });
    }
  };

  // Initialize with a welcome message
  useEffect(() => {
    setMessages([
      {
        id: '1',
        text: 'Hello, I am Holmes. How may I assist you today?',
        sender: 'holmes',
        timestamp: new Date()
      }
    ]);

    // Load webhook URL from localStorage if available
    const savedWebhookUrl = localStorage.getItem('holmesWebhookUrl');
    if (savedWebhookUrl) {
      setWebhookUrl(savedWebhookUrl);
    }

    // Create audio element
    audioRef.current = new Audio();
    audioRef.current.onended = () => {
      setIsPlaying(false);
    };

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Process voice input when listening stops
  useEffect(() => {
    if (!isListening && transcript) {
      setInputText(transcript);
    }
  }, [isListening, transcript]);

  // Handle form submission (both text and voice input)
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!inputText.trim() && !transcript.trim()) return;
    
    const messageText = inputText.trim() || transcript.trim();
    
    if (!webhookUrl) {
      toast({
        title: 'Webhook URL Required',
        description: 'Please set your webhook URL in the settings',
        variant: 'destructive'
      });
      return;
    }
    
    // Create and add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setTranscript('');
    setIsProcessing(true);
    
    try {
      // Send message to webhook
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: messageText,
          sessionId: 'holmes-session'
        })
      });
      
      if (!response.ok) {
        throw new Error(`Webhook error: ${response.status}`);
      }
      
      let responseData;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = { message: await response.text() };
      }
      
      // Extract response text
      const responseText = responseData.output || 
                           responseData.message || 
                           (responseData.kwargs && responseData.kwargs.content) || 
                           'I processed your request.';
      
      // Create and add holmes message
      const holmesMessage: Message = {
        id: Date.now().toString(),
        text: responseText,
        sender: 'holmes',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, holmesMessage]);
      
      // Synthesize speech for holmes response
      synthesizeSpeech(responseText);
      
    } catch (error) {
      console.error('Error processing message:', error);
      
      toast({
        title: 'Error',
        description: 'Failed to communicate with webhook',
        variant: 'destructive'
      });
      
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: 'Sorry, I encountered an error while processing your request.',
        sender: 'holmes',
        timestamp: new Date()
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVoiceInputToggle = () => {
    if (isListening) {
      stopListening();
      if (transcript.trim()) {
        handleSubmit();
      }
    } else {
      startListening();
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (!isMuted && isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleSetWebhookUrl = () => {
    const url = prompt('Enter your webhook URL:');
    if (url) {
      setWebhookUrl(url);
      localStorage.setItem('holmesWebhookUrl', url);
      toast({
        title: 'Webhook URL Updated',
        description: 'Your webhook URL has been saved'
      });
    }
  };

  const handleSetApiKey = () => {
    const apiKey = prompt('Enter your ElevenLabs API key:');
    if (apiKey) {
      localStorage.setItem('elevenLabsApiKey', apiKey);
      toast({
        title: 'API Key Updated',
        description: 'Your ElevenLabs API key has been saved'
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#121212] text-white">
      {/* Header Bar */}
      <header className="bg-[#1a1a1a] border-b border-[#333] p-4 flex items-center justify-between">
        <button 
          onClick={() => navigate('/')}
          className="p-2 rounded-full hover:bg-[#333] transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold">Holmes</h1>
        <div className="flex gap-2">
          <button 
            onClick={handleSetWebhookUrl}
            className="text-xs px-3 py-1 rounded-full bg-[#333] hover:bg-[#444] transition-colors"
          >
            Set Webhook
          </button>
          <button 
            onClick={handleSetApiKey}
            className="text-xs px-3 py-1 rounded-full bg-[#333] hover:bg-[#444] transition-colors"
          >
            Set API Key
          </button>
          <button 
            onClick={toggleMute}
            className="p-2 rounded-full hover:bg-[#333] transition-colors"
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`max-w-[80%] ${
              message.sender === 'user' 
                ? 'ml-auto bg-[#2a2a7a] rounded-tl-xl rounded-tr-xl rounded-bl-xl' 
                : 'mr-auto bg-[#3a3a3a] rounded-tl-xl rounded-tr-xl rounded-br-xl'
            } p-4 rounded-xl shadow-md`}
          >
            <div className="flex items-center mb-1">
              <span className="font-bold text-sm">
                {message.sender === 'user' ? 'You' : 'Holmes'}
              </span>
              <span className="ml-2 text-xs text-gray-400">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <p>{message.text}</p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form 
        onSubmit={handleSubmit}
        className="bg-[#1a1a1a] border-t border-[#333] p-4"
      >
        <div className="flex gap-2 items-center">
          <button
            type="button"
            onClick={handleVoiceInputToggle}
            className={`p-3 rounded-full ${
              isListening ? 'bg-red-600 hover:bg-red-700' : 'bg-[#2a2a7a] hover:bg-[#3a3a8a]'
            } transition-colors`}
            disabled={isProcessing}
          >
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
          
          <input
            type="text"
            value={inputText || transcript}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={isListening ? 'Listening...' : 'Type a message...'}
            className="flex-1 bg-[#333] text-white border-none rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#5a5a9a]"
            disabled={isProcessing || isListening}
          />
          
          <button
            type="submit"
            className="p-3 rounded-full bg-[#2a2a7a] hover:bg-[#3a3a8a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={(!inputText && !transcript) || isProcessing}
          >
            <Send size={20} />
          </button>
        </div>
        
        {isProcessing && (
          <div className="mt-2 text-center text-sm text-gray-400">
            Processing your request...
          </div>
        )}
      </form>
    </div>
  );
};

export default Holmes;
