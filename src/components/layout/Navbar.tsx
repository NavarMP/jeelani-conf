"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { ScrollProgress } from "@/components/ui/ScrollProgress";
import { haptic } from "@/lib/haptics";
import { Sun, Moon, SunMoon, Menu, X } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const t = useTranslations("Nav");

  const navLinks = [
    { href: "/#about", label: t("about") },
    { href: "/#schedule", label: t("schedule") },
    { href: "/#speakers", label: t("speakers") },
    { href: "/#gallery", label: t("gallery") },
    { href: "/live", label: t("live") },
    { href: "/#location", label: t("location") },
  ];

  // Pages that start with a dark hero background (homepage only)
  const hasDarkHero = pathname === "/" || /^\/(en|ml|ar)\/?$/.test(pathname);
  // Use scrolled/solid styling when scrolled OR when the page doesn't have a dark hero
  const solid = scrolled || !hasDarkHero;

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const ThemeIcon = !mounted ? SunMoon : theme === "dark" ? Sun : theme === "light" ? Moon : SunMoon;
  const nextTheme = theme === "dark" ? "light" : theme === "light" ? "system" : "dark";

  return (
    <>
      <ScrollProgress />
      <nav
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          solid
            ? "bg-[var(--surface)]/95 backdrop-blur-lg border-b border-[var(--border)] shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="container-site flex items-center justify-between h-16 md:h-18">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 relative">
              <Image src="/favicon.svg" alt="" width={32} height={32} priority />
            </div>
            <span
              className={`font-[var(--font-display)] text-lg font-bold hidden sm:inline transition-colors ${
                solid ? "text-[var(--color-navy)] dark:text-[var(--color-ivory)]" : "text-white"
              }`}
              style={{ fontFamily: "var(--font-bodoni-moda)" }}
            >
              {t("brandName")}
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => haptic("tap")}
                className={`text-sm font-medium transition-colors hover:text-[var(--color-turquoise)] ${
                  solid ? "text-[var(--text-secondary)]" : "text-white/80 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            {/* Language switcher */}
            <LanguageSwitcher scrolled={solid} />

            {/* Theme toggle */}
            <button
              onClick={() => {
                haptic("select");
                setTheme(nextTheme);
              }}
              className={`w-9 h-9 flex items-center justify-center rounded-full transition-all text-lg active:scale-90 ${
                solid
                  ? "text-[var(--text-secondary)] hover:bg-[var(--border)]"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
              style={{ transition: "transform var(--transition-fast), background-color var(--transition-fast)" }}
              aria-label={`Switch to ${nextTheme} theme`}
            >
              <ThemeIcon className="w-[18px] h-[18px]" strokeWidth={1.75} aria-hidden="true" />
            </button>

            {/* Register CTA */}
            <Link
              href="/#register"
              onClick={() => haptic("select")}
              className="hidden md:inline-flex items-center px-5 py-2 rounded-full text-sm font-semibold bg-[var(--color-brass)] text-[var(--color-black)] hover:bg-[var(--hover-brass)] transition-all hover:shadow-lg hover:shadow-[var(--color-brass)]/20 active:scale-95"
            >
              {t("register")}
            </Link>

            {/* Mobile hamburger — hidden on lg+, visible on smaller screens but nav handled by MobileDock */}
            <button
              onClick={() => {
                haptic("tap");
                setMenuOpen(!menuOpen);
              }}
              className={`lg:hidden w-9 h-9 flex items-center justify-center rounded-full transition-all ${
                solid
                  ? "text-[var(--text-primary)] hover:bg-[var(--border)]"
                  : "text-white hover:bg-white/10"
              }`}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <motion.path
                  d={menuOpen ? "M5 5L15 15" : "M3 6H17"}
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <motion.path
                  d={menuOpen ? "M5 15L15 5" : "M3 14H17"}
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                {!menuOpen && (
                  <path d="M3 10H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-[var(--color-navy)]/98 backdrop-blur-xl pt-20 px-6 lg:hidden"
          >
            <div className="flex flex-col gap-4">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => {
                      haptic("tap");
                      setMenuOpen(false);
                    }}
                    className="block text-2xl font-semibold text-white/90 hover:text-[var(--color-brass)] transition-colors py-2 active:translate-x-1"
                    style={{ fontFamily: "var(--font-bodoni-moda)", transition: "transform var(--transition-fast), color var(--transition-fast)" }}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: navLinks.length * 0.05 }}
                className="mt-4"
              >
                <Link
                  href="/#register"
                  onClick={() => {
                    haptic("success");
                    setMenuOpen(false);
                  }}
                  className="inline-flex items-center px-8 py-3 rounded-full text-base font-semibold bg-[var(--color-brass)] text-[var(--color-black)] hover:bg-[var(--hover-brass)] transition-all active:scale-95"
                >
                  {t("registerNow")}
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
