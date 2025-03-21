
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Info } from "lucide-react";
import { RainbowButton } from "@/components/ui/rainbow-button";

function AnimatedHero({ onScrollToLogin }: { onScrollToLogin: () => void }) {
  const [titleNumber, setTitleNumber] = useState(0);
  const titles = useMemo(
    () => ["smart", "intelligent", "friendly", "efficient"],
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
        <h1 className="text-7xl font-serif mb-8 text-[#a8a0f0] leading-tight">
          Meet your Agentic AI
          <br />
          <span className="text-white">that is</span>
          <br />
          <span className="relative flex w-full justify-center overflow-hidden text-white md:pb-4 md:pt-1">
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
        </h1>
        
        <p className="text-xl font-sans text-gray-400 mb-12 max-w-2xl mx-auto">
          I'm here to help you with your tasks, answer your questions, and assist you
          in making your workflow more efficient. Just ask me anything, and I'll do
          my best to provide helpful and relevant information.
        </p>
        
        <div className="flex gap-4 justify-center">
          <button 
            className="px-6 py-3 rounded-full bg-[#2b2a3d] text-white font-medium flex items-center gap-2 hover:bg-[#3a3952] transition-colors"
          >
            About Us <Info size={18} />
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
