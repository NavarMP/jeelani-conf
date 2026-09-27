"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type LiveEventState = {
  stage: string;
  current_session_id: string | null;
  mode: "auto" | "manual";
  current_speaker_id: string | null;
  subtitle_text: string | null;
  document_url: string | null;
  updated_at: string;
};

export function useLiveEventState(stage: string) {
  const [liveState, setLiveState] = useState<LiveEventState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    // Initial fetch
    const fetchState = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("live_event_state")
        .select("*")
        .eq("stage", stage)
        .single();
        
      if (!error && data) {
        setLiveState(data as LiveEventState);
      }
      setIsLoading(false);
    };

    fetchState();

    // Subscribe to real-time changes
    const channel = supabase
      .channel(`live_event_state_${stage}_${Math.random().toString(36).substring(7)}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "live_event_state",
          filter: `stage=eq.${stage}`,
        },
        (payload) => {
          setLiveState(payload.new as LiveEventState);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [stage]);

  return { liveState, isLoading };
}
