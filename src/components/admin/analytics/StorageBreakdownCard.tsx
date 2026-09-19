"use client";

import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { ChartWrapper } from "./ChartWrapper";
import { Database, HardDrive, CheckCircle2, AlertTriangle } from "lucide-react";

// Adjusted data to represent Supabase Free Tier limitations (small scale)
const storageData = [
  { name: "Postgres Database", value: 342, color: "#FFC800", percent: "68%" }, // Approaching 500MB limit
  { name: "Media Assets (WebP)", value: 72, color: "#218EB6", percent: "14%" },
  { name: "Generated QR Badges", value: 24, color: "#BA6473", percent: "5%" },
  { name: "Edge Cache & Logs", value: 45, color: "#10B981", percent: "9%" },
];

export function StorageBreakdownCard() {
  // Free tier limits
  const dbUsedMB = 342;
  const dbMaxMB = 500;
  const dbUsagePercent = Math.round((dbUsedMB / dbMaxMB) * 100);

  const bucketUsedGB = 0.45;
  const bucketMaxGB = 1.0;
  const bucketUsagePercent = Math.round((bucketUsedGB / bucketMaxGB) * 100);

  return (
    <ChartWrapper
      title="Supabase Quota & Storage Tracking"
      description="Database and bucket limits based on Free Tier plan"
    >
      <div className="flex flex-col h-full gap-4">
        
        {/* Warning Alert if approaching limits */}
        {dbUsagePercent > 60 && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-500 text-xs font-medium">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <strong>Database Quota Warning:</strong> You have reached {dbUsagePercent}% of the 500 MB free tier limit. Consider upgrading to the Pro plan before the event date to prevent outages.
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row items-center gap-6 flex-1">
          {/* Donut Chart (Database focused) */}
          <div className="relative w-full md:w-1/2 h-[200px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={storageData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {storageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--admin-surface)",
                    borderColor: "var(--admin-border)",
                    borderRadius: "8px",
                    color: "var(--admin-text)",
                    fontSize: "12px",
                  }}
                  formatter={(value: any) => [`${value} MB`, "Size"]}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Central Counter */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-[var(--admin-text)]">{dbUsagePercent}%</span>
              <span className="text-[10px] text-[var(--admin-text-muted)] font-medium text-center">DB Quota<br/>Used</span>
            </div>
          </div>

          {/* Progress Bars & Legend */}
          <div className="w-full md:w-1/2 space-y-4">
            
            {/* DB Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[var(--admin-text)] flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-[#FFC800]" /> Postgres DB
                </span>
                <span className="text-[var(--admin-text-secondary)]">{dbUsedMB} MB / {dbMaxMB} MB</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[var(--admin-border)] overflow-hidden">
                <div
                  className={`h-full rounded-full ${dbUsagePercent > 75 ? 'bg-rose-500' : 'bg-[#FFC800]'}`}
                  style={{ width: `${dbUsagePercent}%` }}
                />
              </div>
            </div>

            {/* Storage Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[var(--admin-text)] flex items-center gap-1.5">
                  <HardDrive className="w-3.5 h-3.5 text-[#218EB6]" /> Buckets (Media)
                </span>
                <span className="text-[var(--admin-text-secondary)]">{bucketUsedGB} GB / {bucketMaxGB} GB</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[var(--admin-border)] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#218EB6]"
                  style={{ width: `${bucketUsagePercent}%` }}
                />
              </div>
            </div>

            {/* Micro Legend for other items */}
            <div className="space-y-1 pt-2 border-t border-[var(--admin-border-subtle)]">
              {storageData.filter(d => d.name !== "Postgres Database").map((item) => (
                <div key={item.name} className="flex items-center justify-between text-[11px] py-0.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-[var(--admin-text-secondary)] truncate max-w-[130px]">{item.name}</span>
                  </div>
                  <span className="font-semibold text-[var(--admin-text)]">{item.value} MB</span>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </ChartWrapper>
  );
}
