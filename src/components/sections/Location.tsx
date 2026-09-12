"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { siteSettings } from "@/lib/data";

export function Location() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  /* Use OpenStreetMap free embed instead of Google Maps API */
  /* Coordinates for Alathoorpadi, Melmuri — approx 10.9°N, 76.0°E */
  const osmEmbedUrl = "https://www.openstreetmap.org/export/embed.html?bbox=76.0%2C10.89%2C76.02%2C10.91&layer=mapnik&marker=10.9%2C76.01";

  return (
    <section id="location" className="relative py-20 md:py-28 bg-[var(--surface)]" ref={ref}>
      <div className="container-site">
        {/* Section header */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <span className="text-[var(--color-turquoise)] text-xs font-semibold tracking-[0.2em] uppercase">
            Find Us
          </span>
          <h2
            className="text-3xl md:text-4xl font-bold mt-2 text-[var(--text-primary)]"
            style={{ fontFamily: "var(--font-bodoni-moda)" }}
          >
            Location & Directions
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Map embed */}
          <motion.div
            initial={{ x: -30, opacity: 0 }}
            animate={isInView ? { x: 0, opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="rounded-2xl overflow-hidden border border-[var(--border)] shadow-sm"
          >
            <iframe
              src={osmEmbedUrl}
              width="100%"
              height="350"
              style={{ border: 0 }}
              loading="lazy"
              title="Conference Location - Alathoorpadi, Melmuri"
              className="w-full"
            />
          </motion.div>

          {/* Location details */}
          <motion.div
            initial={{ x: 30, opacity: 0 }}
            animate={isInView ? { x: 0, opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col justify-center"
          >
            <div className="space-y-6">
              {/* Venue */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[var(--color-navy)]/10 flex items-center justify-center text-lg shrink-0">
                  📍
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--text-primary)] text-sm">Venue</h3>
                  <p className="text-[var(--text-secondary)] text-sm mt-0.5">
                    Alathoorpadi, Melmuri, Malappuram, Kerala
                  </p>
                </div>
              </div>

              {/* Date & Time */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[var(--color-turquoise)]/10 flex items-center justify-center text-lg shrink-0">
                  🕐
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--text-primary)] text-sm">Date & Time</h3>
                  <p className="text-[var(--text-secondary)] text-sm mt-0.5">
                    Sunday, September 27, 2026
                  </p>
                  <p className="text-[var(--text-muted)] text-xs mt-0.5">
                    10:00 AM – 10:00 PM IST
                  </p>
                </div>
              </div>

              {/* Stages */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[var(--color-brass)]/10 flex items-center justify-center text-lg shrink-0">
                  🎤
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--text-primary)] text-sm">Two Stages</h3>
                  <p className="text-[var(--text-secondary)] text-sm mt-0.5">
                    Stage 1: Main Conference Hall · Stage 2: Parallel Sessions
                  </p>
                </div>
              </div>

              {/* Get Directions */}
              <div className="flex flex-wrap gap-3 pt-2">
                <a
                  href={siteSettings.locationMapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold bg-[var(--color-navy)] text-white hover:bg-[var(--color-navy)]/90 transition-all"
                >
                  📍 Get Directions
                </a>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=10.9,76.01`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium border border-[var(--border-strong)] text-[var(--text-primary)] hover:bg-[var(--surface-elevated)] transition-all"
                >
                  🗺 Navigate with Maps
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
