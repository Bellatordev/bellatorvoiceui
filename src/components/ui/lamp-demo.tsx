
"use client";
import React from "react";
import { motion } from "framer-motion";
import { LampContainer } from "@/components/ui/lamp";
import { useIsMobile } from "@/hooks/use-mobile";

export function LampDemo() {
  const isMobile = useIsMobile();
  
  return (
    <LampContainer>
      <motion.h1
        initial={{ opacity: 0.5, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className={`mt-8 bg-gradient-to-br from-premium-light to-premium-accent py-4 bg-clip-text text-center text-4xl font-medium tracking-tight text-transparent md:text-7xl font-playfair ${!isMobile ? '-translate-y-36' : ''}`}
      >
        Bellator<span className="text-yellows-accent">.</span><span className="text-yellows-accent font-normal">ai</span>
      </motion.h1>
    </LampContainer>
  );
}
