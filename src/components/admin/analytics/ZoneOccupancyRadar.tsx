"use client";

import React from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts";
import { ChartWrapper } from "./ChartWrapper";

interface ZoneOccupancyRadarProps {
  data: any[];
}

export function ZoneOccupancyRadar({ data }: ZoneOccupancyRadarProps) {
  // Format data for Recharts Radar
  const radarData = data.map((z) => ({
    zone: z.name,
    capacity: z.capacity,
    occupancy: z.occupied, // was currentOccupancy
    fullness: Math.round((z.occupied / z.capacity) * 100),
  }));

  return (
    <ChartWrapper
      title="Live Zone Occupancy"
      description="Heatmap of crowd density across event venues"
    >
      <div className="w-full h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
            <PolarGrid stroke="var(--admin-border)" />
            <PolarAngleAxis dataKey="zone" tick={{ fill: "var(--admin-text-secondary)", fontSize: 11 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--admin-surface)",
                borderColor: "var(--admin-border)",
                borderRadius: "8px",
                color: "var(--admin-text)",
                fontSize: "12px",
              }}
              formatter={(value: any, name: any) => {
                if (name === "fullness") return [`${value}%`, "Density"];
                return [value, name];
              }}
            />
            <Radar
              name="Occupancy %"
              dataKey="fullness"
              stroke="#218EB6"
              fill="#218EB6"
              fillOpacity={0.5}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        {radarData.slice(0, 4).map((zone, idx) => (
          <div key={idx} className="flex justify-between items-center p-2 rounded-lg bg-[var(--admin-surface-alt)] border border-[var(--admin-border-subtle)]">
            <span className="text-[var(--admin-text-secondary)]">{zone.zone}</span>
            <span className={`font-bold ${zone.fullness > 85 ? 'text-red-500' : 'text-emerald-500'}`}>
              {zone.fullness}%
            </span>
          </div>
        ))}
      </div>
    </ChartWrapper>
  );
}
