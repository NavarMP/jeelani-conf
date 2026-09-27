"use client";

import { motion } from "framer-motion";
import { type Speaker, type Session } from "@/lib/data";
import Link from "next/link";
import { haptic } from "@/lib/haptics";

export default function SpeakersGridClient({ speakers, sessions }: { speakers: Speaker[], sessions: Session[] }) {
  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: 0.1 }
        }
      }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 max-w-[1400px] mx-auto px-4"
    >
      {speakers.map((speaker, index) => {
        const speakerSessions = sessions.filter((s) =>
          s.speakers?.some(sp => sp.id === speaker.id)
        );

        return (
          <motion.div
            key={speaker.id}
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { 
                opacity: 1, 
                y: 0,
                transition: { type: "spring", stiffness: 100, damping: 20 }
              }
            }}
            whileHover={{ y: -8 }}
            onPointerDown={() => haptic("tap")}
            className="group relative w-full aspect-[4/5] rounded-[2rem] overflow-hidden cursor-pointer shadow-xl"
          >
            {/* Dynamic Glow Shadow behind the card content */}
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-navy)] via-purple-900 to-[var(--color-turquoise)] opacity-0 group-hover:opacity-40 transition-opacity duration-500 blur-xl"></div>

            {/* Main Card Container */}
            <div className="absolute inset-0 bg-[var(--surface)] border border-[var(--border)] group-hover:border-[var(--color-turquoise)]/50 transition-colors duration-500 z-10 overflow-hidden rounded-[2rem]">
              {/* Background Image */}
              <div className="absolute inset-0 w-full h-full bg-[var(--color-navy)]">
                {speaker.image_url ? (
                  <img
                    src={speaker.image_url}
                    alt={speaker.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center opacity-20">
                    <svg viewBox="0 0 80 80" className="w-24 h-24 text-white" fill="currentColor" aria-hidden="true">
                      <circle cx="40" cy="28" r="14" />
                      <path d="M15 72 Q15 50 40 45 Q65 50 65 72 Z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Cinematic Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-500"></div>

              {/* Content */}
              <div className="absolute inset-0 p-6 flex flex-col justify-end z-20">
                {/* Glint accent */}
                <div className="absolute top-6 right-6 text-[var(--color-brass)] text-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-y-4 group-hover:translate-y-0">
                  ✦
                </div>

                <div className="transform transition-transform duration-500 group-hover:-translate-y-2">
                  {speaker.title && (
                    <span className="inline-block px-3 py-1 mb-3 text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--color-brass)] bg-black/40 backdrop-blur-md rounded-full border border-[var(--color-brass)]/20 shadow-[0_0_10px_rgba(212,175,55,0.2)]">
                      {speaker.title}
                    </span>
                  )}
                  
                  <h3 className="text-2xl font-bold text-white leading-tight mb-1 drop-shadow-md">
                    {speaker.name}
                  </h3>
                  
                  {speaker.name_ml && (
                    <p className="text-sm text-white/70 mb-3 drop-shadow-md" style={{ fontFamily: "var(--font-malayalam-title)" }}>
                      {speaker.name_ml}
                    </p>
                  )}

                  {/* Expandable Bio - Hidden until hover */}
                  <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-in-out">
                    <div className="overflow-hidden">
                      <p className="text-sm text-white/80 mt-2 line-clamp-3 leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                        {speaker.bio}
                      </p>
                      
                      {speakerSessions.length > 0 && (
                        <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200">
                          <p className="text-[10px] text-white/50 font-medium uppercase tracking-wider mb-2">Sessions</p>
                          <div className="flex flex-wrap gap-2">
                            {speakerSessions.map((s) => (
                              <Link
                                key={s.id}
                                href={`/sessions/${s.slug}`}
                                className="text-[10px] px-2.5 py-1 rounded-full bg-[var(--color-turquoise)]/20 text-[var(--color-turquoise)] hover:bg-[var(--color-turquoise)]/40 transition-colors border border-[var(--color-turquoise)]/30 backdrop-blur-sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  haptic("tap");
                                }}
                              >
                                {s.title.length > 25 ? s.title.slice(0, 25) + "…" : s.title}
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
