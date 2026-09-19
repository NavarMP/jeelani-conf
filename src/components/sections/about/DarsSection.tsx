"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { GraduationCap, Users, Award, Calendar, Home, BookOpen, ExternalLink } from "lucide-react";
import { useSectionEnterHaptic } from "@/hooks/useHaptics";

/** Animated counter that counts from 0 to the target number */
function CountUp({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let frame: number;
    const duration = 2000;
    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setCount(Math.floor(eased * target));
      if (progress < 1) frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [isInView, target]);

  return <span ref={ref}>{count}{suffix}</span>;
}

const timelineItems = [
  { year: "1800s", key: "timeline1800" as const, color: "var(--color-turquoise)" },
  { year: "1886", key: "timeline1886" as const, color: "var(--color-navy)" },
  { year: "1900s", key: "timelineScholars" as const, color: "var(--color-rose)" },
  { year: "2000", key: "timeline2000" as const, color: "var(--color-brass)" },
  { year: "Today", key: "timelinePresent" as const, color: "var(--color-turquoise)" },
];

export function DarsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const t = useTranslations("AboutPage.dars");
  useSectionEnterHaptic(isInView);

  const stats = [
    { value: 200, suffix: "+", label: t("statsStudentsLabel"), icon: Users },
    { value: 23, suffix: "", label: t("statsRanksLabel"), icon: Award },
    { value: 12, suffix: "", label: t("statsFirstRanksLabel"), icon: GraduationCap },
    { value: 100, suffix: "+", label: t("statsYearsLabel"), icon: Calendar },
  ];

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <section id="about-dars" className="relative py-20 md:py-28" ref={ref}>
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
        </motion.div>

        {/* Main content: Image + Intro */}
        <div className="grid lg:grid-cols-2 gap-10 max-w-6xl mx-auto mb-16">
          {/* Image */}
          <motion.div
            initial={{ x: -40, opacity: 0 }}
            animate={isInView ? { x: 0, opacity: 1 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative rounded-2xl overflow-hidden shadow-lg group"
          >
            <div className="aspect-[16/10] relative">
              <Image
                src="/about/dars.jpg"
                alt="Alathurpadi Dars & Juma Masjid"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            </div>
            <div className="absolute bottom-4 left-4 right-4">
              <p className="text-white/90 text-xs font-medium">
                Alathurpadi Dars & Juma Masjid
              </p>
              <p className="text-white/50 text-[10px] mt-0.5">
                Alathurpadi, Melmuri, Malappuram
              </p>
            </div>
          </motion.div>

          {/* Text + What is a Dars? */}
          <motion.div
            initial={{ x: 40, opacity: 0 }}
            animate={isInView ? { x: 0, opacity: 1 } : {}}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col justify-center"
          >
            <p className="text-[var(--text-secondary)] text-sm md:text-base leading-relaxed mb-6">
              {t("intro")}
            </p>

            {/* What is a Dars? Card */}
            <div className="rounded-2xl border border-[var(--color-turquoise)]/20 bg-[var(--color-turquoise)]/5 dark:bg-[var(--color-turquoise)]/8 p-5 md:p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-[var(--color-turquoise)]/15 flex items-center justify-center text-[var(--color-turquoise)]">
                  <BookOpen className="w-4.5 h-4.5" strokeWidth={1.75} />
                </div>
                <h3 className="font-semibold text-[var(--text-primary)] text-sm">
                  {t("whatIsDars")}
                </h3>
              </div>
              <p className="text-[var(--text-secondary)] text-xs leading-relaxed mb-2">
                {t("darsDefinition")}
              </p>
              <p className="text-[var(--text-muted)] text-xs leading-relaxed">
                {t("darsFocus")}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Stats grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-16"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              className="text-center p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--color-brass)]/30 hover:shadow-md transition-all group"
            >
              <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-[var(--color-navy)]/8 dark:bg-[var(--color-navy)]/20 flex items-center justify-center text-[var(--color-navy)] dark:text-[var(--color-turquoise)] group-hover:scale-110 transition-transform">
                <stat.icon className="w-5 h-5" strokeWidth={1.75} />
              </div>
              <p className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tabular-nums">
                {isInView ? <CountUp target={stat.value} suffix={stat.suffix} /> : "0"}
              </p>
              <p className="text-[var(--text-muted)] text-xs mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* History + Timeline */}
        <div className="grid lg:grid-cols-2 gap-10 max-w-6xl mx-auto mb-14">
          {/* History text */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h3
              className="text-xl md:text-2xl font-bold text-[var(--text-primary)] mb-4"
              style={{ fontFamily: "var(--font-bodoni-moda)" }}
            >
              {t("historyHeading")}
            </h3>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-4">
              {t("historyP1")}
            </p>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-6">
              {t("historyP2")}
            </p>

            {/* Academic Programme Card */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-[var(--color-brass)]/15 flex items-center justify-center text-[var(--color-brass)]">
                  <GraduationCap className="w-4.5 h-4.5" strokeWidth={1.75} />
                </div>
                <h4 className="font-semibold text-[var(--text-primary)] text-sm">
                  {t("programHeading")}
                </h4>
              </div>
              <p className="text-[var(--text-secondary)] text-xs leading-relaxed">
                {t("programDesc")}
              </p>
            </div>
          </motion.div>

          {/* Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <h3 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-6">
              {t("timelineTitle")}
            </h3>
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-[18px] top-2 bottom-2 w-[2px] bg-gradient-to-b from-[var(--color-turquoise)] via-[var(--color-navy)] to-[var(--color-brass)]" />

              <div className="space-y-6">
                {timelineItems.map((item, i) => (
                  <motion.div
                    key={item.year}
                    initial={{ opacity: 0, x: 20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.4, delay: 0.6 + i * 0.12 }}
                    className="flex items-start gap-4 group"
                  >
                    {/* Dot */}
                    <div className="relative z-10 shrink-0">
                      <div
                        className="w-[38px] h-[38px] rounded-full border-2 flex items-center justify-center bg-[var(--surface)] group-hover:scale-110 transition-transform"
                        style={{ borderColor: item.color }}
                      >
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="pt-1.5">
                      <span
                        className="text-xs font-bold tracking-wider"
                        style={{ color: item.color }}
                      >
                        {item.year}
                      </span>
                      <p className="text-[var(--text-secondary)] text-sm mt-0.5">
                        {t(item.key)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Wikipedia link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="text-center"
        >
          <a
            href="https://en.wikipedia.org/wiki/Alathurpadi_Dars"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs text-[var(--color-turquoise)] hover:text-[var(--hover-turquoise)] font-medium transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            {t("wikiLink")}
          </a>
        </motion.div>
      </div>
    </section>
  );
}
