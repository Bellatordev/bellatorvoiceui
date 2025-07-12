
import React from 'react';
import { ArrowLeft, Search, BookOpen, Database } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ThemeToggle from '@/components/ThemeToggle';

const ResearchAgent = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/');
  };

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

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="max-w-2xl text-center space-y-8">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="p-4 rounded-full bg-primary/10">
              <Search className="h-12 w-12 text-primary" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold">Research Agent</h1>
          
          {/* Description */}
          <p className="text-xl text-muted-foreground leading-relaxed">
            Your intelligent research companion. Upload documents, ask questions, 
            and get comprehensive insights powered by advanced AI analysis.
          </p>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
            <div className="flex items-start gap-4 p-6 rounded-lg border bg-card">
              <BookOpen className="h-6 w-6 text-primary mt-1" />
              <div>
                <h3 className="font-semibold mb-2">Document Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Upload PDFs, documents, and research papers for deep analysis and insights.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-6 rounded-lg border bg-card">
              <Database className="h-6 w-6 text-primary mt-1" />
              <div>
                <h3 className="font-semibold mb-2">Knowledge Search</h3>
                <p className="text-sm text-muted-foreground">
                  Ask questions and get answers based on your uploaded research materials.
                </p>
              </div>
            </div>
          </div>

          {/* Coming Soon Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 text-sm font-medium">
            Coming Soon
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResearchAgent;
