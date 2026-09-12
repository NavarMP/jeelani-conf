"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

export function Hero() {
  return (
    <section id="hero" className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-hero" />

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

      {/* Dome image — parallax-ready */}
      <motion.div
        className="absolute top-[5%] left-1/2 -translate-x-1/2 w-[280px] md:w-[380px] lg:w-[450px] opacity-30"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 0.3 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        aria-hidden="true"
      >
        <Image
          src="/jeelani-dome.png"
          alt=""
          width={450}
          height={450}
          priority
          className="w-full h-auto"
        />
      </motion.div>

      {/* Floating glints */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-[var(--color-brass)]"
          style={{
            top: `${15 + Math.random() * 60}%`,
            left: `${10 + Math.random() * 80}%`,
            fontSize: `${8 + Math.random() * 14}px`,
          }}
          animate={{
            opacity: [0, 0.6, 0],
            scale: [0.5, 1, 0.5],
            rotate: [0, 180],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: i * 0.8,
            ease: "easeInOut",
          }}
          aria-hidden="true"
        >
          ✦
        </motion.div>
      ))}

      {/* Main content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">

        {/* Dars calligraphy */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mb-6"
        >
          {/* <Image
            src="/dars-typo.svg"
            alt="الدرس بجامع النور بادري"
            width={300}
            height={60}
            className="w-[180px] md:w-[260px] h-auto mx-auto invert opacity-100"
          /> */}
        </motion.div>
        
        {/* Scalloped badge with wordmark */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
          className="mb-6"
        >
          <div className="inline-block rounded-lg px-8 py-5 md:px-12 md:py-7" style={{ clipPath: "url(#scallopClip)" }}>
            <Image
              src="/wordmark-en.svg"
              alt="Grand Jeelani Conference"
              width={400}
              height={140}
              priority
              className="w-[220px] md:w-[320px] lg:w-[380px] h-auto invert brightness-200"
            />
          </div>
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-[var(--color-brass)] text-sm md:text-base font-medium tracking-[0.15em] uppercase mb-4"
        >
          From Baghdad to Malabar — Persian Artistry. Malabar Soul.
        </motion.p>

        {/* Date & Venue */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="mb-8"
        >
          <p className="text-white/90 text-lg md:text-xl font-semibold" style={{ fontFamily: "var(--font-bodoni-moda)" }}>
            Sunday, September 27
          </p>
          <p className="text-white/60 text-sm mt-1">
            Alathoorpadi, Melmuri
          </p>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-3"
        >
          <Link
            href="/#register"
            className="inline-flex items-center px-7 py-3 rounded-full text-sm font-semibold bg-[var(--color-brass)] text-[var(--color-black)] hover:bg-[var(--hover-brass)] transition-all hover:shadow-lg hover:shadow-[var(--color-brass)]/25 active:scale-95"
          >
            Register Now
          </Link>
          <Link
            href="/#schedule"
            className="inline-flex items-center px-7 py-3 rounded-full text-sm font-semibold bg-white/10 text-white border border-white/20 hover:bg-white/15 backdrop-blur-sm transition-all active:scale-95"
          >
            View Schedule
          </Link>
          <Link
            href="/live"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-sm font-semibold bg-white/5 text-white/80 border border-white/10 hover:bg-white/10 backdrop-blur-sm transition-all active:scale-95"
          >
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Watch Live
          </Link>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-1.5">
          <motion.div
            className="w-1.5 h-1.5 rounded-full bg-[var(--color-brass)]"
            animate={{ y: [0, 16, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </motion.div>
    </section>
  );
}
