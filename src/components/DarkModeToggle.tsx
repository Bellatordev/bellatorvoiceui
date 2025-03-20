
import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from './ui/button';

interface DarkModeToggleProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const DarkModeToggle: React.FC<DarkModeToggleProps> = ({ 
  isDarkMode, 
  toggleDarkMode 
}) => {
  return (
    <Button
      onClick={toggleDarkMode}
      className="rounded-full"
      size="icon"
      variant="outline"
      aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDarkMode ? 
        <Sun className="h-4 w-4 text-yellow-400" /> : 
        <Moon className="h-4 w-4 text-slate-700" />
      }
    </Button>
  );
};

export default DarkModeToggle;
