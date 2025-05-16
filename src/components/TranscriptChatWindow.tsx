
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';

export type MessageType = {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
};

interface TranscriptChatWindowProps {
  messages: MessageType[];
  className?: string;
}

const TranscriptChatWindow: React.FC<TranscriptChatWindowProps> = ({ messages, className = '' }) => {
  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card className={`bg-black/30 backdrop-blur-md border border-white/10 ${className}`}>
      <div className="p-3 border-b border-white/10">
        <h3 className="font-semibold text-center">Conversation Transcript</h3>
      </div>

      <ScrollArea className="h-[300px] p-3">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-white/50">Conversation will appear here</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.sender === 'user'
                    ? 'bg-blue-600/30 ml-auto rounded-tr-none'
                    : 'bg-purple-600/30 mr-auto rounded-tl-none'
                }`}
              >
                <div className="flex flex-col">
                  <span className="text-sm">{message.text}</span>
                  <span className="text-xs text-white/50 mt-1">
                    {formatTimestamp(message.timestamp)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </Card>
  );
};

export default TranscriptChatWindow;
