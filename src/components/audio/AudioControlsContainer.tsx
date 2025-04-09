
import React from 'react';
import TranscriptDisplay from '../TranscriptDisplay';
import AudioSettings from '../AudioSettings';

interface AudioControlsContainerProps {
  transcript: string;
  isListening: boolean;
  isGeneratingVoice: boolean;
  inputMode: 'voice' | 'text';
  isMuted: boolean;
  isMicMuted: boolean;
  volume: number;
  toggleListening: () => Promise<void>;
  stopListening: () => void;
  handleMuteToggle: () => void;
  handleMicMuteToggle: () => void;
  handleVolumeChange: (value: number) => void;
  handleSwitchToTextMode: () => void;
  handleSwitchToVoiceMode: () => void;
  processUserInput: (text: string) => void;
}

const AudioControlsContainer: React.FC<AudioControlsContainerProps> = ({
  transcript,
  isListening,
  isGeneratingVoice,
  inputMode,
  isMuted,
  isMicMuted,
  volume,
  toggleListening,
  stopListening,
  handleMuteToggle,
  handleMicMuteToggle,
  handleVolumeChange,
  handleSwitchToTextMode,
  handleSwitchToVoiceMode,
  processUserInput,
}) => {
  return (
    <>
      <TranscriptDisplay 
        transcript={transcript}
        isMicMuted={isMicMuted}
        isListening={isListening}
        isGeneratingVoice={isGeneratingVoice}
        inputMode={inputMode}
      />
      
      <AudioSettings
        inputMode={inputMode}
        isListening={isListening}
        isMuted={isMuted}
        isMicMuted={isMicMuted}
        volume={volume}
        onToggleListening={toggleListening}
        onMuteToggle={handleMuteToggle}
        onMicMuteToggle={handleMicMuteToggle}
        onVolumeChange={handleVolumeChange}
        onSwitchToTextMode={handleSwitchToTextMode}
        onSwitchToVoiceMode={handleSwitchToVoiceMode}
        onTextInputSubmit={processUserInput}
      />
    </>
  );
};

export default AudioControlsContainer;
