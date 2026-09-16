"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { CalendarPlus } from "lucide-react";
import { Magnetic } from "@/components/ui/Magnetic";
import { useSectionEnterHaptic } from "@/hooks/useHaptics";

/**
 * Opening — the first act of the site, told as one unbroken canvas.
 *
 * Hero, About, and Countdown used to be three stacked sections, each with
 * its own background and a hard cut between them. Here they share a single
 * relatively-positioned container with one continuous background gradient
 * (drawn once, not re-triggered by scroll) and one shared pattern/thread
 * behind all three, so scrolling from the title card into the story and
 * into the countdown reads as one motion rather than three page loads.
 */
export function Opening({ targetDate }: { targetDate: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef(null);
  const countdownRef = useRef(null);

  const aboutInView = useInView(aboutRef, { once: true, margin: "-100px" });
  const countdownInView = useInView(countdownRef, { once: true, margin: "-50px" });
  useSectionEnterHaptic(aboutInView);
  useSectionEnterHaptic(countdownInView);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });
  
  const tHero = useTranslations("Hero");
  const tAbout = useTranslations("About");
  const tCountdown = useTranslations("Countdown");
  const locale = useLocale();

  const wordmarkSrc = locale === "ar" ? "/wordmark-ar.svg" : locale === "ml" ? "/wordmark-ml.svg" : "/wordmark-en.svg";
  const paragraphs = [tAbout("p1"), tAbout("p2"), tAbout("p3"), tAbout("p4"), tAbout("p5")];

  const calendarTitle = encodeURIComponent("Grand Jeelani Conference");
  const calendarDetails = encodeURIComponent("From Baghdad to Malabar — Persian Artistry. Malabar Soul. At Alathurpadi, Melmuri.");
  const calendarLocation = encodeURIComponent("Alathurpadi, Melmuri, Kerala");
  const googleCalUrl = `https://calendar.google.com/calendar/r/eventedit?text=${calendarTitle}&dates=20260927T043000Z/20260927T163000Z&details=${calendarDetails}&location=${calendarLocation}`;

  // Computed once via useState's lazy initializer (the sanctioned place for
  // one-time non-deterministic setup) rather than on every render, so the
  // glints don't jump to new positions on unrelated re-renders.
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
    <div ref={containerRef} id="opening" className="relative">
      {/* ── One continuous background for the whole opening act ── */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: `linear-gradient(180deg,
            var(--color-navy) 0%,
            color-mix(in srgb, var(--color-navy) 84%, var(--color-turquoise)) 22%,
            color-mix(in srgb, var(--color-navy) 45%, var(--surface)) 40%,
            var(--surface) 50%,
            var(--surface) 100%)`,
        }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 -z-10 opacity-[0.045]"
        style={{
          backgroundImage: "url('/motifs/arabesque-tile-pattern.svg')",
          backgroundRepeat: "repeat",
          backgroundSize: "140px 140px",
        }}
        aria-hidden="true"
      />

      {/* ══════════════════ HERO ══════════════════ */}
      <section id="hero" className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden">
        {glints.map((g, i) => (
          <motion.div
            key={i}
            className="absolute text-[var(--color-brass)]"
            style={{
              top: `${g.top}%`,
              left: `${g.left}%`,
              fontSize: `${g.size}px`,
            }}
            animate={{ opacity: [0, 0.6, 0], scale: [0.5, 1, 0.5], rotate: [0, 180] }}
            transition={{ duration: g.duration, repeat: Infinity, delay: g.delay, ease: "easeInOut" }}
            aria-hidden="true"
          >
            ✦
          </motion.div>
        ))}

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3, duration: 0.6 }} className="mb-6">
            <Image src="/dars-typo.svg" alt="الدرس بجامع النور بادري" width={300} height={60} className="w-[180px] md:w-[260px] h-auto mx-auto invert opacity-100" />
          </motion.div>

          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }} className="mb-6">
            <div className="inline-block rounded-lg px-8 py-5 md:px-12 md:py-7" style={{ clipPath: "url(#scallopClip)" }}>
              <Image src={wordmarkSrc} alt="Grand Jeelani Conference" width={400} height={140} priority className="w-[220px] md:w-[320px] lg:w-[380px] h-auto invert brightness-200" />
            </div>
          </motion.div>

          <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5, duration: 0.6 }} className="text-[var(--color-brass)] text-sm md:text-base font-medium tracking-[0.15em] uppercase mb-4">
            {tHero("tagline")}
          </motion.p>

          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.7, duration: 0.6 }} className="mb-8">
            <p className="text-white/90 text-lg md:text-xl font-semibold" style={{ fontFamily: "var(--font-bodoni-moda)" }}>
              {tHero("date")}
            </p>
            <p className="text-white/60 text-sm mt-1">{tHero("venue")}</p>
          </motion.div>

          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.9, duration: 0.6 }} className="flex flex-wrap items-center justify-center gap-3">
            <Magnetic pattern="select">
              <Link href="/#register" className="inline-flex items-center px-7 py-3 rounded-full text-sm font-semibold bg-[var(--color-brass)] text-[var(--color-black)] hover:bg-[var(--hover-brass)] transition-colors hover:shadow-lg hover:shadow-[var(--color-brass)]/25">
                {tHero("registerNow")}
              </Link>
            </Magnetic>
            <Magnetic pattern="tap">
              <Link href="/#schedule" className="inline-flex items-center px-7 py-3 rounded-full text-sm font-semibold bg-white/10 text-white border border-white/20 hover:bg-white/15 backdrop-blur-sm transition-colors">
                {tHero("viewSchedule")}
              </Link>
            </Magnetic>
            <Magnetic pattern="tap">
              <Link href="/live" className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-sm font-semibold bg-white/5 text-white/80 border border-white/10 hover:bg-white/10 backdrop-blur-sm transition-colors">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                {tHero("watchLive")}
              </Link>
            </Magnetic>
          </motion.div>
        </div>

        <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2" animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
          <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-1.5">
            <motion.div className="w-1.5 h-1.5 rounded-full bg-[var(--color-brass)]" animate={{ y: [0, 16, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} />
          </div>
        </motion.div>
      </section>

      {/* ══════════════════ ABOUT ══════════════════ (flows straight out of Hero — no seam) */}
      <section id="about" className="relative py-16 md:py-24">
        <div className="container-site relative z-10" ref={aboutRef}>
          <motion.div initial={{ y: 30, opacity: 0 }} animate={aboutInView ? { y: 0, opacity: 1 } : {}} transition={{ duration: 0.6 }} className="text-center mb-12">
            <span className="text-[var(--color-turquoise)] text-xs font-semibold tracking-[0.2em] uppercase">{tAbout("eyebrow")}</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mt-3 text-[var(--text-primary)]" style={{ fontFamily: "var(--font-bodoni-moda)" }}>
              {tAbout("heading")}
            </h2>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            <motion.div initial={{ x: -50, opacity: 0 }} animate={aboutInView ? { x: 0, opacity: 1 } : {}} transition={{ duration: 0.8, delay: 0.2 }} className="relative">
              <div className="relative aspect-square max-w-md mx-auto">
                <div className="absolute inset-0 rounded-2xl opacity-10" style={{ backgroundImage: "url('/motifs/arabesque-tile-pattern.svg')", backgroundRepeat: "repeat", backgroundSize: "100px 100px" }} aria-hidden="true" />
                <div className="absolute inset-8 flex items-center justify-center">
                  <div
                    className="w-full h-full bg-[var(--color-navy)] dark:bg-[var(--color-turquoise)]"
                    style={{
                      WebkitMaskImage: "url('/motifs/jeelani-dome-stroke.svg')",
                      WebkitMaskSize: "contain",
                      WebkitMaskPosition: "center",
                      WebkitMaskRepeat: "no-repeat",
                      maskImage: "url('/motifs/jeelani-dome-stroke.svg')",
                      maskSize: "contain",
                      maskPosition: "center",
                      maskRepeat: "no-repeat",
                    }}
                    aria-hidden="true"
                  />
                </div>
                <div className="absolute -bottom-4 -right-4 w-16 h-16">
                  <div
                    className="w-full h-full bg-[var(--color-brass)]"
                    style={{
                      WebkitMaskImage: "url('/motifs/four-point-glint.svg')",
                      WebkitMaskSize: "contain",
                      WebkitMaskPosition: "center",
                      WebkitMaskRepeat: "no-repeat",
                      maskImage: "url('/motifs/four-point-glint.svg')",
                      maskSize: "contain",
                      maskPosition: "center",
                      maskRepeat: "no-repeat",
                    }}
                    aria-hidden="true"
                  />
                </div>
              </div>
            </motion.div>

            <div className="space-y-5">
              {paragraphs.map((text, i) => (
                <motion.p key={i} initial={{ y: 20, opacity: 0 }} animate={aboutInView ? { y: 0, opacity: 1 } : {}} transition={{ duration: 0.5, delay: 0.3 + i * 0.15 }} className="text-[var(--text-secondary)] leading-relaxed text-base md:text-lg">
                  {text}
                </motion.p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════ COUNTDOWN ══════════════════ (same canvas, no bg reset) */}
      <section id="countdown" className="relative py-16 md:py-24" ref={countdownRef}>
        <div className="container-site text-center">
          <motion.div initial={{ y: 30, opacity: 0 }} animate={countdownInView ? { y: 0, opacity: 1 } : {}} transition={{ duration: 0.6 }}>
            <span className="text-[var(--color-turquoise)] text-xs font-semibold tracking-[0.2em] uppercase">{tCountdown("eyebrow")}</span>
            <h2 className="text-2xl md:text-3xl font-bold mt-2 mb-8 text-[var(--text-primary)]" style={{ fontFamily: "var(--font-bodoni-moda)" }}>
              {tCountdown("heading")}
            </h2>
          </motion.div>

          <CountdownDigits
            targetDate={targetDate}
            inView={countdownInView}
            labels={{ days: tCountdown("days"), hours: tCountdown("hours"), min: tCountdown("min"), sec: tCountdown("sec") }}
          />

          <motion.div initial={{ y: 20, opacity: 0 }} animate={countdownInView ? { y: 0, opacity: 1 } : {}} transition={{ duration: 0.6, delay: 0.4 }} className="flex flex-wrap items-center justify-center gap-3">
            <Magnetic pattern="tap">
              <a href={googleCalUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium bg-[var(--color-navy)] text-white hover:bg-[var(--color-navy)]/90 transition-colors">
                <CalendarPlus className="w-4 h-4" strokeWidth={2} aria-hidden="true" /> {tCountdown("addGoogle")}
              </a>
            </Magnetic>
            <Magnetic pattern="tap">
              <a href="/api/calendar" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium border border-[var(--border-strong)] text-[var(--text-primary)] hover:bg-[var(--surface-elevated)] transition-colors">
                <CalendarPlus className="w-4 h-4" strokeWidth={2} aria-hidden="true" /> {tCountdown("downloadIcs")}
              </a>
            </Magnetic>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

function getTimeRemaining(targetDate: string) {
  const total = new Date(targetDate).getTime() - Date.now();
  if (total <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(total / (1000 * 60 * 60 * 24)),
    hours: Math.floor((total / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((total / (1000 * 60)) % 60),
    seconds: Math.floor((total / 1000) % 60),
  };
}

function CountdownDigits({
  targetDate,
  inView,
  labels,
}: {
  targetDate: string;
  inView: boolean;
  labels: { days: string; hours: string; min: string; sec: string };
}) {
  const [time, setTime] = useState(getTimeRemaining(targetDate));

  useEffect(() => {
    const timer = setInterval(() => setTime(getTimeRemaining(targetDate)), 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <motion.div
      initial={{ y: 30, opacity: 0 }}
      animate={inView ? { y: 0, opacity: 1 } : {}}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="flex items-center justify-center gap-3 md:gap-5 mb-10"
    >
      <Digit value={time.days} label={labels.days} />
      <span className="text-2xl text-[var(--color-turquoise)] font-bold mt-[-1rem]">:</span>
      <Digit value={time.hours} label={labels.hours} />
      <span className="text-2xl text-[var(--color-turquoise)] font-bold mt-[-1rem]">:</span>
      <Digit value={time.minutes} label={labels.min} />
      <span className="text-2xl text-[var(--color-turquoise)] font-bold mt-[-1rem]">:</span>
      <Digit value={time.seconds} label={labels.sec} />
    </motion.div>
  );
}

function Digit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <div className="bg-[var(--color-navy)] dark:bg-[var(--surface-elevated)] rounded-xl px-4 py-3 md:px-6 md:py-4 min-w-[64px] md:min-w-[80px] text-center border border-[var(--color-turquoise)]/20 shadow-lg">
          <span className="text-3xl md:text-5xl font-bold text-[var(--color-brass)] tabular-nums" style={{ fontFamily: "var(--font-bodoni-moda)" }}>
            {String(value).padStart(2, "0")}
          </span>
        </div>
        <span className="absolute -top-1 -right-1 text-[var(--color-brass)] text-[8px] opacity-50">✦</span>
      </div>
      <span className="text-xs text-[var(--text-muted)] mt-2 uppercase tracking-wider font-medium">{label}</span>
    </div>
  );
}
