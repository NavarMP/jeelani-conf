"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Search,
  X,
  ArrowRight,
  CalendarDays,
  User,
  Ticket,
  Images,
  MapPin,
  Tv,
  Info,
  Navigation,
  Building2,
  MessageSquare,
  Users,
  Calendar,
  Clock,
  CornerDownLeft,
} from "lucide-react";
import { useSearch, type SearchItem, type GroupedResults } from "@/components/providers/SearchProvider";
import { haptic } from "@/lib/haptics";

/* ── Icon resolver ───────────────────────────────────────────────────── */

const ICON_MAP: Record<string, React.ElementType> = {
  CalendarDays,
  User,
  Users,
  Ticket,
  Images,
  MapPin,
  Tv,
  Info,
  Navigation,
  Building2,
  MessageSquare,
  Calendar,
};

function getIcon(name?: string) {
  if (!name) return Search;
  return ICON_MAP[name] || Search;
}

/* ── Type colors ──────────────────────────────────────────────────────── */

const TYPE_COLORS: Record<SearchItem["type"], { bg: string; text: string; icon: string }> = {
  session: {
    bg: "bg-[var(--color-turquoise)]/10",
    text: "text-[var(--color-turquoise)]",
    icon: "text-[var(--color-turquoise)]",
  },
  speaker: {
    bg: "bg-[var(--color-navy)]/10 dark:bg-[var(--color-turquoise)]/10",
    text: "text-[var(--color-navy)] dark:text-[var(--color-turquoise)]",
    icon: "text-[var(--color-navy)] dark:text-[var(--color-turquoise)]",
  },
  registration: {
    bg: "bg-[var(--color-brass)]/10",
    text: "text-[var(--color-brass)]",
    icon: "text-[var(--color-brass)]",
  },
  gallery: {
    bg: "bg-[var(--color-rose)]/10",
    text: "text-[var(--color-rose)]",
    icon: "text-[var(--color-rose)]",
  },
  page: {
    bg: "bg-[var(--color-navy)]/10 dark:bg-[var(--color-ivory)]/10",
    text: "text-[var(--color-navy)] dark:text-[var(--color-ivory)]",
    icon: "text-[var(--color-navy)] dark:text-[var(--color-ivory)]",
  },
  info: {
    bg: "bg-[var(--color-brass)]/8",
    text: "text-[var(--color-brass)]",
    icon: "text-[var(--color-brass)]",
  },
};

/* ── Recent searches (localStorage) ───────────────────────────────────── */

const RECENT_KEY = "gjc-recent-searches";
const MAX_RECENT = 5;

function getRecentSearches(): string[] {
  try {
    const stored = localStorage.getItem(RECENT_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function addRecentSearch(query: string) {
  try {
    const recent = getRecentSearches().filter((q) => q !== query);
    recent.unshift(query);
    localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
  } catch {
    /* ignore */
  }
}

function clearRecentSearches() {
  try {
    localStorage.removeItem(RECENT_KEY);
  } catch {
    /* ignore */
  }
}

/* ── Quick actions (shown when input is empty) ────────────────────────── */

interface QuickAction {
  id: string;
  label: string;
  icon: React.ElementType;
  href: string;
  color: string;
}

/* ── Main Component ───────────────────────────────────────────────────── */

export function GlobalSearch({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { search } = useSearch();
  const router = useRouter();
  const t = useTranslations("Search");
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeIndex, setActiveIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const categories = useMemo(
    () => [
      { key: "all", label: t("categories.all") },
      { key: "session", label: t("categories.sessions") },
      { key: "speaker", label: t("categories.speakers") },
      { key: "registration", label: t("categories.registration") },
      { key: "gallery", label: t("categories.gallery") },
      { key: "info", label: t("categories.info") },
    ],
    [t]
  );

  const quickActions: QuickAction[] = useMemo(
    () => [
      { id: "qa-register", label: t("quickActionLabels.registerNow"), icon: Ticket, href: "/#register", color: "var(--color-brass)" },
      { id: "qa-schedule", label: t("quickActionLabels.viewSchedule"), icon: CalendarDays, href: "/#schedule", color: "var(--color-turquoise)" },
      { id: "qa-directions", label: t("quickActionLabels.getDirections"), icon: Navigation, href: "/#location", color: "var(--color-navy)" },
      { id: "qa-live", label: t("quickActionLabels.watchLive"), icon: Tv, href: "/live", color: "var(--color-rose)" },
    ],
    [t]
  );

  // Search results
  const results: GroupedResults[] = useMemo(() => {
    if (!query.trim()) return [];
    return search(query, activeCategory !== "all" ? activeCategory : undefined);
  }, [query, activeCategory, search]);

  // Flatten results for keyboard navigation
  const flatResults = useMemo(() => {
    const flat: { item: SearchItem; groupIndex: number; itemIndex: number }[] = [];
    results.forEach((group, gi) => {
      group.items.forEach((result, ii) => {
        flat.push({ item: result.item, groupIndex: gi, itemIndex: ii });
      });
    });
    return flat;
  }, [results]);

  // Load recent searches on open
  useEffect(() => {
    if (isOpen) {
      setRecentSearches(getRecentSearches());
      setQuery("");
      setActiveIndex(0);
      setActiveCategory("all");
      // Focus input after animation
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  }, [isOpen]);

  // Reset active index when results change
  useEffect(() => {
    setActiveIndex(0);
  }, [results]);

  // Scroll active item into view
  useEffect(() => {
    if (resultsRef.current && flatResults.length > 0) {
      const activeEl = resultsRef.current.querySelector(`[data-result-index="${activeIndex}"]`);
      activeEl?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [activeIndex, flatResults.length]);

  // Navigate to selected item
  const navigateTo = useCallback(
    (href: string, searchQuery?: string) => {
      haptic("select");
      if (searchQuery) addRecentSearch(searchQuery);
      onClose();

      // Handle external links
      if (href.startsWith("http")) {
        window.open(href, "_blank", "noopener,noreferrer");
        return;
      }

      // Handle hash links on current page
      if (href.startsWith("/#")) {
        const hash = href.substring(1);
        const el = document.querySelector(hash);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
          return;
        }
      }

      router.push(href);
    },
    [onClose, router]
  );

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const totalItems = query.trim() ? flatResults.length : quickActions.length;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setActiveIndex((prev) => (prev + 1) % Math.max(totalItems, 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setActiveIndex((prev) => (prev - 1 + Math.max(totalItems, 1)) % Math.max(totalItems, 1));
          break;
        case "Enter":
          e.preventDefault();
          if (query.trim() && flatResults[activeIndex]) {
            navigateTo(flatResults[activeIndex].item.href, query);
          } else if (!query.trim() && quickActions[activeIndex]) {
            navigateTo(quickActions[activeIndex].href);
          }
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
        case "Tab":
          e.preventDefault();
          // Cycle through categories
          const currentIdx = categories.findIndex((c) => c.key === activeCategory);
          const nextIdx = (currentIdx + (e.shiftKey ? -1 : 1) + categories.length) % categories.length;
          setActiveCategory(categories[nextIdx].key);
          break;
      }
    },
    [query, flatResults, quickActions, activeIndex, activeCategory, categories, navigateTo, onClose]
  );

  // Handle recent search click
  const handleRecentClick = useCallback(
    (q: string) => {
      haptic("tap");
      setQuery(q);
    },
    []
  );

  const handleClearRecent = useCallback(() => {
    haptic("tap");
    clearRecentSearches();
    setRecentSearches([]);
  }, []);

  const isEmpty = query.trim() && results.length === 0;
  const showQuickActions = !query.trim();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] md:pt-[15vh] px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 search-backdrop"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-2xl search-panel rounded-2xl overflow-hidden"
            initial={{ scale: 0.95, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.97, opacity: 0, y: -10 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            onKeyDown={handleKeyDown}
            role="dialog"
            aria-modal="true"
            aria-label="Search"
          >
            {/* ── Search Input ──────────────────────────────────────── */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--border)]">
              <Search className="w-5 h-5 text-[var(--color-turquoise)] shrink-0" strokeWidth={2} />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("placeholder")}
                className="search-input flex-1 min-w-0 text-[var(--text-primary)]"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
              />
              {query && (
                <button
                  onClick={() => {
                    setQuery("");
                    inputRef.current?.focus();
                    haptic("tap");
                  }}
                  className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center hover:bg-[var(--border)] transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                </button>
              )}
              <button
                onClick={onClose}
                className="shrink-0 search-kbd hidden md:flex"
                aria-label={t("close")}
              >
                ESC
              </button>
            </div>

            {/* ── Category Filter Pills ─────────────────────────────── */}
            <div className="flex items-center gap-2 px-5 py-2.5 border-b border-[var(--border)] overflow-x-auto no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat.key}
                  className="search-category-pill"
                  data-active={activeCategory === cat.key ? "true" : "false"}
                  onClick={() => {
                    haptic("tap");
                    setActiveCategory(cat.key);
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* ── Results / Quick Actions / Empty State ──────────────── */}
            <div
              ref={resultsRef}
              className="max-h-[50vh] md:max-h-[55vh] overflow-y-auto overscroll-contain"
            >
              {/* Recent searches */}
              {showQuickActions && recentSearches.length > 0 && (
                <div className="px-5 pt-4 pb-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-[0.15em]">
                      {t("recentSearches")}
                    </span>
                    <button
                      onClick={handleClearRecent}
                      className="text-[10px] font-medium text-[var(--text-muted)] hover:text-[var(--color-turquoise)] transition-colors"
                    >
                      {t("clearRecent")}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {recentSearches.map((q) => (
                      <button
                        key={q}
                        onClick={() => handleRecentClick(q)}
                        className="px-3 py-1 rounded-full text-xs font-medium border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--color-turquoise)] hover:text-[var(--color-turquoise)] transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick actions (when input is empty) */}
              {showQuickActions && (
                <div className="px-5 pt-3 pb-4">
                  <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-[0.15em] block mb-2">
                    {t("quickActions")}
                  </span>
                  <div className="space-y-0.5">
                    {quickActions.map((action, i) => (
                      <button
                        key={action.id}
                        onClick={() => navigateTo(action.href)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                          activeIndex === i
                            ? "search-result-active"
                            : "hover:bg-[var(--surface-elevated)]/60"
                        }`}
                        data-result-index={i}
                      >
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `color-mix(in srgb, ${action.color} 12%, transparent)` }}
                        >
                          <action.icon className="w-4 h-4" style={{ color: action.color }} strokeWidth={2} />
                        </div>
                        <span className="text-sm font-medium text-[var(--text-primary)]">{action.label}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[var(--text-muted)] ml-auto shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Search results */}
              {!showQuickActions && results.length > 0 && (
                <div className="py-2">
                  {results.map((group) => (
                    <div key={group.type} className="mb-1">
                      {/* Group header */}
                      <div className="px-5 py-1.5 flex items-center gap-2">
                        <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-[0.15em]">
                          ✦ {group.label}
                        </span>
                        <div className="flex-1 h-px bg-[var(--border)]" />
                      </div>

                      {/* Group items */}
                      <div className="px-2">
                        {group.items.map((result) => {
                          const globalIdx = flatResults.findIndex((f) => f.item.id === result.item.id);
                          const Icon = getIcon(result.item.icon);
                          const colors = TYPE_COLORS[result.item.type];

                          return (
                            <button
                              key={result.item.id}
                              onClick={() => navigateTo(result.item.href, query)}
                              data-result-index={globalIdx}
                              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all group/result ${
                                activeIndex === globalIdx
                                  ? "search-result-active"
                                  : "hover:bg-[var(--surface-elevated)]/60"
                              }`}
                            >
                              {/* Icon or image */}
                              {result.item.image ? (
                                <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 border border-[var(--border)]">
                                  <img
                                    src={result.item.image}
                                    alt=""
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                  />
                                </div>
                              ) : (
                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${colors.bg}`}>
                                  <Icon className={`w-4 h-4 ${colors.icon}`} strokeWidth={1.75} />
                                </div>
                              )}

                              {/* Text */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-[var(--text-primary)] truncate">
                                    {result.item.title}
                                  </span>
                                  {/* Metadata badges */}
                                  {result.item.metadata?.stage && (
                                    <span className={`search-type-badge ${colors.bg} ${colors.text}`}>
                                      {result.item.metadata.stage}
                                    </span>
                                  )}
                                  {result.item.metadata?.paid && (
                                    <span className="search-type-badge bg-[var(--color-rose)]/10 text-[var(--color-rose)]">
                                      {result.item.metadata.paid}
                                    </span>
                                  )}
                                  {result.item.metadata?.status && (
                                    <span
                                      className={`search-type-badge ${
                                        result.item.metadata.status === "Open"
                                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                          : "bg-red-500/10 text-red-600 dark:text-red-400"
                                      }`}
                                    >
                                      {result.item.metadata.status}
                                    </span>
                                  )}
                                </div>
                                {result.item.subtitle && (
                                  <p className="text-xs text-[var(--text-muted)] truncate mt-0.5">
                                    {result.item.subtitle}
                                  </p>
                                )}
                              </div>

                              {/* Enter hint */}
                              <CornerDownLeft
                                className={`w-3.5 h-3.5 text-[var(--text-muted)] shrink-0 transition-opacity ${
                                  activeIndex === globalIdx ? "opacity-100" : "opacity-0 group-hover/result:opacity-50"
                                }`}
                              />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Empty state */}
              {isEmpty && (
                <div className="px-5 py-12 text-center">
                  <div className="relative w-16 h-16 mx-auto mb-4">
                    <div
                      className="w-full h-full opacity-10"
                      style={{
                        backgroundImage: "url('/motifs/arabesque-tile-pattern.svg')",
                        backgroundSize: "contain",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center",
                      }}
                    />
                    <Search className="absolute inset-0 m-auto w-6 h-6 text-[var(--text-muted)]" />
                  </div>
                  <p className="text-sm font-medium text-[var(--text-secondary)] mb-1">
                    {t("noResults")}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {t("noResultsHint")}
                  </p>
                </div>
              )}
            </div>

            {/* ── Footer ─────────────────────────────────────────────── */}
            <div className="px-5 py-2.5 border-t border-[var(--border)] flex items-center justify-between text-[10px] text-[var(--text-muted)]">
              <div className="hidden md:flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="search-kbd">↑↓</kbd> navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="search-kbd">↵</kbd> select
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="search-kbd">Tab</kbd> category
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="search-kbd">Esc</kbd> {t("close").toLowerCase()}
                </span>
              </div>
              <span className="text-[var(--color-brass)] font-medium tracking-wide">✦ Jeelani Conference</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
