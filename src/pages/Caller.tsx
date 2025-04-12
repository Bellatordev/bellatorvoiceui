
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Phone } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

const Caller = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Theme Toggle in top right */}
      <div className="absolute top-6 right-6 z-10">
        <ThemeToggle />
      </div>
      
      {/* Back button */}
      <div className="absolute top-6 left-6 z-10">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate('/')}
        >
          <ChevronLeft size={24} />
        </Button>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full mx-auto text-center">
          <div className="bg-secondary/20 p-12 rounded-full w-32 h-32 mx-auto mb-8 flex items-center justify-center">
            <Phone size={48} className="text-primary" />
          </div>
          
          <h1 className="text-4xl font-serif mb-4">Call Sheldon</h1>
          
          <p className="text-muted-foreground mb-8">
            Connect with Sheldon's AI assistant for a personalized conversation experience.
          </p>
          
          <div className="space-y-4">
            <Button 
              className="w-full py-6 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Start Call
            </Button>
            
            <Button 
              variant="outline"
              className="w-full py-6" 
              onClick={() => navigate('/')}
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Caller;
