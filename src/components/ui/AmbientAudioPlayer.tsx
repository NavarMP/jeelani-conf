"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function AmbientAudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [showControls, setShowControls] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio("/ambient-music.mp3");
    audioRef.current.loop = true;
    audioRef.current.volume = volume;

    // Restore preference
    const pref = localStorage.getItem("gjc-ambient-audio");
    if (pref === "playing") {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }

    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      localStorage.setItem("gjc-ambient-audio", "paused");
    } else {
      audioRef.current.play().catch(() => {});
      localStorage.setItem("gjc-ambient-audio", "playing");
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="fixed bottom-20 lg:bottom-6 right-4 z-40">
      <div
        className="relative"
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        {/* Volume slider */}
        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-full mb-2 right-0 px-3 py-2 rounded-xl bg-[var(--surface)]/95 backdrop-blur-lg border border-[var(--border)] shadow-lg"
            >
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-24 accent-[var(--color-brass)]"
                aria-label="Volume"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Play/Pause button — styled as Ponnani lamp */}
        <button
          onClick={togglePlay}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg ${
            isPlaying
              ? "bg-[var(--color-brass)] text-[var(--color-black)] glow-brass"
              : "bg-[var(--surface)] text-[var(--text-muted)] border border-[var(--border)] hover:border-[var(--color-brass)]/40"
          }`}
          aria-label={isPlaying ? "Pause ambient audio" : "Play ambient audio"}
          title={isPlaying ? "Pause ambient audio" : "Play ambient audio"}
        >
          {isPlaying ? (
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
              <rect x="6" y="5" width="4" height="14" rx="1" />
              <rect x="14" y="5" width="4" height="14" rx="1" />
            </svg>
          ) : (
            <span className="text-lg">🪔</span>
          )}
        </button>

        {/* Pulse ring when playing */}
        {isPlaying && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-[var(--color-brass)]"
            animate={{ scale: [1, 1.3], opacity: [0.5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
          />
        )}
      </div>
    </div>
  );
}
