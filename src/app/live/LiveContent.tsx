"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export function LiveContent({ liveStreams }: { liveStreams: any }) {
  const [activeStage, setActiveStage] = useState<"stage1" | "stage2">("stage1");
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
        <div className="flex items-center justify-center gap-2 mb-6">
          {(["stage1", "stage2"] as const).map((key) => (
            <button
              key={key}
              onClick={() => setActiveStage(key)}
              className={`relative px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
                activeStage === key
                  ? "bg-[var(--color-turquoise)] text-white shadow-lg"
                  : "bg-white/5 text-[var(--color-ivory)]/60 border border-white/10 hover:bg-white/10"
              }`}
            >
              {key === "stage1" ? "Stage 1" : "Stage 2"}
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
          className="max-w-4xl mx-auto"
        >
          <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black">
            {stream?.youtubeVideoId ? (
              <iframe
                src={`https://www.youtube.com/embed/${stream.youtubeVideoId}?rel=0&modestbranding=1`}
                title={`Live Stream - ${activeStage === "stage1" ? "Stage 1" : "Stage 2"}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-white/50">
                Stream not available yet
              </div>
            )}
          </div>
        </motion.div>

        {/* Stage descriptions */}
        <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto mt-8">
          <div className={`p-5 rounded-xl border transition-all ${
            activeStage === "stage1"
              ? "border-[var(--color-turquoise)]/30 bg-[var(--color-turquoise)]/5"
              : "border-white/5 bg-white/[0.02]"
          }`}>
            <h3 className="font-semibold text-[var(--color-ivory)] text-sm mb-1">Stage 1 — Main Hall</h3>
            <p className="text-xs text-[var(--color-ivory)]/50 leading-relaxed">
              Grand Assembly, Inaugural Ceremony, keynote sessions, Jilani Jalsa, and the closing conference.
            </p>
          </div>
          <div className={`p-5 rounded-xl border transition-all ${
            activeStage === "stage2"
              ? "border-[var(--color-turquoise)]/30 bg-[var(--color-turquoise)]/5"
              : "border-white/5 bg-white/[0.02]"
          }`}>
            <h3 className="font-semibold text-[var(--color-ivory)] text-sm mb-1">Stage 2 — Parallel Sessions</h3>
            <p className="text-xs text-[var(--color-ivory)]/50 leading-relaxed">
              Dars Management Meet, academic sessions, Musthafa Darimi course, and paper presentations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
