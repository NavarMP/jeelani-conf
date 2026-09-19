"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ChartWrapperProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function ChartWrapper({ title, description, children, className }: ChartWrapperProps) {
  return (
    <div className={cn("flex flex-col rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-6 shadow-sm", className)}>
      <div className="mb-4">
        <h3 className="text-lg font-bold text-[var(--admin-text)]">{title}</h3>
        {description && <p className="text-sm text-[var(--admin-text-secondary)] mt-1">{description}</p>}
      </div>
      <div className="flex-1 w-full relative min-h-[300px]">
        {children}
      </div>
    </div>
  );
}
