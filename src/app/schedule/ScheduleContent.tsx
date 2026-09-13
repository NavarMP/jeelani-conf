"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { type Session, type Speaker } from "@/lib/data";
import Link from "next/link";

function FullSessionCard({ session }: { session: Session }) {
  const speakerList = session.speakers || [];
  const typeColors: Record<string, string> = {
    talk: "bg-[var(--color-turquoise)]/10 text-[var(--color-turquoise)] border-[var(--color-turquoise)]/20",
    ceremony: "bg-[var(--color-navy)]/10 text-[var(--color-navy)] border-[var(--color-navy)]/20",
    meal: "bg-[var(--color-rose)]/10 text-[var(--color-rose)] border-[var(--color-rose)]/20",
    mawlid: "bg-[var(--color-brass)]/10 text-[var(--color-brass)] border-[var(--color-brass)]/20",
    meeting: "bg-[var(--color-turquoise)]/10 text-[var(--color-turquoise)] border-[var(--color-turquoise)]/20",
    paid_session: "bg-[var(--color-rose)]/10 text-[var(--color-rose)] border-[var(--color-rose)]/20",
    paper_presentation: "bg-[var(--color-navy)]/10 text-[var(--color-navy)] border-[var(--color-navy)]/20",
    closing: "bg-[var(--color-black)]/10 text-[var(--color-black)] border-[var(--color-black)]/20",
  };

  return (
    <motion.div
      initial={{ y: 15, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true }}
      className="group p-5 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--color-turquoise)]/30 hover:shadow-md transition-all"
    >
      <div className="flex items-start gap-4">
        <div className="shrink-0 text-center pt-1 min-w-[70px]">
          <p className="text-base font-bold text-[var(--color-navy)] dark:text-[var(--color-turquoise)]">{session.start_time}</p>
          <p className="text-xs text-[var(--text-muted)]">to {session.end_time}</p>
        </div>
        <div className="flex-1">
          <div className="flex items-start gap-2 mb-2 flex-wrap">
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${typeColors[session.type] || ""}`}>
              {session.type.replace("_", " ")}
            </span>
          </div>

          <Link href={`/sessions/${session.slug}`} className="block group/link">
            <h3 className="text-base font-semibold text-[var(--text-primary)] leading-snug group-hover/link:text-[var(--color-turquoise)] transition-colors">
              {session.title}
            </h3>
          </Link>

          {session.title_ml && (
            <p className="text-xs text-[var(--text-muted)] mt-0.5" style={{ fontFamily: "var(--font-noto-sans-malayalam)" }}>
              {session.title_ml}
            </p>
          )}

          {speakerList.length > 0 && (
            <p className="text-xs text-[var(--text-secondary)] mt-2">
              🎤 {speakerList.map((s) => s.name).join(", ")}
            </p>
          )}

          <p className="text-xs text-[var(--text-muted)] mt-2 leading-relaxed">{session.description}</p>
        </div>
      </div>
    </motion.div>
  );
}

export function ScheduleContent({ sessions }: { sessions: Session[] }) {
  const [activeStage, setActiveStage] = useState<string>("stage1");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSessions = sessions
    .filter((s) => s.stage === activeStage)
    .filter((s) =>
      searchQuery === "" ||
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <div className="min-h-[100dvh] pt-24 pb-32">
      <div className="container-site">
        {/* Page header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]" style={{ fontFamily: "var(--font-bodoni-moda)" }}>
            Conference Schedule
          </h1>
          <p className="text-[var(--text-secondary)] text-sm mt-2 max-w-lg mx-auto">
            Sunday, September 27, 2026 — Two stages, one transformative day of knowledge, spirituality, and community.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
          <div className="flex items-center gap-2">
            {["stage1", "stage2"].map((stage) => (
              <button
                key={stage}
                onClick={() => setActiveStage(stage)}
                className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
                  activeStage === stage
                    ? "bg-[var(--color-navy)] text-white shadow-md"
                    : "bg-[var(--surface)] text-[var(--text-secondary)] border border-[var(--border)] hover:border-[var(--color-turquoise)]/30"
                }`}
              >
                {stage === "stage1" ? "Stage 1" : "Stage 2"}
              </button>
            ))}
          </div>
          <input
            type="search"
            placeholder="Search sessions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2.5 rounded-full border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-turquoise)]/40 w-full sm:w-60 placeholder:text-[var(--text-muted)]"
          />
        </div>

        {/* Sessions */}
        <div className="max-w-3xl mx-auto space-y-3">
          {filteredSessions.map((session) => (
            <FullSessionCard key={session.id} session={session} />
          ))}
          {filteredSessions.length === 0 && (
            <p className="text-center text-[var(--text-muted)] py-12 text-sm">No sessions found matching your search.</p>
          )}
        </div>
      </div>
    </div>
  );
}
