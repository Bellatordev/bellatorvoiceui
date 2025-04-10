
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
  const lastErrorRef = useRef<string | null>(null);
  
  // Only add an error message once for the entire session
  useEffect(() => {
    if (error && 
        !hasAddedErrorMessage.current && 
        !messages.some(msg => msg.text && msg.text.includes("I'm having trouble with my voice output"))) {
      
      const errorMessage = {
        id: crypto.randomUUID(),
        text: `I'm having trouble with my voice output. ${error.includes("quota") ? "The API quota has been exceeded." : "Please check if the Voice ID is correct."}`,
        sender: 'assistant' as const,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
      hasAddedErrorMessage.current = true;
      lastErrorRef.current = error;
      
      // Log error for debugging
      console.log('Error message added to conversation - will not show again:', error);
    }
  }, [error, messages, setMessages]);

  return <>{children}</>;
};

export default ErrorHandler;
