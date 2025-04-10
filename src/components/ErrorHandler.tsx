
import React, { useEffect, useRef } from 'react';

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
  const hasAddedErrorMessage = useRef(false);

  useEffect(() => {
    if (error && !hasAddedErrorMessage.current) {
      if (!messages.some(msg => msg.text.includes("I'm having trouble with my voice output"))) {
        const errorMessage = {
          id: crypto.randomUUID(),
          text: `I'm having trouble with my voice output. ${error.includes("quota") ? "The API quota has been exceeded." : "Please check if the Voice ID is correct."}`,
          sender: 'assistant' as const,
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, errorMessage]);
        hasAddedErrorMessage.current = true;
      }
    }
  }, [error, messages, setMessages]);

  // Reset the flag if the error changes
  useEffect(() => {
    if (!error) {
      hasAddedErrorMessage.current = false;
    }
  }, [error]);

  return <>{children}</>;
};

export default ErrorHandler;
