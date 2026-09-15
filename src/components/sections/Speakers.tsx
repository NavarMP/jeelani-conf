"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { type Speaker } from "@/lib/data";
import { useTranslations } from "next-intl";

function SpeakerCard({ speaker, index }: { speaker: Speaker; index: number }) {
  return (
    <motion.div
      initial={{ y: 30, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="group text-center"
    >
      {/* Scalloped-seal photo frame */}
      <div className="relative w-28 h-28 md:w-32 md:h-32 mx-auto mb-3">
        <div
          className="w-full h-full rounded-full bg-gradient-to-br from-[var(--color-navy)] to-[var(--color-turquoise)] flex items-center justify-center border-2 border-[var(--color-turquoise)]/20 group-hover:border-[var(--color-brass)]/40 transition-all group-hover:shadow-lg group-hover:shadow-[var(--color-turquoise)]/10 overflow-hidden"
          style={{
            clipPath:
              "polygon(50% 0%, 61% 5%, 72% 2%, 80% 10%, 90% 8%, 95% 18%, 100% 25%, 98% 37%, 100% 50%, 98% 63%, 100% 75%, 95% 82%, 90% 92%, 80% 90%, 72% 98%, 61% 95%, 50% 100%, 39% 95%, 28% 98%, 20% 90%, 10% 92%, 5% 82%, 0% 75%, 2% 63%, 0% 50%, 2% 37%, 0% 25%, 5% 18%, 10% 8%, 20% 10%, 28% 2%, 39% 5%)",
          }}
        >
          {speaker.image_url ? (
            <img
              src={speaker.image_url}
              alt={speaker.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <svg viewBox="0 0 80 80" className="w-16 h-16 text-white/30" fill="currentColor" aria-hidden="true">
              <circle cx="40" cy="28" r="14" />
              <path d="M15 72 Q15 50 40 45 Q65 50 65 72 Z" />
            </svg>
          )}
        </div>
        {/* Glint accent */}
        <div className="absolute -top-1 -right-1 text-[var(--color-brass)] text-xs opacity-0 group-hover:opacity-100 transition-opacity">
          ✦
        </div>
      </div>

      {/* Name & title */}
      <div>
        <h3 className="text-sm font-semibold text-[var(--text-primary)] leading-snug mt-0.5">
          {speaker.name}
        </h3>
        {speaker.name_ml && (
          <p className="text-[10px] text-[var(--text-muted)] mt-0.5" style={{ fontFamily: "var(--font-noto-sans-malayalam)" }}>
            {speaker.name_ml}
          </p>
        )}
        <p className="text-xs text-[var(--text-muted)] mt-1 line-clamp-2 max-w-[180px] mx-auto">
          {speaker.bio ? `${speaker.bio.split(".")[0]}.` : speaker.title}
        </p>
      </div>
    </motion.div>
  );
}

export function Speakers({ speakers }: { speakers: Speaker[] }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const t = useTranslations("Speakers");

  return (
    <section id="speakers" className="relative py-20 md:py-28 bg-[var(--surface)]" ref={ref}>
      <div className="container-site">
        {/* Section header */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
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
          <p className="text-[var(--text-secondary)] mt-3 max-w-lg mx-auto text-sm">
            {t("description")}
          </p>
        </motion.div>

        {/* Speakers grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8 md:gap-10">
          {speakers.map((speaker, i) => (
            <SpeakerCard key={speaker.id} speaker={speaker} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
