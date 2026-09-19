"use client";

import React from "react";
import { ChartWrapper } from "./ChartWrapper";
import { Server, Database, Shield, Radio, BellRing, RefreshCw } from "lucide-react";

const services = [
  {
    name: "Supabase Postgres DB",
    role: "Core Storage & Auth Schema",
    latency: "24ms",
    status: "Operational",
    icon: Database,
    color: "text-emerald-500",
  },
  {
    name: "Next.js Edge Runtime",
    role: "Vercel / Node Gateway",
    latency: "12ms",
    status: "Operational",
    icon: Server,
    color: "text-emerald-500",
  },
  {
    name: "Supabase Auth & GoTrue",
    role: "JWT & OAuth Verifications",
    latency: "38ms",
    status: "Operational",
    icon: Shield,
    color: "text-emerald-500",
  },
  {
    name: "Cloudflare CDN & Cache",
    role: "Global Edge Network",
    latency: "8ms",
    status: "Operational",
    icon: RefreshCw,
    color: "text-emerald-500",
  },
  {
    name: "Live Broadcast Transcoder",
    role: "1080p HLS Stream Cluster",
    latency: "45ms",
    status: "Active (On Air)",
    icon: Radio,
    color: "text-[var(--color-turquoise)]",
  },
  {
    name: "Notification & Email Service",
    role: "Resend / Twilio Webhooks",
    latency: "94ms",
    status: "Operational",
    icon: BellRing,
    color: "text-emerald-500",
  },
];

export function SystemHealthMonitor() {
  return (
    <ChartWrapper
      title="System Architecture & Cloud Microservices"
      description="Live ping latencies, operational readiness, and edge node health"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {services.map((srv) => {
          const Icon = srv.icon;
          return (
            <div
              key={srv.name}
              className="p-3.5 rounded-xl bg-[var(--admin-surface-alt)] border border-[var(--admin-border-subtle)] hover:border-[var(--admin-border)] transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[var(--admin-surface)] border border-[var(--admin-border-subtle)] text-[var(--color-navy)] dark:text-[var(--color-turquoise)]">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[var(--admin-text)] truncate max-w-[150px]">
                    {srv.name}
                  </div>
                  <div className="text-[10px] text-[var(--admin-text-muted)] truncate max-w-[150px]">
                    {srv.role}
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="flex items-center justify-end gap-1.5 text-xs font-semibold text-emerald-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {srv.latency}
                </div>
                <div className="text-[10px] text-[var(--admin-text-secondary)] font-medium">
                  {srv.status}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </ChartWrapper>
  );
}
