"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useTranslations } from "next-intl";
import { GraduationCap, Clock, UserCheck, Sparkles, ArrowRight } from "lucide-react";
import { useSectionEnterHaptic } from "@/hooks/useHaptics";

export function SUFFASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const t = useTranslations("AboutPage.suffa");
  useSectionEnterHaptic(isInView);

  return (
    <section
      id="about-suffa"
      className="relative py-20 md:py-28 overflow-hidden"
      ref={ref}
    >
      {/* Background: Warm gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-brass)]/[0.03] via-transparent to-[var(--color-brass)]/[0.03] dark:from-[var(--color-brass)]/[0.04] dark:to-[var(--color-brass)]/[0.04]" />

      <div className="container-site relative">
        {/* Section header */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="text-[var(--color-brass)] text-xs font-semibold tracking-[0.2em] uppercase">
            {t("eyebrow")}
          </span>
          <h2
            className="text-3xl md:text-4xl font-bold mt-2 text-[var(--text-primary)]"
            style={{ fontFamily: "var(--font-bodoni-moda)" }}
          >
            {t("heading")}
          </h2>
          <p className="text-[var(--color-brass)] text-sm font-medium mt-1">
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

        {/* Featured Initiative: Pre-Dars Course */}
        {/* <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="max-w-3xl mx-auto mb-14"
        >
          <div className="relative rounded-2xl border border-[var(--color-brass)]/30 bg-gradient-to-br from-[var(--color-navy)]/[0.04] to-[var(--color-brass)]/[0.08] dark:from-[var(--color-navy)]/20 dark:to-[var(--color-brass)]/10 p-6 md:p-8 overflow-hidden"> */}
            {/* Glow effect */}
            {/* <div className="absolute -top-20 -right-20 w-40 h-40 bg-[var(--color-brass)]/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-[var(--color-turquoise)]/10 rounded-full blur-3xl" />

            <div className="relative"> */}
              {/* Badge */}
              {/* <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.4, delay: 0.5 }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-brass)]/15 text-[var(--color-brass)] text-[10px] font-semibold tracking-wider uppercase mb-4"
              >
                <Sparkles className="w-3 h-3" />
                {t("initiativeBadge")}
              </motion.div>

              <h3 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">
                {t("initiativeHeading")}
              </h3>
              <h4
                className="text-xl md:text-2xl font-bold text-[var(--text-primary)] mb-4"
                style={{ fontFamily: "var(--font-bodoni-moda)" }}
              >
                {t("initiativeTitle")}
              </h4>
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-6">
                {t("initiativeDesc")}
              </p> */}

              {/* Quick facts */}
              {/* <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-xs">
                  <Clock className="w-3.5 h-3.5 text-[var(--color-turquoise)]" />
                  <span className="text-[var(--text-primary)] font-medium">
                    {t("initiativeDuration")}
                  </span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-xs">
                  <UserCheck className="w-3.5 h-3.5 text-[var(--color-brass)]" />
                  <span className="text-[var(--text-primary)] font-medium">
                    {t("initiativeEligibility")}
                  </span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-xs">
                  <GraduationCap className="w-3.5 h-3.5 text-[var(--color-navy)] dark:text-[var(--color-turquoise)]" />
                  <span className="text-[var(--text-primary)] font-medium">
                    Pre-Dars Foundation
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div> */}

        {/* Community Impact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center max-w-xl mx-auto"
        >
          <h3 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">
            {t("impactHeading")}
          </h3>
          <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
            {t("impactDesc")}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
