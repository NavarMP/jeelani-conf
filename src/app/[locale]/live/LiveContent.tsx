"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LiveEventHero } from "@/components/sections/LiveEventHero";
import { Zap } from "lucide-react";

export function LiveContent({ liveStreams, sessions }: { liveStreams: any; sessions: any[] }) {
  const stageKeys = Object.keys(liveStreams).sort();
  const [activeStage, setActiveStage] = useState<string>(stageKeys[0] || "stage1");
  const stream = liveStreams[activeStage] || {};

  return (
    <div className="min-h-[100dvh] bg-[var(--color-black)] pt-20">
      <div className="container-site py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1
            className="text-3xl md:text-4xl font-bold text-[var(--color-ivory)]"
            style={{ fontFamily: "var(--font-bodoni-moda)" }}
          >
            Watch Live
          </h1>
          <p className="text-[var(--color-ivory)]/60 text-sm mt-2">
            From Baghdad to Malabar — streaming live on YouTube
          </p>
        </div>

        {/* Stage toggle */}
        <div className="flex items-center justify-center gap-2 mb-6 flex-wrap">
          {stageKeys.map((key) => (
            <button
              key={key}
              onClick={() => setActiveStage(key)}
              className={`relative px-6 py-2.5 rounded-full text-sm font-semibold transition-all capitalize ${
                activeStage === key
                  ? "bg-[var(--color-turquoise)] text-white shadow-lg"
                  : "bg-white/5 text-[var(--color-ivory)]/60 border border-white/10 hover:bg-white/10"
              }`}
            >
              {liveStreams[key]?.name || key.replace("stage", "Stage ")}
              {liveStreams[key]?.isLive && (
                <span className="ml-2 inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-[10px]">LIVE</span>
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Video embed */}
        <motion.div
          key={activeStage}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="max-w-4xl mx-auto mb-10"
        >
          <div className="relative aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-black">
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

        {/* Live Event Hero (Premium Now Playing Section) */}
        <div className="max-w-4xl mx-auto">
          <LiveEventHero sessions={sessions} stage={activeStage} />
        </div>
      </div>
    </div>
  );
}
