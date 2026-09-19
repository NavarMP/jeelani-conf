"use client";

import React from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Maximize, Minimize, ArrowUpRight } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";

/**
 * Admin-specific header bar with controls for theme toggle,
 * fullscreen, and "View Site" link. Does NOT include any public
 * website navigation — admin gets its own independent controls.
 */
export function AdminHeader({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await document.documentElement.requestFullscreen();
      }
    } catch (e) {
      console.warn("Fullscreen not supported", e);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="h-14 bg-[var(--admin-surface)] border-b border-[var(--admin-border)] flex items-center justify-between px-4 sm:px-6 shrink-0">
      {/* Left: Hamburger for mobile + Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-[var(--admin-text-secondary)] hover:bg-[var(--admin-hover)] hover:text-[var(--admin-text)] transition-colors"
          aria-label="Toggle sidebar"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M2 4.5H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M2 9H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M2 13.5H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
        <div>
          <h1 className="font-bold text-[var(--admin-text)] text-sm sm:text-base leading-tight">
            GJC Administration
          </h1>
          <p className="text-[10px] text-[var(--admin-text-muted)] hidden sm:block leading-tight">
            as-Sanad al-Muttaṣil — Control Center
          </p>
        </div>
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Event date badge */}
        <span className="hidden md:inline-flex items-center px-2.5 py-1 bg-[var(--admin-surface-alt)] rounded-lg text-[10px] font-mono font-semibold text-[var(--admin-text-secondary)] border border-[var(--admin-border)]">
          Sept 27, 2026
        </span>

        {/* Dark mode toggle */}
        {mounted && (
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-[var(--admin-text-secondary)] hover:bg-[var(--admin-hover)] hover:text-[var(--admin-text)] transition-colors"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4" strokeWidth={1.75} />
            ) : (
              <Moon className="w-4 h-4" strokeWidth={1.75} />
            )}
          </button>
        )}

        {/* Fullscreen toggle */}
        <button
          onClick={toggleFullscreen}
          className="hidden sm:flex p-2 rounded-lg text-[var(--admin-text-secondary)] hover:bg-[var(--admin-hover)] hover:text-[var(--admin-text)] transition-colors"
          aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        >
          {isFullscreen ? (
            <Minimize className="w-4 h-4" strokeWidth={1.75} />
          ) : (
            <Maximize className="w-4 h-4" strokeWidth={1.75} />
          )}
        </button>

        {/* View Site */}
        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg border border-[var(--admin-border)] text-[var(--admin-text-secondary)] hover:text-[var(--admin-text)] hover:bg-[var(--admin-hover)] transition-colors"
        >
          <span className="hidden sm:inline">View Site</span>
          <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={2} aria-hidden="true" />
        </Link>
      </div>
    </header>
  );
}
