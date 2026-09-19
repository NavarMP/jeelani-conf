"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useTranslations } from "next-intl";
import { Landmark, Palette, BookOpenCheck, UsersRound, Mail } from "lucide-react";
import { FaFacebookF, FaInstagram, FaThreads } from "react-icons/fa6";
import { useSectionEnterHaptic } from "@/hooks/useHaptics";

export function SUHBASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const t = useTranslations("AboutPage.suhba");
  useSectionEnterHaptic(isInView);

  const focusAreas = [
    {
      icon: Landmark,
      title: t("focus1Title"),
      desc: t("focus1Desc"),
      accentColor: "var(--color-navy)",
    },
    {
      icon: Palette,
      title: t("focus2Title"),
      desc: t("focus2Desc"),
      accentColor: "var(--color-turquoise)",
    },
    {
      icon: BookOpenCheck,
      title: t("focus3Title"),
      desc: t("focus3Desc"),
      accentColor: "var(--color-brass)",
    },
    {
      icon: UsersRound,
      title: t("focus4Title"),
      desc: t("focus4Desc"),
      accentColor: "var(--color-rose)",
    },
  ];

  return (
    <section id="about-suhba" className="relative py-20 md:py-28" ref={ref}>
      <div className="container-site">
        {/* Section header */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
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
          <p className="text-[var(--color-turquoise)] text-sm font-medium mt-1">
            {t("fullName")}
          </p>
          <p className="text-[var(--text-muted)] text-xs mt-1 italic">
            {t("tagline")}
          </p>
        </motion.div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-[var(--text-secondary)] text-sm md:text-base leading-relaxed text-center max-w-2xl mx-auto mb-12"
        >
          {t("description")}
        </motion.p>

        {/* Focus Areas - Interactive hover cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
          {focusAreas.map((area, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
              className="group relative p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] hover:shadow-lg transition-all duration-300 overflow-hidden cursor-default"
            >
              {/* Hover accent line */}
              <div
                className="absolute top-0 left-0 right-0 h-[3px] scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"
                style={{ backgroundColor: area.accentColor }}
              />

              {/* Icon */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300"
                style={{ backgroundColor: `color-mix(in srgb, ${area.accentColor} 10%, transparent)` }}
              >
                <area.icon
                  className="w-6 h-6"
                  style={{ color: area.accentColor }}
                  strokeWidth={1.5}
                />
              </div>

              {/* Text */}
              <h3 className="font-semibold text-[var(--text-primary)] text-sm mb-2">
                {area.title}
              </h3>
              <p className="text-[var(--text-muted)] text-xs leading-relaxed">
                {area.desc}
              </p>

              {/* Hover glow */}
              <div
                className="absolute -bottom-8 -right-8 w-24 h-24 rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-500 blur-2xl"
                style={{ backgroundColor: area.accentColor }}
              />
            </motion.div>
          ))}
        </div>

        {/* Social Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="flex justify-center gap-6 mt-12"
        >
          <a href="mailto:suhba313@gmail.com" aria-label="Email" className="text-[var(--text-muted)] hover:text-[var(--color-turquoise)] transition-colors">
            <Mail className="w-5 h-5" />
          </a>
          <a href="https://www.facebook.com/p/SUHBA_Alathurpadi_Dars-100089424082394/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-[var(--text-muted)] hover:text-[var(--color-turquoise)] transition-colors">
            <FaFacebookF className="w-5 h-5" />
          </a>
          <a href="https://www.instagram.com/suhba_alathurpadidars/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-[var(--text-muted)] hover:text-[var(--color-turquoise)] transition-colors">
            <FaInstagram className="w-5 h-5" />
          </a>
          <a href="https://www.threads.com/@suhba_alathurpadidars" target="_blank" rel="noopener noreferrer" aria-label="Threads" className="text-[var(--text-muted)] hover:text-[var(--color-turquoise)] transition-colors">
            <FaThreads className="w-5 h-5" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
