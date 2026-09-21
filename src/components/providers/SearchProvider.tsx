"use client";

import { createContext, useContext, useMemo, useCallback, type ReactNode } from "react";

/* ── Shared types ──────────────────────────────────────────────────────── */

export interface SearchItem {
  id: string;
  type: "session" | "speaker" | "registration" | "gallery" | "page" | "info";
  title: string;
  subtitle?: string;
  description?: string;
  keywords?: string[];
  icon?: string;
  href: string;
  image?: string;
  metadata?: Record<string, string>;
}

export interface SearchResult {
  item: SearchItem;
  score: number;
}

export interface GroupedResults {
  type: SearchItem["type"];
  label: string;
  items: SearchResult[];
}

/* ── Raw data types matching what the layout passes in ─────────────────── */

export interface SearchDataPayload {
  sessions: any[];
  speakers: any[];
  registrationSessions: any[];
  galleryMedia: any[];
  siteSettings: any;
}

/* ── Context ──────────────────────────────────────────────────────────── */

interface SearchContextValue {
  /** All indexed items */
  items: SearchItem[];
  /** Fuzzy-search and return grouped results */
  search: (query: string, category?: string) => GroupedResults[];
}

const SearchContext = createContext<SearchContextValue | null>(null);

export function useSearch() {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error("useSearch must be used within <SearchProvider>");
  return ctx;
}

/* ── Build the unified search index from raw data ─────────────────────── */

function buildIndex(data: SearchDataPayload): SearchItem[] {
  const items: SearchItem[] = [];

  // ── Sessions ──
  (data.sessions || []).forEach((s: any) => {
    const speakerNames = (s.speakers || []).map((sp: any) => sp.name).join(", ");
    items.push({
      id: `session-${s.id}`,
      type: "session",
      title: s.title,
      subtitle: speakerNames || undefined,
      description: s.description,
      keywords: [
        s.type,
        s.stage,
        s.is_paid ? "paid" : "free",
        ...(s.speakers || []).map((sp: any) => sp.name),
        s.title_ml,
      ].filter(Boolean),
      icon: "CalendarDays",
      href: `/sessions/${s.slug}`,
      metadata: {
        stage: s.stage === "stage1" ? "Stage 1" : s.stage === "stage2" ? "Stage 2" : s.stage,
        type: s.type,
        ...(s.is_paid ? { paid: "Paid" } : {}),
      },
    });

    // Also index child programs
    (s.programs || []).forEach((p: any) => {
      const pSpeakers = (p.speakers || []).map((sp: any) => sp.name).join(", ");
      items.push({
        id: `session-${p.id}`,
        type: "session",
        title: p.title,
        subtitle: pSpeakers || undefined,
        description: p.description,
        keywords: [p.type, p.stage, p.title_ml].filter(Boolean),
        icon: "CalendarDays",
        href: `/sessions/${p.slug}`,
        metadata: {
          type: p.type,
        },
      });
    });
  });

  // ── Speakers ──
  (data.speakers || []).forEach((sp: any) => {
    items.push({
      id: `speaker-${sp.id}`,
      type: "speaker",
      title: sp.name,
      subtitle: sp.title,
      description: sp.bio || sp.description,
      keywords: [sp.name_ml, sp.title].filter(Boolean),
      icon: "User",
      href: `/speakers/${sp.slug}`,
      image: sp.image_url || undefined,
    });
  });

  // ── Registration Sessions ──
  (data.registrationSessions || []).forEach((rs: any) => {
    items.push({
      id: `reg-${rs.id}`,
      type: "registration",
      title: rs.title,
      subtitle: rs.description,
      description: rs.description_ml,
      keywords: [
        rs.slug,
        rs.price_label,
        rs.is_open ? "open" : "closed",
        rs.title_ml,
        "register",
        "registration",
      ].filter(Boolean),
      icon: "Ticket",
      href: rs.href_override || `/register/${rs.slug}`,
      metadata: {
        status: rs.is_open ? "Open" : "Closed",
        ...(rs.price_label ? { price: rs.price_label } : {}),
      },
    });
  });

  // ── Gallery ──
  (data.galleryMedia || []).forEach((g: any) => {
    const categoryName = g.category?.name || "Gallery";
    items.push({
      id: `gallery-${g.id}`,
      type: "gallery",
      title: g.title || g.caption || categoryName,
      subtitle: categoryName,
      keywords: [categoryName, "gallery", "photo", "image", "video"].filter(Boolean),
      icon: "Images",
      href: "/gallery",
      image: g.media_type === "image" ? g.url : undefined,
    });
  });

  // ── Static pages ──
  const staticPages: Omit<SearchItem, "id">[] = [
    {
      type: "page",
      title: "About the Conference",
      subtitle: "The Central Idea — What is Jeelani Conference?",
      description: "A commemorative, academic, and spiritual assembly honoring Shaykh Abd al-Qadir al-Jilani.",
      keywords: ["about", "history", "jeelani", "jilani", "baghdad", "malabar", "sufi", "conference"],
      icon: "Info",
      href: "/about",
    },
    {
      type: "page",
      title: "Conference Schedule",
      subtitle: "Full day program across two stages",
      keywords: ["schedule", "program", "timetable", "sessions", "stage"],
      icon: "CalendarDays",
      href: "/#schedule",
    },
    {
      type: "page",
      title: "Distinguished Guests & Speakers",
      subtitle: "Scholars, spiritual leaders, and academics",
      keywords: ["speakers", "guests", "scholars", "ulema"],
      icon: "Users",
      href: "/#speakers",
    },
    {
      type: "page",
      title: "Registration",
      subtitle: "Register for conference sessions",
      keywords: ["register", "registration", "sign up", "ticket", "book"],
      icon: "Ticket",
      href: "/#register",
    },
    {
      type: "page",
      title: "Gallery",
      subtitle: "Visual heritage — photos and videos",
      keywords: ["gallery", "photos", "images", "videos", "media"],
      icon: "Images",
      href: "/gallery",
    },
    {
      type: "page",
      title: "Location & Directions",
      subtitle: "Alathurpadi, Melmuri, Kerala",
      keywords: ["location", "venue", "directions", "map", "address"],
      icon: "MapPin",
      href: "/#location",
    },
    {
      type: "page",
      title: "Watch Live",
      subtitle: "Live stream of the conference",
      keywords: ["live", "stream", "youtube", "watch", "broadcast"],
      icon: "Tv",
      href: "/live",
    },
    {
      type: "page",
      title: "Share Feedback",
      subtitle: "Tell us about your experience",
      keywords: ["feedback", "review", "rating", "opinion"],
      icon: "MessageSquare",
      href: "/feedback",
    },
  ];

  staticPages.forEach((page, i) => {
    items.push({ ...page, id: `page-${i}` } as SearchItem);
  });

  // ── Quick info cards from site settings ──
  const settings = data.siteSettings || {};
  const infoCards: Omit<SearchItem, "id">[] = [
    {
      type: "info",
      title: "Event Date",
      subtitle: "Sunday, September 27, 2026",
      keywords: ["date", "when", "time", "day", "september"],
      icon: "Calendar",
      href: "/#countdown",
      metadata: { value: "Sep 27, 2026 · 10 AM – 10 PM" },
    },
    {
      type: "info",
      title: "Venue",
      subtitle: settings.venue || "Alathurpadi, Melmuri",
      keywords: ["venue", "where", "location", "place", "address", "alathurpadi", "melmuri"],
      icon: "MapPin",
      href: "/#location",
      metadata: { value: settings.venue || "Alathurpadi, Melmuri, Kerala" },
    },
    {
      type: "info",
      title: "Organizer",
      subtitle: settings.organizer || "Alathurpadi Students Association",
      keywords: ["organizer", "organized by", "who", "association", "students"],
      icon: "Building2",
      href: "/about",
      metadata: { value: settings.organizer || "Alathurpadi Students Association" },
    },
    {
      type: "info",
      title: "Get Directions",
      subtitle: "Open in Google Maps",
      keywords: ["directions", "map", "navigate", "google maps", "route"],
      icon: "Navigation",
      href: settings.locationMapUrl || "https://maps.app.goo.gl/nCJ4g6Rx9B9Sn3c99",
    },
  ];

  infoCards.forEach((card, i) => {
    items.push({ ...card, id: `info-${i}` } as SearchItem);
  });

  return items;
}

/* ── Fuzzy search scoring ─────────────────────────────────────────────── */

function scoreMatch(text: string, query: string): number {
  if (!text) return 0;
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();

  // Exact match
  if (lowerText === lowerQuery) return 100;
  // Starts with
  if (lowerText.startsWith(lowerQuery)) return 80;
  // Word boundary match
  const words = lowerText.split(/\s+/);
  if (words.some((w) => w.startsWith(lowerQuery))) return 60;
  // Contains
  if (lowerText.includes(lowerQuery)) return 40;

  return 0;
}

function scoreItem(item: SearchItem, tokens: string[]): number {
  let totalScore = 0;

  for (const token of tokens) {
    let bestTokenScore = 0;

    // Title gets highest weight
    bestTokenScore = Math.max(bestTokenScore, scoreMatch(item.title, token) * 3);
    // Subtitle
    if (item.subtitle) bestTokenScore = Math.max(bestTokenScore, scoreMatch(item.subtitle, token) * 2);
    // Description
    if (item.description) bestTokenScore = Math.max(bestTokenScore, scoreMatch(item.description, token) * 1);
    // Keywords
    if (item.keywords) {
      for (const kw of item.keywords) {
        bestTokenScore = Math.max(bestTokenScore, scoreMatch(kw, token) * 1.5);
      }
    }

    totalScore += bestTokenScore;
  }

  return totalScore;
}

/* ── Provider ─────────────────────────────────────────────────────────── */

const TYPE_LABELS: Record<SearchItem["type"], string> = {
  session: "Sessions",
  speaker: "Speakers",
  registration: "Registration",
  gallery: "Gallery",
  page: "Pages",
  info: "Quick Info",
};

const TYPE_ORDER: SearchItem["type"][] = ["page", "session", "speaker", "registration", "gallery", "info"];

export function SearchProvider({
  data,
  children,
}: {
  data: SearchDataPayload;
  children: ReactNode;
}) {
  const items = useMemo(() => buildIndex(data), [data]);

  const search = useCallback(
    (query: string, category?: string): GroupedResults[] => {
      const trimmed = query.trim();
      if (!trimmed) return [];

      const tokens = trimmed.toLowerCase().split(/\s+/).filter(Boolean);

      // Score all items
      let scored: SearchResult[] = items
        .map((item) => ({ item, score: scoreItem(item, tokens) }))
        .filter((r) => r.score > 0);

      // Filter by category if specified
      if (category && category !== "all") {
        scored = scored.filter((r) => r.item.type === category);
      }

      // Sort by score descending
      scored.sort((a, b) => b.score - a.score);

      // Group by type
      const groups: Map<SearchItem["type"], SearchResult[]> = new Map();
      for (const result of scored) {
        const existing = groups.get(result.item.type) || [];
        if (existing.length < 5) {
          existing.push(result);
          groups.set(result.item.type, existing);
        }
      }

      // Convert to array in type order
      const grouped: GroupedResults[] = [];
      for (const type of TYPE_ORDER) {
        const groupItems = groups.get(type);
        if (groupItems && groupItems.length > 0) {
          grouped.push({
            type,
            label: TYPE_LABELS[type],
            items: groupItems,
          });
        }
      }

      return grouped;
    },
    [items]
  );

  const value = useMemo(() => ({ items, search }), [items, search]);

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}
