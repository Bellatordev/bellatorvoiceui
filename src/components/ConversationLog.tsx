
import React, { useRef, useEffect, useState } from 'react';
import { DownloadIcon } from 'lucide-react';
import AudioVisualizer from './AudioVisualizer';

export type Message = {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  audioElement?: HTMLAudioElement | null;
  debugInfo?: string; // Add debug info field for webhooks
  rawWebhookResponse?: any; // Store the raw webhook response
};

type ConversationLogProps = {
  messages: Message[];
  isGeneratingAudio?: boolean;
  isPlayingAudio?: boolean;
  onToggleAudio?: (messageId: string, text: string, audioElement?: HTMLAudioElement | null) => void;
  onPlaybackEnd?: () => void;
  className?: string;
  onLogout?: () => void;
};

const ConversationLog: React.FC<ConversationLogProps> = ({
  messages,
  isGeneratingAudio = false,
  isPlayingAudio = false,
  onToggleAudio,
  onPlaybackEnd,
  className = '',
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(null);
  const [audioPlaybackStates, setAudioPlaybackStates] = useState<Record<string, boolean>>({});
  
  // Add event listeners to each audio element to detect when playback ends or pauses
  useEffect(() => {
    const audioEventHandlers: Record<string, { element: HTMLAudioElement, handlers: Array<{event: string, handler: () => void}> }> = {};
    
    messages.forEach(message => {
      if (message.audioElement) {
        // Create handlers for this message's audio element
        const handleAudioEnded = () => {
          console.log('Audio playback completed for message:', message.id);
          setCurrentlyPlayingId(null);
          setAudioPlaybackStates(prev => ({ ...prev, [message.id]: false }));
          if (onPlaybackEnd) {
            onPlaybackEnd();
          }
        };
        
        // Handle pause events
        const handleAudioPaused = () => {
          // Only handle genuine pauses (not automatic pauses at the end)
          if (message.audioElement && 
              message.audioElement.currentTime < message.audioElement.duration - 0.1) {
            console.log('Audio playback manually paused for message:', message.id);
            setAudioPlaybackStates(prev => ({ ...prev, [message.id]: false }));
          }
        };
        
        // Handle play events
        const handleAudioPlay = () => {
          console.log('Audio playback started/resumed for message:', message.id);
          setAudioPlaybackStates(prev => ({ ...prev, [message.id]: true }));
        };
        
        // Add all event listeners
        message.audioElement.addEventListener('ended', handleAudioEnded);
        message.audioElement.addEventListener('pause', handleAudioPaused);
        message.audioElement.addEventListener('play', handleAudioPlay);
        
        // Track handlers so we can remove them on cleanup
        audioEventHandlers[message.id] = {
          element: message.audioElement,
          handlers: [
            { event: 'ended', handler: handleAudioEnded },
            { event: 'pause', handler: handleAudioPaused },
            { event: 'play', handler: handleAudioPlay }
          ]
        };
      }
    });
    
    // Cleanup function to remove all event listeners
    return () => {
      Object.values(audioEventHandlers).forEach(({ element, handlers }) => {
        handlers.forEach(({ event, handler }) => {
          element.removeEventListener(event, handler);
        });
      });
    };
  }, [messages, onPlaybackEnd]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const downloadConversation = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const text = messages.map(msg => `${formatTimestamp(msg.timestamp)} - ${msg.sender === 'user' ? 'You' : 'Assistant'}: ${msg.text}`).join('\n\n');
    const blob = new Blob([text], {
      type: 'text/plain'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversation-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleToggleAudio = (message: Message, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onToggleAudio) {
      setCurrentlyPlayingId(message.id);
      onToggleAudio(message.id, message.text, message.audioElement);
    }
  };
  
  return (
    <div className={`flex flex-col ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Conversation</h2>
        
        <div className="flex space-x-2">
          <button 
            onClick={downloadConversation} 
            className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors focus-ring" 
            aria-label="Download conversation"
            type="button"
          >
            <DownloadIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-4 p-1">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <p>No messages yet. Start a conversation!</p>
          </div>
        ) : (
          messages.map(message => {
            // Determine if this specific message's audio is playing
            const isThisMessagePlaying = message.audioElement ? 
              (message.audioElement.currentTime > 0 && !message.audioElement.paused && !message.audioElement.ended) || 
              audioPlaybackStates[message.id] || 
              (currentlyPlayingId === message.id && isPlayingAudio);
              
            return (
              <div 
                key={message.id} 
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}
              >
                <div 
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.sender === 'user' 
                      ? 'bg-primary/10 dark:bg-primary/20 text-foreground rounded-tr-none' 
                      : 'bg-secondary dark:bg-secondary/30 text-foreground rounded-tl-none'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-sm">{message.text}</span>
                    
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-muted-foreground">
                        {formatTimestamp(message.timestamp)}
                      </span>
                      
                      {message.sender === 'assistant' && onToggleAudio && message.audioElement && (
                        <AudioVisualizer 
                          isPlaying={isThisMessagePlaying} 
                          isGenerating={isGeneratingAudio && currentlyPlayingId === message.id} 
                          onTogglePlayback={(e) => handleToggleAudio(message, e)}
                          className="ml-2"
                          hasAttachedAudio={!!message.audioElement}
                          showCompactUI={true}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ConversationLog;
