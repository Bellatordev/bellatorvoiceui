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
  const [currentAudioMessageId, setCurrentAudioMessageId] = useState<string | null>(null);
  const [audioPlayer, setAudioPlayer] = useState<HTMLAudioElement | null>(null);
  
  // Initialize the ElevenLabs TTS service with the current agent's voice ID
  const { 
    generateSpeech, 
    isGenerating, 
    isPlaying, 
    error,
    stopAudio,
    cleanup,
    togglePlayback 
  } = useElevenLabs({
    apiKey,
    voiceId: agentId,
    modelId: "eleven_multilingual_v2", // Explicitly set to use the high-quality model
  });

  // Sync errors between ElevenLabs service and local state
  useEffect(() => {
    if (error) {
      console.log('ElevenLabs service reported error:', error);
      setTtsError(error);
    }
  }, [error]);

  useEffect(() => {
    return () => {
      console.log('ConversationInterface unmounting, cleaning up resources');
      stopAudio();
      cleanup();
      if (audioPlayer) {
        audioPlayer.pause();
        setAudioPlayer(null);
      }
    };
  }, [stopAudio, cleanup]);

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
    if (isPlaying) {
      stopAudio();
    }
    if (audioPlayer) {
      audioPlayer.pause();
    }
  };

  const handleVolumeChange = (value: number) => {
    console.log('Setting audio volume to', value);
    setVolume(value);
    if (audioPlayer) {
      audioPlayer.volume = value;
    }
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
    if (audioPlayer) {
      audioPlayer.pause();
      setAudioPlayer(null);
    }
    setIsMicMuted(true);
    resetSpeech();
    stopListening();
    
    endConversation();
    
    toast({
      title: "Conversation Ended",
      description: "The conversation has been ended. You can start a new one by restarting."
    });
  };

  const handleRestartConversation = (resetSpeech: () => void, restartConversation: () => void) => {
    console.log("Restarting conversation");
    stopAudio();
    if (audioPlayer) {
      audioPlayer.pause();
      setAudioPlayer(null);
    }
    setIsMicMuted(true);
    resetSpeech();
    
    restartConversation();
    
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

  const handlePlaybackEnd = () => {
    console.log('Audio playback ended, reactivating microphone');
    setCurrentAudioMessageId(null);
    setAudioPlayer(null);
    
    // Only unmute mic if we're in voice mode
    if (inputMode === 'voice') {
      // Short delay to avoid picking up system sounds
      setTimeout(() => {
        if (!isMicMuted) {
          setIsMicMuted(false);
        }
      }, 500);
    }
  };

  const handleToggleAudio = (messageId: string, text: string, attachedAudio?: HTMLAudioElement | null) => {
    console.log('Toggle audio playback for message:', messageId);
    
    // First stop any currently playing audio
    if (isPlaying) {
      stopAudio();
    }
    
    // If there's a currently playing audio that's different from the one we want to play,
    // stop it first
    if (audioPlayer && (!attachedAudio || audioPlayer !== attachedAudio)) {
      audioPlayer.pause();
      setAudioPlayer(null);
    }
    
    // If we're clicking on the currently playing message, just toggle playback state
    if (currentAudioMessageId === messageId) {
      if (attachedAudio && attachedAudio === audioPlayer) {
        if (audioPlayer.paused) {
          // Resume playback
          audioPlayer.play()
            .then(() => {
              console.log('Resumed playback of attached audio');
            })
            .catch(err => {
              console.error('Error resuming audio playback:', err);
            });
        } else {
          // Pause playback
          audioPlayer.pause();
          console.log('Paused playback of attached audio');
        }
        return;
      } else if (isPlaying) {
        // Toggle ElevenLabs audio
        togglePlayback();
        return;
      }
    }
    
    // Set the current message ID for playback tracking
    setCurrentAudioMessageId(messageId);
    
    // If we have an attached audio file, prioritize playing that
    if (attachedAudio) {
      console.log('Playing attached audio file');
      attachedAudio.volume = volume;
      setAudioPlayer(attachedAudio);
      
      // Add event listeners to handle playback state
      attachedAudio.onended = () => {
        console.log('Audio playback ended');
        // Don't reset the message ID or player - just mark as ended
        // This way the UI can still show which message was just played
      };
      
      // Start playback
      attachedAudio.play()
        .then(() => {
          toast({
            title: "Playing Audio",
            description: "Playing attached audio file",
            duration: 2000,
          });
        })
        .catch(err => {
          console.error('Failed to play audio file:', err);
          toast({
            title: "Audio Playback Issue",
            description: "There was a problem playing the audio file",
            variant: "destructive"
          });
        });
    } else {
      // No attached audio, use ElevenLabs to generate speech
      toast({
        title: "Generating Speech",
        description: "Preparing to play audio response...",
        duration: 2000,
      });
      
      generateSpeech(text).catch(err => {
        console.error('Failed to generate speech:', err);
        toast({
          title: "Speech Generation Issue",
          description: "There was a problem generating speech from the text",
          variant: "destructive"
        });
      });
    }
  };

  useEffect(() => {
    console.log(`Microphone mute state changed to: ${isMicMuted ? 'muted' : 'unmuted'}`);
  }, [isMicMuted]);

  const handleLogout = () => {
    if (onLogout) {
      console.log('Preparing for logout, cleaning up resources');
      stopAudio();
      if (audioPlayer) {
        audioPlayer.pause();
        setAudioPlayer(null);
      }
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
        isPlaying={isPlaying || (audioPlayer !== null && !audioPlayer.paused)}
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
            isPlaying={isPlaying || (audioPlayer !== null && !audioPlayer.paused)}
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
                  isPlaying={isPlaying || (audioPlayer !== null && !audioPlayer.paused)}
                  onToggleAudio={handleToggleAudio}
                  onPlaybackEnd={handlePlaybackEnd}
                  onRestartConversation={() => handleRestartConversation(resetSpeech, restartConversation)}
                  onEndConversation={() => {
                    handleEndConversation(
                      resetSpeech, 
                      () => setMessages([]), 
                      stopListening
                    );
                  }}
                  onLogout={handleLogout}
                />
                
                <TranscriptDisplay 
                  transcript={transcript}
                  isMicMuted={isMicMuted}
                  isListening={isListening}
                  isGeneratingVoice={isGenerating || (audioPlayer !== null && !audioPlayer.paused)}
                  inputMode={inputMode}
                />
                
                <AudioSettings
                  inputMode={inputMode}
                  isListening={isListening}
                  isMuted={isMuted}
                  isMicMuted={isMicMuted}
                  volume={volume}
                  onToggleListening={async () => {
                    if (isPlaying || isGenerating || (audioPlayer !== null && !audioPlayer.paused)) {
                      stopAudio();
                      if (audioPlayer) {
                        audioPlayer.pause();
                      }
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
