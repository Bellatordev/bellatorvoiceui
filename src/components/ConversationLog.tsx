
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
  className?: string;
  onLogout?: () => void;
};

const ConversationLog: React.FC<ConversationLogProps> = ({
  messages,
  isGeneratingAudio = false,
  isPlayingAudio = false,
  onToggleAudio,
  className = '',
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(null);
  
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
      if (currentlyPlayingId === message.id) {
        setCurrentlyPlayingId(null);
      } else {
        setCurrentlyPlayingId(message.id);
      }
      
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
                  
                  {message.debugInfo && (
                    <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-md text-xs font-mono overflow-auto max-h-[300px]">
                      <details>
                        <summary className="text-xs text-blue-500 cursor-pointer">Show Webhook Debug Info</summary>
                        <div className="mt-1">
                          <h4 className="text-xs font-semibold mb-1">Raw JSON Response:</h4>
                          <pre className="whitespace-pre-wrap break-words">{message.debugInfo}</pre>
                          
                          {message.rawWebhookResponse && (
                            <div className="mt-2 border-t border-gray-300 dark:border-gray-600 pt-2">
                              <h4 className="text-xs font-semibold mb-1">Response Structure:</h4>
                              <ul className="list-disc pl-4 space-y-1">
                                {Object.keys(message.rawWebhookResponse).map(key => (
                                  <li key={key} className="text-xs">
                                    <span className="font-medium">{key}:</span> 
                                    {typeof message.rawWebhookResponse[key] === 'object' ? 
                                      ' [Object]' : 
                                      ` ${String(message.rawWebhookResponse[key]).substring(0, 50)}${String(message.rawWebhookResponse[key]).length > 50 ? '...' : ''}`}
                                  </li>
                                ))}
                              </ul>
                              
                              {/* Display kwargs content if available */}
                              {message.rawWebhookResponse?.kwargs && (
                                <div className="mt-2 border-t border-gray-300 dark:border-gray-600 pt-2">
                                  <h4 className="text-xs font-semibold mb-1">kwargs:</h4>
                                  <ul className="list-disc pl-4 space-y-1">
                                    {Object.keys(message.rawWebhookResponse.kwargs).map(key => (
                                      <li key={key} className="text-xs">
                                        <span className="font-medium">{key}:</span> 
                                        {typeof message.rawWebhookResponse.kwargs[key] === 'object' ? 
                                          ' [Object]' : 
                                          ` ${String(message.rawWebhookResponse.kwargs[key]).substring(0, 100)}${String(message.rawWebhookResponse.kwargs[key]).length > 100 ? '...' : ''}`}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </details>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-muted-foreground">
                      {formatTimestamp(message.timestamp)}
                    </span>
                    
                    {message.sender === 'assistant' && onToggleAudio && (
                      <AudioVisualizer 
                        isPlaying={isPlayingAudio && currentlyPlayingId === message.id} 
                        isGenerating={isGeneratingAudio && currentlyPlayingId === message.id} 
                        onTogglePlayback={(e) => handleToggleAudio(message, e)}
                        className="ml-2"
                        hasAttachedAudio={!!message.audioElement}
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
