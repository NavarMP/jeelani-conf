"use client";

import { motion } from "framer-motion";

export const ParticleBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <motion.div
        animate={{
          x: [0, 100, -50, 0],
          y: [0, -100, 50, 0],
          scale: [1, 1.2, 0.8, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute top-1/4 left-1/4 w-[40vw] h-[40vw] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen"
      />
      <motion.div
        animate={{
          x: [0, -120, 80, 0],
          y: [0, 80, -100, 0],
          scale: [1, 0.9, 1.3, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute top-1/3 right-1/4 w-[30vw] h-[30vw] bg-violet-600/20 rounded-full blur-[100px] mix-blend-screen"
      />
      <motion.div
        animate={{
          x: [0, 80, -120, 0],
          y: [0, 120, -80, 0],
          scale: [1, 1.4, 0.9, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute -bottom-20 left-1/3 w-[35vw] h-[35vw] bg-cyan-600/10 rounded-full blur-[120px] mix-blend-screen"
      />
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
    </div>
  );
};
