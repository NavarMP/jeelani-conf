"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { ChevronRight, ChevronDown } from "lucide-react";

export function AboutHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("AboutPage.hero");

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  // Golden celestial glints - identical to homepage Opening
  const [glints] = useState(() =>
    Array.from({ length: 6 }, (_, i) => ({
      top: 15 + Math.random() * 60,
      left: 10 + Math.random() * 80,
      size: 8 + Math.random() * 14,
      duration: 3 + Math.random() * 2,
      delay: i * 0.8,
    }))
  );

  return (
    <section
      ref={containerRef}
      className="relative min-h-[75dvh] md:min-h-[85dvh] flex items-center justify-center overflow-hidden"
    >
      {/* ── Background: Continuous canvas matching homepage Opening ── */}
      <div
        className="absolute inset-0 -z-10 pointer-events-none"
        style={{
          background: `linear-gradient(180deg,
            var(--color-navy) 0%,
            color-mix(in srgb, var(--color-navy) 84%, var(--color-turquoise)) 24%,
            color-mix(in srgb, var(--color-navy) 45%, var(--surface)) 55%,
            var(--surface) 80%,
            var(--surface) 100%)`,
        }}
        aria-hidden="true"
      />

      {/* Shared arabesque tile pattern motif */}
      <div
        className="absolute inset-0 -z-10 opacity-[0.045] pointer-events-none"
        style={{
          backgroundImage: "url('/motifs/arabesque-tile-pattern.svg')",
          backgroundRepeat: "repeat",
          backgroundSize: "140px 140px",
        }}
        aria-hidden="true"
      />

      {/* Floating celestial glints */}
      {glints.map((g, i) => (
        <motion.div
          key={i}
          className="absolute text-[var(--color-brass)] pointer-events-none"
          style={{
            top: `${g.top}%`,
            left: `${g.left}%`,
            fontSize: `${g.size}px`,
          }}
          animate={{ opacity: [0, 0.65, 0], scale: [0.5, 1.1, 0.5], rotate: [0, 180] }}
          transition={{ duration: g.duration, repeat: Infinity, delay: g.delay, ease: "easeInOut" }}
          aria-hidden="true"
        >
          ✦
        </motion.div>
      ))}

      {/* Content */}
      <motion.div
        className="relative z-10 text-center px-6 max-w-3xl mx-auto pt-8 pb-14"
        style={{ y: contentY, opacity }}
      >
        {/* Breadcrumb */}
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex items-center justify-center gap-1.5 text-xs text-white/60 mb-6"
          aria-label="Breadcrumb"
        >
          <Link href="/" className="hover:text-white transition-colors">
            {t("breadcrumbHome")}
          </Link>
          <ChevronRight className="w-3 h-3 text-white/40" />
          <span className="text-[var(--color-brass)] font-medium">{t("breadcrumbAbout")}</span>
        </motion.nav>

        {/* Dars Typography Motif */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mb-5"
        >
          <Image
            src="/dars-typo.svg"
            alt="الدرس بجامع النور بادري"
            width={260}
            height={55}
            className="w-[160px] md:w-[220px] h-auto mx-auto invert opacity-90 drop-shadow-sm"
          />
        </motion.div>

        {/* Eyebrow */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mb-3"
        >
          <span className="text-[var(--color-brass)] text-xs md:text-sm font-medium tracking-[0.2em] uppercase">
            ✦ &nbsp; {t("eyebrow")} &nbsp; ✦
          </span>
        </motion.div>

        {/* Main heading */}
        <motion.h1
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight"
          style={{ fontFamily: "var(--font-bodoni-moda)" }}
        >
          {t("heading")}
        </motion.h1>

        {/* Ornamental divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="flex items-center justify-center gap-3 my-6"
        >
          <div className="h-[1px] w-20 bg-gradient-to-r from-transparent to-[var(--color-brass)]" />
          <span className="text-[var(--color-brass)] text-xs">✦</span>
          <div className="h-[1px] w-20 bg-gradient-to-l from-transparent to-[var(--color-brass)]" />
        </motion.div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="text-white/80 text-sm md:text-base leading-relaxed max-w-2xl mx-auto"
        >
          {t("description")}
        </motion.p>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.5 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 pointer-events-none"
      >
        <span className="text-white/50 text-[10px] tracking-widest uppercase font-medium">
          {t("scrollDown")}
        </span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="w-4 h-4 text-[var(--color-brass)]" />
        </motion.div>
      </motion.div>
    </section>
  );
}
