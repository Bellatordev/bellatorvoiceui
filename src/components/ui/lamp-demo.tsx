
"use client";

import React from "react";
import { motion } from "framer-motion";
import { LampContainer } from "@/components/ui/lamp";

export function LampDemo() {
  return (
    <LampContainer>
      <motion.h1 
        initial={{
          opacity: 0.5,
          y: 100
        }} 
        whileInView={{
          opacity: 1,
          y: 0
        }} 
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut"
        }} 
        className="mt-8 bg-gradient-to-br from-[#a8a0f0] to-[#9b87f5] py-4 bg-clip-text text-center tracking-tight text-transparent md:text-7xl text-5xl dark:from-[#a8a0f0] dark:to-[#9b87f5] light:from-amber-400 light:to-yellow-500"
      >
        <span className="font-serif font-extrabold">Bellator</span>
        <span className="text-yellow-400 font-serif font-extrabold dark:text-yellow-400 light:text-amber-600">.ai</span>
      </motion.h1>
    </LampContainer>
  );
}
