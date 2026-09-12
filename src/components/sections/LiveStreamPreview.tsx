"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { liveStreams } from "@/lib/data";

export function LiveStreamPreview() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <section id="live" className="relative py-20 md:py-28" ref={ref}>
      <div className="container-site">
        {/* Section header */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <span className="text-[var(--color-turquoise)] text-xs font-semibold tracking-[0.2em] uppercase">
            Witness from Anywhere
          </span>
          <h2
            className="text-3xl md:text-4xl font-bold mt-2 text-[var(--text-primary)]"
            style={{ fontFamily: "var(--font-bodoni-moda)" }}
          >
            Watch Live
          </h2>
          <p className="text-[var(--text-secondary)] mt-3 max-w-md mx-auto text-sm">
            Can&apos;t make it in person? Watch the conference live on YouTube.
          </p>
        </motion.div>

        {/* Live stream cards */}
        <div className="grid md:grid-cols-2 gap-5 max-w-3xl mx-auto">
          {([
            { stage: "Stage 1", key: "stage1" as const, description: "Main conference hall — Grand Assembly, keynotes, and mawlid" },
            { stage: "Stage 2", key: "stage2" as const, description: "Parallel sessions — Dars Management, academic talks, and paper presentations" },
          ]).map((item, i) => (
            <motion.div
              key={item.key}
              initial={{ y: 20, opacity: 0 }}
              animate={isInView ? { y: 0, opacity: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
            >
              <Link
                href="/live"
                className="group block rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden hover:border-[var(--color-turquoise)]/30 hover:shadow-lg transition-all"
              >
                {/* Video thumbnail area */}
                <div className="relative aspect-video bg-[var(--color-navy)] flex items-center justify-center overflow-hidden">
                  <div
                    className="absolute inset-0 opacity-10"
                    style={{
                      backgroundImage: "url('/motifs/arabesque-tile-pattern.svg')",
                      backgroundRepeat: "repeat",
                      backgroundSize: "80px 80px",
                    }}
                    aria-hidden="true"
                  />
                  {/* Play button */}
                  <div className="relative z-10 w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/20 transition-all group-hover:scale-110">
                    <svg viewBox="0 0 24 24" className="w-6 h-6 text-white ml-0.5" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                  {/* Live badge */}
                  {liveStreams[item.key].isLive && (
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-600 text-white text-xs font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      LIVE NOW
                    </div>
                  )}
                </div>
                {/* Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-[var(--text-primary)] text-sm">{item.stage}</h3>
                  <p className="text-xs text-[var(--text-muted)] mt-1">{item.description}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
