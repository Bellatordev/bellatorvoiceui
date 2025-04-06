
import React, { useState, useEffect, useCallback, memo } from 'react';
import ConversationLog from './ConversationLog';
import useElevenLabs from '@/hooks/useElevenLabs';
import TranscriptDisplay from './TranscriptDisplay';
import SpeechHandler from './SpeechHandler';
import ConversationHandler from './ConversationHandler';
import ErrorHandler from './ErrorHandler';
import AudioSettings from './AudioSettings';

interface ConversationInterfaceProps {
  apiKey: string;
  agentId: string;
  onLogout?: () => void;
  active?: boolean;
}

const ConversationInterface: React.FC<ConversationInterfaceProps> = ({ 
  apiKey, 
  agentId,
  onLogout,
  active = true
}) => {
  const [inputMode, setInputMode] = useState<'voice' | 'text'>('voice');
  const [isMuted, setIsMuted] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [autoStartMic, setAutoStartMic] = useState(true);
  const [ttsError, setTtsError] = useState<string | null>(null);
  
  // Memoize these to prevent unnecessary re-renders
  const handleMuteToggle = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  const handleVolumeChange = useCallback((value: number) => {
    console.log('Setting audio volume to', value);
    setVolume(value);
  }, []);

  const handleSwitchToTextMode = useCallback(() => {
    setMicMuted(true);
    setInputMode('text');
  }, []);

  const handleSwitchToVoiceMode = useCallback(() => {
    setMicMuted(false);
    setInputMode('voice');
  }, []);
  
  const setMicMuted = useCallback((value: boolean) => {
    console.log('Setting mic muted to', value);
    setIsMicMuted(value);
  }, []);
  
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
    active
  });

  // Clean up resources when component becomes inactive
  useEffect(() => {
    if (!active) {
      console.log("Conversation interface is inactive, cleaning up resources");
      cleanup();
    }
    
    return () => {
      console.log("Conversation interface unmounting, cleaning up resources");
      cleanup();
    };
  }, [active, cleanup]);

  // Memoize the toggleListening handler to prevent re-renders
  const handleToggleListening = useCallback(async (toggleListening: () => Promise<void>) => {
    if (isPlaying || isGenerating) {
      stopAudio();
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    await toggleListening();
  }, [isPlaying, isGenerating, stopAudio]);

  // Memoize the micMuteToggle handler to prevent re-renders
  const handleMicMuteToggle = useCallback((toggleListening: () => Promise<void>) => {
    const newMuteState = !isMicMuted;
    setMicMuted(newMuteState);
    
    if (!newMuteState && autoStartMic && !isPlaying && !isGenerating && active) {
      setTimeout(() => toggleListening(), 300);
    }
  }, [isMicMuted, autoStartMic, isPlaying, isGenerating, active, setMicMuted]);

  return (
    <div className="flex flex-col h-full">
      <ConversationHandler
        generateSpeech={generateSpeech}
        isMuted={isMuted}
        autoStartMic={autoStartMic}
        isPlaying={isPlaying}
        isGenerating={isGenerating}
        ttsError={ttsError}
        active={active}
      >
        {({ messages, setMessages, processUserInput }) => (
          <SpeechHandler
            autoStartMic={autoStartMic}
            isMicMuted={isMicMuted}
            isPlaying={isPlaying}
            isGenerating={isGenerating}
            inputMode={inputMode}
            active={active}
            onFinalTranscript={processUserInput}
          >
            {({ isListening, transcript, toggleListening }) => (
              <ErrorHandler
                error={error}
                messages={messages}
                setMessages={setMessages}
              >
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
                  inputMode={inputMode}
                />
                
                <AudioSettings
                  inputMode={inputMode}
                  isListening={isListening}
                  isMuted={isMuted}
                  isMicMuted={isMicMuted}
                  volume={volume}
                  onToggleListening={() => handleToggleListening(toggleListening)}
                  onMuteToggle={handleMuteToggle}
                  onMicMuteToggle={() => handleMicMuteToggle(toggleListening)}
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

export default memo(ConversationInterface);
