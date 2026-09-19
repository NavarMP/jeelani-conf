"use client";

import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { ChartWrapper } from "./ChartWrapper";

interface RegistrationGrowthChartProps {
  data: {
    date: string;
    burda: number;
    astro: number;
    dars: number;
    totalRegs: number;
    revenue: number;
  }[];
  className?: string;
}

export function RegistrationGrowthChart({ data, className }: RegistrationGrowthChartProps) {
  return (
    <ChartWrapper
      title="Daily Registration Inflow"
      description="Live registration activity broken down by program over time"
      className={className}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
          <defs>
            <linearGradient id="colorAstro" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorBurda" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorDars" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--admin-border)" opacity={0.6} />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--admin-text-muted)", fontSize: 12 }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--admin-text-muted)", fontSize: 12 }}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--admin-surface)",
              borderColor: "var(--admin-border)",
              borderRadius: "8px",
              color: "var(--admin-text)",
            }}
          />
          <Legend
            verticalAlign="top"
            height={36}
            iconType="circle"
            wrapperStyle={{ fontSize: "12px", color: "var(--admin-text-secondary)" }}
          />
          <Area
            type="monotone"
            name="Astro & AI Fiqh"
            dataKey="astro"
            stackId="1"
            stroke="#8b5cf6"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorAstro)"
          />
          <Area
            type="monotone"
            name="Burda & Qawwali"
            dataKey="burda"
            stackId="1"
            stroke="#f59e0b"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorBurda)"
          />
          <Area
            type="monotone"
            name="Dars Management"
            dataKey="dars"
            stackId="1"
            stroke="#06b6d4"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorDars)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}
