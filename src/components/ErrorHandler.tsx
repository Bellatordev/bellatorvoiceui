
import React, { useEffect } from 'react';

interface ErrorHandlerProps {
  error: string | null;
  messages: any[];
  setMessages: React.Dispatch<React.SetStateAction<any[]>>;
  children: React.ReactNode;
}

const ErrorHandler: React.FC<ErrorHandlerProps> = ({
  error,
  messages,
  setMessages,
  children,
}) => {
  useEffect(() => {
    if (error) {
      if (!messages.some(msg => msg.text.includes("I'm having trouble with my voice output"))) {
        const errorMessage = {
          id: crypto.randomUUID(),
          text: `I'm having trouble with my voice output. ${error.includes("quota") ? "The API quota has been exceeded." : "Please check if the Voice ID is correct."}`,
          sender: 'assistant' as const,
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, errorMessage]);
      }
    }
  }, [error, messages, setMessages]);

  return <>{children}</>;
};

export default ErrorHandler;
