"use client";

import React from "react";
import { motion } from "framer-motion";
import { Zap, HardDrive, Network, ShieldCheck, Activity, AlertCircle, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface AppStatCardsProps {
  timeframe: string;
}

export function AppStatCards({ timeframe }: AppStatCardsProps) {
  const stats = [
    {
      title: "P95 Latency",
      value: "142ms",
      subtext: "Target < 200ms",
      trend: { value: 12.8, isPositive: true, text: "faster than avg" },
      icon: Zap,
      accent: "text-amber-500",
      bgAccent: "bg-amber-500/10",
      status: "Optimal",
    },
    {
      title: "Cloud Storage",
      value: "384.2 GB",
      subtext: "of 500 GB (76.8%)",
      trend: { value: 4.2, isPositive: false, text: "growth this week" },
      icon: HardDrive,
      accent: "text-blue-500",
      bgAccent: "bg-blue-500/10",
      status: "Healthy",
    },
    {
      title: "Data Bandwidth",
      value: timeframe === "24h" ? "84.5 GB" : timeframe === "7d" ? "612 GB" : "2.41 TB",
      subtext: "98.2% Cache Hit Ratio",
      trend: { value: 18.5, isPositive: true, text: "handled via CDN" },
      icon: Network,
      accent: "text-emerald-500",
      bgAccent: "bg-emerald-500/10",
      status: "Edge Cached",
    },
    {
      title: "SSO Active Users",
      value: "14,890",
      subtext: "Across 4 Identity Providers",
      trend: { value: 24.1, isPositive: true, text: "vs previous cycle" },
      icon: ShieldCheck,
      accent: "text-purple-500",
      bgAccent: "bg-purple-500/10",
      status: "Protected",
    },
    {
      title: "Error Rate (HTTP 5xx)",
      value: "0.04%",
      subtext: "99.96% Clean Transmissions",
      trend: { value: 0.02, isPositive: true, text: "drop in anomalies" },
      icon: AlertCircle,
      accent: "text-emerald-500",
      bgAccent: "bg-emerald-500/10",
      status: "Stable",
    },
    {
      title: "System Availability",
      value: "99.99%",
      subtext: "42 days zero downtime",
      trend: { value: 0.01, isPositive: true, text: "SLA Tier-1" },
      icon: Activity,
      accent: "text-[var(--color-turquoise)]",
      bgAccent: "bg-[var(--color-turquoise)]/10",
      status: "Live 100%",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {stats.map((item, idx) => {
        const Icon = item.icon;
        return (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: idx * 0.05 }}
            className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-4 shadow-sm hover:border-[var(--admin-border-strong)] transition-all flex flex-col justify-between relative group"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-semibold text-[var(--admin-text-secondary)] uppercase tracking-wider truncate">
                  {item.title}
                </span>
                <div className={`p-1.5 rounded-lg ${item.bgAccent} ${item.accent}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold tracking-tight text-[var(--admin-text)]">
                  {item.value}
                </span>
              </div>
              <p className="text-[11px] text-[var(--admin-text-muted)] mt-0.5">
                {item.subtext}
              </p>
            </div>

            <div className="mt-3 pt-2.5 border-t border-[var(--admin-border-subtle)] flex items-center justify-between text-[11px]">
              <span className={`inline-flex items-center font-medium ${item.trend.isPositive ? "text-emerald-500" : "text-amber-500"}`}>
                {item.trend.isPositive ? (
                  <ArrowUpRight className="w-3 h-3 mr-0.5" />
                ) : (
                  <ArrowDownRight className="w-3 h-3 mr-0.5" />
                )}
                {item.trend.value}%
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[var(--admin-surface-alt)] border border-[var(--admin-border-subtle)] text-[var(--admin-text-secondary)] font-medium">
                {item.status}
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
