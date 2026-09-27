"use client";

import { motion, AnimatePresence } from "framer-motion";
import { type Session, type Speaker } from "@/lib/data";
import Link from "next/link";
import { FileText, Mic, PlayCircle, ExternalLink } from "lucide-react";
import { useLiveEventState } from "@/lib/useLiveEventState";
import { formatSessionTime } from "@/lib/sessionHelpers";
import { haptic } from "@/lib/haptics";

interface LiveEventHeroProps {
  sessions: Session[];
  stage: string;
}

export function LiveEventHero({ sessions, stage }: LiveEventHeroProps) {
  const { liveState } = useLiveEventState(stage);

  if (!liveState) return null;

  let currentSession = null;
  
  if (liveState.mode === "manual" && liveState.current_session_id) {
    currentSession = sessions.find(s => s.id === liveState.current_session_id);
  } else {
    // Auto mode - fallback to current time checking or the one provided by DB
    // Actually for auto, we can also let the backend set current_session_id,
    // but if not, we can find the active one by time
    const now = new Date();
    currentSession = sessions.find(s => {
      const start = new Date(s.start_time);
      const end = new Date(s.end_time);
      return now >= start && now <= end && s.stage === stage;
    });
  }

  if (!currentSession) return null;

  const currentSpeaker = currentSession.speakers?.find(
    s => s.id === liveState.current_speaker_id
  ) || currentSession.speakers?.[0]; // Fallback to first speaker if none selected

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative mb-12 rounded-3xl overflow-hidden shadow-2xl border border-[var(--color-turquoise)]/30 group"
    >
      {/* Background with animated gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-navy)] via-[var(--surface)] to-[var(--color-turquoise)]/20 opacity-90 z-0"></div>
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay z-0"></div>

      <div className="relative z-10 p-6 md:p-10 flex flex-col md:flex-row gap-8 items-center md:items-stretch">
        
        {/* Left Side: Session Info */}
        <div className="flex-1 flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            <span className="text-sm font-bold tracking-widest text-red-500 uppercase">Live Now</span>
            <span className="text-[var(--text-muted)] text-sm">
              {formatSessionTime(currentSession.start_time)} - {formatSessionTime(currentSession.end_time)}
            </span>
          </div>

          <h3 className="text-2xl md:text-4xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-bodoni-moda)" }}>
            {currentSession.title}
          </h3>
          
          {currentSession.title_ml && (
            <p className="text-[var(--text-muted)] text-lg mb-4" style={{ fontFamily: "var(--font-malayalam-title)" }}>
              {currentSession.title_ml}
            </p>
          )}

          <p className="text-gray-300 mb-6 line-clamp-3">
            {currentSession.description}
          </p>

          {/* Subtitles (Lower Third) */}
          <AnimatePresence mode="wait">
            {liveState.subtitle_text && (
              <motion.div
                key={liveState.subtitle_text}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="mt-auto bg-black/40 backdrop-blur-md border-l-4 border-[var(--color-turquoise)] p-4 rounded-r-xl"
              >
                <p className="text-white font-medium text-lg italic">"{liveState.subtitle_text}"</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Side: Speaker Focus & Actions */}
        <div className="w-full md:w-72 shrink-0 flex flex-col gap-4">
          {/* Speaker Avatar & Info */}
          <AnimatePresence mode="wait">
            {currentSpeaker ? (
              <motion.div
                key={currentSpeaker.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-black/20 backdrop-blur-sm rounded-2xl p-4 flex flex-col items-center text-center border border-white/10"
              >
                <div className="w-24 h-24 rounded-full overflow-hidden mb-3 border-2 border-[var(--color-turquoise)] shadow-[0_0_15px_var(--color-turquoise)]">
                  {currentSpeaker.image_url ? (
                    <img src={currentSpeaker.image_url} alt={currentSpeaker.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[var(--color-navy)] to-[var(--color-turquoise)] flex items-center justify-center">
                      <Mic className="w-8 h-8 text-white/50" />
                    </div>
                  )}
                </div>
                <p className="text-xs text-[var(--color-turquoise)] uppercase tracking-wider font-semibold mb-1">
                  On Stage
                </p>
                <h4 className="text-white font-bold text-lg leading-tight">{currentSpeaker.name}</h4>
                {currentSpeaker.title && (
                  <p className="text-[10px] text-gray-400 mt-1">{currentSpeaker.title}</p>
                )}
              </motion.div>
            ) : (
              <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-4 flex flex-col items-center justify-center text-center border border-white/10 h-full min-h-[160px]">
                <PlayCircle className="w-12 h-12 text-white/20 mb-2" />
                <p className="text-white/50 text-sm">Event in Progress</p>
              </div>
            )}
          </AnimatePresence>

          {/* Document Push */}
          <AnimatePresence>
            {liveState.document_url && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
              >
                <Link
                  href={liveState.document_url}
                  target="_blank"
                  onClick={() => haptic("success")}
                  className="w-full flex items-center justify-between p-3 bg-[var(--color-turquoise)]/20 hover:bg-[var(--color-turquoise)]/40 border border-[var(--color-turquoise)] rounded-xl backdrop-blur-md transition-colors group/doc"
                >
                  <div className="flex items-center gap-2 text-white">
                    <FileText className="w-5 h-5" />
                    <span className="text-sm font-semibold">Live Resource</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-white/70 group-hover/doc:text-white group-hover/doc:translate-x-1 transition-all" />
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
