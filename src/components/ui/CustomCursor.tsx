"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isHoveringPlay, setIsHoveringPlay] = useState(false);
  const [isHidden, setIsHidden] = useState(true); // Hidden until mouse moves

  useEffect(() => {
    // Only enable custom cursor on non-touch devices
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const onMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setIsHidden(false);
    };
    
    const onMouseLeave = () => setIsHidden(true);
    const onMouseEnter = () => setIsHidden(false);

    window.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mouseenter", onMouseEnter);

    // Add event listeners for hover states
    const addHoverListeners = () => {
      const interactiveElements = document.querySelectorAll(
        "a, button, input, select, textarea, [role='button'], [tabindex='0']"
      );
      
      const playElements = document.querySelectorAll("[data-cursor='play']");

      interactiveElements.forEach((el) => {
        el.addEventListener("mouseenter", () => setIsHovering(true));
        el.addEventListener("mouseleave", () => setIsHovering(false));
      });
      
      playElements.forEach((el) => {
        el.addEventListener("mouseenter", () => {
          setIsHovering(true);
          setIsHoveringPlay(true);
        });
        el.addEventListener("mouseleave", () => {
          setIsHoveringPlay(false);
        });
      });
    };

    addHoverListeners();

    // Re-run listener attachment if DOM changes
    const observer = new MutationObserver(addHoverListeners);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mouseenter", onMouseEnter);
      observer.disconnect();
    };
  }, []);

  if (isHidden) return null;

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 w-4 h-4 bg-[var(--color-turquoise)] rounded-full pointer-events-none z-[9999] mix-blend-difference"
        animate={{
          x: position.x - 8,
          y: position.y - 8,
          scale: isHovering ? 0 : 1,
          opacity: isHovering ? 0 : 1,
        }}
        transition={{
          type: "tween",
          ease: "backOut",
          duration: 0.15,
        }}
      />
      <motion.div
        className="fixed top-0 left-0 w-12 h-12 border border-[var(--color-turquoise)] rounded-full pointer-events-none z-[9998] flex items-center justify-center bg-[var(--color-turquoise)]/10 backdrop-blur-sm"
        animate={{
          x: position.x - 24,
          y: position.y - 24,
          scale: isHovering ? 1.5 : 1,
          opacity: isHovering ? 1 : 0.2,
        }}
        transition={{
          type: "spring",
          stiffness: 150,
          damping: 15,
          mass: 0.5,
        }}
      >
        {isHoveringPlay && (
          <svg className="w-4 h-4 text-[var(--color-turquoise)] translate-x-[1px]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </motion.div>
    </>
  );
}
