
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ApiQuotaAlertProps {
  error: string | null;
}

const ApiQuotaAlert: React.FC<ApiQuotaAlertProps> = ({ error }) => {
  if (!error) return null;
  
  const isQuotaError = error.includes('quota exceeded');
  const isAgentNotFoundError = error.includes('agent not found') || error.includes('Not Found');
  
  if (!isQuotaError && !isAgentNotFoundError) return null;
  
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>
        {isQuotaError ? "API Quota Exceeded" : "Agent Not Found"}
      </AlertTitle>
      <AlertDescription>
        {isQuotaError ? (
          <>
            {error}
            <div className="mt-2 text-sm">
              Please visit <a href="https://elevenlabs.io" target="_blank" rel="noopener noreferrer" className="underline">ElevenLabs</a> to add more credits to your account or try again later.
            </div>
          </>
        ) : (
          <>
            The voice agent ID you provided doesn't exist or is incorrect.
            <div className="mt-2 text-sm">
              Please check your agent ID on <a href="https://elevenlabs.io" target="_blank" rel="noopener noreferrer" className="underline">ElevenLabs</a> and try again.
            </div>
          </>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default ApiQuotaAlert;
