"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * useGlobalSearch — manages the ⌘K / Ctrl+K global search modal state.
 *
 * Registers a global keydown listener for the shortcut, toggles body scroll
 * lock, and provides open/close/toggle methods for the search overlay.
 */
export function useGlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => {
    setIsOpen(true);
    document.body.classList.add("search-open");
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    document.body.classList.remove("search-open");
  }, []);

  const toggle = useCallback(() => {
    setIsOpen((prev) => {
      const next = !prev;
      if (next) {
        document.body.classList.add("search-open");
      } else {
        document.body.classList.remove("search-open");
      }
      return next;
    });
  }, []);

  // ⌘K / Ctrl+K global shortcut
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // ⌘K (Mac) or Ctrl+K (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        toggle();
        return;
      }

      // Escape closes
      if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        close();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, toggle, close]);

  // Cleanup scroll lock on unmount
  useEffect(() => {
    return () => {
      document.body.classList.remove("search-open");
    };
  }, []);

  return { isOpen, open, close, toggle };
}
