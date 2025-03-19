
import React, { useState } from 'react';
import { Settings as SettingsIcon, X, ChevronDown } from 'lucide-react';

export type VoiceOption = {
  id: string;
  name: string;
  description: string;
};

type SettingsProps = {
  voiceOptions: VoiceOption[];
  selectedVoice: string;
  onVoiceChange: (voiceId: string) => void;
};

const Settings: React.FC<SettingsProps> = ({
  voiceOptions,
  selectedVoice,
  onVoiceChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const selectedVoiceOption = voiceOptions.find(v => v.id === selectedVoice);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full bg-white text-gray-600 hover:bg-gray-100 transition-colors focus-ring"
        aria-label="Settings"
      >
        <SettingsIcon className="w-5 h-5" />
      </button>
      
      {isOpen && (
        <div className="absolute top-12 right-0 w-72 bg-white rounded-xl shadow-lg p-4 z-20 glass animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-800">Settings</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors focus-ring"
              aria-label="Close settings"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Voice</label>
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full flex items-center justify-between agent-input"
                >
                  <span>{selectedVoiceOption?.name || 'Select a voice'}</span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>
                
                {isDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-md max-h-48 overflow-y-auto z-30 animate-slide-down">
                    {voiceOptions.map((voice) => (
                      <button
                        key={voice.id}
                        onClick={() => {
                          onVoiceChange(voice.id);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors ${
                          voice.id === selectedVoice ? 'bg-agent-secondary/10 text-agent-primary' : ''
                        }`}
                      >
                        <div className="font-medium">{voice.name}</div>
                        <div className="text-xs text-gray-500">{voice.description}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/5 z-10" 
          onClick={() => {
            setIsOpen(false);
            setIsDropdownOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default Settings;
