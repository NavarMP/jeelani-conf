"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ClipboardList,
  MessageSquare,
  Radio,
  CalendarRange,
  Images,
  Download,
  BarChart3,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import type { DashboardOverviewData } from "@/lib/data";

type ConnectionStatus = "connected" | "reconnecting" | "offline";

interface QuickActionsPanelProps {
  data: DashboardOverviewData;
  connectionStatus: ConnectionStatus;
  lastUpdated: Date;
}

interface QuickAction {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string | number;
  badgeColor?: string;
  accentClass?: string;
}

export default function QuickActionsPanel({
  data,
  connectionStatus,
  lastUpdated,
}: QuickActionsPanelProps) {
  const actions: QuickAction[] = [
    {
      label: "Manage Registrations",
      href: "/admin/registrations",
      icon: <ClipboardList className="w-4 h-4" strokeWidth={1.75} />,
      badge: data.stats.pendingCount > 0 ? data.stats.pendingCount : undefined,
      badgeColor: "bg-amber-500 text-white",
    },
    {
      label: "Review Feedback",
      href: "/admin/feedback",
      icon: <MessageSquare className="w-4 h-4" strokeWidth={1.75} />,
      badge: data.feedbackStats.unreadCount > 0 ? data.feedbackStats.unreadCount : undefined,
      badgeColor: "bg-purple-500 text-white",
    },
    {
      label: "Event Intelligence",
      href: "/admin/analytics",
      icon: <BarChart3 className="w-4 h-4" strokeWidth={1.75} />,
    },
    {
      label: "Live Stream Control",
      href: "/admin/live",
      icon: <Radio className="w-4 h-4" strokeWidth={1.75} />,
      badge: data.liveStreams.isAnyLive ? "LIVE" : undefined,
      badgeColor: "bg-red-500 text-white animate-pulse",
    },
    {
      label: "Schedule Builder",
      href: "/admin/schedule",
      icon: <CalendarRange className="w-4 h-4" strokeWidth={1.75} />,
      badge: data.sessionCounts.total > 0 ? data.sessionCounts.total : undefined,
      badgeColor: "bg-[var(--admin-badge-bg)] text-[var(--admin-text-secondary)]",
    },
    {
      label: "Gallery Manager",
      href: "/admin/gallery",
      icon: <Images className="w-4 h-4" strokeWidth={1.75} />,
    },
    {
      label: "Audit Trail",
      href: "/admin/audit",
      icon: <ShieldCheck className="w-4 h-4" strokeWidth={1.75} />,
    },
  ];

  const statusConfig = {
    connected: {
      dotClass: "bg-emerald-500",
      text: "Connected",
      textClass: "text-emerald-500",
    },
    reconnecting: {
      dotClass: "bg-amber-500 animate-pulse",
      text: "Reconnecting…",
      textClass: "text-amber-500",
    },
    offline: {
      dotClass: "bg-red-500",
      text: "Offline",
      textClass: "text-red-400",
    },
  };

  const status = statusConfig[connectionStatus];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="bg-[var(--color-navy)] rounded-xl border border-[var(--color-navy)] shadow-sm overflow-hidden relative"
    >
      {/* Decorative glow */}
      <div className="absolute -top-16 -right-16 w-40 h-40 bg-[var(--color-turquoise)] rounded-full opacity-15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-10 w-32 h-32 bg-[var(--color-brass)] rounded-full opacity-10 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="px-5 pt-5 pb-3 relative z-10">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <span className="text-[var(--color-brass)]">✦</span>
          Quick Actions
        </h3>
      </div>

      {/* Actions */}
      <div className="px-4 pb-3 space-y-1.5 relative z-10">
        {actions.map((action, i) => (
          <Link
            key={i}
            href={action.href}
            className="group flex items-center justify-between px-3 py-2.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.06] hover:border-white/[0.12] text-white text-xs font-medium transition-all duration-200"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-white/60 group-hover:text-[var(--color-turquoise)] transition-colors">
                {action.icon}
              </span>
              <span className="text-white/90 group-hover:text-white transition-colors">
                {action.label}
              </span>
              {action.badge !== undefined && (
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none ${action.badgeColor}`}
                >
                  {action.badge}
                </span>
              )}
            </div>
            <ArrowRight className="w-3 h-3 text-white/30 group-hover:text-white/70 group-hover:translate-x-0.5 transition-all duration-200" />
          </Link>
        ))}
      </div>

      {/* System Status */}
      <div className="mx-4 mb-4 mt-2 px-3 py-3 rounded-lg bg-white/[0.04] border border-white/[0.06] relative z-10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider">
            System Status
          </span>
          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${status.dotClass}`} />
            <span className={`text-[10px] font-semibold ${status.textClass}`}>
              {status.text}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between text-[10px] text-white/40">
          <span>Supabase Realtime</span>
          <span className="font-mono tabular-nums">
            {connectionStatus === "connected"
              ? `Synced ${Math.floor((Date.now() - lastUpdated.getTime()) / 1000)}s ago`
              : "Waiting..."}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
