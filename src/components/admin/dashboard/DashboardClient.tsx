"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useDashboardRealtime } from "@/hooks/useDashboardRealtime";
import type { DashboardOverviewData } from "@/lib/data";
import KPICardGrid from "./KPICardGrid";
import LiveActivityFeed from "./LiveActivityFeed";
import MiniChartsRow from "./MiniChartsRow";
import QuickActionsPanel from "./QuickActionsPanel";
import RegistrationBreakdown from "./RegistrationBreakdown";

interface DashboardClientProps {
  initialData: DashboardOverviewData;
}

export default function DashboardClient({ initialData }: DashboardClientProps) {
  const { data, connectionStatus, realtimeEvents, lastUpdated } =
    useDashboardRealtime(initialData);

  // Track which KPI cards should flash on update
  const [flashCards, setFlashCards] = useState<Set<string>>(new Set());

  // Flash effect when realtime events arrive
  useEffect(() => {
    if (realtimeEvents.length === 0) return;
    const latest = realtimeEvents[0];
    if (!latest) return;

    const flashKey =
      latest.type === "registration" || latest.type === "status_change"
        ? "registrations"
        : latest.type === "feedback"
          ? "feedback"
          : latest.type === "stream"
            ? "stream"
            : "";

    if (flashKey) {
      setFlashCards((prev) => new Set(prev).add(flashKey));
      // Also flash revenue for registrations
      if (latest.type === "registration") {
        setFlashCards((prev) => new Set(prev).add("revenue"));
      }
      const timer = setTimeout(() => {
        setFlashCards((prev) => {
          const next = new Set(prev);
          next.delete(flashKey);
          next.delete("revenue");
          return next;
        });
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [realtimeEvents]);

  // Periodically force re-render for "X seconds ago" labels
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-[var(--admin-text)] tracking-tight">
            Dashboard Overview
          </h2>
          <p className="text-[var(--admin-text-secondary)] text-sm mt-0.5">
            Live metrics, registrations & event intelligence
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Connection indicator */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[var(--admin-border)] bg-[var(--admin-surface)] text-[10px] font-medium">
            <span
              className={`realtime-dot w-2 h-2 rounded-full ${
                connectionStatus === "connected"
                  ? "bg-emerald-500"
                  : connectionStatus === "reconnecting"
                    ? "bg-amber-500 animate-pulse"
                    : "bg-red-400"
              }`}
            />
            <span className="text-[var(--admin-text-secondary)]">
              {connectionStatus === "connected"
                ? "Realtime Active"
                : connectionStatus === "reconnecting"
                  ? "Reconnecting…"
                  : "Offline"}
            </span>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid (6 cards) */}
      <KPICardGrid data={data} flashCards={flashCards} />

      {/* Mini Charts Row */}
      <MiniChartsRow data={data} />

      {/* Two-column: Activity Feed + Right Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Activity Feed + Registration Breakdown */}
        <div className="lg:col-span-3 space-y-6">
          <LiveActivityFeed
            realtimeEvents={realtimeEvents}
            recentRegistrations={data.recentRegistrations}
          />
          <RegistrationBreakdown data={data} />
        </div>

        {/* Right: Quick Actions */}
        <div className="lg:col-span-2">
          <QuickActionsPanel
            data={data}
            connectionStatus={connectionStatus}
            lastUpdated={lastUpdated}
          />
        </div>
      </div>
    </div>
  );
}
