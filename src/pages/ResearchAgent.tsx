
import React, { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ThemeToggle from '@/components/ThemeToggle';

const ResearchAgent = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/');
  };

  useEffect(() => {
    // Load Flowise chatbot script
    const script = document.createElement('script');
    script.type = 'module';
    script.innerHTML = `
      import Chatbot from "https://cdn.jsdelivr.net/npm/flowise-embed/dist/web.js"
      Chatbot.initFull({
        chatflowid: "8c306382-f882-4de0-bc87-f99a38d929ef",
        apiHost: "https://cloud.flowiseai.com",
      })
    `;
    document.body.appendChild(script);

    // Cleanup function to remove script when component unmounts
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <div className="flex justify-between items-center p-6">
        <Button 
          variant="ghost" 
          onClick={handleBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Button>
        <ThemeToggle />
      </div>

      {/* Main Content with Flowise Chatbot */}
      <div className="flex-1 relative">
        <flowise-fullchatbot></flowise-fullchatbot>
      </div>
    </div>
  );
};

export default ResearchAgent;
