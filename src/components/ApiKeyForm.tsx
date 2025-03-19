
import React, { useState } from 'react';
import { Key } from 'lucide-react';
import { Button } from './ui/button';

interface ApiKeyFormProps {
  onSaveApiKey: (apiKey: string) => void;
  hasApiKey: boolean;
}

const ApiKeyForm: React.FC<ApiKeyFormProps> = ({ onSaveApiKey, hasApiKey }) => {
  const [apiKey, setApiKey] = useState('');
  const [showForm, setShowForm] = useState(!hasApiKey);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      onSaveApiKey(apiKey.trim());
      setShowForm(false);
    }
  };

  return (
    <div className="mb-4">
      {!showForm ? (
        <Button 
          variant="outline"
          size="sm"
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2"
        >
          <Key size={16} />
          {hasApiKey ? 'Change API Key' : 'Set Eleven Labs API Key'}
        </Button>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col space-y-2">
          <div className="flex flex-col">
            <label htmlFor="apiKey" className="text-sm font-medium text-gray-700 mb-1">
              Eleven Labs API Key
            </label>
            <input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your Eleven Labs API Key"
              className="agent-input"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Your API key is stored locally and never sent to our servers.
            </p>
          </div>
          <div className="flex space-x-2">
            <Button type="submit" variant="default" size="sm">
              Save Key
            </Button>
            {hasApiKey && (
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      )}
    </div>
  );
};

export default ApiKeyForm;
