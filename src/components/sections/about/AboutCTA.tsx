"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight, ExternalLink, Home } from "lucide-react";
import { Magnetic } from "@/components/ui/Magnetic";
import { useSectionEnterHaptic } from "@/hooks/useHaptics";

export function AboutCTA() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const t = useTranslations("AboutPage.cta");
  useSectionEnterHaptic(isInView);

  return (
    <section
      id="about-cta"
      className="relative py-24 md:py-32 overflow-hidden"
      ref={ref}
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-navy)] via-[#0d3160] to-[var(--color-black)]" />

      {/* Arabesque pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: "url('/motifs/arabesque-tile-pattern.svg')",
          backgroundRepeat: "repeat",
          backgroundSize: "140px 140px",
        }}
        aria-hidden="true"
      />

      {/* Decorative accent lines */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--color-brass)]/40 to-transparent" />

      {/* Radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,200,0,0.08)_0%,transparent_60%)]" />

      {/* Content */}
      <div className="container-site relative z-10 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4"
          style={{ fontFamily: "var(--font-bodoni-moda)" }}
        >
          {t("heading")}
        </motion.h2>

        {/* Decorative divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : {}}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="mx-auto mb-6 h-[2px] w-20 bg-gradient-to-r from-transparent via-[var(--color-brass)] to-transparent"
        />

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-white/60 text-sm md:text-base leading-relaxed max-w-lg mx-auto mb-10"
        >
          {t("description")}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Magnetic pattern="select">
            <Link
              href="/#register"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-sm font-semibold bg-[var(--color-brass)] text-[var(--color-black)] hover:bg-[var(--hover-brass)] transition-all hover:shadow-lg hover:shadow-[var(--color-brass)]/20 active:scale-95"
            >
              {t("registerBtn")}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Magnetic>

          <Magnetic pattern="tap">
            <a
              href="https://alathurpadidars.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-sm font-medium border border-white/20 text-white/80 hover:bg-white/10 hover:text-white transition-all active:scale-95"
            >
              {t("visitWebsite")}
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </Magnetic>

          <Magnetic pattern="tap">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-sm font-medium text-white/50 hover:text-white/80 transition-all active:scale-95"
            >
              <Home className="w-3.5 h-3.5" />
              {t("backToHome")}
            </Link>
          </Magnetic>
        </motion.div>
      </div>
    </section>
  );
}
