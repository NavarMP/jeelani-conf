"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Schedule } from "@/components/sections/Schedule";
import { Zap } from "lucide-react";
import { useAllLiveEventStates } from "@/lib/useLiveEventState";

export function LiveContent({ liveStreams, sessions }: { liveStreams: any; sessions: any[] }) {
  const stageKeys = Object.keys(liveStreams).sort();
  const [activeStage, setActiveStage] = useState<string>(stageKeys[0] || "stage1");
  const stream = liveStreams[activeStage] || {};
  
  const { allStates } = useAllLiveEventStates();
  const globalState = allStates.find(s => s.stage === "global");
  const isGlobalActive = globalState?.mode === "manual" && !!globalState?.current_session_id;

  return (
    <div className="min-h-[100dvh] bg-background pt-20">
      <div className="container-site py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1
            className="text-3xl md:text-4xl font-bold text-foreground"
            style={{ fontFamily: "var(--font-bodoni-moda)" }}
          >
            Watch Live
          </h1>
          <p className="text-text-muted text-sm mt-2">
            From Baghdad to Malabar — streaming live on YouTube
          </p>
        </div>

        {/* Stage toggle */}
        <div className="flex items-center justify-center gap-2 mb-6 flex-wrap">
          {stageKeys.map((key) => {
            const isLive = liveStreams[key]?.isLive || isGlobalActive;
            return (
              <button
                key={key}
                onClick={() => setActiveStage(key)}
                className={`relative px-6 py-2.5 rounded-full text-sm font-semibold transition-all capitalize ${
                  activeStage === key
                    ? "bg-[var(--color-turquoise)] text-white shadow-lg"
                    : "bg-surface text-text-secondary border border-border hover:bg-surface-elevated"
                }`}
              >
                {liveStreams[key]?.name || key.replace("stage", "Stage ")}
                {isLive && (
                  <span className="ml-2 inline-flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[10px]">{isGlobalActive ? "GLOBAL" : "LIVE"}</span>
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Video embed */}
        <motion.div
          key={activeStage}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="max-w-4xl mx-auto mb-10"
        >
          <div className="relative aspect-video rounded-3xl overflow-hidden border border-border shadow-2xl bg-black">
            {stream?.youtubeVideoId ? (
              <iframe
                src={`https://www.youtube.com/embed/${stream.youtubeVideoId}?rel=0&modestbranding=1&autoplay=1`}
                title={`Live Stream - ${stream.name || activeStage.replace("stage", "Stage ")}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white/50">
                <Zap className="w-12 h-12 mb-4 text-white/20" />
                Stream not available yet
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Replaced LiveEventHero with inline Schedule representation */}
      <div className="-mt-20">
        <Schedule sessions={sessions} stages={stageKeys.map(k => ({ slug: k, name: liveStreams[k]?.name || k }))} />
      </div>
    </div>
  );
}
