
import React, { useState, useEffect } from 'react';
import ConversationLog from './ConversationLog';
import useElevenLabs from '@/hooks/useElevenLabs';
import VoiceControls from './VoiceControls';
import useSpeechRecognition from '@/hooks/useSpeechRecognition';
import useConversation from '@/hooks/useConversation';
import TextInputMode from './TextInputMode';
import TranscriptDisplay from './TranscriptDisplay';

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
  const [inputMode, setInputMode] = useState<'voice' | 'text'>('voice');
  const [isMuted, setIsMuted] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [autoStartMic, setAutoStartMic] = useState(true);
  const [ttsError, setTtsError] = useState<string | null>(null);
  
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

  const {
    messages,
    setMessages,
    processUserInput,
    initializeConversation
  } = useConversation({
    generateSpeech,
    isMuted,
    autoStartMic,
    isPlaying,
    isGenerating,
    ttsError
  });

  const handleFinalTranscript = (finalText: string) => {
    console.log("Processing final transcript:", finalText);
    if (finalText.trim()) {
      processUserInput(finalText);
    }
  };

  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    toggleListening
  } = useSpeechRecognition({
    autoStartMic,
    isMicMuted,
    isPlaying,
    isGenerating,
    onFinalTranscript: handleFinalTranscript
  });

  useEffect(() => {
    initializeConversation();
  }, []);

  useEffect(() => {
    if (isGenerating || isPlaying) {
      stopListening();
    } else if (autoStartMic && !isListening && !isGenerating && !isPlaying && !isMicMuted && inputMode === 'voice') {
      console.log('Auto-starting microphone after audio playback complete');
      const timer = setTimeout(() => {
        startListening();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [isGenerating, isPlaying, isListening, autoStartMic, isMicMuted, inputMode]);

  useEffect(() => {
    if (error) {
      setTtsError(error);
      
      if (!error.includes("quota")) {
        // This is handled in the useElevenLabs hook now
      } else {
        console.log("TTS quota exceeded, continuing without voice output");
      }
      
      if (!messages.some(msg => msg.text.includes("I'm having trouble with my voice output"))) {
        const errorMessage = {
          id: crypto.randomUUID(),
          text: `I'm having trouble with my voice output. ${error.includes("quota") ? "The API quota has been exceeded." : "Please check if the Voice ID is correct."}`,
          sender: 'assistant' as const,
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, errorMessage]);
      }
    }
  }, [error, messages]);

  const handleTextInputSubmit = (text: string) => {
    processUserInput(text);
  };

  const handleToggleListening = async () => {
    if (isPlaying || isGenerating) {
      stopAudio();
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    await toggleListening();
  };

  const handleMicMuteToggle = () => {
    const newMuteState = !isMicMuted;
    setIsMicMuted(newMuteState);
    
    if (!newMuteState && autoStartMic && !isPlaying && !isGenerating) {
      setTimeout(startListening, 300);
    }
    
    if (newMuteState && isListening) {
      stopListening();
    }
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
    if (isPlaying) {
      stopAudio();
    }
  };

  const handleVolumeChange = (value: number) => {
    console.log('Setting audio volume to', value);
    setVolume(value);
  };

  const handleSwitchToTextMode = () => {
    // Stop listening and mute the microphone when switching to text mode
    stopListening();
    setIsMicMuted(true);
    setInputMode('text');
  };

  const handleSwitchToVoiceMode = () => {
    // Unmute the microphone when switching to voice mode
    setIsMicMuted(false);
    setInputMode('voice');
    // Start listening if auto-start is enabled
    if (autoStartMic && !isPlaying && !isGenerating) {
      setTimeout(startListening, 300);
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
          onLogout={onLogout}
          className="h-full" 
        />
      </div>
      
      <TranscriptDisplay 
        transcript={transcript}
        isMicMuted={isMicMuted}
        isListening={isListening}
        isGeneratingVoice={isGenerating || isPlaying}
      />
      
      {inputMode === 'voice' ? (
        <div className="flex justify-center py-4">
          <VoiceControls 
            isListening={isListening}
            isMuted={isMuted}
            volume={volume}
            onListen={handleToggleListening}
            onStopListening={handleToggleListening}
            onMuteToggle={handleMuteToggle}
            onVolumeChange={handleVolumeChange}
            onSwitchToText={handleSwitchToTextMode}
            isMicMuted={isMicMuted}
            onMicMuteToggle={handleMicMuteToggle}
          />
        </div>
      ) : (
        <TextInputMode 
          onSendMessage={handleTextInputSubmit}
          onSwitchToVoice={handleSwitchToVoiceMode}
        />
      )}
    </div>
  );
};

export default ConversationInterface;
