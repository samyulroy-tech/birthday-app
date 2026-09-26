"use client";

import { motion } from "framer-motion";

interface RevealWordsProps {
  text: string;
  className?: string;
  stagger?: number;
  delay?: number;
}

export function RevealWords({
  text,
  className = "",
  stagger = 0.12,
  delay = 0,
}: RevealWordsProps) {
  const words = text.trim().split(/\s+/);

  return (
    <span
      className={`inline-block ${className}`}
      aria-label={text}
    >
      {words.map((word, index) => (
        <motion.span
          key={`${word}-${index}`}
          initial={{
            opacity: 0,
            y: 22,
            filter: "blur(10px)",
          }}
          animate={{
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
          }}
          transition={{
            duration: 0.85,
            delay: delay + index * stagger,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="mr-[0.28em] inline-block will-change-transform"
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}