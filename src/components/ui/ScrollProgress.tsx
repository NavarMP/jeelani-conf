"use client";

import { motion, useScroll, useSpring } from "framer-motion";

/**
 * A hairline thread that fills left-to-right as the person moves through
 * the page — the visual spine tying hero, story, schedule, and registration
 * into one continuous journey rather than a stack of separate screens.
 * Transform-only (scaleX), so it costs nothing on scroll.
 */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 210,
    damping: 32,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[2.5px] origin-left z-[70] pointer-events-none"
      style={{
        scaleX,
        background:
          "linear-gradient(90deg, var(--color-brass), var(--color-turquoise), var(--color-rose))",
      }}
      aria-hidden="true"
    />
  );
}
