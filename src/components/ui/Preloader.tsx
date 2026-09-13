"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Preloader() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would tie into Next.js router events or load states
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // 2 second preloader for demo

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-[var(--color-navy)] overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          {/* Subtle background pattern */}
          <div
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage: "url('/motifs/arabesque-tile-pattern.svg')",
              backgroundRepeat: "repeat",
              backgroundSize: "120px 120px",
            }}
          />

          <div className="relative z-10 flex flex-col items-center">
            {/* SVG Drawing Animation for the Dome */}
            <motion.div
              className="w-32 h-32 md:w-48 md:h-48 mb-8"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <svg viewBox="0 0 100 100" className="w-full h-full text-[var(--color-turquoise)]" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <motion.path
                  d="M50 10 C 20 40, 10 60, 10 90 L 90 90 C 90 60, 80 40, 50 10 Z"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                />
                <motion.circle
                  cx="50"
                  cy="10"
                  r="3"
                  className="fill-[var(--color-brass)] stroke-none"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1, duration: 0.5, type: "spring" }}
                />
              </svg>
            </motion.div>

            {/* Wordmark Fade In */}
            <motion.div
              className="overflow-hidden"
            >
              <motion.img
                src="/wordmark-en.svg"
                alt="Grand Jeelani Conference"
                className="w-48 md:w-64 invert brightness-200"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
              />
            </motion.div>
            
            <motion.div
              className="mt-6 h-1 w-32 bg-[var(--color-navy)] overflow-hidden rounded-full border border-white/10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <motion.div
                className="h-full bg-[var(--color-brass)] rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ delay: 0.8, duration: 1, ease: "easeInOut" }}
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
