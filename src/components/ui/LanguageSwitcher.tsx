"use client";

import { useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, ChevronDown, Check } from "lucide-react";

const localeLabels: Record<string, string> = {
  system: "SYS",
  en: "EN",
  ml: "മല",
  ar: "عر",
};

const localeFullLabels: Record<string, string> = {
  system: "System Default",
  en: "English",
  ml: "മലയാളം",
  ar: "العربية",
};

export function LanguageSwitcher({ scrolled = false }: { scrolled?: boolean }) {
  const locale = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [isSystem, setIsSystem] = useState(false);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    
    // Check if a specific locale is set in cookies
    setIsSystem(!document.cookie.includes('NEXT_LOCALE='));
    
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

    if (newLocale === "system") {
      document.cookie = `NEXT_LOCALE=; path=/; max-age=0; SameSite=Lax`;
      window.location.href = cleanPath;
      return;
    }

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

  const activeLabel = isSystem ? "SYS" : (localeLabels[locale] || "EN");
  const activeKey = isSystem ? "system" : locale;

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
        <Globe className="w-3 h-3" strokeWidth={2} aria-hidden="true" />
        <span>{activeLabel}</span>
        <ChevronDown
          className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`}
          strokeWidth={2.25}
          aria-hidden="true"
        />
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
            {["system", "en", "ml", "ar"].map((loc) => (
              <button
                key={loc}
                onClick={() => switchLocale(loc)}
                className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-all ${
                  activeKey === loc
                    ? "bg-[var(--color-turquoise)]/10 text-[var(--color-turquoise)] font-semibold"
                    : "text-[var(--text-secondary)] hover:bg-[var(--surface-elevated)] hover:text-[var(--text-primary)]"
                }`}
              >
                <span className="text-xs font-bold w-7 text-left">{localeLabels[loc]}</span>
                <span>{localeFullLabels[loc]}</span>
                {activeKey === loc && (
                  <Check className="w-3.5 h-3.5 ml-auto text-[var(--color-turquoise)]" strokeWidth={2.5} aria-hidden="true" />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

