"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import type { DashboardOverviewData } from "@/lib/data";

interface RegistrationBreakdownProps {
  data: DashboardOverviewData;
}

const slugIconMap: Record<string, string> = {
  "burda-qawwali": "🎶",
  "astro-ai-fiqh": "🔭",
  "dars-management-meet": "📚",
};

export default function RegistrationBreakdown({
  data,
}: RegistrationBreakdownProps) {
  const totalRegs = data.stats.totalRegistrations;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="bg-[var(--admin-surface)] rounded-xl border border-[var(--admin-border)] shadow-sm overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--admin-border-subtle)]">
        <h3 className="text-sm font-bold text-[var(--admin-text)]">
          Program Breakdown
        </h3>
        <Link
          href="/admin/sessions"
          className="text-[10px] text-[var(--color-turquoise)] font-semibold uppercase tracking-wider hover:underline"
        >
          Sessions →
        </Link>
      </div>

      {/* Programs */}
      <div className="divide-y divide-[var(--admin-border-subtle)]">
        {data.programBreakdown.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-[var(--admin-text-muted)]">
            No registration sessions configured.
          </div>
        ) : (
          data.programBreakdown.map((program) => {
            const pct =
              totalRegs > 0
                ? Math.round((program.count / totalRegs) * 100)
                : 0;
            const icon = slugIconMap[program.slug] || "📋";

            return (
              <Link
                key={program.slug}
                href={`/admin/registrations?type=${program.slug}`}
                className="block px-5 py-4 hover:bg-[var(--admin-hover)] transition-colors group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{icon}</span>
                    <div>
                      <p className="text-xs font-semibold text-[var(--admin-text)] group-hover:text-[var(--color-turquoise)] transition-colors">
                        {program.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                            program.isOpen
                              ? "bg-emerald-500/10 text-emerald-500"
                              : "bg-red-500/10 text-red-400"
                          }`}
                        >
                          {program.isOpen ? "OPEN" : "CLOSED"}
                        </span>
                        {program.fee > 0 && (
                          <span className="text-[9px] text-[var(--admin-text-muted)]">
                            ₹{program.fee}/entry
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-[var(--admin-text)] tabular-nums">
                      {program.count}
                    </p>
                    {program.revenue > 0 && (
                      <p className="text-[10px] text-[var(--admin-text-muted)] font-mono tabular-nums">
                        ₹{program.revenue.toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-[var(--admin-surface-alt)] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: program.color }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[9px] text-[var(--admin-text-muted)]">
                    {pct}% of total
                  </span>
                  <span className="text-[9px] text-[var(--admin-text-muted)]">
                    {program.count} / {totalRegs}
                  </span>
                </div>
              </Link>
            );
          })
        )}
      </div>

      {/* Footer summary */}
      <div className="px-5 py-3 bg-[var(--admin-surface-alt)] border-t border-[var(--admin-border-subtle)] flex items-center justify-between text-[10px]">
        <span className="text-[var(--admin-text-muted)]">
          {data.stats.receiptsUploaded} receipts uploaded
        </span>
        <span className="font-bold text-[var(--admin-text)]">
          Total: ₹{data.stats.totalRevenue.toLocaleString()}
        </span>
      </div>
    </motion.div>
  );
}
