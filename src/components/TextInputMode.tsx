
import React, { useState, FormEvent } from 'react';

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
    <form onSubmit={handleTextSubmit} className="flex items-center space-x-2 p-4">
      <input
        type="text"
        value={textInput}
        onChange={(e) => setTextInput(e.target.value)}
        placeholder="Type your message..."
        className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-agent-primary"
      />
      <button
        type="submit"
        className="px-4 py-2 bg-agent-primary text-white rounded-md hover:bg-agent-primary/90"
      >
        Send
      </button>
      <button
        type="button"
        onClick={onSwitchToVoice}
        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
      >
        Use Voice
      </button>
    </form>
  );
};

export default TextInputMode;
