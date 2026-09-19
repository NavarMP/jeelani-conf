"use client";

import React from "react";
import { ChartWrapper } from "./ChartWrapper";
import { MapPin } from "lucide-react";

interface GeographicPlacesListProps {
  places: { place: string; count: number }[];
  totalRegistrations: number;
  className?: string;
}

export function GeographicPlacesList({ places, totalRegistrations, className }: GeographicPlacesListProps) {
  return (
    <ChartWrapper
      title="Regional Origin Distribution"
      description="Top locations of registered delegates and attendees"
      className={className}
    >
      <div className="space-y-3.5 pt-1">
        {places.length === 0 ? (
          <p className="text-sm text-[var(--admin-text-secondary)] py-8 text-center">No location data captured yet</p>
        ) : (
          places.map((item, idx) => {
            const percentage = totalRegistrations > 0 ? Math.round((item.count / totalRegistrations) * 100) : 0;
            return (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-[var(--admin-text)] flex items-center gap-1.5 truncate max-w-[220px]">
                    <MapPin className="w-3.5 h-3.5 text-[var(--color-turquoise)] shrink-0" />
                    <span className="truncate">{item.place}</span>
                  </span>
                  <span className="text-[var(--admin-text-secondary)] font-mono">
                    {item.count} ({percentage}%)
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-[var(--admin-surface-alt)] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[var(--color-turquoise)] to-[var(--color-navy)] transition-all duration-500"
                    style={{ width: `${Math.max(percentage, 8)}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </ChartWrapper>
  );
}
