"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { DashboardOverviewData } from "@/lib/data";

type ConnectionStatus = "connected" | "reconnecting" | "offline";

interface RealtimeEvent {
  id: string;
  type: "registration" | "feedback" | "stream" | "status_change";
  message: string;
  detail: string;
  timestamp: string;
  color: string;
}

interface DashboardRealtimeResult {
  data: DashboardOverviewData;
  connectionStatus: ConnectionStatus;
  realtimeEvents: RealtimeEvent[];
  lastUpdated: Date;
}

const FEE_MAP: Record<string, number> = {
  "burda-qawwali": 300,
  "astro-ai-fiqh": 50,
  "dars-management-meet": 0,
};

/**
 * useDashboardRealtime — Subscribes to Supabase Realtime channels
 * for dynamic_registrations, feedback, and live_streams tables.
 * Merges incoming events into the server-fetched initial data.
 */
export function useDashboardRealtime(
  initialData: DashboardOverviewData
): DashboardRealtimeResult {
  const [data, setData] = useState<DashboardOverviewData>(initialData);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("offline");
  const [realtimeEvents, setRealtimeEvents] = useState<RealtimeEvent[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const channelRef = useRef<ReturnType<
    ReturnType<typeof createClient>["channel"]
  > | null>(null);

  // Keep initial data ref updated for reconnect scenarios
  const dataRef = useRef(data);
  dataRef.current = data;

  const addEvent = useCallback(
    (event: Omit<RealtimeEvent, "id" | "timestamp">) => {
      const newEvent: RealtimeEvent = {
        ...event,
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
      };
      setRealtimeEvents((prev) => [newEvent, ...prev].slice(0, 20));
      setLastUpdated(new Date());
    },
    []
  );

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase.channel("dashboard-realtime", {
      config: { broadcast: { self: true } },
    });

    // --- Dynamic Registrations ---
    channel.on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "dynamic_registrations",
      },
      (payload) => {
        const row = payload.new as any;
        const fee = FEE_MAP[row.session_slug] || 0;

        setData((prev) => {
          const newReg = {
            id: row.id,
            name: row.name || "New Registration",
            place: row.place || "Online",
            type: row.session_slug || "Session",
            session_slug: row.session_slug,
            created_at: row.created_at || new Date().toISOString(),
            status: row.status || "pending",
          };

          // Update program breakdown
          const updatedBreakdown = prev.programBreakdown.map((p) =>
            p.slug === row.session_slug
              ? { ...p, count: p.count + 1, revenue: p.revenue + fee }
              : p
          );

          return {
            ...prev,
            stats: {
              ...prev.stats,
              totalRegistrations: prev.stats.totalRegistrations + 1,
              pendingCount:
                row.status === "confirmed"
                  ? prev.stats.pendingCount
                  : prev.stats.pendingCount + 1,
              confirmedCount:
                row.status === "confirmed"
                  ? prev.stats.confirmedCount + 1
                  : prev.stats.confirmedCount,
              totalRevenue: prev.stats.totalRevenue + fee,
              pendingRevenue:
                row.status === "confirmed"
                  ? prev.stats.pendingRevenue
                  : prev.stats.pendingRevenue + fee,
              confirmedRevenue:
                row.status === "confirmed"
                  ? prev.stats.confirmedRevenue + fee
                  : prev.stats.confirmedRevenue,
              receiptsUploaded: row.receipt_url
                ? prev.stats.receiptsUploaded + 1
                : prev.stats.receiptsUploaded,
            },
            recentRegistrations: [newReg, ...prev.recentRegistrations].slice(
              0,
              10
            ),
            programBreakdown: updatedBreakdown,
          };
        });

        addEvent({
          type: "registration",
          message: `New registration: ${row.name || "Unknown"}`,
          detail: `${row.session_slug || "session"} • ${row.place || "Online"}`,
          color: "emerald",
        });
      }
    );

    // Registration updates (status changes)
    channel.on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "dynamic_registrations",
      },
      (payload) => {
        const row = payload.new as any;
        const old = payload.old as any;

        if (old.status !== row.status) {
          const fee = FEE_MAP[row.session_slug] || 0;

          setData((prev) => {
            const newStats = { ...prev.stats };

            // Decrement old status
            if (old.status === "confirmed") {
              newStats.confirmedCount--;
              newStats.confirmedRevenue -= fee;
            } else if (old.status === "cancelled") {
              newStats.cancelledCount--;
            } else {
              newStats.pendingCount--;
              newStats.pendingRevenue -= fee;
            }

            // Increment new status
            if (row.status === "confirmed") {
              newStats.confirmedCount++;
              newStats.confirmedRevenue += fee;
            } else if (row.status === "cancelled") {
              newStats.cancelledCount++;
            } else {
              newStats.pendingCount++;
              newStats.pendingRevenue += fee;
            }

            // Update recent registrations status
            const updatedRecent = prev.recentRegistrations.map((r) =>
              r.id === row.id ? { ...r, status: row.status } : r
            );

            return { ...prev, stats: newStats, recentRegistrations: updatedRecent };
          });

          addEvent({
            type: "status_change",
            message: `Status changed: ${row.name || "Registration"}`,
            detail: `${old.status} → ${row.status}`,
            color: row.status === "confirmed" ? "blue" : "amber",
          });
        }
      }
    );

    // --- Feedback ---
    channel.on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "feedback",
      },
      (payload) => {
        const row = payload.new as any;

        setData((prev) => {
          const newTotal = prev.feedbackStats.total + 1;
          const newAvg =
            Math.round(
              ((prev.feedbackStats.avgRating * prev.feedbackStats.total +
                row.overall_rating) /
                newTotal) *
                10
            ) / 10;

          const newSentiment = { ...prev.feedbackStats.sentimentCounts };
          const sentiment = row.sentiment as keyof typeof newSentiment;
          if (sentiment in newSentiment) {
            newSentiment[sentiment]++;
          }

          return {
            ...prev,
            feedbackStats: {
              ...prev.feedbackStats,
              total: newTotal,
              avgRating: newAvg,
              unreadCount: prev.feedbackStats.unreadCount + 1,
              sentimentCounts: newSentiment,
            },
          };
        });

        addEvent({
          type: "feedback",
          message: `New feedback: ${row.overall_rating}★`,
          detail: `from ${row.name || "Anonymous"} — ${row.sentiment || "neutral"}`,
          color: "purple",
        });
      }
    );

    // --- Live Streams ---
    channel.on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "live_streams",
      },
      (payload) => {
        const row = payload.new as any;

        setData((prev) => {
          const updatedStreams = prev.liveStreams.streams.map((s) =>
            s.stage === row.stage
              ? { ...s, is_live: row.is_live, youtube_id: row.youtube_id, updated_at: row.updated_at }
              : s
          );

          return {
            ...prev,
            liveStreams: {
              isAnyLive: updatedStreams.some((s) => s.is_live),
              streams: updatedStreams,
            },
          };
        });

        addEvent({
          type: "stream",
          message: `${row.stage}: ${row.is_live ? "WENT LIVE" : "OFFLINE"}`,
          detail: row.is_live ? "Broadcasting now" : "Stream ended",
          color: row.is_live ? "red" : "gray",
        });
      }
    );

    // Subscribe
    channel
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setConnectionStatus("connected");
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          setConnectionStatus("reconnecting");
        } else if (status === "CLOSED") {
          setConnectionStatus("offline");
        }
      });

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, []); // Single subscription on mount

  // Sync initialData if it changes (e.g., after revalidation)
  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  return { data, connectionStatus, realtimeEvents, lastUpdated };
}
