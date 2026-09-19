"use client";

import React, { useState } from "react";
import { AppStatCards } from "@/components/admin/analytics/AppStatCards";
import { AppPerformanceChart } from "@/components/admin/analytics/AppPerformanceChart";
import { StorageBreakdownCard } from "@/components/admin/analytics/StorageBreakdownCard";
import { DataUsageBandwidthChart } from "@/components/admin/analytics/DataUsageBandwidthChart";
import { SSORankingCard } from "@/components/admin/analytics/SSORankingCard";
import { SystemHealthMonitor } from "@/components/admin/analytics/SystemHealthMonitor";
import { Download, RefreshCw, CheckCircle2 } from "lucide-react";

export default function TelemetryDashboard() {
  const [timeframe, setTimeframe] = useState<"24h" | "7d" | "30d" | "90d">("30d");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [exportNotice, setExportNotice] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  const handleExport = () => {
    setExportNotice(true);
    const data = {
      timestamp: new Date().toISOString(),
      timeframe,
      appMetrics: {
        p95Latency: "142ms",
        storageUsedMB: 342,
        bucketUsedGB: 0.45,
        bandwidthGB: timeframe === "30d" ? 2410 : 84.5,
        activeUsers: 14890,
        errorRate: "0.04%",
        uptime: "99.99%",
      },
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `system-telemetry-${timeframe}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => setExportNotice(false), 3000);
  };

  return (
    <div className="space-y-6 p-1 sm:p-2">
      {/* Top Header & Command Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[var(--admin-border-subtle)]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-[var(--admin-text)] tracking-tight">
              System Telemetry
            </h1>
            <div className="px-2.5 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Feed
            </div>
          </div>
          <p className="text-sm text-[var(--admin-text-secondary)] mt-1">
            Real-time app performance, Supabase Free Tier quotas, data usage, and SSO rankings.
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Timeframe pill selector */}
          <div className="flex items-center p-1 rounded-xl bg-[var(--admin-surface-alt)] border border-[var(--admin-border)]">
            {(["24h", "7d", "30d", "90d"] as const).map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => setTimeframe(tf)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  timeframe === tf
                    ? "bg-[var(--admin-surface)] text-[var(--admin-text)] shadow-xs font-semibold"
                    : "text-[var(--admin-text-secondary)] hover:text-[var(--admin-text)]"
                }`}
              >
                {tf.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Refresh button */}
          <button
            type="button"
            onClick={handleRefresh}
            className="p-2 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] text-[var(--admin-text-secondary)] hover:text-[var(--admin-text)] hover:bg-[var(--admin-surface-alt)] transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-[var(--color-turquoise)]" : ""}`} />
          </button>

          {/* Export Report button */}
          <button
            type="button"
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] text-[var(--admin-text)] text-xs font-medium hover:bg-[var(--admin-surface-alt)] transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-[var(--color-turquoise)]" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {exportNotice && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>System telemetry report downloaded successfully as JSON.</span>
        </div>
      )}

      {/* App Key Telemetry Metrics */}
      <AppStatCards timeframe={timeframe} />

      {/* Latency & Storage Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AppPerformanceChart timeframe={timeframe} />
        </div>
        <div>
          <StorageBreakdownCard />
        </div>
      </div>

      {/* Bandwidth & SSO Rankings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DataUsageBandwidthChart />
        <SSORankingCard />
      </div>

      {/* Microservices & Cloud Health */}
      <SystemHealthMonitor />
    </div>
  );
}
