
import React, { useState, useEffect } from 'react';
import ConversationLog from './ConversationLog';
import useElevenLabs from '@/hooks/useElevenLabs';
import TranscriptDisplay from './TranscriptDisplay';
import SpeechHandler from './SpeechHandler';
import ConversationHandler from './ConversationHandler';
import ErrorHandler from './ErrorHandler';
import AudioSettings from './AudioSettings';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

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
    stopAudio,
    cleanup 
  } = useElevenLabs({
    apiKey,
    voiceId: agentId,
  });

  // Clean up resources when component unmounts
  useEffect(() => {
    return () => {
      console.log('ConversationInterface unmounting, cleaning up resources');
      stopAudio();
      cleanup();
    };
  }, [stopAudio, cleanup]);

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
    setIsMicMuted(true);
    setInputMode('text');
  };

  const handleSwitchToVoiceMode = () => {
    // Unmute the microphone when switching to voice mode
    setIsMicMuted(false);
    setInputMode('voice');
  };

  const handleMicMuteToggle = () => {
    const newMuteState = !isMicMuted;
    console.log(`Microphone mute toggled to: ${newMuteState ? 'muted' : 'unmuted'}`);
    setIsMicMuted(newMuteState);
  };

  const handleEndConversation = (resetSpeech: () => void, endConversation: () => void) => {
    console.log("Ending conversation and shutting down all audio services");
    // First stop any playing audio
    stopAudio();
    
    // Immediately set microphone to muted state
    setIsMicMuted(true);
    
    // Reset speech recognition completely (this will abort any ongoing recognition)
    resetSpeech();
    
    // End the conversation
    endConversation();
    
    toast({
      title: "Conversation Ended",
      description: "The conversation has been reset. You can start a new one."
    });
  };

  // Effect to ensure microphone is properly reset when mute state changes
  useEffect(() => {
    console.log(`Microphone mute state changed to: ${isMicMuted ? 'muted' : 'unmuted'}`);
  }, [isMicMuted]);

  // Handle logout by cleaning up first
  const handleLogout = () => {
    if (onLogout) {
      // First clean up audio and mic resources
      console.log('Preparing for logout, cleaning up resources');
      stopAudio();
      cleanup();
      // Then call the parent's logout handler
      onLogout();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <ConversationHandler
        generateSpeech={generateSpeech}
        isMuted={isMuted}
        autoStartMic={autoStartMic}
        isPlaying={isPlaying}
        isGenerating={isGenerating}
        ttsError={ttsError}
      >
        {({ messages, setMessages, processUserInput, isProcessing, initializeConversation }) => (
          <SpeechHandler
            autoStartMic={autoStartMic}
            isMicMuted={isMicMuted}
            isPlaying={isPlaying}
            isGenerating={isGenerating}
            inputMode={inputMode}
            onFinalTranscript={processUserInput}
          >
            {({ isListening, transcript, toggleListening, stopListening, resetSpeech }) => (
              <ErrorHandler
                error={error}
                messages={messages}
                setMessages={setMessages}
              >
                <div className="flex-1 agent-card mb-6 overflow-hidden">
                  <div className="flex justify-between items-center mb-4">
                    <div />
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      className="flex gap-2 items-center"
                      onClick={() => handleEndConversation(resetSpeech, () => {
                        setMessages([]);
                        setTimeout(() => {
                          initializeConversation();
                        }, 300);
                      })}
                    >
                      <X size={16} />
                      End Conversation
                    </Button>
                  </div>
                  <ConversationLog 
                    messages={messages} 
                    isGeneratingAudio={isGenerating} 
                    isPlayingAudio={isPlaying}
                    onToggleAudio={generateSpeech}
                    onLogout={handleLogout}
                    className="h-full" 
                  />
                </div>
                
                <TranscriptDisplay 
                  transcript={transcript}
                  isMicMuted={isMicMuted}
                  isListening={isListening}
                  isGeneratingVoice={isGenerating || isPlaying}
                  inputMode={inputMode}
                />
                
                <AudioSettings
                  inputMode={inputMode}
                  isListening={isListening}
                  isMuted={isMuted}
                  isMicMuted={isMicMuted}
                  volume={volume}
                  onToggleListening={async () => {
                    if (isPlaying || isGenerating) {
                      stopAudio();
                      await new Promise(resolve => setTimeout(resolve, 300));
                    }
                    await toggleListening();
                  }}
                  onMuteToggle={handleMuteToggle}
                  onMicMuteToggle={handleMicMuteToggle}
                  onVolumeChange={handleVolumeChange}
                  onSwitchToTextMode={handleSwitchToTextMode}
                  onSwitchToVoiceMode={handleSwitchToVoiceMode}
                  onTextInputSubmit={processUserInput}
                />
              </ErrorHandler>
            )}
          </SpeechHandler>
        )}
      </ConversationHandler>
    </div>
  );
};

export default ConversationInterface;
