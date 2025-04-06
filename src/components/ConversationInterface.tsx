
import React, { useState } from 'react';
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
        {({ messages, setMessages, processUserInput }) => (
          <SpeechHandler
            autoStartMic={autoStartMic}
            isMicMuted={isMicMuted}
            isPlaying={isPlaying}
            isGenerating={isGenerating}
            inputMode={inputMode}
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
                  onToggleListening={async () => {
                    if (isPlaying || isGenerating) {
                      stopAudio();
                      await new Promise(resolve => setTimeout(resolve, 300));
                    }
                    await toggleListening();
                  }}
                  onMuteToggle={handleMuteToggle}
                  onMicMuteToggle={() => {
                    const newMuteState = !isMicMuted;
                    setIsMicMuted(newMuteState);
                    
                    if (!newMuteState && autoStartMic && !isPlaying && !isGenerating) {
                      setTimeout(() => toggleListening(), 300);
                    }
                  }}
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
