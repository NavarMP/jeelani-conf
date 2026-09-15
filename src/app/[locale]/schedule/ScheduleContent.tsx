"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { type Session, type Speaker } from "@/lib/data";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { formatSessionTime, getSessionRegistration } from "@/lib/sessionHelpers";

function FullSessionCard({ session, t }: { session: Session; t: (key: string) => string }) {
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

  const regInfo = getSessionRegistration(session);
  const startTimeFormatted = formatSessionTime(session.start_time);
  const endTimeFormatted = formatSessionTime(session.end_time);

  return (
    <motion.div
      initial={{ y: 15, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true }}
      className="group relative p-5 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--color-turquoise)]/40 hover:bg-[var(--surface-elevated)]/60 hover:shadow-md transition-all cursor-pointer"
    >
      {/* Whole card clickable link */}
      <Link
        href={`/sessions/${session.slug}`}
        className="absolute inset-0 z-10 rounded-xl"
        aria-label={`View details for ${session.title}`}
      />

      <div className="flex items-start gap-4">
        {/* Time column */}
        <div className="shrink-0 text-center pt-1 min-w-[75px]">
          <p className="text-base font-bold text-[var(--color-navy)] dark:text-[var(--color-turquoise)] leading-tight">
            {startTimeFormatted}
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-1 font-medium">
            {t("to")} {endTimeFormatted}
          </p>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-start gap-2 mb-2 flex-wrap">
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${typeColors[session.type] || ""}`}>
              {session.type.replace("_", " ")}
            </span>
            {session.is_paid && (
              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-[var(--color-brass)]/10 text-[var(--color-brass)] border border-[var(--color-brass)]/20">
                Paid
              </span>
            )}
          </div>

          <h3 className="text-base font-semibold text-[var(--text-primary)] leading-snug group-hover:text-[var(--color-turquoise)] transition-colors">
            {session.title}
          </h3>

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

          {/* Action row */}
          <div className="flex items-center justify-between gap-3 mt-4 pt-3 border-t border-[var(--border)]/50">
            <span className="inline-flex items-center text-xs font-medium text-[var(--color-turquoise)] group-hover:underline gap-1">
              View details →
            </span>

            {regInfo && (
              <Link
                href={regInfo.url}
                target={regInfo.isExternal ? "_blank" : undefined}
                rel={regInfo.isExternal ? "noopener noreferrer" : undefined}
                onClick={(e) => e.stopPropagation()}
                className="relative z-20 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[var(--color-turquoise)] text-white hover:bg-[var(--hover-turquoise)] shadow-sm hover:shadow transition-all"
              >
                <span>{regInfo.label}</span>
                <span className="text-[10px]">{regInfo.isExternal ? "↗" : "→"}</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function ScheduleContent({ sessions }: { sessions: Session[] }) {
  const [activeStage, setActiveStage] = useState<string>("stage1");
  const [searchQuery, setSearchQuery] = useState("");
  const t = useTranslations("SchedulePage");

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
            {t("heading")}
          </h1>
          <p className="text-[var(--text-secondary)] text-sm mt-2 max-w-lg mx-auto">
            {t("description")}
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
                {stage === "stage1" ? t("stage1") : t("stage2")}
              </button>
            ))}
          </div>
          <input
            type="search"
            placeholder={t("searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2.5 rounded-full border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-turquoise)]/40 w-full sm:w-60 placeholder:text-[var(--text-muted)]"
          />
        </div>

        {/* Sessions */}
        <div className="max-w-3xl mx-auto space-y-3">
          {filteredSessions.map((session) => (
            <FullSessionCard key={session.id} session={session} t={t} />
          ))}
          {filteredSessions.length === 0 && (
            <p className="text-center text-[var(--text-muted)] py-12 text-sm">{t("noResults")}</p>
          )}
        </div>
      </div>
    </div>
  );
}
