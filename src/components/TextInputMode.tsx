
import React, { useState, FormEvent } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mic } from "lucide-react";

interface TextInputModeProps {
  onSendMessage: (text: string) => void;
  onSwitchToVoice: () => void;
}

const TextInputMode: React.FC<TextInputModeProps> = ({ onSendMessage, onSwitchToVoice }) => {
  const [textInput, setTextInput] = useState("");

  const handleTextSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (textInput.trim()) {
      onSendMessage(textInput);
      setTextInput("");
    }
  };

  return (
    <form onSubmit={handleTextSubmit} className="flex items-center space-x-2 p-4 bg-background border-t border-border">
      <Input
        type="text"
        value={textInput}
        onChange={(e) => setTextInput(e.target.value)}
        placeholder="Type your message..."
        className="flex-1 text-foreground"
      />
      <Button type="submit" variant="default">
        Send
      </Button>
      <Button 
        type="button" 
        onClick={onSwitchToVoice} 
        variant="outline"
        className="flex items-center gap-2"
      >
        <Mic className="h-4 w-4" />
        Voice
      </Button>
    </form>
  );
};

export default TextInputMode;
