
import React, { useState, useEffect } from 'react';
import TranscriptDisplay from './TranscriptDisplay';
import SpeechHandler from './SpeechHandler';
import ConversationHandler from './ConversationHandler';
import ErrorHandler from './ErrorHandler';
import AudioSettings from './AudioSettings';
import useElevenLabs from '@/hooks/useElevenLabs';
import { toast } from '@/components/ui/use-toast';
import ConversationContainer from './conversation/ConversationContainer';

interface ConversationInterfaceProps {
  apiKey: string;
  agentId: string;
  onLogout?: () => void;
  webhookUrl?: string;
  agentName?: string;
}

const ConversationInterface: React.FC<ConversationInterfaceProps> = ({ 
  apiKey, 
  agentId,
  onLogout,
  webhookUrl,
  agentName
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
    setIsMicMuted(true);
    setInputMode('text');
  };

  const handleSwitchToVoiceMode = () => {
    setIsMicMuted(false);
    setInputMode('voice');
  };

  const handleMicMuteToggle = () => {
    const newMuteState = !isMicMuted;
    console.log(`Microphone mute toggled to: ${newMuteState ? 'muted' : 'unmuted'}`);
    setIsMicMuted(newMuteState);
  };

  const handleEndConversation = (resetSpeech: () => void, endConversation: () => void, stopListening: () => void) => {
    console.log("Ending conversation and shutting down all audio services");
    stopAudio();
    setIsMicMuted(true);
    resetSpeech();
    stopListening();
    
    // Simply clear messages without initializing a new conversation
    endConversation();
    
    toast({
      title: "Conversation Ended",
      description: "The conversation has been ended. You can start a new one by restarting."
    });
  };

  const handleRestartConversation = (resetSpeech: () => void, restartConversation: () => void) => {
    console.log("Restarting conversation");
    stopAudio();
    setIsMicMuted(true);
    resetSpeech();
    
    // Restart with welcome message
    restartConversation();
    
    // After restart, unmute mic if in voice mode
    setTimeout(() => {
      if (inputMode === 'voice') {
        setIsMicMuted(false);
      }
    }, 1000);
    
    toast({
      title: "Conversation Restarted",
      description: "Starting a new conversation."
    });
  };

  useEffect(() => {
    console.log(`Microphone mute state changed to: ${isMicMuted ? 'muted' : 'unmuted'}`);
  }, [isMicMuted]);

  const handleLogout = () => {
    if (onLogout) {
      console.log('Preparing for logout, cleaning up resources');
      stopAudio();
      cleanup();
      setTimeout(() => {
        onLogout();
      }, 100);
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
        startListening={null}
        ttsError={ttsError}
        webhookUrl={webhookUrl}
        agentName={agentName}
      >
        {({ messages, setMessages, processUserInput, isProcessing, initializeConversation, restartConversation }) => (
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
                <ConversationContainer 
                  messages={messages}
                  isGenerating={isGenerating}
                  isPlaying={isPlaying}
                  onToggleAudio={generateSpeech}
                  onRestartConversation={() => handleRestartConversation(resetSpeech, restartConversation)}
                  onEndConversation={() => handleEndConversation(resetSpeech, () => {
                    setMessages([]);
                  }, stopListening)}
                  onLogout={handleLogout}
                />
                
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
