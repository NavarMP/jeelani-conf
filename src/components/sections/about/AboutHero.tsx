"use client";

import { useRef } from "react";
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

  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-[70dvh] md:min-h-[80dvh] flex items-center justify-center overflow-hidden"
    >
      {/* Background layers */}
      <motion.div className="absolute inset-0 z-0" style={{ y: bgY }}>
        {/* Deep navy gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a2544] via-[var(--color-navy)] to-[#0d3160]" />

        {/* Arabesque pattern overlay */}
        <div className="absolute inset-0 opacity-[0.06]">
          <Image
            src="/about/arabesque-pattern.jpg"
            alt=""
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Radial glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(33,142,182,0.15)_0%,transparent_70%)]" />

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[var(--surface)] dark:from-[var(--background)] to-transparent" />
      </motion.div>

      {/* Content */}
      <motion.div
        className="relative z-10 text-center px-6 max-w-3xl mx-auto"
        style={{ opacity }}
      >
        {/* Breadcrumb */}
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex items-center justify-center gap-1.5 text-xs text-white/50 mb-8"
          aria-label="Breadcrumb"
        >
          <Link href="/" className="hover:text-white/80 transition-colors">
            {t("breadcrumbHome")}
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[var(--color-brass)]">{t("breadcrumbAbout")}</span>
        </motion.nav>

        {/* Eyebrow */}
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="inline-block text-[var(--color-brass)] text-xs font-semibold tracking-[0.25em] uppercase mb-4"
        >
          {t("eyebrow")}
        </motion.span>

        {/* Main heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.7 }}
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight"
          style={{ fontFamily: "var(--font-bodoni-moda)" }}
        >
          {t("heading")}
        </motion.h1>

        {/* Decorative divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mx-auto mt-6 mb-6 h-[2px] w-24 bg-gradient-to-r from-transparent via-[var(--color-brass)] to-transparent"
        />

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="text-white/70 text-sm md:text-base leading-relaxed max-w-2xl mx-auto"
        >
          {t("description")}
        </motion.p>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
      >
        <span className="text-white/40 text-[10px] tracking-widest uppercase">
          {t("scrollDown")}
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="w-4 h-4 text-white/40" />
        </motion.div>
      </motion.div>
    </section>
  );
}
