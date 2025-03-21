
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';

interface MicrophonePermissionAlertProps {
  onRequestPermission: () => Promise<void>;
}

const MicrophonePermissionAlert: React.FC<MicrophonePermissionAlertProps> = ({
  onRequestPermission
}) => {
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Microphone Access Denied</AlertTitle>
      <AlertDescription>
        <p>Please enable microphone access in your browser settings to use voice features.</p>
        <div className="mt-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRequestPermission}
            className="mt-2"
          >
            Request Microphone Access
          </Button>
          <div className="mt-2 text-xs">
            <strong>Browser Instructions:</strong>
            <ul className="list-disc pl-5 mt-1">
              <li>Chrome/Edge: Click the lock/camera icon in address bar → Site settings → Allow microphone</li>
              <li>Safari: Preferences → Websites → Microphone → Allow for this website</li>
              <li>Firefox: Click the shield icon in address bar → Allow microphone</li>
              <li>Mobile: Check browser permissions in device settings</li>
            </ul>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default MicrophonePermissionAlert;
