import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const IDchatTest = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Button>
          <h1 className="text-3xl font-bold">IDchat-test</h1>
        </div>
        
        <div className="bg-card rounded-lg p-8 shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Welcome to IDchat-test</h2>
          <p className="text-muted-foreground">
            This is your new IDchat-test page. You can start building your functionality here.
          </p>
        </div>
      </div>
    </div>
  );
};

export default IDchatTest;