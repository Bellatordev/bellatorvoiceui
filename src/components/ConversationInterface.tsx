import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Mic, Send, User, Bot } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';

interface ConversationInterfaceProps {
  apiKey: string;
  agentId: string;
  onLogout: () => void;
}

const ConversationInterface: React.FC<ConversationInterfaceProps> = ({
  apiKey,
  agentId,
  onLogout,
}) => {
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState<
    { sender: 'user' | 'bot'; text: string }[]
  >([]);
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState('');
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom on new message
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [conversation]);

  useEffect(() => {
    // Initialize media recorder
    const initializeMediaRecorder = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);

        recorder.ondataavailable = (event) => {
          const audioBlob = new Blob([event.data], { type: 'audio/webm' });
          const url = URL.createObjectURL(audioBlob);
          setAudioURL(url);
        };

        setMediaRecorder(recorder);
      } catch (error) {
        console.error("Error initializing media recorder:", error);
        toast({
          title: "Microphone Error",
          description: "Please allow microphone access to use voice input.",
          variant: "destructive",
        });
      }
    };

    initializeMediaRecorder();

    return () => {
      if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
      }
    };
  }, []);

  const sendMessage = async () => {
    if (!message.trim()) return;

    setIsLoading(true);
    const userMessage = { sender: 'user', text: message };
    setConversation((prevConversation) => [...prevConversation, userMessage]);
    setMessage('');

    try {
      const response = await fetch('https://api.elevenlabs.io/v1/agents/' + agentId + '/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: message }],
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      const botMessage = { sender: 'bot', text: data.choices[0].message.content };
      setConversation((prevConversation) => [...prevConversation, botMessage]);
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send message.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.start();
      setIsRecording(true);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const sendAudioMessage = async () => {
    if (!audioURL) {
      toast({
        title: "No audio recorded",
        description: "Please record audio before sending.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const audioBlob = await fetch(audioURL).then(r => r.blob());
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');

    try {
      const response = await fetch('https://api.elevenlabs.io/v1/agents/' + agentId + '/transcribe', {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      const transcribedMessage = data.text;

      // Add user's transcribed message to conversation
      const userMessage = { sender: 'user', text: transcribedMessage };
      setConversation((prevConversation) => [...prevConversation, userMessage]);

      // Send the transcribed message to the bot
      const chatResponse = await fetch('https://api.elevenlabs.io/v1/agents/' + agentId + '/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: transcribedMessage }],
        }),
      });

      if (!chatResponse.ok) {
        throw new Error(`HTTP error! Status: ${chatResponse.status}`);
      }

      const chatData = await chatResponse.json();
      const botMessage = { sender: 'bot', text: chatData.choices[0].message.content };
      setConversation((prevConversation) => [...prevConversation, botMessage]);

    } catch (error: any) {
      console.error("Error sending audio message:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send audio message.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
        <h2 className="text-lg font-semibold">Conversation</h2>
        <Button variant="outline" size="sm" onClick={onLogout}>
          Logout
        </Button>
      </div>

      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-2">
        {conversation.map((messageData, index) => (
          <div
            key={index}
            className={`flex flex-col rounded-xl p-3 w-fit max-w-[80%] ${messageData.sender === 'user'
              ? 'ml-auto bg-blue-100 dark:bg-blue-200'
              : 'mr-auto bg-gray-100 dark:bg-gray-700'
              }`}
          >
            <div className="text-sm text-gray-800 dark:text-gray-100">
              {messageData.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center justify-center">
            <div className="animate-pulse rounded-full bg-gray-300 dark:bg-gray-600 h-4 w-4 mr-2"></div>
            <div className="animate-pulse rounded-full bg-gray-300 dark:bg-gray-600 h-4 w-4 mr-2"></div>
            <div className="animate-pulse rounded-full bg-gray-300 dark:bg-gray-600 h-4 w-4"></div>
          </div>
        )}
      </div>

      <div className="p-4 border-t dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 resize-none border rounded-md py-2 px-3 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />
          <Button onClick={sendMessage} disabled={isLoading}>
            <Send className="w-4 h-4 mr-2" />
            Send
          </Button>
        </div>

        <div className="flex items-center justify-between mt-2">
          <Button
            variant="secondary"
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isLoading}
          >
            {isRecording ? (
              <>Stop Recording</>
            ) : (
              <>Record Audio</>
            )}
          </Button>
          <Button
            variant="secondary"
            onClick={sendAudioMessage}
            disabled={isLoading || !audioURL}
          >
            Send Audio
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConversationInterface;
