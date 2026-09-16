"use client";

import { useRef, type PointerEvent, type ReactNode } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";
import { haptic } from "@/lib/haptics";
import { cn } from "@/lib/utils";

type HapticPattern = Parameters<typeof haptic>[0];

/**
 * Wraps any interactive element (link, button, card) to give it a felt
 * response on every device:
 *  - Fine pointers (mouse/trackpad): a subtle magnetic pull toward the
 *    cursor, released with a spring on leave.
 *  - Coarse pointers (touch): a short haptic pulse on press, no magnetism
 *    (there's no hover to pull toward).
 *  - Everyone: a quick press-scale so the tap itself reads as a real push.
 *
 * Purely presentational — it does not intercept clicks, so the wrapped
 * element keeps its own href/onClick/navigation behavior intact.
 */
export function Magnetic({
  children,
  className,
  strength = 0.3,
  pattern = "tap",
  as: Component = motion.div,
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
  pattern?: HapticPattern;
  as?: typeof motion.div | typeof motion.span;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 20, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 300, damping: 20, mass: 0.4 });

  function handlePointerMove(e: PointerEvent<HTMLDivElement>) {
    if (reducedMotion || e.pointerType !== "mouse") return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - (rect.left + rect.width / 2)) * strength * 0.35);
    y.set((e.clientY - (rect.top + rect.height / 2)) * strength * 0.35);
  }

  function reset() {
    x.set(0);
    y.set(0);
  }

  return (
    <Component
      ref={ref}
      className={cn("inline-block will-change-transform", className)}
      style={reducedMotion ? undefined : { x: springX, y: springY }}
      onPointerMove={handlePointerMove}
      onPointerLeave={reset}
      onPointerDown={() => haptic(pattern)}
      whileTap={{ scale: 0.94 }}
      transition={{ type: "spring", stiffness: 420, damping: 18 }}
    >
      {children}
    </Component>
  );
}
