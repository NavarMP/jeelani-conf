"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { type Speaker } from "@/lib/data";
import { useTranslations } from "next-intl";
import { haptic } from "@/lib/haptics";
import { useSectionEnterHaptic } from "@/hooks/useHaptics";
import Link from "next/link";

function SpeakerCard({ speaker, index }: { speaker: Speaker; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ 
        duration: 0.7, 
        delay: index * 0.1, 
        type: "spring", 
        stiffness: 100, 
        damping: 20 
      }}
      whileHover={{ y: -10 }}
      onPointerDown={() => haptic("tap")}
      className="group relative flex-shrink-0 w-[260px] md:w-[320px] aspect-[4/5] rounded-[2rem] overflow-hidden cursor-pointer snap-center sm:snap-start shadow-xl"
    >
      {/* Dynamic Glow Shadow behind the card content */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-navy)] via-purple-900 to-[var(--color-turquoise)] opacity-0 group-hover:opacity-40 transition-opacity duration-500 blur-xl"></div>

      {/* Main Card Container */}
      <div className="absolute inset-0 bg-[var(--surface)] border border-[var(--border)] group-hover:border-[var(--color-turquoise)]/50 transition-colors duration-500 z-10 overflow-hidden rounded-[2rem]">
        {/* Background Image */}
        <div className="absolute inset-0 w-full h-full bg-[var(--color-navy)]">
          {speaker.image_url ? (
            <motion.img
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-500"></div>

        {/* Content */}
        <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end">
          {/* Glint accent */}
          <div className="absolute top-6 right-6 text-[var(--color-brass)] text-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-y-4 group-hover:translate-y-0">
            ✦
          </div>

          <motion.div 
            initial={{ y: 20 }}
            whileHover={{ y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative z-20"
          >
            {speaker.title && (
              <span className="inline-block px-3 py-1 mb-3 text-[10px] md:text-xs font-bold uppercase tracking-[0.15em] text-[var(--color-brass)] bg-black/40 backdrop-blur-md rounded-full border border-[var(--color-brass)]/20 shadow-[0_0_10px_rgba(212,175,55,0.2)]">
                {speaker.title}
              </span>
            )}
            
            <h3 className="text-2xl md:text-3xl font-bold text-white leading-tight mb-1 drop-shadow-md">
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
                <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200">
                  <span className="text-[var(--color-turquoise)] text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
                    View Profile 
                    <span className="transform translate-x-0 group-hover:translate-x-1 transition-transform">→</span>
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

export function Speakers({ speakers }: { speakers: Speaker[] }) {
  const ref = useRef(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const t = useTranslations("Speakers");
  useSectionEnterHaptic(isInView);

  // Auto-scroll logic
  useEffect(() => {
    let animationFrameId: number;
    
    const scroll = () => {
      if (!isPaused && scrollRef.current) {
        scrollRef.current.scrollLeft += 1;
        
        // Loop back to start if we reached the end
        if (
          scrollRef.current.scrollLeft + scrollRef.current.clientWidth >=
          scrollRef.current.scrollWidth - 1
        ) {
          scrollRef.current.scrollLeft = 0;
        }
      }
      animationFrameId = requestAnimationFrame(scroll);
    };

    animationFrameId = requestAnimationFrame(scroll);

    return () => cancelAnimationFrame(animationFrameId);
  }, [isPaused]);

  // For parallax background effects
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  return (
    <section id="speakers" className="relative py-24 md:py-32 overflow-hidden bg-[var(--background)]" ref={ref}>
      {/* Decorative Background Elements */}
      <motion.div 
        style={{ y: backgroundY }}
        className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--color-turquoise)]/5 rounded-full blur-[100px] pointer-events-none"
      />
      <motion.div 
        style={{ y: backgroundY }}
        className="absolute bottom-0 left-[-100px] w-[600px] h-[600px] bg-[var(--color-navy)]/5 rounded-full blur-[120px] pointer-events-none"
      />

      <div className="container-site mb-12 md:mb-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          {/* Section header */}
          <motion.div
            initial={{ x: -30, opacity: 0 }}
            animate={isInView ? { x: 0, opacity: 1 } : {}}
            transition={{ duration: 0.8, type: "spring" }}
            className="max-w-2xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-[2px] bg-[var(--color-brass)]"></div>
              <span className="text-[var(--color-brass)] text-xs font-bold tracking-[0.2em] uppercase">
                {t("eyebrow")}
              </span>
            </div>
            <h2
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--text-primary)] leading-tight"
              style={{ fontFamily: "var(--font-bodoni-moda)" }}
            >
              Distinguished <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-turquoise)] to-[var(--color-navy)]">Guests</span>
            </h2>
            <p className="text-[var(--text-secondary)] mt-4 text-base md:text-lg leading-relaxed">
              {t("description")}
            </p>
          </motion.div>

          {/* Optional: View All Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="hidden md:block z-10"
          >
            <Link 
              href="/speakers" 
              className="group relative inline-flex items-center justify-center px-8 py-3 font-semibold text-white bg-[var(--color-navy)] rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(30,58,138,0.3)] hover:shadow-[0_0_30px_rgba(30,58,138,0.5)]"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-br from-[var(--color-turquoise)] to-[var(--color-navy)] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <span className="relative z-10 flex items-center gap-2">
                View All Guests
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </span>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Horizontal Scrolling Marquee / Gallery */}
      <div 
        className="w-full relative"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Left/Right Gradient Fades for depth */}
        <div className="absolute left-0 top-0 bottom-0 w-8 md:w-32 bg-gradient-to-r from-[var(--background)] to-transparent z-10 pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 w-8 md:w-32 bg-gradient-to-l from-[var(--background)] to-transparent z-10 pointer-events-none"></div>

        {/* Scroll Container */}
        <div 
          ref={scrollRef}
          className="flex overflow-x-auto gap-6 md:gap-8 px-8 md:px-32 pb-16 pt-4 hide-scrollbar"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none", scrollBehavior: "auto" }}
        >
          {/* We render the speakers twice for a seamless infinite scroll loop */}
          {[...speakers, ...speakers].map((speaker, i) => (
            <SpeakerCard key={`${speaker.id}-${i}`} speaker={speaker} index={i} />
          ))}
          
          {/* Mobile "View All" card at the end */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="md:hidden flex-shrink-0 w-[260px] aspect-[4/5] rounded-[2rem] border-2 border-dashed border-[var(--border)] flex flex-col items-center justify-center snap-center"
          >
            <Link href="/speakers" className="flex flex-col items-center text-[var(--color-turquoise)] hover:text-[var(--color-navy)] transition-colors">
              <span className="w-12 h-12 rounded-full bg-[var(--color-turquoise)]/10 flex items-center justify-center mb-3">
                →
              </span>
              <span className="font-semibold tracking-wide uppercase text-sm">View All</span>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Global Style for hiding scrollbar */}
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}} />
    </section>
  );
}
