
import React from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { AIVoiceInput } from './ui/ai-voice-input';
import { useConversation } from '@/contexts/ConversationContext';

const CircularVoiceInterface: React.FC = () => {
  const { 
    isListening,
    isMicMuted,
    isMuted,
    handleListenStart,
    handleListenStop,
    toggleMic,
    toggleMute,
    isDarkMode,
    toggleDarkMode
  } = useConversation();

  return (
    <div className="relative w-64 h-64 mx-auto flex items-center justify-center">
      {/* Animated gradient background */}
      <div 
        className={`absolute w-full h-full rounded-full overflow-hidden ${isListening ? "animate-pulse" : ""}`}
      >
        <div 
          className={`absolute inset-0 rounded-full ${isListening ? "animate-gradient-shift" : ""} dark:bg-gradient-premium-dark bg-gradient-premium-light`}
          style={{
            backgroundSize: "300% 300%",
          }}
        />
        
        {/* Inner animated pulse effect */}
        <div 
          className={`absolute inset-0 rounded-full ${isListening ? "animate-breathe" : ""}`}
          style={{
            background: "radial-gradient(circle, transparent 30%, var(--gradient-center-color) 70%)",
            mixBlendMode: "overlay"
          }}
        />
      </div>
      
      {/* Center voice input with visualizer */}
      <AIVoiceInput 
        onStart={handleListenStart}
        onStop={handleListenStop}
        className={isListening ? '' : 'opacity-75 hover:opacity-100 transition-opacity'}
      />

      {/* Circular buttons for controls */}
      <Button
        onClick={toggleMic}
        className={`absolute bottom-0 right-0 z-20 rounded-full w-12 h-12 flex items-center justify-center transition-colors duration-300 ${
          isMicMuted 
            ? "bg-red-500 text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700" 
            : "bg-white/80 text-gray-800 hover:bg-white/90 dark:bg-gray-800/80 dark:text-gray-100 dark:hover:bg-gray-800/90 border border-gray-200 dark:border-gray-700"
        }`}
        variant="ghost"
        size="icon"
        aria-label={isMicMuted ? "Unmute microphone" : "Mute microphone"}
      >
        {isMicMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
      </Button>
      
      <Button
        onClick={toggleMute}
        className={`absolute bottom-0 left-0 z-20 rounded-full w-12 h-12 flex items-center justify-center transition-colors duration-300 ${
          isMuted 
            ? "bg-red-500 text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700" 
            : "bg-white/80 text-gray-800 hover:bg-white/90 dark:bg-gray-800/80 dark:text-gray-100 dark:hover:bg-gray-800/90 border border-gray-200 dark:border-gray-700"
        }`}
        variant="ghost"
        size="icon"
        aria-label={isMuted ? "Unmute speaker" : "Mute speaker"}
      >
        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
      </Button>
      
      <Button
        onClick={toggleDarkMode}
        className="absolute top-0 right-0 z-20 rounded-full w-12 h-12 flex items-center justify-center transition-colors duration-300 bg-white/80 text-gray-800 hover:bg-white/90 dark:bg-gray-800/80 dark:text-gray-100 dark:hover:bg-gray-800/90 border border-gray-200 dark:border-gray-700"
        variant="ghost"
        size="icon"
        aria-label="Toggle dark mode"
      >
        {isDarkMode ? 
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
          </svg> : 
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        }
      </Button>
    </div>
  );
};

export default CircularVoiceInterface;
