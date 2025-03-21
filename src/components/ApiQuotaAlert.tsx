
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ApiQuotaAlertProps {
  error: string | null;
}

const ApiQuotaAlert: React.FC<ApiQuotaAlertProps> = ({ error }) => {
  if (!error) return null;
  
  const isQuotaError = error.includes('quota exceeded');
  
  if (!isQuotaError) return null;
  
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>API Quota Exceeded</AlertTitle>
      <AlertDescription>
        {error}
        <div className="mt-2 text-sm">
          Please visit <a href="https://elevenlabs.io" target="_blank" rel="noopener noreferrer" className="underline">ElevenLabs</a> to add more credits to your account or try again later.
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default ApiQuotaAlert;
