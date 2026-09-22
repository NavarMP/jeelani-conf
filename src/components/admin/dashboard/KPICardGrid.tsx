"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Banknote,
  Radio,
  Star,
  Clock,
  Layers,
} from "lucide-react";
import { useCountdown } from "@/hooks/useCountdown";
import type { DashboardOverviewData } from "@/lib/data";

// --- Animated Counter ---
function AnimatedNumber({ value, prefix = "", suffix = "", duration = 1.2 }: { value: number; prefix?: string; suffix?: string; duration?: number }) {
  const [display, setDisplay] = useState(0);
  const prevRef = useRef(0);

  useEffect(() => {
    const start = prevRef.current;
    const diff = value - start;
    if (diff === 0) return;

    const startTime = performance.now();
    const durationMs = duration * 1000;

    function animate(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + diff * eased);
      setDisplay(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        prevRef.current = value;
      }
    }

    requestAnimationFrame(animate);
  }, [value, duration]);

  return <>{prefix}{display.toLocaleString()}{suffix}</>;
}

// --- Countdown Digit ---
function CountdownDigit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="countdown-digit relative w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-lg bg-[var(--admin-surface-alt)] border border-[var(--admin-border)] shadow-sm">
        <span className="text-lg sm:text-xl font-bold font-mono text-[var(--admin-text)] tabular-nums">
          {String(value).padStart(2, "0")}
        </span>
      </div>
      <span className="text-[9px] uppercase tracking-wider text-[var(--admin-text-muted)] mt-1 font-semibold">
        {label}
      </span>
    </div>
  );
}

// --- Card Wrapper ---
function KPICard({
  children,
  delay = 0,
  className = "",
  flash = false,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  flash?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`dashboard-kpi-card relative overflow-hidden rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-[var(--color-turquoise)]/30 ${flash ? "dashboard-card-flash" : ""} ${className}`}
    >
      {children}
    </motion.div>
  );
}

// --- Main Component ---
interface KPICardGridProps {
  data: DashboardOverviewData;
  flashCards: Set<string>;
}

export default function KPICardGrid({ data, flashCards }: KPICardGridProps) {
  const countdown = useCountdown(data.eventDate);

  const openSessions = data.programBreakdown.filter((p) => p.isOpen).length;
  const totalSessions = data.programBreakdown.length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
      {/* 1. Total Registrations */}
      <KPICard delay={0.05} flash={flashCards.has("registrations")}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-[var(--admin-text-secondary)] uppercase tracking-wide">
            Registrations
          </h3>
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <Users className="w-4 h-4 text-emerald-500" strokeWidth={2} />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-[var(--admin-text)] tabular-nums">
          <AnimatedNumber value={data.stats.totalRegistrations} />
        </div>
        <div className="mt-2 flex items-center gap-2 text-[10px]">
          <span className="text-emerald-500 font-semibold">
            {data.stats.confirmedCount} verified
          </span>
          <span className="text-[var(--admin-text-muted)]">•</span>
          <span className="text-amber-500 font-semibold">
            {data.stats.pendingCount} pending
          </span>
        </div>
      </KPICard>

      {/* 2. Revenue */}
      <KPICard delay={0.1} flash={flashCards.has("revenue")}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-[var(--admin-text-secondary)] uppercase tracking-wide">
            Revenue
          </h3>
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <Banknote className="w-4 h-4 text-blue-500" strokeWidth={2} />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-[var(--color-navy)] dark:text-[var(--color-turquoise)] tabular-nums">
          <AnimatedNumber value={data.stats.totalRevenue} prefix="₹" />
        </div>
        <div className="mt-2">
          <div className="w-full h-1.5 bg-[var(--admin-surface-alt)] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full transition-all duration-700"
              style={{
                width: `${data.stats.totalRevenue > 0 ? Math.round((data.stats.confirmedRevenue / data.stats.totalRevenue) * 100) : 0}%`,
              }}
            />
          </div>
          <div className="flex justify-between mt-1 text-[10px] text-[var(--admin-text-muted)]">
            <span>₹{data.stats.confirmedRevenue.toLocaleString()} confirmed</span>
            <span>₹{data.stats.pendingRevenue.toLocaleString()} pending</span>
          </div>
        </div>
      </KPICard>

      {/* 3. Live Stream */}
      <KPICard
        delay={0.15}
        flash={flashCards.has("stream")}
        className={
          data.liveStreams.isAnyLive
            ? "border-red-500/40 shadow-[0_0_20px_rgba(239,68,68,0.1)]"
            : ""
        }
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-[var(--admin-text-secondary)] uppercase tracking-wide">
            Live Stream
          </h3>
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              data.liveStreams.isAnyLive ? "bg-red-500/10" : "bg-gray-500/10"
            }`}
          >
            <Radio
              className={`w-4 h-4 ${
                data.liveStreams.isAnyLive ? "text-red-500" : "text-gray-400"
              }`}
              strokeWidth={2}
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          {data.liveStreams.isAnyLive ? (
            <>
              <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xl font-bold text-red-500">ON AIR</span>
            </>
          ) : (
            <>
              <div className="w-2.5 h-2.5 rounded-full bg-[var(--admin-border)]" />
              <span className="text-xl font-bold text-[var(--admin-text-muted)]">
                OFFLINE
              </span>
            </>
          )}
        </div>
        <div className="mt-2 flex gap-2">
          {data.liveStreams.streams.map((s) => (
            <span
              key={s.stage}
              className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                s.is_live
                  ? "bg-red-500/10 text-red-500"
                  : "bg-[var(--admin-surface-alt)] text-[var(--admin-text-muted)]"
              }`}
            >
              {s.stage}
            </span>
          ))}
        </div>
      </KPICard>

      {/* 4. Feedback Score */}
      <KPICard delay={0.2} flash={flashCards.has("feedback")}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-[var(--admin-text-secondary)] uppercase tracking-wide">
            Feedback
          </h3>
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
            <Star className="w-4 h-4 text-amber-500" strokeWidth={2} />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold text-[var(--admin-text)] tabular-nums">
            {data.feedbackStats.avgRating > 0 ? data.feedbackStats.avgRating.toFixed(1) : "—"}
          </span>
          <span className="text-sm text-[var(--admin-text-muted)]">/ 5.0</span>
        </div>
        <div className="mt-2 flex items-center gap-2 text-[10px]">
          <span className="font-semibold text-[var(--admin-text-secondary)]">
            {data.feedbackStats.total} responses
          </span>
          {data.feedbackStats.unreadCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-purple-500/10 text-purple-500 font-bold text-[9px]">
              {data.feedbackStats.unreadCount} new
            </span>
          )}
        </div>
      </KPICard>

      {/* 5. Event Countdown */}
      <KPICard delay={0.25}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-[var(--admin-text-secondary)] uppercase tracking-wide">
            {countdown.isEventDay ? "Event Live" : countdown.isEventOver ? "Event Over" : "Countdown"}
          </h3>
          <div className="w-8 h-8 rounded-lg bg-[var(--color-turquoise)]/10 flex items-center justify-center">
            <Clock className="w-4 h-4 text-[var(--color-turquoise)]" strokeWidth={2} />
          </div>
        </div>
        {countdown.isEventDay ? (
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xl font-bold text-emerald-500">EVENT LIVE</span>
          </div>
        ) : countdown.isEventOver ? (
          <span className="text-lg font-bold text-[var(--admin-text-muted)]">Concluded</span>
        ) : (
          <div className="flex items-center gap-1.5 sm:gap-2">
            <CountdownDigit value={countdown.days} label="Days" />
            <span className="text-[var(--admin-text-muted)] font-bold text-lg mb-4">:</span>
            <CountdownDigit value={countdown.hours} label="Hrs" />
            <span className="text-[var(--admin-text-muted)] font-bold text-lg mb-4">:</span>
            <CountdownDigit value={countdown.minutes} label="Min" />
            <span className="text-[var(--admin-text-muted)] font-bold text-lg mb-4 hidden sm:block">:</span>
            <div className="hidden sm:block">
              <CountdownDigit value={countdown.seconds} label="Sec" />
            </div>
          </div>
        )}
      </KPICard>

      {/* 6. Sessions Status */}
      <KPICard delay={0.3}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-[var(--admin-text-secondary)] uppercase tracking-wide">
            Sessions
          </h3>
          <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
            <Layers className="w-4 h-4 text-violet-500" strokeWidth={2} />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-[var(--admin-text)] tabular-nums">
          {openSessions}<span className="text-base text-[var(--admin-text-muted)] font-normal">/{totalSessions}</span>
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          {data.programBreakdown.map((p) => (
            <span
              key={p.slug}
              className={`w-2 h-2 rounded-full ${
                p.isOpen ? "bg-emerald-500" : "bg-[var(--admin-border)]"
              }`}
              title={`${p.name}: ${p.isOpen ? "Open" : "Closed"}`}
            />
          ))}
        </div>
        <p className="text-[10px] text-[var(--admin-text-muted)] mt-1.5">
          {openSessions} open • {data.sessionCounts.speakers} speakers
        </p>
      </KPICard>
    </div>
  );
}
