"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useTranslations } from "next-intl";
import { BookOpen, Newspaper, CalendarDays, HeartHandshake } from "lucide-react";
import { FaYoutube, FaInstagram, FaXTwitter } from "react-icons/fa6";
import { useSectionEnterHaptic } from "@/hooks/useHaptics";

export function ADSASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const t = useTranslations("AboutPage.adsa");
  useSectionEnterHaptic(isInView);

  const activities = [
    {
      icon: BookOpen,
      title: t("activity1Title"),
      desc: t("activity1Desc"),
      gradient: "from-[var(--color-navy)] to-[var(--color-turquoise)]",
    },
    {
      icon: Newspaper,
      title: t("activity2Title"),
      desc: t("activity2Desc"),
      gradient: "from-[var(--color-turquoise)] to-[var(--color-navy)]",
    },
    {
      icon: CalendarDays,
      title: t("activity3Title"),
      desc: t("activity3Desc"),
      gradient: "from-[var(--color-brass)] to-[var(--color-rose)]",
    },
    {
      icon: HeartHandshake,
      title: t("activity4Title"),
      desc: t("activity4Desc"),
      gradient: "from-[var(--color-rose)] to-[var(--color-navy)]",
    },
  ];

  return (
    <section id="about-adsa" className="relative py-20 md:py-28" ref={ref}>
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

        {/* Activities grid */}
        <div className="grid sm:grid-cols-2 gap-5 max-w-4xl mx-auto mb-12">
          {activities.map((activity, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 25, scale: 0.97 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
              className="group p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--color-turquoise)]/30 hover:shadow-md transition-all"
            >
              <div className="flex items-start gap-4">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${activity.gradient} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-sm`}>
                  <activity.icon className="w-5 h-5 text-white" strokeWidth={1.75} />
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--text-primary)] text-sm mb-1">
                    {activity.title}
                  </h3>
                  <p className="text-[var(--text-muted)] text-xs leading-relaxed">
                    {activity.desc}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Publications showcase */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          <span className="text-[var(--text-muted)] text-xs font-semibold uppercase tracking-wider">
            {t("publicationsHeading")}:
          </span>
          {[
            { label: t("pub1"), href: "https://darshanammagazine.com/" },
            { label: t("pub2"), href: "https://alzahra.in/" },
          ].map((pub, i) => (
            <a
              key={i}
              href={pub.href}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-1.5 rounded-full text-xs font-medium border border-[var(--color-brass)]/30 text-[var(--color-brass)] bg-[var(--color-brass)]/5 hover:bg-[var(--color-brass)]/15 transition-colors"
            >
              {pub.label}
            </a>
          ))}
        </motion.div>

        {/* Social Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="flex justify-center gap-6 mt-10"
        >
          <a href="https://www.youtube.com/@alathurpadidars" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="text-[var(--text-muted)] hover:text-[var(--color-turquoise)] transition-colors">
            <FaYoutube className="w-5 h-5" />
          </a>
          <a href="https://www.instagram.com/alathurpadi_dars" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-[var(--text-muted)] hover:text-[var(--color-turquoise)] transition-colors">
            <FaInstagram className="w-5 h-5" />
          </a>
          <a href="https://x.com/ALATHURPADARS" target="_blank" rel="noopener noreferrer" aria-label="X" className="text-[var(--text-muted)] hover:text-[var(--color-turquoise)] transition-colors">
            <FaXTwitter className="w-5 h-5" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
