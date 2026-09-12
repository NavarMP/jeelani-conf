"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export function About() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const paragraphs = [
    "The Jeelani Conference is a commemorative, academic, and spiritual assembly organized to honor the life, teachings, and enduring legacy of the revered 12th-century scholar and Sufi master, Shaykh ʿAbd al-Qādir al-Jīlānī.",
    "Moving beyond a conventional devotional gathering, it serves as a dynamic forum that unites sacred tradition, scholastic discourse, and student research — emphasizing inner purification (tasawwuf) alongside orthodox scholarship.",
    "The event draws its creative inspiration from the Ottoman and Persian arabesque tilework adorning Shaykh Jīlānī's shrine in Baghdad. Following the Ottoman conquest of Baghdad in 1534, these artisans adorned the shrine with turquoise-and-cobalt geometric patterns that became a visual language of spiritual devotion.",
    "Just as the arabesque travelled across regions, cultures, and generations while retaining its essential identity, the teachings of Shaykh al-Jīlānī transcended geographical boundaries — from Baghdad to the shores of Malabar — inspiring communities across the Muslim world.",
    "Organized by the Alathoorpadi Students Association, the conference connects historical learning with the living Dars tradition, affirming this generation as custodians of a centuries-old knowledge system.",
  ];

  return (
    <section id="about" className="relative py-20 md:py-28 overflow-hidden">
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "url('/motifs/baghdad-rose-ogee.svg')",
          backgroundRepeat: "repeat",
          backgroundSize: "200px 200px",
        }}
        aria-hidden="true"
      />

      <div className="container-site relative z-10" ref={ref}>
        {/* Section header */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="text-[var(--color-turquoise)] text-xs font-semibold tracking-[0.2em] uppercase">
            The Central Idea
          </span>
          <h2
            className="text-3xl md:text-4xl lg:text-5xl font-bold mt-3 text-[var(--text-primary)]"
            style={{ fontFamily: "var(--font-bodoni-moda)" }}
          >
            What Is Jeelani Conference?
          </h2>
        </motion.div>

        {/* Editorial split layout */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left — Dome illustration with pattern */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={isInView ? { x: 0, opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative aspect-square max-w-md mx-auto">
              {/* Pattern frame */}
              <div
                className="absolute inset-0 rounded-2xl opacity-10"
                style={{
                  backgroundImage: "url('/motifs/arabesque-tile-pattern.svg')",
                  backgroundRepeat: "repeat",
                  backgroundSize: "100px 100px",
                }}
                aria-hidden="true"
              />
              {/* Dome stroke illustration */}
              <div className="absolute inset-8 flex items-center justify-center">
                <svg viewBox="0 0 200 180" className="w-full h-full text-[var(--color-navy)] dark:text-[var(--color-turquoise)]" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
                  <path d="M30 140 Q30 60 100 20 Q170 60 170 140"/>
                  <rect x="25" y="140" width="150" height="25" rx="2"/>
                  <path d="M40 165 Q50 150 60 165"/>
                  <path d="M65 165 Q75 150 85 165"/>
                  <path d="M90 165 Q100 150 110 165"/>
                  <path d="M115 165 Q125 150 135 165"/>
                  <path d="M140 165 Q150 150 160 165"/>
                  <line x1="100" y1="20" x2="100" y2="8"/>
                  <circle cx="100" cy="6" r="3"/>
                  <path d="M97 3 Q100 0 103 3"/>
                  <path d="M100 35 Q120 50 110 75 Q100 60 90 75 Q80 50 100 35Z"/>
                  <path d="M70 80 Q85 70 100 80 Q115 70 130 80"/>
                  <path d="M55 110 Q75 95 100 105 Q125 95 145 110"/>
                  <path d="M80 55 L100 45 L120 55 L100 65 Z"/>
                  <path d="M65 85 L85 75 L105 85 L85 95 Z"/>
                  <path d="M95 85 L115 75 L135 85 L115 95 Z"/>
                </svg>
              </div>
              {/* Decorative accent */}
              <div className="absolute -bottom-4 -right-4 w-16 h-16 text-[var(--color-brass)]">
                <svg viewBox="0 0 100 100" fill="currentColor" aria-hidden="true">
                  <path d="M50 0C53.5 20 58 30 70 36.5C80 40 100 42 100 50C100 50 80 52 70 56.5C58 63 53.5 73 50 100C46.5 73 42 63 30 56.5C20 52 0 50 0 50C0 42 20 40 30 36.5C42 30 46.5 20 50 0Z"/>
                </svg>
              </div>
            </div>
          </motion.div>

          {/* Right — Narrative copy with scroll-triggered reveal */}
          <div className="space-y-5">
            {paragraphs.map((text, i) => (
              <motion.p
                key={i}
                initial={{ y: 20, opacity: 0 }}
                animate={isInView ? { y: 0, opacity: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.15 }}
                className="text-[var(--text-secondary)] leading-relaxed text-base md:text-lg"
              >
                {text}
              </motion.p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
