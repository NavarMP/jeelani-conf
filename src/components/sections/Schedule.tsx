"use client";

import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { type Session, type Speaker } from "@/lib/data";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { formatSessionTime, getSessionRegistration } from "@/lib/sessionHelpers";
import { haptic } from "@/lib/haptics";
import { useSectionEnterHaptic } from "@/hooks/useHaptics";
import { Magnetic } from "@/components/ui/Magnetic";
import { Mic } from "lucide-react";

function SessionCard({ session, index, t }: { session: Session; index: number; t: (key: string) => string }) {
  const speakerList = session.speakers || [];
  const typeColors: Record<string, string> = {
    talk: "bg-[var(--color-turquoise)]/10 text-[var(--color-turquoise)]",
    ceremony: "bg-[var(--color-navy)]/10 text-[var(--color-navy)] dark:bg-[var(--color-turquoise)]/10 dark:text-[var(--color-turquoise)]",
    meal: "bg-[var(--color-rose)]/10 text-[var(--color-rose)]",
    mawlid: "bg-[var(--color-brass)]/10 text-[var(--color-brass)]",
    meeting: "bg-[var(--color-turquoise)]/10 text-[var(--color-turquoise)]",
    paid_session: "bg-[var(--color-rose)]/10 text-[var(--color-rose)]",
    competition: "bg-[var(--color-brass)]/10 text-[var(--color-brass)]",
    external_redirect: "bg-[var(--color-navy)]/10 text-[var(--color-navy)] dark:bg-[var(--color-turquoise)]/10 dark:text-[var(--color-turquoise)]",
    closing: "bg-[var(--text-muted)]/10 text-[var(--text-secondary)]",
  };

  const regInfo = getSessionRegistration(session);
  const startTimeFormatted = formatSessionTime(session.start_time);
  const endTimeFormatted = formatSessionTime(session.end_time);

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group relative flex gap-4 p-4 md:p-5 rounded-xl border border-[var(--border)] hover:border-[var(--color-turquoise)]/40 bg-[var(--surface)] hover:bg-[var(--surface-elevated)]/60 hover:shadow-md transition-all cursor-pointer"
    >
      {/* Whole card clickable link to full details */}
      <Link
        href={`/sessions/${session.slug}`}
        onClick={() => haptic("tap")}
        className="absolute inset-0 z-10 rounded-xl"
        aria-label={`View details for ${session.title}`}
      />

      {/* Time column */}
      <div className="shrink-0 text-center min-w-[75px] pt-0.5">
        <p className="text-sm font-bold text-[var(--color-navy)] dark:text-[var(--color-turquoise)] leading-tight">
          {startTimeFormatted}
        </p>
        <p className="text-xs text-[var(--text-muted)] mt-0.5 font-medium">
          {endTimeFormatted}
        </p>
      </div>

      {/* Timeline dot + line */}
      <div className="flex flex-col items-center shrink-0">
        <div className="w-3 h-3 rounded-full bg-[var(--color-turquoise)] border-2 border-[var(--surface)] shadow-sm mt-1 group-hover:scale-125 transition-transform" />
        <div className="w-0.5 flex-1 bg-[var(--border)] mt-1" />
      </div>

      {/* Content */}
      <div className="flex-1 pb-1">
        <div className="flex items-start gap-2 mb-1 flex-wrap">
          <h3 className="text-sm md:text-base font-semibold text-[var(--text-primary)] leading-snug group-hover:text-[var(--color-turquoise)] transition-colors">
            {session.title}
          </h3>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${typeColors[session.type] || ""}`}>
            {session.type.replace("_", " ")}
          </span>
          {session.is_paid && (
            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-[var(--color-brass)]/10 text-[var(--color-brass)] shrink-0">
              {t("paid")}
            </span>
          )}
        </div>

        {session.title_ml && (
          <p className="text-xs text-[var(--text-muted)] mb-1" style={{ fontFamily: "var(--font-malayalam-text)" }}>
            {session.title_ml}
          </p>
        )}

        {speakerList.length > 0 && (
          <p className="text-xs text-[var(--text-muted)] mt-1 flex items-center gap-1.5">
            <Mic className="w-3 h-3 shrink-0" strokeWidth={2} aria-hidden="true" />
            {speakerList.map((s) => s.name).join(", ")}
          </p>
        )}

        <p className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed line-clamp-2">
          {session.description}
        </p>

        {/* Action row: Details hint on left, Registration button on right */}
        <div className="flex items-center justify-between gap-3 mt-3 pt-2 border-t border-[var(--border)]/50">
          <span className="inline-flex items-center text-xs font-medium text-[var(--color-turquoise)] group-hover:underline gap-1">
            {t("viewDetails")}
          </span>

          {regInfo && (
            <Magnetic pattern="select" strength={0.4}>
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
            </Magnetic>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function Schedule({ sessions }: { sessions: Session[] }) {
  const [activeStage, setActiveStage] = useState<string>("stage1");
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const t = useTranslations("Schedule");
  useSectionEnterHaptic(isInView);

  const stageSessions = sessions.filter((s) => s.stage === activeStage);

  return (
    <section id="schedule" className="relative py-20 md:py-28" ref={ref}>
      <div className="container-site">
        {/* Section header */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <span className="text-[var(--color-turquoise)] text-xs font-semibold tracking-[0.2em] uppercase">
            {t("eyebrow")}
          </span>
          <h2
            className="text-3xl md:text-4xl font-bold mt-2 text-[var(--text-primary)]"
            style={{ fontFamily: "var(--font-bodoni-moda)" }}
          >
            {t("heading")}
          </h2>
          <p className="text-[var(--text-secondary)] mt-3 max-w-xl mx-auto text-sm">
            {t("description")}
          </p>
        </motion.div>

        {/* Stage tabs */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex items-center justify-center gap-2 mb-8"
        >
          {["stage1", "stage2"].map((stage) => (
            <button
              key={stage}
              onClick={() => {
                haptic("select");
                setActiveStage(stage);
              }}
              className={`relative px-6 py-2.5 rounded-full text-sm font-semibold transition-all active:scale-95 ${
                activeStage === stage
                  ? "bg-[var(--color-navy)] text-white shadow-md"
                  : "bg-[var(--surface)] text-[var(--text-secondary)] border border-[var(--border)] hover:border-[var(--color-turquoise)]/30"
              }`}
            >
              {stage === "stage1" ? t("stage1") : t("stage2")}
              {activeStage === stage && (
                <motion.div
                  layoutId="stage-tab"
                  className="absolute inset-0 rounded-full bg-[var(--color-navy)]"
                  style={{ zIndex: -1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          ))}
        </motion.div>

        {/* Session list */}
        <div className="max-w-2xl mx-auto space-y-2">
          {stageSessions.map((session, i) => (
            <SessionCard key={session.id} session={session} index={i} t={t} />
          ))}
        </div>

        {/* Full schedule link */}
        <div className="text-center mt-10">
          <Magnetic pattern="tap">
            <Link
              href="/schedule"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium border border-[var(--border-strong)] text-[var(--text-primary)] hover:bg-[var(--surface-elevated)] transition-all"
            >
              {t("viewFullSchedule")}
            </Link>
          </Magnetic>
        </div>
      </div>
    </section>
  );
}
