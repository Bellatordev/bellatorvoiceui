
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MoveRight, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RainbowButton } from "@/components/ui/rainbow-button";

interface HeroProps {
  scrollHandler?: (e: React.MouseEvent) => void;
}

function Hero({ scrollHandler }: HeroProps) {
  const [titleNumber, setTitleNumber] = useState(0);
  const titles = useMemo(
    () => ["helpful", "intelligent", "responsive", "friendly", "smart", "efficient"],
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
    <div className="w-full">
      <div className="container mx-auto">
        <div className="flex gap-8 py-20 lg:py-40 items-center justify-center flex-col">
          <div className="flex gap-4 flex-col">
            <h1 className="text-5xl md:text-7xl max-w-2xl tracking-tighter text-center font-regular">
              <span className="text-yellows-accent dark:text-premium-accent">Meet your Agentic AI that is</span>
              <span className="relative flex w-full justify-center overflow-hidden text-center md:pb-4 md:pt-1">
                &nbsp;
                {titles.map((title, index) => (
                  <motion.span
                    key={index}
                    className="absolute font-semibold text-yellows-deep dark:text-premium-light"
                    initial={{ opacity: 0, y: "-100" }}
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

            <p className="text-lg md:text-xl leading-relaxed tracking-tight text-muted-foreground max-w-2xl text-center">
              I'm here to help you with your tasks, answer your questions, and assist you in making your workflow more efficient. 
              Just ask me anything, and I'll do my best to provide helpful and relevant information.
            </p>
          </div>
          <div className="flex flex-row gap-3">
            <Button size="lg" className="gap-4 agent-button-secondary" variant="outline">
              About Us <Info className="w-4 h-4" />
            </Button>
            <RainbowButton 
              className="gap-4 flex items-center justify-center"
              onClick={scrollHandler}
            >
              Get Started <MoveRight className="w-4 h-4" />
            </RainbowButton>
          </div>
        </div>
      </div>
    </div>
  );
}

export { Hero };
