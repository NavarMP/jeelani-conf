"use client";

import { useState, useRef } from "react";
import { motion, useInView, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { type Session, type Speaker } from "@/lib/data";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { formatSessionTime, getSessionRegistration } from "@/lib/sessionHelpers";
import { haptic } from "@/lib/haptics";
import { useSectionEnterHaptic } from "@/hooks/useHaptics";
import { Magnetic } from "@/components/ui/Magnetic";
import { Mic, ChevronDown, ExternalLink, ArrowRight } from "lucide-react";
import { LiveEventHero } from "@/components/sections/LiveEventHero";
import { cn } from "@/lib/utils";

function SessionCard({ session, index, t }: { session: Session; index: number; t: (key: string) => string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const speakerList = session.speakers || [];
  const typeColors: Record<string, string> = {
    talk: "bg-[var(--color-turquoise)]/10 text-[var(--color-turquoise)] border-[var(--color-turquoise)]/20",
    ceremony: "bg-[var(--color-navy)]/10 text-[var(--color-navy)] dark:bg-[var(--color-turquoise)]/10 dark:text-[var(--color-turquoise)] border-[var(--color-navy)]/20 dark:border-[var(--color-turquoise)]/20",
    meal: "bg-[var(--color-rose)]/10 text-[var(--color-rose)] border-[var(--color-rose)]/20",
    mawlid: "bg-[var(--color-brass)]/10 text-[var(--color-brass)] border-[var(--color-brass)]/20",
    meeting: "bg-[var(--color-turquoise)]/10 text-[var(--color-turquoise)] border-[var(--color-turquoise)]/20",
    paid_session: "bg-[var(--color-rose)]/10 text-[var(--color-rose)] border-[var(--color-rose)]/20",
    competition: "bg-[var(--color-brass)]/10 text-[var(--color-brass)] border-[var(--color-brass)]/20",
    external_redirect: "bg-[var(--color-navy)]/10 text-[var(--color-navy)] dark:bg-[var(--color-turquoise)]/10 dark:text-[var(--color-turquoise)] border-[var(--color-navy)]/20",
    closing: "bg-[var(--text-muted)]/10 text-[var(--text-secondary)] border-[var(--border)]",
  };

  const regInfo = getSessionRegistration(session);
  const startTimeFormatted = formatSessionTime(session.start_time);
  const endTimeFormatted = formatSessionTime(session.end_time);
  const hasNestedPrograms = session.programs && session.programs.length > 0;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const toggleExpand = (e: React.MouseEvent) => {
    // Only toggle if they didn't click a link
    if ((e.target as HTMLElement).closest('a')) return;
    haptic("tap");
    setIsExpanded(!isExpanded);
  };

  return (
    <motion.div
      initial={{ y: 30, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.05, type: "spring", stiffness: 300, damping: 24 }}
      className="relative flex gap-4 md:gap-6 group"
    >
      {/* Timeline Column */}
      <div className="flex flex-col items-center shrink-0 w-12 md:w-16">
        <div className="text-center pt-1 pb-2">
          <p className="text-xs md:text-sm font-bold text-[var(--color-navy)] dark:text-[var(--color-turquoise)] leading-none">
            {startTimeFormatted.split(' ')[0]}
          </p>
          <p className="text-[10px] md:text-xs text-[var(--text-muted)] mt-1 font-medium">
            {startTimeFormatted.split(' ')[1] || ''}
          </p>
        </div>
        
        {/* Animated Timeline Node */}
        <div className="relative flex justify-center items-center h-full">
          <div className="absolute top-0 bottom-0 w-px bg-gradient-to-b from-[var(--border)] via-[var(--color-turquoise)]/30 to-[var(--border)] group-hover:via-[var(--color-turquoise)]/80 transition-colors duration-500" />
          <div className="relative w-3.5 h-3.5 md:w-4 md:h-4 rounded-full bg-[var(--surface)] border-[2.5px] border-[var(--color-turquoise)] shadow-[0_0_10px_rgba(var(--color-turquoise-rgb),0.3)] z-10 group-hover:scale-125 transition-transform duration-300 ease-out" />
        </div>
      </div>

      {/* Card Content */}
      <div 
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onClick={toggleExpand}
        className={cn(
          "relative flex-1 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-md overflow-hidden transition-all duration-500 cursor-pointer mb-6",
          "hover:border-[var(--color-turquoise)]/50 hover:shadow-lg hover:shadow-[var(--color-turquoise)]/5",
          isExpanded ? "shadow-md border-[var(--color-turquoise)]/30 bg-[var(--surface)]" : ""
        )}
      >
        {/* Spotlight Effect on Hover */}
        <div 
          className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, var(--color-turquoise) 0%, transparent 40%)`,
            opacity: 0.08
          }}
        />

        <div className="p-5 md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className={cn(
                "text-[10px] px-2.5 py-1 rounded-full font-semibold tracking-wide uppercase border",
                typeColors[session.type] || "bg-[var(--surface-elevated)] text-[var(--text-primary)] border-[var(--border)]"
              )}>
                {session.type.replace("_", " ")}
              </span>
              {session.is_paid && (
                <span className="text-[10px] px-2.5 py-1 rounded-full font-semibold tracking-wide uppercase bg-[var(--color-brass)]/10 text-[var(--color-brass)] border border-[var(--color-brass)]/20">
                  {t("paid")}
                </span>
              )}
            </div>
            
            <p className="text-xs font-medium text-[var(--text-muted)]">
              {startTimeFormatted} - {endTimeFormatted}
            </p>
          </div>

          <h3 className="text-lg md:text-xl font-bold text-[var(--text-primary)] leading-snug group-hover:text-[var(--color-turquoise)] transition-colors mt-2 mb-1">
            {session.title}
          </h3>

          {session.title_ml && (
            <p className="text-sm text-[var(--text-secondary)] mb-3 opacity-80" style={{ fontFamily: "var(--font-malayalam-title)" }}>
              {session.title_ml}
            </p>
          )}

          {speakerList.length > 0 && (
            <div className="flex items-center gap-2 mt-3 mb-1">
              <Mic className="w-4 h-4 text-[var(--color-turquoise)]" />
              <p className="text-sm font-medium text-[var(--text-secondary)]">
                {speakerList.map((s) => s.name).join(", ")}
              </p>
            </div>
          )}

          <p className={cn(
            "text-sm text-[var(--text-secondary)] leading-relaxed mt-2 transition-all",
            !isExpanded && "line-clamp-2"
          )}>
            {session.description}
          </p>

          {/* Action Row & Expand Indicator */}
          <div className="flex items-center justify-between mt-5 pt-4 border-t border-[var(--border)]/50">
            <div className="flex items-center gap-3">
              <Link 
                href={`/sessions/${session.slug}`}
                onClick={(e) => { e.stopPropagation(); haptic("tap"); }}
                className="text-sm font-semibold text-[var(--color-turquoise)] hover:text-[var(--hover-turquoise)] flex items-center gap-1 transition-colors"
              >
                {t("viewDetails")}
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="flex items-center gap-3">
              {regInfo && (
                <Link
                  href={regInfo.url}
                  target={regInfo.isExternal ? "_blank" : undefined}
                  rel={regInfo.isExternal ? "noopener noreferrer" : undefined}
                  onClick={(e) => { e.stopPropagation(); haptic("tap"); }}
                  className="relative z-20 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold bg-[var(--color-turquoise)] text-white hover:bg-[var(--hover-turquoise)] shadow-sm hover:shadow transition-all hover:scale-105 active:scale-95"
                >
                  {regInfo.label}
                  {regInfo.isExternal ? <ExternalLink className="w-3 h-3" /> : <ArrowRight className="w-3 h-3" />}
                </Link>
              )}
              {hasNestedPrograms && (
                <button
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--surface-elevated)] hover:bg-[var(--border)] transition-colors text-[var(--text-secondary)]"
                  aria-label="Expand details"
                >
                  <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ type: "spring", stiffness: 200, damping: 20 }}>
                    <ChevronDown className="w-4 h-4" />
                  </motion.div>
                </button>
              )}
            </div>
          </div>

          {/* Expandable Nested Programs */}
          <AnimatePresence initial={false}>
            {isExpanded && hasNestedPrograms && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="mt-5 pt-4 space-y-4 border-t border-[var(--border)]/30 relative">
                  <div className="absolute left-2 top-4 bottom-4 w-px bg-[var(--border)]/50" />
                  {session.programs!.map((program) => {
                    const progSpeakers = program.speakers || [];
                    return (
                      <div key={program.id} className="relative pl-6">
                        <div className="absolute left-[5.5px] top-1.5 w-1.5 h-1.5 rounded-full bg-[var(--text-muted)]" />
                        <p className="text-xs font-bold text-[var(--color-navy)] dark:text-[var(--color-turquoise)] mb-1">
                          {formatSessionTime(program.start_time)} - {formatSessionTime(program.end_time)}
                        </p>
                        <h4 className="text-sm font-bold text-[var(--text-primary)]">
                          {program.title}
                        </h4>
                        {program.title_ml && (
                          <p className="text-xs text-[var(--text-muted)] mt-0.5" style={{ fontFamily: "var(--font-malayalam-title)" }}>
                            {program.title_ml}
                          </p>
                        )}
                        {progSpeakers.length > 0 && (
                          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-[var(--text-secondary)] font-medium">
                            <Mic className="w-3 h-3" />
                            {progSpeakers.map((s) => s.name).join(", ")}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

export function Schedule({ sessions, stages = [] }: { sessions: Session[], stages?: any[] }) {
  const uniqueStages = stages.length > 0 
    ? Array.from(new Set([...stages.map((s) => s.slug), ...sessions.map((s) => s.stage).filter(Boolean)]))
    : Array.from(new Set(sessions.map((s) => s.stage).filter(Boolean))).sort();

  const [activeStage, setActiveStage] = useState<string>(uniqueStages[0] || "stage1");
  const [visibleCount, setVisibleCount] = useState(4);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Parallax Scroll Effect for Background
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  
  const isInView = useInView(containerRef, { once: true, margin: "-50px" });
  const t = useTranslations("Schedule");
  useSectionEnterHaptic(isInView);

  const stageSessions = sessions.filter((s) => s.stage === activeStage);
  const visibleSessions = stageSessions.slice(0, visibleCount);
  const hasMore = visibleCount < stageSessions.length;

  return (
    <section id="schedule" className="relative py-24 md:py-32 overflow-hidden" ref={containerRef}>
      {/* Animated Parallax Background Mesh */}
      <motion.div 
        style={{ y: backgroundY }}
        className="absolute inset-0 z-0 pointer-events-none opacity-40 dark:opacity-20"
      >
        <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-[var(--color-turquoise)] rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob" />
        <div className="absolute top-1/3 -right-1/4 w-96 h-96 bg-[var(--color-navy)] rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-32 left-1/2 w-96 h-96 bg-[var(--color-brass)] rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-4000" />
      </motion.div>

      <div className="container-site relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center gap-2 px-3 py-1 mb-4 rounded-full bg-[var(--color-turquoise)]/10 border border-[var(--color-turquoise)]/20 text-[var(--color-turquoise)] text-xs font-bold tracking-[0.2em] uppercase backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-turquoise)] animate-pulse" />
            {t("eyebrow")}
          </div>
          <h2
            className="text-4xl md:text-5xl lg:text-6xl font-bold mt-2 text-[var(--text-primary)] tracking-tight"
            style={{ fontFamily: "var(--font-bodoni-moda)" }}
          >
            {t("heading")}
          </h2>
          <p className="text-[var(--text-secondary)] mt-6 max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
            {t("description")}
          </p>
        </motion.div>

        {/* Apple-style Segmented Control for Stages */}
        <motion.div
          initial={{ y: 20, opacity: 0, scale: 0.95 }}
          animate={isInView ? { y: 0, opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.2, type: "spring" }}
          className="flex items-center justify-center gap-1.5 mb-16 flex-wrap bg-[var(--surface-elevated)]/50 p-1.5 rounded-2xl md:rounded-full border border-[var(--border)] max-w-max mx-auto backdrop-blur-md"
        >
          {uniqueStages.map((stage) => {
            const isActive = activeStage === stage;
            return (
              <button
                key={stage}
                onClick={() => {
                  haptic("select");
                  setActiveStage(stage);
                  setVisibleCount(4);
                }}
                className={cn(
                  "relative px-6 py-2.5 rounded-xl md:rounded-full text-sm font-bold transition-colors duration-300 capitalize",
                  isActive ? "text-white" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                )}
              >
                <span className="relative z-10 flex items-center gap-2">
                  {stages.find(s => s.slug === stage)?.name || (t.has(stage) ? t(stage) : stage.replace("stage", "Stage "))}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute inset-0 rounded-xl md:rounded-full bg-gradient-to-r from-[var(--color-navy)] to-[var(--color-turquoise)] shadow-lg"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </motion.div>

        {/* Currently Live Hero */}
        <div className="mb-12">
          <LiveEventHero sessions={sessions} stage={activeStage} />
        </div>

        {/* Sessions List */}
        <div className="max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStage}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="space-y-0"
            >
              {visibleSessions.map((session, i) => (
                <SessionCard key={session.id} session={session} index={i} t={t} />
              ))}
              
              {stageSessions.length === 0 && (
                <div className="text-center py-20 bg-[var(--surface)]/50 rounded-2xl border border-[var(--border)] border-dashed">
                  <p className="text-[var(--text-muted)] font-medium">No sessions scheduled for this stage yet.</p>
                </div>
              )}

              {hasMore && (
                <div className="text-center mt-12 mb-4">
                  <button
                    onClick={() => {
                      haptic("tap");
                      setVisibleCount(prev => prev + 4);
                    }}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold text-[var(--color-turquoise)] border border-[var(--color-turquoise)]/30 bg-[var(--color-turquoise)]/5 hover:bg-[var(--color-turquoise)]/15 transition-all active:scale-95"
                  >
                    Load More <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Full Schedule Link */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-16"
        >
          <Magnetic pattern="tap" strength={0.5}>
            <Link
              href="/schedule"
              onClick={() => haptic("tap")}
              className="group relative inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-bold bg-[var(--surface-elevated)] border border-[var(--border-strong)] text-[var(--text-primary)] hover:border-[var(--color-turquoise)]/50 transition-all overflow-hidden"
            >
              <div className="absolute inset-0 bg-[var(--color-turquoise)]/5 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300" />
              <span className="relative z-10 flex items-center gap-2">
                {t("viewFullSchedule")}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </Magnetic>
        </motion.div>
      </div>
    </section>
  );
}
