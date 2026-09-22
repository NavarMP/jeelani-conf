"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import type { DashboardOverviewData } from "@/lib/data";

interface MiniChartsRowProps {
  data: DashboardOverviewData;
}

// Chart card wrapper
function ChartCard({
  title,
  subtitle,
  children,
  delay = 0,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className="bg-[var(--admin-surface)] rounded-xl border border-[var(--admin-border)] shadow-sm p-5 overflow-hidden"
    >
      <div className="mb-4">
        <h3 className="text-sm font-bold text-[var(--admin-text)]">{title}</h3>
        {subtitle && (
          <p className="text-[10px] text-[var(--admin-text-muted)] mt-0.5">
            {subtitle}
          </p>
        )}
      </div>
      {children}
    </motion.div>
  );
}

// Custom tooltip
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-lg px-3 py-2 shadow-lg text-xs">
      <p className="font-semibold text-[var(--admin-text)] mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-[var(--admin-text-secondary)]">
          <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: p.color }} />
          {p.name}: <span className="font-semibold text-[var(--admin-text)]">{p.value}</span>
        </p>
      ))}
    </div>
  );
}

export default function MiniChartsRow({ data }: MiniChartsRowProps) {
  // Prepare trend data (sorted by date)
  const trendData = data.dailyTrend.length > 0
    ? data.dailyTrend.slice(-7)
    : [
        { date: "No data", count: 0 },
      ];

  // Program distribution for donut chart
  const programData = data.programBreakdown
    .filter((p) => p.count > 0)
    .map((p) => ({
      name: p.name.length > 18 ? p.name.slice(0, 18) + "…" : p.name,
      fullName: p.name,
      value: p.count,
      color: p.color,
      fee: p.fee,
      revenue: p.revenue,
    }));

  // If no program data, show placeholder
  if (programData.length === 0) {
    programData.push({ name: "No registrations", fullName: "No registrations yet", value: 1, color: "#6b7280", fee: 0, revenue: 0 });
  }

  // Revenue breakdown for horizontal bar
  const revenueData = [
    {
      name: "Revenue",
      confirmed: data.stats.confirmedRevenue,
      pending: data.stats.pendingRevenue,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* 1. Registration Trend (Area Chart) */}
      <ChartCard title="Registration Trend" subtitle="Last 7 days" delay={0.3}>
        <div className="h-[160px] -ml-3">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-turquoise)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--color-turquoise)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: "var(--admin-text-muted)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "var(--admin-text-muted)" }}
                axisLine={false}
                tickLine={false}
                width={30}
              />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey="count"
                name="Registrations"
                stroke="var(--color-turquoise)"
                strokeWidth={2}
                fill="url(#trendGrad)"
                dot={{ fill: "var(--color-turquoise)", r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5, stroke: "var(--admin-surface)", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* 2. Program Distribution (Donut Chart) */}
      <ChartCard title="Program Breakdown" subtitle="By registration count" delay={0.35}>
        <div className="h-[160px] flex items-center">
          <div className="w-[120px] h-[120px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={programData}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={55}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {programData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-lg px-3 py-2 shadow-lg text-xs">
                        <p className="font-semibold text-[var(--admin-text)]">{d.fullName}</p>
                        <p className="text-[var(--admin-text-secondary)]">
                          {d.value} registrations • ₹{d.revenue.toLocaleString()}
                        </p>
                      </div>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 ml-4 space-y-2">
            {programData.map((p, i) => (
              <div key={i} className="flex items-center gap-2 text-[11px]">
                <span
                  className="w-2.5 h-2.5 rounded-sm shrink-0"
                  style={{ backgroundColor: p.color }}
                />
                <span className="text-[var(--admin-text-secondary)] truncate flex-1">
                  {p.name}
                </span>
                <span className="font-bold text-[var(--admin-text)] tabular-nums">
                  {p.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </ChartCard>

      {/* 3. Revenue Breakdown (Horizontal Stacked Bar) */}
      <ChartCard title="Revenue Split" subtitle="Confirmed vs Pending" delay={0.4}>
        <div className="space-y-4">
          <div className="h-[60px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} layout="vertical" barSize={24}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" hide />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="confirmed" name="Confirmed" stackId="a" fill="#10b981" radius={[6, 0, 0, 6]} />
                <Bar dataKey="pending" name="Pending" stackId="a" fill="#f59e0b" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-emerald-500" />
              <span className="text-[var(--admin-text-secondary)]">Confirmed</span>
              <span className="font-bold text-[var(--admin-text)]">
                ₹{data.stats.confirmedRevenue.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-amber-500" />
              <span className="text-[var(--admin-text-secondary)]">Pending</span>
              <span className="font-bold text-[var(--admin-text)]">
                ₹{data.stats.pendingRevenue.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Receipt rate */}
          <div className="pt-3 border-t border-[var(--admin-border-subtle)]">
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="text-[var(--admin-text-secondary)]">Receipt Upload Rate</span>
              <span className="font-bold text-[var(--admin-text)]">
                {data.stats.totalRegistrations > 0
                  ? Math.round(
                      (data.stats.receiptsUploaded /
                        data.stats.totalRegistrations) *
                        100
                    )
                  : 0}
                %
              </span>
            </div>
            <div className="w-full h-2 bg-[var(--admin-surface-alt)] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[var(--color-turquoise)] to-[var(--color-navy)] rounded-full transition-all duration-700"
                style={{
                  width: `${
                    data.stats.totalRegistrations > 0
                      ? Math.round(
                          (data.stats.receiptsUploaded /
                            data.stats.totalRegistrations) *
                            100
                        )
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
        </div>
      </ChartCard>
    </div>
  );
}
