
import React from 'react';
import VoiceControls from './VoiceControls';
import TextInputMode from './TextInputMode';

interface AudioSettingsProps {
  inputMode: 'voice' | 'text';
  isListening: boolean;
  isMuted: boolean;
  isMicMuted: boolean;
  volume: number;
  onToggleListening: () => void;
  onMuteToggle: () => void;
  onMicMuteToggle: () => void;
  onVolumeChange: (value: number) => void;
  onSwitchToTextMode: () => void;
  onSwitchToVoiceMode: () => void;
  onTextInputSubmit: (text: string) => void;
}

const AudioSettings: React.FC<AudioSettingsProps> = ({
  inputMode,
  isListening,
  isMuted,
  isMicMuted,
  volume,
  onToggleListening,
  onMuteToggle,
  onMicMuteToggle,
  onVolumeChange,
  onSwitchToTextMode,
  onSwitchToVoiceMode,
  onTextInputSubmit,
}) => {
  return (
    <>
      {inputMode === 'voice' ? (
        <div className="flex justify-center py-4">
          <VoiceControls 
            isListening={isListening}
            isMuted={isMuted}
            volume={volume}
            onListen={onToggleListening}
            onStopListening={onToggleListening}
            onMuteToggle={onMuteToggle}
            onVolumeChange={onVolumeChange}
            onSwitchToText={onSwitchToTextMode}
            isMicMuted={isMicMuted}
            onMicMuteToggle={onMicMuteToggle}
          />
        </div>
      ) : (
        <TextInputMode 
          onSendMessage={onTextInputSubmit}
          onSwitchToVoice={onSwitchToVoiceMode}
        />
      )}
    </>
  );
};

export default AudioSettings;
