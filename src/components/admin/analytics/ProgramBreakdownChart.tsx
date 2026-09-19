"use client";

import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from "recharts";
import { ChartWrapper } from "./ChartWrapper";

interface ProgramBreakdownChartProps {
  data: {
    slug: string;
    name: string;
    count: number;
    revenue: number;
    fee: number;
    color: string;
  }[];
  className?: string;
}

export function ProgramBreakdownChart({ data, className }: ProgramBreakdownChartProps) {
  return (
    <ChartWrapper
      title="Program Registrations & Revenue"
      description="Total registered attendees and generated income per program"
      className={className}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 20, left: -20, bottom: 20 }}
          layout="horizontal"
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--admin-border)" opacity={0.6} />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--admin-text)", fontSize: 11 }}
            interval={0}
            angle={-10}
            textAnchor="end"
            height={45}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--admin-text-muted)", fontSize: 12 }}
            allowDecimals={false}
          />
          <Tooltip
            cursor={{ fill: "var(--admin-surface-hover)", opacity: 0.4 }}
            contentStyle={{
              backgroundColor: "var(--admin-surface)",
              borderColor: "var(--admin-border)",
              borderRadius: "10px",
              color: "var(--admin-text)",
              boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
            }}
            formatter={(value: any, name: any, item: any) => {
              const payload = item?.payload;
              return [
                <div key="tooltip-content" className="space-y-1">
                  <div><span className="font-bold text-lg text-[var(--color-turquoise)]">{payload?.count}</span> Registrations</div>
                  <div className="text-xs text-[var(--admin-text-muted)]">Fee: {payload?.fee > 0 ? `₹${payload?.fee}` : "Free"}</div>
                  <div className="text-xs font-semibold text-emerald-500">Total: ₹{payload?.revenue?.toLocaleString()}</div>
                </div>,
                ""
              ];
            }}
          />
          <Bar
            dataKey="count"
            radius={[6, 6, 0, 0]}
            maxBarSize={55}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}
