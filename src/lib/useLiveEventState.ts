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
  const [stageState, setStageState] = useState<LiveEventState | null>(null);
  const [globalState, setGlobalState] = useState<LiveEventState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    // Initial fetch
    const fetchState = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("live_event_state")
        .select("*")
        .in("stage", [stage, "global"]);
        
      if (!error && data) {
        const sState = data.find(d => d.stage === stage) || null;
        const gState = data.find(d => d.stage === "global") || null;
        setStageState(sState as LiveEventState);
        setGlobalState(gState as LiveEventState);
      }
      setIsLoading(false);
    };

    fetchState();

    // Subscribe to real-time changes
    const channel = supabase
      .channel(`live_event_state_${stage}_global_${Math.random().toString(36).substring(7)}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "live_event_state",
          filter: `stage=in.(${stage},global)`,
        },
        (payload) => {
          const newState = payload.new as LiveEventState;
          if (newState.stage === "global") {
            setGlobalState(newState);
          } else if (newState.stage === stage) {
            setStageState(newState);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [stage]);

  // Determine effective state: if global is active (manual and has a session), it overrides.
  const isGlobalActive = globalState?.mode === "manual" && !!globalState?.current_session_id;
  const effectiveState = isGlobalActive ? globalState : stageState;

  return { liveState: effectiveState, stageState, globalState, isGlobalActive, isLoading };
}

export function useAllLiveEventStates() {
  const [allStates, setAllStates] = useState<LiveEventState[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    const fetchAll = async () => {
      setIsLoading(true);
      const { data, error } = await supabase.from("live_event_state").select("*");
      if (!error && data) {
        setAllStates(data as LiveEventState[]);
      }
      setIsLoading(false);
    };

    fetchAll();

    const channel = supabase
      .channel(`live_event_state_all_${Math.random().toString(36).substring(7)}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "live_event_state",
        },
        (payload) => {
          const newState = payload.new as LiveEventState;
          setAllStates(prev => {
            const exists = prev.find(s => s.stage === newState.stage);
            if (exists) {
              return prev.map(s => s.stage === newState.stage ? newState : s);
            }
            return [...prev, newState];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { allStates, isLoading };
}
