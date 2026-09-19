"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ChartWrapper } from "./ChartWrapper";
import { Globe2 } from "lucide-react";

const bandwidthData = [
  { day: "Mon", egress: 38, ingress: 12, apiCalls: 85 },
  { day: "Tue", egress: 42, ingress: 14, apiCalls: 98 },
  { day: "Wed", egress: 58, ingress: 19, apiCalls: 132 },
  { day: "Thu", egress: 64, ingress: 22, apiCalls: 148 },
  { day: "Fri", egress: 78, ingress: 26, apiCalls: 182 },
  { day: "Sat", egress: 92, ingress: 31, apiCalls: 215 },
  { day: "Sun", egress: 84, ingress: 28, apiCalls: 194 },
];

const topEndpoints = [
  { path: "/api/register/status", count: "128.4k", pct: "34%" },
  { path: "/api/live/hls-stream", count: "89.2k", pct: "24%" },
  { path: "/api/gallery/feed", count: "62.1k", pct: "16%" },
  { path: "/api/schedule/sync", count: "54.8k", pct: "14%" },
];

export function DataUsageBandwidthChart() {
  return (
    <ChartWrapper
      title="Network Data Usage & API Traffic"
      description="Daily bandwidth egress/ingress (GB) and API request volumes"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        {/* Chart Column */}
        <div className="lg:col-span-2 h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={bandwidthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--admin-border)" opacity={0.6} />
              <XAxis dataKey="day" stroke="var(--admin-text-muted)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--admin-text-muted)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}GB`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--admin-surface)",
                  borderColor: "var(--admin-border)",
                  borderRadius: "8px",
                  color: "var(--admin-text)",
                  fontSize: "12px",
                }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
              <Bar dataKey="egress" name="Egress (Out)" fill="#218EB6" stackId="a" radius={[0, 0, 4, 4]} />
              <Bar dataKey="ingress" name="Ingress (In)" fill="#103E79" stackId="a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Endpoints Side Column */}
        <div className="flex flex-col justify-between p-3.5 rounded-xl bg-[var(--admin-surface-alt)] border border-[var(--admin-border-subtle)]">
          <div>
            <div className="flex items-center gap-1.5 mb-3">
              <Globe2 className="w-3.5 h-3.5 text-[var(--color-turquoise)]" />
              <span className="text-xs font-bold text-[var(--admin-text)] uppercase tracking-wider">
                Top Consuming Endpoints
              </span>
            </div>

            <div className="space-y-2">
              {topEndpoints.map((ep) => (
                <div key={ep.path} className="flex items-center justify-between text-xs py-1 border-b border-[var(--admin-border-subtle)]">
                  <span className="font-mono text-[11px] text-[var(--admin-text-secondary)] truncate max-w-[130px]">
                    {ep.path}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[var(--admin-text)]">{ep.count}</span>
                    <span className="text-[10px] text-[var(--admin-text-muted)]">{ep.pct}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-[var(--admin-border-subtle)] flex items-center justify-between text-[11px] text-[var(--admin-text-secondary)]">
            <span>Global Edge Hit Rate:</span>
            <span className="font-bold text-emerald-500">98.4%</span>
          </div>
        </div>
      </div>
    </ChartWrapper>
  );
}
