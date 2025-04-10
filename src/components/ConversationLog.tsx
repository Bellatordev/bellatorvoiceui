import React, { useRef, useEffect } from 'react';
import { DownloadIcon } from 'lucide-react';
import AudioVisualizer from './AudioVisualizer';

export type Message = {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
};

type ConversationLogProps = {
  messages: Message[];
  isGeneratingAudio?: boolean;
  isPlayingAudio?: boolean;
  onToggleAudio?: (text: string) => void;
  className?: string;
  onLogout?: () => void;
};

const ConversationLog: React.FC<ConversationLogProps> = ({
  messages,
  isGeneratingAudio = false,
  isPlayingAudio = false,
  onToggleAudio,
  className = '',
  onLogout
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
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
  
  const downloadConversation = () => {
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

  let lastAssistantMessage: Message | undefined = undefined;
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].sender === 'assistant') {
      lastAssistantMessage = messages[i];
      break;
    }
  }
  
  const handleToggleAudio = (messageText: string) => {
    if (onToggleAudio) {
      onToggleAudio(messageText);
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
          messages.map(message => (
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
                    
                    {message.sender === 'assistant' && onToggleAudio && (
                      <AudioVisualizer 
                        isPlaying={isPlayingAudio && lastAssistantMessage?.id === message.id} 
                        isGenerating={isGeneratingAudio && lastAssistantMessage?.id === message.id} 
                        onTogglePlayback={() => handleToggleAudio(message.text)} 
                        className="ml-2" 
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ConversationLog;
