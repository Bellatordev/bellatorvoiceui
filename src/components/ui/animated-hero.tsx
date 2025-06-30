
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Info, Bot } from "lucide-react";
import { useNavigate } from "react-router-dom";

function AnimatedHero({ onScrollToLogin }: { onScrollToLogin: () => void }) {
  const navigate = useNavigate();
  const [titleNumber, setTitleNumber] = useState(0);
  const titles = useMemo(
    () => ["Bellator", "Intelligent", "Trusty", "Efficient", "Amazing"],
    []
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (titleNumber === titles.length - 1) {
        setTitleNumber(0);
      } else {
        setTitleNumber(titleNumber + 1);
      }
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);

  const handleAssistantClick = () => {
    navigate('/assistant');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative">
      <div className="max-w-3xl text-center">
        <h1 className="text-6xl md:text-7xl font-serif mb-8 text-primary leading-tight">
          Meet your Agentic AI
          <br />
          <span className="text-foreground">that is</span>
        </h1>
        
        {/* Animated words section */}
        <div className="h-20 md:h-24 mb-8 relative flex justify-center">
          <span className="relative flex w-full justify-center overflow-visible text-foreground text-6xl md:text-7xl font-serif">
            {titles.map((title, index) => (
              <motion.span
                key={index}
                className="absolute"
                initial={{ opacity: 0, y: "-100%" }}
                transition={{ type: "spring", stiffness: 50 }}
                animate={
                  titleNumber === index
                    ? {
                        y: 0,
                        opacity: 1,
                      }
                    : {
                        y: titleNumber > index ? -150 : 150,
                        opacity: 0,
                      }
                }
                style={{
                  background: 'linear-gradient(90deg, hsla(45, 100%, 60%, 1) 0%, hsla(45, 100%, 70%, 1) 100%)',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                  fontWeight: 'normal'
                }}
              >
                {title}
              </motion.span>
            ))}
          </span>
        </div>
        
        <p className="text-xl font-sans text-muted-foreground mb-12 max-w-2xl mx-auto">
          I'm here to help you with your tasks, answer your questions, and assist you
          in making your workflow more efficient. Just ask me anything, and I'll do
          my best to provide helpful and relevant information.
        </p>
      </div>
      
      {/* Information icon in bottom right */}
      <button 
        onClick={onScrollToLogin}
        className="fixed bottom-6 right-6 p-4 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg z-10"
        aria-label="Get started"
      >
        <Info size={24} />
      </button>

      {/* Small assistant icon below the info icon */}
      <button 
        onClick={handleAssistantClick}
        className="fixed bottom-6 right-20 p-2 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors shadow-md z-10"
        aria-label="Assistant"
      >
        <Bot size={16} />
      </button>
    </div>
  );
}

export { AnimatedHero };
