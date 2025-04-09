
import React, { useEffect, useState } from 'react';
import SpeechHandler from './SpeechHandler';
import ConversationHandler from './ConversationHandler';
import ErrorHandler from './ErrorHandler';
import useElevenLabs from '@/hooks/useElevenLabs';
import useAudioSettings from '@/hooks/useAudioSettings';
import ConversationManager from './conversation/ConversationManager';
import AudioControlsContainer from './audio/AudioControlsContainer';

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

  const {
    inputMode,
    isMuted,
    isMicMuted,
    volume,
    autoStartMic,
    handleMuteToggle,
    handleVolumeChange,
    handleSwitchToTextMode,
    handleSwitchToVoiceMode,
    handleMicMuteToggle
  } = useAudioSettings({ stopAudio });

  useEffect(() => {
    return () => {
      console.log('ConversationInterface unmounting, cleaning up resources');
      stopAudio();
      cleanup();
    };
  }, [stopAudio, cleanup]);

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
                <ConversationManager 
                  messages={messages}
                  isGenerating={isGenerating}
                  isPlaying={isPlaying}
                  generateSpeech={generateSpeech}
                  stopAudio={stopAudio}
                  cleanup={cleanup}
                  resetSpeech={resetSpeech}
                  stopListening={stopListening}
                  restartConversation={restartConversation}
                  onLogout={handleLogout}
                />
                
                <AudioControlsContainer 
                  transcript={transcript}
                  isListening={isListening}
                  isGeneratingVoice={isGenerating || isPlaying}
                  inputMode={inputMode}
                  isMuted={isMuted}
                  isMicMuted={isMicMuted}
                  volume={volume}
                  toggleListening={async () => {
                    if (isPlaying || isGenerating) {
                      stopAudio();
                      await new Promise(resolve => setTimeout(resolve, 300));
                    }
                    await toggleListening();
                  }}
                  stopListening={stopListening}
                  handleMuteToggle={handleMuteToggle}
                  handleMicMuteToggle={handleMicMuteToggle}
                  handleVolumeChange={handleVolumeChange}
                  handleSwitchToTextMode={handleSwitchToTextMode}
                  handleSwitchToVoiceMode={handleSwitchToVoiceMode}
                  processUserInput={processUserInput}
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
