"use client";

import { useTheme } from "next-themes";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, Monitor, ChevronDown, Check } from "lucide-react";

const themeLabels: Record<string, string> = {
  light: "Light",
  dark: "Dark",
  system: "System Default",
};

export function ThemeSwitcher({ scrolled = false }: { scrolled?: boolean }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!mounted) return null;

  const currentTheme = theme || "system";
  const ThemeIcon = currentTheme === "dark" ? Moon : currentTheme === "light" ? Sun : Monitor;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`w-9 h-9 flex items-center justify-center rounded-full transition-all text-lg active:scale-90 border border-transparent ${
          scrolled
            ? "text-[var(--text-secondary)] hover:bg-[var(--border)]"
            : "text-white/70 hover:text-white hover:bg-white/10"
        }`}
        aria-label="Switch theme"
        aria-expanded={open}
      >
        <ThemeIcon className="w-[18px] h-[18px]" strokeWidth={1.75} aria-hidden="true" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full right-0 mt-2 min-w-[150px] rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-xl backdrop-blur-xl overflow-hidden z-50"
          >
            {["light", "dark", "system"].map((t) => {
              const Icon = t === "dark" ? Moon : t === "light" ? Sun : Monitor;
              return (
                <button
                  key={t}
                  onClick={() => {
                    setTheme(t);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-all ${
                    currentTheme === t
                      ? "bg-[var(--color-turquoise)]/10 text-[var(--color-turquoise)] font-semibold"
                      : "text-[var(--text-secondary)] hover:bg-[var(--surface-elevated)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  <Icon className="w-4 h-4" strokeWidth={1.75} />
                  <span>{themeLabels[t]}</span>
                  {currentTheme === t && (
                    <Check className="w-3.5 h-3.5 ml-auto text-[var(--color-turquoise)]" strokeWidth={2.5} aria-hidden="true" />
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
