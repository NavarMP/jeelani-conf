"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    label: string;
    isPositive: boolean;
  };
  delay?: number;
  className?: string;
}

export function StatCard({ title, value, icon, trend, delay = 0, className }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className={cn(
        "relative overflow-hidden rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-6 shadow-sm transition-all hover:shadow-md",
        "before:absolute before:inset-0 before:-z-10 before:bg-gradient-to-br before:from-transparent before:to-white/5",
        "dark:before:to-white/5",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-[var(--admin-text-secondary)]">{title}</h3>
        {icon && <div className="text-[var(--color-turquoise)]">{icon}</div>}
      </div>
      
      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-3xl font-bold text-[var(--admin-text)]">{value}</span>
      </div>

      {trend && (
        <div className="mt-2 flex items-center gap-1.5 text-xs">
          <span
            className={cn(
              "flex items-center font-medium",
              trend.isPositive ? "text-emerald-500" : "text-rose-500"
            )}
          >
            {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
          </span>
          <span className="text-[var(--admin-text-muted)]">{trend.label}</span>
        </div>
      )}
      
      {/* Interactive hover glow */}
      <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-black/5 dark:ring-white/5 group-hover:ring-[var(--color-turquoise)]/20 transition-all duration-300" />
    </motion.div>
  );
}
