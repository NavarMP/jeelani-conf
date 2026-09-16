/**
 * Haptics — thin, safe wrapper around the Vibration API.
 *
 * Design constraints:
 * - Vibration only means anything on touch devices with the API; desktop
 *   pointer input never triggers it (feature + pointer-type gated).
 * - Respects prefers-reduced-motion — haptic "surprise" is a motion-adjacent
 *   effect, so reduced-motion users get none.
 * - Never throws: some browsers expose `vibrate` but reject calls from
 *   background tabs, cross-origin iframes, etc. Every call is wrapped.
 * - Patterns are short (<=40ms per pulse) so they read as a "tick" rather
 *   than a buzz, and cost is negligible either way.
 */

type HapticPattern = "tap" | "tick" | "select" | "success" | "warning";

const PATTERNS: Record<HapticPattern, number | number[]> = {
  tap: 8,
  tick: 6,
  select: [10, 30, 10],
  success: [12, 40, 12, 40, 18],
  warning: [20, 40, 20],
};

let reduced: boolean | null = null;
function prefersReducedMotion(): boolean {
  if (reduced !== null) return reduced;
  reduced =
    typeof window !== "undefined" &&
    "matchMedia" in window &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  return reduced;
}

let coarsePointer: boolean | null = null;
function isCoarsePointer(): boolean {
  if (coarsePointer !== null) return coarsePointer;
  coarsePointer =
    typeof window !== "undefined" &&
    "matchMedia" in window &&
    window.matchMedia("(pointer: coarse)").matches;
  return coarsePointer;
}

export function haptic(pattern: HapticPattern = "tap"): void {
  if (typeof window === "undefined") return;
  if (!isCoarsePointer()) return; // desktop mice/trackpads: no-op
  if (prefersReducedMotion()) return;
  try {
    if (typeof navigator === "undefined" || !("vibrate" in navigator)) return;
    navigator.vibrate(PATTERNS[pattern]);
  } catch {
    // Vibration can be denied silently (permissions, background tab) — ignore.
  }
}

export function canHaptic(): boolean {
  return (
    typeof navigator !== "undefined" &&
    "vibrate" in navigator &&
    isCoarsePointer() &&
    !prefersReducedMotion()
  );
}
