"use client";

import React from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { ChartWrapper } from "./ChartWrapper";

interface FeedbackSentimentPieProps {
  data: { name: string; value: number; color: string }[];
  className?: string;
}

export function FeedbackSentimentPie({ data, className }: FeedbackSentimentPieProps) {
  return (
    <ChartWrapper title="Feedback Sentiment" description="Distribution of overall sentiment" className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: "var(--admin-surface)", borderColor: "var(--admin-border)", borderRadius: "8px", color: "var(--admin-text)" }}
            formatter={(value: any) => [`${value}%`, "Share"]}
          />
          <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px', color: 'var(--admin-text)' }} />
        </PieChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}
