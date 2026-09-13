"use client";

import { useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const localeLabels: Record<string, string> = {
  en: "EN",
  ml: "മല",
  ar: "عر",
};

const localeFullLabels: Record<string, string> = {
  en: "English",
  ml: "മലയാളം",
  ar: "العربية",
};

export function LanguageSwitcher({ scrolled = false }: { scrolled?: boolean }) {
  const locale = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const switchLocale = (newLocale: string) => {
    setOpen(false);

    // Remove any existing locale prefix from pathname
    const segments = pathname.split("/");
    const locales = ["en", "ml", "ar"];
    if (locales.includes(segments[1])) {
      segments.splice(1, 1);
    }
    const cleanPath = segments.join("/") || "/";

    // Routes that default to Malayalam
    const isMlDefaultRoute =
      cleanPath === "/schedule" ||
      cleanPath.startsWith("/schedule/") ||
      cleanPath === "/register/burda-qawwali" ||
      cleanPath.startsWith("/register/burda-qawwali/");

    const defaultLocale = isMlDefaultRoute ? "ml" : "en";

    // Target path calculation:
    // If switching to the page's default locale, use cleanPath without prefix.
    // Otherwise, prefix with /${newLocale}.
    const targetPath =
      newLocale === defaultLocale
        ? cleanPath
        : `/${newLocale}${cleanPath === "/" ? "" : cleanPath}`;

    // Set cookie so Next.js and next-intl register the preference
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;

    // Navigate cleanly
    window.location.href = targetPath;
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
          scrolled
            ? "text-[var(--text-secondary)] border-[var(--border)] hover:bg-[var(--border)] hover:border-[var(--color-turquoise)]/30"
            : "text-white/80 border-white/15 hover:bg-white/10 hover:text-white"
        }`}
        aria-label="Switch language"
        aria-expanded={open}
      >
        <span className="text-[10px]">🌐</span>
        <span>{localeLabels[locale] || "EN"}</span>
        <svg
          className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full right-0 mt-2 min-w-[140px] rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-xl backdrop-blur-xl overflow-hidden z-50"
          >
            {["en", "ml", "ar"].map((loc) => (
              <button
                key={loc}
                onClick={() => switchLocale(loc)}
                className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-all ${
                  locale === loc
                    ? "bg-[var(--color-turquoise)]/10 text-[var(--color-turquoise)] font-semibold"
                    : "text-[var(--text-secondary)] hover:bg-[var(--surface-elevated)] hover:text-[var(--text-primary)]"
                }`}
              >
                <span className="text-xs font-bold w-6">{localeLabels[loc]}</span>
                <span>{localeFullLabels[loc]}</span>
                {locale === loc && (
                  <svg className="w-3.5 h-3.5 ml-auto text-[var(--color-turquoise)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
