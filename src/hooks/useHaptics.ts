"use client";

import { useCallback, useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { haptic } from "@/lib/haptics";

/** Returns a stable callback that fires a haptic pulse (no-op where unsupported). */
export function useHapticTap(pattern: Parameters<typeof haptic>[0] = "tap") {
  return useCallback(() => haptic(pattern), [pattern]);
}

/**
 * Fires one short haptic "tick" the first time `active` becomes true —
 * the felt equivalent of a page turn as a new chapter of the site scrolls
 * into view. Fires at most once per mount, so re-crossing the same
 * boundary while scrolling up and down doesn't buzz repeatedly.
 */
export function useSectionEnterHaptic(active: boolean) {
  const fired = useRef(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (active && !fired.current && !reducedMotion) {
      fired.current = true;
      haptic("tick");
    }
  }, [active, reducedMotion]);
}
