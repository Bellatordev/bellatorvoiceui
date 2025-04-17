
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { RainbowButton } from "@/components/ui/rainbow-button";

function AnimatedHero({ onScrollToLogin }: { onScrollToLogin: () => void }) {
  const [titleNumber, setTitleNumber] = useState(0);
  const titles = useMemo(
    () => ["bellator", "intelligent", "efficient", "trusty"],
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
        
        <div className="flex gap-4 justify-center">
          <button 
            className="px-6 py-3 rounded-full bg-secondary text-secondary-foreground font-medium flex items-center gap-2 hover:bg-secondary/90 transition-colors"
          >
            About Us
          </button>
          
          <RainbowButton 
            onClick={onScrollToLogin}
            className="h-12 rounded-full font-medium flex items-center gap-2"
          >
            Get Started <ArrowRight size={18} />
          </RainbowButton>
        </div>
      </div>
    </div>
  );
}

export { AnimatedHero };
