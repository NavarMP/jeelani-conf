"use client";

import React, { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { ChartWrapper } from "./ChartWrapper";
import { Clock, Activity } from "lucide-react";

interface AppPerformanceChartProps {
  timeframe: string;
}

const latencyData = [
  { time: "00:00", ttfb: 42, p95: 128, dbQuery: 18, errors: 0.02 },
  { time: "03:00", ttfb: 38, p95: 115, dbQuery: 15, errors: 0.01 },
  { time: "06:00", ttfb: 45, p95: 130, dbQuery: 22, errors: 0.03 },
  { time: "09:00", ttfb: 62, p95: 185, dbQuery: 34, errors: 0.08 },
  { time: "12:00", ttfb: 58, p95: 168, dbQuery: 29, errors: 0.05 },
  { time: "15:00", ttfb: 68, p95: 195, dbQuery: 38, errors: 0.06 },
  { time: "18:00", ttfb: 52, p95: 155, dbQuery: 25, errors: 0.04 },
  { time: "21:00", ttfb: 46, p95: 140, dbQuery: 20, errors: 0.02 },
];

export function AppPerformanceChart({ timeframe }: AppPerformanceChartProps) {
  const [metricMode, setMetricMode] = useState<"latency" | "errors">("latency");

  return (
    <ChartWrapper
      title="App Performance & Latency Spectrum"
      description="Time-to-First-Byte (TTFB), P95 API response times, and Supabase database latency"
    >
      <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-[var(--admin-border-subtle)]">
        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => setMetricMode("latency")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              metricMode === "latency"
                ? "bg-[var(--color-navy)] text-white shadow-xs"
                : "bg-[var(--admin-surface-alt)] text-[var(--admin-text-secondary)] hover:text-[var(--admin-text)]"
            }`}
          >
            Response Latency (ms)
          </button>
          <button
            type="button"
            onClick={() => setMetricMode("errors")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              metricMode === "errors"
                ? "bg-rose-600 text-white shadow-xs"
                : "bg-[var(--admin-surface-alt)] text-[var(--admin-text-secondary)] hover:text-[var(--admin-text)]"
            }`}
          >
            Error Spike Tracking (%)
          </button>
        </div>

        {/* Real-time status */}
        <div className="hidden sm:flex items-center gap-4 text-xs text-[var(--admin-text-secondary)]">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-emerald-500" />
            <span>Avg TTFB: <strong className="text-[var(--admin-text)]">49ms</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-[var(--color-turquoise)]" />
            <span>P95: <strong className="text-[var(--admin-text)]">152ms</strong></span>
          </div>
        </div>
      </div>

      <div className="w-full h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          {metricMode === "latency" ? (
            <AreaChart data={latencyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradP95" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#218EB6" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#218EB6" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="gradTtfb" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#103E79" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#103E79" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="gradDb" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FFC800" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#FFC800" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--admin-border)" opacity={0.6} />
              <XAxis dataKey="time" stroke="var(--admin-text-muted)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--admin-text-muted)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}ms`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--admin-surface)",
                  borderColor: "var(--admin-border)",
                  borderRadius: "10px",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                  color: "var(--admin-text)",
                  fontSize: "12px",
                }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
              <Area type="monotone" dataKey="p95" name="P95 Latency" stroke="#218EB6" strokeWidth={2.5} fillOpacity={1} fill="url(#gradP95)" />
              <Area type="monotone" dataKey="ttfb" name="TTFB (Edge)" stroke="#103E79" strokeWidth={2} fillOpacity={1} fill="url(#gradTtfb)" />
              <Area type="monotone" dataKey="dbQuery" name="Database Query" stroke="#FFC800" strokeWidth={2} fillOpacity={1} fill="url(#gradDb)" />
            </AreaChart>
          ) : (
            <AreaChart data={latencyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradErrors" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E11D48" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#E11D48" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--admin-border)" opacity={0.6} />
              <XAxis dataKey="time" stroke="var(--admin-text-muted)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--admin-text-muted)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--admin-surface)",
                  borderColor: "var(--admin-border)",
                  borderRadius: "10px",
                  color: "var(--admin-text)",
                  fontSize: "12px",
                }}
              />
              <Area type="monotone" dataKey="errors" name="Error Rate %" stroke="#E11D48" strokeWidth={2.5} fillOpacity={1} fill="url(#gradErrors)" />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Core Web Vitals row */}
      <div className="mt-4 pt-3 border-t border-[var(--admin-border-subtle)] grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        <div className="p-2 rounded-lg bg-[var(--admin-surface-alt)] border border-[var(--admin-border-subtle)]">
          <div className="text-[10px] uppercase font-bold text-[var(--admin-text-muted)]">LCP</div>
          <div className="text-sm font-bold text-emerald-500">0.82s</div>
          <div className="text-[9px] text-[var(--admin-text-secondary)]">Good (&lt;2.5s)</div>
        </div>
        <div className="p-2 rounded-lg bg-[var(--admin-surface-alt)] border border-[var(--admin-border-subtle)]">
          <div className="text-[10px] uppercase font-bold text-[var(--admin-text-muted)]">INP / FID</div>
          <div className="text-sm font-bold text-emerald-500">38ms</div>
          <div className="text-[9px] text-[var(--admin-text-secondary)]">Good (&lt;200ms)</div>
        </div>
        <div className="p-2 rounded-lg bg-[var(--admin-surface-alt)] border border-[var(--admin-border-subtle)]">
          <div className="text-[10px] uppercase font-bold text-[var(--admin-text-muted)]">CLS</div>
          <div className="text-sm font-bold text-emerald-500">0.012</div>
          <div className="text-[9px] text-[var(--admin-text-secondary)]">Good (&lt;0.1)</div>
        </div>
        <div className="p-2 rounded-lg bg-[var(--admin-surface-alt)] border border-[var(--admin-border-subtle)]">
          <div className="text-[10px] uppercase font-bold text-[var(--admin-text-muted)]">FCP</div>
          <div className="text-sm font-bold text-emerald-500">0.54s</div>
          <div className="text-[9px] text-[var(--admin-text-secondary)]">Good (&lt;1.8s)</div>
        </div>
      </div>
    </ChartWrapper>
  );
}
