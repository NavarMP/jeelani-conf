"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  Volume2,
  Volume1,
  VolumeX,
  RotateCcw,
  RotateCw,
  ChevronUp,
  ChevronDown,
  Music2,
  Sparkles,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { haptic } from "@/lib/haptics";

// Harmonic wave bar definitions for visualizer
const WAVE_BARS = [
  { minH: 4, maxH: 22, duration: 0.72, delay: 0.05 },
  { minH: 6, maxH: 32, duration: 0.58, delay: 0.18 },
  { minH: 4, maxH: 20, duration: 0.81, delay: 0.12 },
  { minH: 8, maxH: 38, duration: 0.64, delay: 0.25 },
  { minH: 5, maxH: 26, duration: 0.52, delay: 0.1 },
  { minH: 10, maxH: 42, duration: 0.76, delay: 0.32 },
  { minH: 7, maxH: 34, duration: 0.6, delay: 0.08 },
  { minH: 9, maxH: 40, duration: 0.68, delay: 0.22 },
  { minH: 6, maxH: 30, duration: 0.55, delay: 0.15 },
  { minH: 10, maxH: 44, duration: 0.7, delay: 0.28 },
  { minH: 5, maxH: 28, duration: 0.62, delay: 0.14 },
  { minH: 8, maxH: 36, duration: 0.66, delay: 0.2 },
  { minH: 4, maxH: 24, duration: 0.78, delay: 0.06 },
  { minH: 7, maxH: 32, duration: 0.56, delay: 0.16 },
  { minH: 5, maxH: 22, duration: 0.74, delay: 0.24 },
  { minH: 3, maxH: 16, duration: 0.85, delay: 0.1 },
];

const MINI_BARS = [
  { minH: 3, maxH: 14, duration: 0.55 },
  { minH: 4, maxH: 22, duration: 0.65 },
  { minH: 5, maxH: 26, duration: 0.5 },
  { minH: 4, maxH: 18, duration: 0.7 },
  { minH: 3, maxH: 12, duration: 0.6 },
];

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

export function AmbientAudioPlayer() {
  const t = useTranslations("AmbientAudio");

  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5); // 50% default volume as requested
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(32);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const prevVolumeRef = useRef(0.5);

  // Helper safe translations with fallbacks
  const title = t("title") || "Sacred Echoes";
  const subtitle = t("subtitle") || "Baghdad to Malabar";
  const playLabel = t("play") || "Play";
  const pauseLabel = t("pause") || "Pause";
  const volumeLabel = t("volume") || "Volume";
  const muteLabel = t("mute") || "Mute";
  const unmuteLabel = t("unmute") || "Unmute";
  const tapToPlayLabel = t("tapToPlay") || "Tap to Play";

  // Autoplay at 50% volume on launch
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Restore saved volume if any, otherwise default strictly to 0.5 (50%)
    const savedVolume = localStorage.getItem("gjc-ambient-volume");
    const initialVol = savedVolume !== null ? parseFloat(savedVolume) : 0.5;
    const validVol = isNaN(initialVol) ? 0.5 : Math.max(0, Math.min(1, initialVol));
    setVolume(validVol);
    audio.volume = validVol;

    const savedPref = localStorage.getItem("gjc-ambient-pref");

    // Only suppress if user explicitly paused in a prior visit
    if (savedPref !== "paused") {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setAutoplayBlocked(false);
          })
          .catch((err) => {
            // Autoplay policy prevented unmuted playback before user gesture
            setAutoplayBlocked(true);

            // Listen for first user interaction anywhere on the window
            const startPlaybackOnGesture = () => {
              if (audioRef.current && audioRef.current.paused) {
                audioRef.current.volume = validVol;
                audioRef.current
                  .play()
                  .then(() => {
                    setIsPlaying(true);
                    setAutoplayBlocked(false);
                  })
                  .catch(() => {});
              }
              cleanupGestureListeners();
            };

            const gestureEvents = ["pointerdown", "click", "touchstart", "keydown"];
            const cleanupGestureListeners = () => {
              gestureEvents.forEach((evt) => {
                window.removeEventListener(evt, startPlaybackOnGesture);
              });
            };

            gestureEvents.forEach((evt) => {
              window.addEventListener(evt, startPlaybackOnGesture, { once: true, passive: true });
            });
          });
      }
    }
  }, []);

  // Synchronize audio volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    haptic("select");

    if (isPlaying) {
      audio.pause();
      localStorage.setItem("gjc-ambient-pref", "paused");
      setIsPlaying(false);
    } else {
      audio.volume = isMuted ? 0 : volume;
      audio
        .play()
        .then(() => {
          setIsPlaying(true);
          setAutoplayBlocked(false);
          localStorage.setItem("gjc-ambient-pref", "playing");
        })
        .catch((err) => {
          console.warn("Playback prevented:", err);
        });
    }
  }, [isPlaying, isMuted, volume]);

  const handleVolumeChange = (newVol: number) => {
    const clamped = Math.max(0, Math.min(1, newVol));
    setVolume(clamped);
    if (clamped > 0 && isMuted) {
      setIsMuted(false);
    }
    if (audioRef.current) {
      audioRef.current.volume = clamped;
    }
    localStorage.setItem("gjc-ambient-volume", clamped.toString());
  };

  const toggleMute = () => {
    haptic("tap");
    if (isMuted || volume === 0) {
      const restoreVol = prevVolumeRef.current > 0 ? prevVolumeRef.current : 0.5;
      setIsMuted(false);
      setVolume(restoreVol);
      if (audioRef.current) audioRef.current.volume = restoreVol;
      localStorage.setItem("gjc-ambient-volume", restoreVol.toString());
    } else {
      prevVolumeRef.current = volume;
      setIsMuted(true);
      if (audioRef.current) audioRef.current.volume = 0;
    }
  };

  const skipTime = (delta: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    haptic("tick");
    const total = audio.duration || duration || 32;
    const newTime = Math.max(0, Math.min(total, audio.currentTime + delta));
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleSeekChange = (val: number) => {
    setSeekValue(val);
  };

  const handleSeekCommit = (val: number) => {
    setIsSeeking(false);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
    }
    setCurrentTime(val);
  };

  const currentDisplayTime = isSeeking ? seekValue : currentTime;
  const progressPercent = duration > 0 ? (currentDisplayTime / duration) * 100 : 0;
  const currentEffectiveVolume = isMuted ? 0 : volume;
  const volumePercent = Math.round(currentEffectiveVolume * 100);

  return (
    <>
      {/* Native HTML5 Audio Element with fallback sources */}
      <audio
        ref={audioRef}
        preload="auto"
        loop
        playsInline
        onTimeUpdate={() => {
          if (!isSeeking && audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
          }
        }}
        onLoadedMetadata={() => {
          if (audioRef.current && !isNaN(audioRef.current.duration)) {
            setDuration(audioRef.current.duration);
          }
        }}
        onDurationChange={() => {
          if (audioRef.current && !isNaN(audioRef.current.duration)) {
            setDuration(audioRef.current.duration);
          }
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
      >
        <source src="/ambient-audio.mp3" type="audio/mpeg" />
        <source src="/ambient-audio.wav" type="audio/wav" />
      </audio>

      {/* Music Player Container: positioned above mobile dock on small screens and bottom-right on desktop */}
      <div className="fixed bottom-24 lg:bottom-6 right-4 z-40 select-none">
        <AnimatePresence mode="wait">
          {isExpanded ? (
            /* =========================================================
               EXPANDED LUXURY AUDIO DECK
               ========================================================= */
            <motion.div
              key="expanded"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              transition={{ type: "spring", stiffness: 380, damping: 28 }}
              className="relative w-[88vw] max-w-[340px] sm:max-w-[360px] p-4 sm:p-5 rounded-2xl bg-[var(--surface)]/95 dark:bg-[#101827]/95 backdrop-blur-2xl border border-[var(--color-brass)]/40 shadow-2xl shadow-black/25 overflow-hidden"
              style={{
                boxShadow: "0 16px 40px -8px rgba(0,0,0,0.3), 0 0 24px -4px rgba(255,200,0,0.15)",
              }}
            >
              {/* Subtle Arabesque ornamental ambient glow */}
              <div
                className="absolute -top-16 -right-16 w-36 h-36 rounded-full bg-[var(--color-brass)]/15 blur-3xl pointer-events-none"
                aria-hidden="true"
              />
              <div
                className="absolute -bottom-16 -left-16 w-36 h-36 rounded-full bg-[var(--color-turquoise)]/15 blur-3xl pointer-events-none"
                aria-hidden="true"
              />

              {/* Header: Title, Subtitle, Minimize button */}
              <div className="flex items-start justify-between gap-3 mb-3 relative z-10">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-tr from-[var(--color-navy)] to-[#1a5b9c] text-[var(--color-brass)] shadow-md border border-[var(--color-brass)]/30">
                    <Music2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-semibold tracking-wide text-[var(--text-primary)]">
                        {title}
                      </h4>
                      <Sparkles className="w-3 h-3 text-[var(--color-brass)] animate-pulse" />
                    </div>
                    <p className="text-[11px] text-[var(--text-muted)] tracking-wider">
                      {subtitle}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    haptic("tap");
                    setIsExpanded(false);
                  }}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                  aria-label="Minimize player"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              {/* Sound Wave Visualizer */}
              <div className="my-3 py-2 px-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 flex items-center justify-center gap-1 h-14 relative overflow-hidden">
                {WAVE_BARS.map((bar, i) => {
                  const targetHeight =
                    isPlaying && currentEffectiveVolume > 0
                      ? Math.max(bar.minH, Math.round(bar.maxH * currentEffectiveVolume))
                      : bar.minH;

                  return (
                    <motion.span
                      key={i}
                      className="w-1 rounded-full bg-gradient-to-t from-[var(--color-brass)] to-[#218EB6]"
                      animate={{
                        height: isPlaying && currentEffectiveVolume > 0 ? [bar.minH, targetHeight, bar.minH] : 4,
                        opacity: isPlaying && currentEffectiveVolume > 0 ? [0.65, 1, 0.65] : 0.35,
                      }}
                      transition={{
                        repeat: isPlaying && currentEffectiveVolume > 0 ? Infinity : 0,
                        repeatType: "reverse",
                        duration: bar.duration,
                        delay: bar.delay,
                        ease: "easeInOut",
                      }}
                      style={{
                        boxShadow:
                          isPlaying && currentEffectiveVolume > 0
                            ? "0 0 6px rgba(255, 200, 0, 0.4)"
                            : "none",
                      }}
                    />
                  );
                })}
              </div>

              {/* Progress Bar & Timestamps */}
              <div className="mb-4">
                <div className="relative flex items-center group">
                  <input
                    type="range"
                    min={0}
                    max={duration || 32}
                    step={0.1}
                    value={currentDisplayTime}
                    onMouseDown={() => setIsSeeking(true)}
                    onTouchStart={() => setIsSeeking(true)}
                    onChange={(e) => handleSeekChange(parseFloat(e.target.value))}
                    onMouseUp={(e) => handleSeekCommit(parseFloat((e.target as HTMLInputElement).value))}
                    onTouchEnd={(e) => handleSeekCommit(parseFloat((e.target as HTMLInputElement).value))}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-[var(--color-brass)] focus:outline-none"
                    style={{
                      background: `linear-gradient(to right, var(--color-brass) 0%, var(--color-brass) ${progressPercent}%, rgba(150, 150, 150, 0.25) ${progressPercent}%, rgba(150, 150, 150, 0.25) 100%)`,
                    }}
                    aria-label="Track progress"
                  />
                </div>
                <div className="flex justify-between items-center mt-1.5 text-[10px] text-[var(--text-muted)] font-mono">
                  <span>{formatTime(currentDisplayTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Playback Controls Row: -5s, Hero Play/Pause, +5s */}
              <div className="flex items-center justify-center gap-4 mb-4">
                <button
                  type="button"
                  onClick={() => skipTime(-5)}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/10 active:scale-90 transition-transform"
                  title="Rewind 5 seconds"
                  aria-label="Rewind 5 seconds"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                {/* Hero Play / Pause button */}
                <button
                  type="button"
                  onClick={togglePlay}
                  className="relative w-13 h-13 rounded-full flex items-center justify-center bg-gradient-to-tr from-[#E6B400] to-[var(--color-brass)] text-[var(--color-black)] font-bold shadow-lg shadow-[var(--color-brass)]/30 hover:scale-105 active:scale-95 transition-all"
                  style={{
                    boxShadow: "0 4px 18px rgba(255, 200, 0, 0.45)",
                  }}
                  aria-label={isPlaying ? pauseLabel : playLabel}
                  title={isPlaying ? pauseLabel : playLabel}
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 fill-[var(--color-black)]" />
                  ) : (
                    <Play className="w-5 h-5 fill-[var(--color-black)] translate-x-0.5" />
                  )}

                  {/* Pulsing ring when playing */}
                  {isPlaying && (
                    <motion.div
                      className="absolute inset-0 rounded-full border border-[var(--color-brass)]"
                      animate={{ scale: [1, 1.35], opacity: [0.7, 0] }}
                      transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
                    />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => skipTime(5)}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/10 active:scale-90 transition-transform"
                  title="Forward 5 seconds"
                  aria-label="Forward 5 seconds"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
              </div>

              {/* Volume Slider & Mute Toggle */}
              <div className="flex items-center justify-between gap-3 pt-3 border-t border-black/5 dark:border-white/10">
                <button
                  type="button"
                  onClick={toggleMute}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                  aria-label={isMuted ? unmuteLabel : muteLabel}
                  title={isMuted ? unmuteLabel : muteLabel}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4 text-red-400" />
                  ) : volume < 0.5 ? (
                    <Volume1 className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>

                <div className="flex-1 flex items-center">
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={isMuted ? 0 : volume}
                    onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-[var(--color-brass)] focus:outline-none"
                    style={{
                      background: `linear-gradient(to right, var(--color-brass) 0%, var(--color-brass) ${volumePercent}%, rgba(150, 150, 150, 0.25) ${volumePercent}%, rgba(150, 150, 150, 0.25) 100%)`,
                    }}
                    aria-label={volumeLabel}
                  />
                </div>

                <span className="text-[11px] font-mono text-[var(--text-muted)] min-w-[32px] text-right font-medium">
                  {volumePercent}%
                </span>
              </div>
            </motion.div>
          ) : (
            /* =========================================================
               COMPACT FLOATING PILL
               ========================================================= */
            <motion.div
              key="compact"
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              transition={{ type: "spring", stiffness: 420, damping: 26 }}
              className="flex items-center gap-2 sm:gap-2.5 p-1.5 sm:p-2 pr-3 rounded-full bg-[var(--surface)]/95 dark:bg-[#101827]/95 backdrop-blur-xl border border-[var(--color-brass)]/40 shadow-xl shadow-black/20"
              style={{
                boxShadow: "0 10px 25px -4px rgba(0,0,0,0.25), 0 0 16px -2px rgba(255,200,0,0.2)",
              }}
            >
              {/* Play / Pause Toggle Button */}
              <button
                type="button"
                onClick={togglePlay}
                className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90 ${
                  isPlaying
                    ? "bg-gradient-to-tr from-[#E6B400] to-[var(--color-brass)] text-[var(--color-black)] shadow-md"
                    : "bg-black/5 dark:bg-white/10 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
                style={
                  isPlaying
                    ? { boxShadow: "0 0 14px rgba(255, 200, 0, 0.45)" }
                    : undefined
                }
                aria-label={isPlaying ? pauseLabel : playLabel}
                title={isPlaying ? pauseLabel : playLabel}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 fill-[var(--color-black)]" />
                ) : (
                  <Play className="w-4 h-4 fill-current translate-x-0.5" />
                )}

                {/* Pulsing ring when playing */}
                {isPlaying && (
                  <motion.div
                    className="absolute inset-0 rounded-full border border-[var(--color-brass)]"
                    animate={{ scale: [1, 1.35], opacity: [0.7, 0] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
                  />
                )}
              </button>

              {/* Title & Interactive mini visualizer (opens deck on click) */}
              <button
                type="button"
                onClick={() => {
                  haptic("tap");
                  setIsExpanded(true);
                }}
                className="flex items-center gap-2 text-left group"
                aria-label="Expand audio controls"
              >
                {/* Mini Waveform Bars */}
                <div className="flex items-center gap-0.5 h-5 px-1">
                  {MINI_BARS.map((bar, i) => {
                    const targetHeight =
                      isPlaying && currentEffectiveVolume > 0
                        ? Math.max(bar.minH, Math.round(bar.maxH * currentEffectiveVolume))
                        : bar.minH;

                    return (
                      <motion.span
                        key={i}
                        className="w-0.5 rounded-full bg-[var(--color-brass)]"
                        animate={{
                          height: isPlaying && currentEffectiveVolume > 0 ? [bar.minH, targetHeight, bar.minH] : 3,
                          opacity: isPlaying && currentEffectiveVolume > 0 ? [0.7, 1, 0.7] : 0.4,
                        }}
                        transition={{
                          repeat: isPlaying && currentEffectiveVolume > 0 ? Infinity : 0,
                          repeatType: "reverse",
                          duration: bar.duration,
                          ease: "easeInOut",
                        }}
                      />
                    );
                  })}
                </div>

                <div className="hidden sm:flex flex-col pr-1">
                  <span className="text-xs font-semibold text-[var(--text-primary)] group-hover:text-[var(--color-brass)] transition-colors line-clamp-1 max-w-[100px]">
                    {title}
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)] font-mono">
                    {autoplayBlocked && !isPlaying ? tapToPlayLabel : `${volumePercent}% vol`}
                  </span>
                </div>

                {/* Expand Indicator */}
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[var(--text-muted)] group-hover:text-[var(--text-primary)] group-hover:bg-black/5 dark:group-hover:bg-white/10 transition-colors">
                  <ChevronUp className="w-3.5 h-3.5" />
                </div>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
