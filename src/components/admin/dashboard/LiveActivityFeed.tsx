"use client";

import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, UserPlus, MessageSquare, Radio, RefreshCw } from "lucide-react";
import Link from "next/link";

interface RealtimeEvent {
  id: string;
  type: "registration" | "feedback" | "stream" | "status_change";
  message: string;
  detail: string;
  timestamp: string;
  color: string;
}

interface RecentReg {
  id: string;
  name: string;
  place: string;
  type: string;
  session_slug: string;
  created_at: string;
  status: string;
}

interface LiveActivityFeedProps {
  realtimeEvents: RealtimeEvent[];
  recentRegistrations: RecentReg[];
}

const iconMap = {
  registration: UserPlus,
  feedback: MessageSquare,
  stream: Radio,
  status_change: RefreshCw,
};

const colorMap: Record<string, string> = {
  emerald: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  purple: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  red: "bg-red-500/10 text-red-500 border-red-500/20",
  blue: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  amber: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  gray: "bg-gray-500/10 text-gray-400 border-gray-500/20",
};

function timeAgo(dateString: string) {
  const diff = Date.now() - new Date(dateString).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function LiveActivityFeed({
  realtimeEvents,
  recentRegistrations,
}: LiveActivityFeedProps) {
  // Merge realtime events + static recent registrations into a combined feed
  const feedItems = useMemo(() => {
    const items: (RealtimeEvent | { id: string; type: "registration"; message: string; detail: string; timestamp: string; color: string })[] = [
      ...realtimeEvents,
    ];

    // Fill in from recent registrations if we don't have enough realtime events
    if (items.length < 10) {
      const existingIds = new Set(realtimeEvents.map((e) => e.id));
      const backfillItems = recentRegistrations
        .filter((r) => !existingIds.has(r.id))
        .slice(0, 10 - items.length)
        .map((r) => ({
          id: r.id,
          type: "registration" as const,
          message: `Registration: ${r.name}`,
          detail: `${r.type} • ${r.place}`,
          timestamp: r.created_at,
          color: r.status === "confirmed" ? "emerald" : "amber",
        }));
      items.push(...backfillItems);
    }

    return items.slice(0, 10);
  }, [realtimeEvents, recentRegistrations]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="bg-[var(--admin-surface)] rounded-xl border border-[var(--admin-border)] shadow-sm overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--admin-border-subtle)]">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[var(--color-turquoise)]" strokeWidth={2} />
          <h3 className="text-sm font-bold text-[var(--admin-text)]">Live Activity</h3>
          {realtimeEvents.length > 0 && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-[10px] font-bold text-emerald-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {realtimeEvents.length} live
            </span>
          )}
        </div>
        <Link
          href="/admin/registrations"
          className="text-[10px] text-[var(--color-turquoise)] font-semibold uppercase tracking-wider hover:underline"
        >
          View All →
        </Link>
      </div>

      {/* Feed */}
      <div className="divide-y divide-[var(--admin-border-subtle)] max-h-[400px] overflow-y-auto">
        <AnimatePresence mode="popLayout" initial={false}>
          {feedItems.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="px-5 py-10 text-center text-sm text-[var(--admin-text-muted)]"
            >
              No activity yet. New events will appear here in real-time.
            </motion.div>
          ) : (
            feedItems.map((item) => {
              const Icon = iconMap[item.type] || UserPlus;
              const colors = colorMap[item.color] || colorMap.gray;

              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: -20, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: "auto" }}
                  exit={{ opacity: 0, x: 20, height: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-[var(--admin-hover)] transition-colors cursor-default"
                >
                  <div
                    className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border ${colors}`}
                  >
                    <Icon className="w-3.5 h-3.5" strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[var(--admin-text)] truncate">
                      {item.message}
                    </p>
                    <p className="text-[10px] text-[var(--admin-text-muted)] truncate">
                      {item.detail}
                    </p>
                  </div>
                  <span className="text-[10px] text-[var(--admin-text-muted)] whitespace-nowrap font-mono tabular-nums">
                    {timeAgo(item.timestamp)}
                  </span>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
