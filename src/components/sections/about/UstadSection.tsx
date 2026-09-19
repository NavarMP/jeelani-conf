"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Award, BookMarked, Users2, Star } from "lucide-react";
import { useSectionEnterHaptic } from "@/hooks/useHaptics";

export function UstadSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const t = useTranslations("AboutPage.ustad");
  useSectionEnterHaptic(isInView);

  const credentials = [
    {
      icon: Award,
      title: t("credentialRank"),
      desc: t("credentialRankDesc"),
      color: "var(--color-brass)",
    },
    {
      icon: BookMarked,
      title: t("credentialMudaris"),
      desc: t("credentialMudarisDesc"),
      color: "var(--color-turquoise)",
    },
    {
      icon: Users2,
      title: t("credentialMushawara"),
      desc: t("credentialMushawaraDesc"),
      color: "var(--color-navy)",
    },
  ];

  const teachers = [
    { name: t("teacher1Name"), role: t("teacher1Role") },
    { name: t("teacher2Name"), role: t("teacher2Role") },
    { name: t("teacher3Name"), role: t("teacher3Role") },
    { name: t("teacher4Name"), role: t("teacher4Role") },
  ];

  return (
    <section
      id="about-ustad"
      className="relative py-20 md:py-28 overflow-hidden"
      ref={ref}
    >
      {/* Background: Subtle dark gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-navy)]/[0.03] via-transparent to-[var(--color-navy)]/[0.03] dark:from-white/[0.02] dark:to-white/[0.02]" />

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
        </motion.div>

        {/* Profile section */}
        <div className="grid lg:grid-cols-5 gap-10 max-w-6xl mx-auto mb-16">
          {/* Profile card - 2 columns */}
          <motion.div
            initial={{ x: -40, opacity: 0 }}
            animate={isInView ? { x: 0, opacity: 1 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="relative rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--surface)] shadow-sm">
              {/* Frame image */}
              <div className="aspect-[3/4] relative">
                <Image
                  src="/about/ustad.jpg"
                  alt={t("fullName")}
                  fill
                  className="object-cover object-top"
                />
                {/* Overlay with profile info */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <p className="text-[var(--color-brass)] text-[10px] font-semibold tracking-[0.15em] uppercase mb-1">
                    {t("role")}
                  </p>
                  <h3
                    className="text-white text-lg md:text-xl font-bold leading-tight"
                    style={{ fontFamily: "var(--font-bodoni-moda)" }}
                  >
                    {t("fullName")}
                  </h3>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Bio + Credentials - 3 columns */}
          <motion.div
            initial={{ x: 40, opacity: 0 }}
            animate={isInView ? { x: 0, opacity: 1 } : {}}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="lg:col-span-3 flex flex-col justify-center"
          >
            {/* Bio */}
            <p className="text-[var(--text-secondary)] text-sm md:text-base leading-relaxed mb-4">
              {t("bio1")}
            </p>
            <p className="text-[var(--text-secondary)] text-sm md:text-base leading-relaxed mb-8">
              {t("bio2")}
            </p>

            {/* Credentials */}
            <div className="space-y-4">
              {credentials.map((cred, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.5 + i * 0.1 }}
                  className="flex items-start gap-4 p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:shadow-sm transition-all group"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: `color-mix(in srgb, ${cred.color} 12%, transparent)` }}
                  >
                    <cred.icon className="w-5 h-5" style={{ color: cred.color }} strokeWidth={1.75} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[var(--text-primary)] text-sm">
                      {cred.title}
                    </h4>
                    <p className="text-[var(--text-muted)] text-xs mt-0.5">
                      {cred.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Other Teachers */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <h3 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider text-center mb-6">
            {t("otherTeachers")}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {teachers.map((teacher, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.8 + i * 0.1 }}
                className="text-center p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--color-turquoise)]/30 hover:shadow-sm transition-all"
              >
                {/* Avatar placeholder */}
                <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-gradient-to-br from-[var(--color-navy)] to-[var(--color-turquoise)] flex items-center justify-center">
                  <Star className="w-6 h-6 text-white/40" strokeWidth={1.5} />
                </div>
                <h4 className="font-semibold text-[var(--text-primary)] text-sm">
                  {teacher.name}
                </h4>
                <p className="text-[var(--text-muted)] text-xs mt-1">
                  {teacher.role}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
