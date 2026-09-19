"use client";

import React from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartWrapper } from "./ChartWrapper";

interface RevenueChartProps {
  data: any[];
  className?: string;
}

export function RevenueChart({ data, className }: RevenueChartProps) {
  return (
    <ChartWrapper title="Revenue Flow" description="Daily ticket sales & transaction volume" className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0891b2" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#0891b2" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--admin-border)" />
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
            tickFormatter={(value) => `₹${value}`}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: "var(--admin-surface)", borderColor: "var(--admin-border)", borderRadius: "8px", color: "var(--admin-text)" }}
            itemStyle={{ color: "var(--color-turquoise)", fontWeight: "bold" }}
            formatter={(value: any) => [`₹${value}`, "Revenue"]}
          />
          <Area 
            type="monotone" 
            dataKey="revenue" 
            stroke="#0891b2" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorAmount)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}
