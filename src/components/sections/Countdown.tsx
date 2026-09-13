"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useTranslations } from "next-intl";

function getTimeRemaining(targetDate: string) {
  const total = new Date(targetDate).getTime() - Date.now();
  if (total <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
  return {
    days: Math.floor(total / (1000 * 60 * 60 * 24)),
    hours: Math.floor((total / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((total / (1000 * 60)) % 60),
    seconds: Math.floor((total / 1000) % 60),
    total,
  };
}

function CountdownDigit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <div className="bg-[var(--color-navy)] dark:bg-[var(--surface-elevated)] rounded-xl px-4 py-3 md:px-6 md:py-4 min-w-[64px] md:min-w-[80px] text-center border border-[var(--color-turquoise)]/20 shadow-lg">
          <span
            className="text-3xl md:text-5xl font-bold text-[var(--color-brass)] tabular-nums"
            style={{ fontFamily: "var(--font-bodoni-moda)" }}
          >
            {String(value).padStart(2, "0")}
          </span>
        </div>
        {/* Glint on corners */}
        <span className="absolute -top-1 -right-1 text-[var(--color-brass)] text-[8px] opacity-50">✦</span>
      </div>
      <span className="text-xs text-[var(--text-muted)] mt-2 uppercase tracking-wider font-medium">{label}</span>
    </div>
  );
}

export function Countdown({ targetDate }: { targetDate: string }) {
  const [time, setTime] = useState(getTimeRemaining(targetDate));
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const t = useTranslations("Countdown");

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(getTimeRemaining(targetDate));
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  const calendarTitle = encodeURIComponent("Grand Jeelani Conference");
  const calendarDetails = encodeURIComponent("From Baghdad to Malabar — Persian Artistry. Malabar Soul. At Alathoorpadi, Melmuri.");
  const calendarLocation = encodeURIComponent("Alathoorpadi, Melmuri, Kerala");
  const startISO = "20260927T043000Z"; // 10:00 AM IST in UTC
  const endISO = "20260927T163000Z";   // 10:00 PM IST in UTC
  const googleCalUrl = `https://calendar.google.com/calendar/r/eventedit?text=${calendarTitle}&dates=${startISO}/${endISO}&details=${calendarDetails}&location=${calendarLocation}`;

  return (
    <section id="countdown" className="relative py-16 md:py-24 bg-[var(--surface)]" ref={ref}>
      <div className="container-site text-center">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="text-[var(--color-turquoise)] text-xs font-semibold tracking-[0.2em] uppercase">
            {t("eyebrow")}
          </span>
          <h2
            className="text-2xl md:text-3xl font-bold mt-2 mb-8 text-[var(--text-primary)]"
            style={{ fontFamily: "var(--font-bodoni-moda)" }}
          >
            {t("heading")}
          </h2>
        </motion.div>

        {/* Countdown digits */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex items-center justify-center gap-3 md:gap-5 mb-10"
        >
          <CountdownDigit value={time.days} label={t("days")} />
          <span className="text-2xl text-[var(--color-turquoise)] font-bold mt-[-1rem]">:</span>
          <CountdownDigit value={time.hours} label={t("hours")} />
          <span className="text-2xl text-[var(--color-turquoise)] font-bold mt-[-1rem]">:</span>
          <CountdownDigit value={time.minutes} label={t("min")} />
          <span className="text-2xl text-[var(--color-turquoise)] font-bold mt-[-1rem]">:</span>
          <CountdownDigit value={time.seconds} label={t("sec")} />
        </motion.div>

        {/* Add to calendar buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-3"
        >
          <a
            href={googleCalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium bg-[var(--color-navy)] text-white hover:bg-[var(--color-navy)]/90 transition-all"
          >
            📅 {t("addGoogle")}
          </a>
          <a
            href="/api/calendar"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium border border-[var(--border-strong)] text-[var(--text-primary)] hover:bg-[var(--surface-elevated)] transition-all"
          >
            📅 {t("downloadIcs")}
          </a>
        </motion.div>
      </div>
    </section>
  );
}
