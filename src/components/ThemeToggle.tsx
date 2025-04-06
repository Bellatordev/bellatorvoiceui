
import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark'); // Default to dark for this design

  useEffect(() => {
    // Check if user has a theme preference in localStorage
    const storedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    
    // Set theme based on stored preference, default to dark for this design
    if (storedTheme) {
      setTheme(storedTheme);
      document.documentElement.classList.toggle('dark', storedTheme === 'dark');
    } else {
      // Default to dark mode for this design
      setTheme('dark');
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    
    // Apply theme to the document element
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
    
    localStorage.setItem('theme', newTheme);
  };

  return (
    <button 
      onClick={toggleTheme} 
      className="p-3 rounded-full bg-[#2b2a3d] hover:bg-[#3a3952] text-gray-300 transition-colors duration-200 shadow-lg border border-gray-700/50 dark:bg-[#2b2a3d] light:bg-gray-200 light:text-gray-700 light:hover:bg-gray-300 light:border-gray-300/50"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? <Moon size={20} className="text-yellow-400" /> : <Sun size={20} className="text-yellow-400" />}
    </button>
  );
}
