"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useTranslations } from "next-intl";
import { MapPin, Clock, Mic, Navigation } from "lucide-react";
import { useSectionEnterHaptic } from "@/hooks/useHaptics";
import { Magnetic } from "@/components/ui/Magnetic";

export function Location({ locationMapUrl }: { locationMapUrl: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const t = useTranslations("Location");
  useSectionEnterHaptic(isInView);

  /* Embed URL using Google Maps (reliable fallback that doesn't require WebGL) */
  /* Coordinates for M.M.E.T.H.S.S Melmuri, Alathurpadi: 11.071439, 76.076833 */
  const mapEmbedUrl = "https://maps.google.com/maps?q=11.071439,76.076833&hl=en&z=15&output=embed";

  return (
    <section id="location" className="relative py-20 md:py-28" ref={ref}>
      <div className="container-site">
        {/* Section header */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
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

        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Map embed */}
          <motion.div
            initial={{ x: -30, opacity: 0 }}
            animate={isInView ? { x: 0, opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="rounded-2xl overflow-hidden border border-[var(--border)] shadow-sm"
          >
            <iframe
              src={mapEmbedUrl}
              width="100%"
              height="350"
              style={{ border: 0 }}
              loading="lazy"
              title="Conference Location - Alathurpadi, Melmuri"
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
                <div className="w-10 h-10 rounded-xl bg-[var(--color-navy)]/10 flex items-center justify-center shrink-0 text-[var(--color-navy)] dark:text-[var(--color-turquoise)]">
                  <MapPin className="w-5 h-5" strokeWidth={1.75} aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--text-primary)] text-sm">{t("venue")}</h3>
                  <p className="text-[var(--text-secondary)] text-sm mt-0.5">
                    {t("venueAddress")}
                  </p>
                </div>
              </div>

              {/* Date & Time */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[var(--color-turquoise)]/10 flex items-center justify-center shrink-0 text-[var(--color-turquoise)]">
                  <Clock className="w-5 h-5" strokeWidth={1.75} aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--text-primary)] text-sm">{t("dateTime")}</h3>
                  <p className="text-[var(--text-secondary)] text-sm mt-0.5">
                    {t("dateValue")}
                  </p>
                  <p className="text-[var(--text-muted)] text-xs mt-0.5">
                    {t("timeValue")}
                  </p>
                </div>
              </div>

              {/* Stages */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[var(--color-brass)]/10 flex items-center justify-center shrink-0 text-[var(--color-brass)]">
                  <Mic className="w-5 h-5" strokeWidth={1.75} aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--text-primary)] text-sm">{t("twoStages")}</h3>
                  <p className="text-[var(--text-secondary)] text-sm mt-0.5">
                    {t("stagesDesc")}
                  </p>
                </div>
              </div>

              {/* Get Directions */}
              <div className="flex flex-wrap gap-3 pt-2">
                <Magnetic pattern="select">
                  <a
                    href={locationMapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold bg-[var(--color-navy)] text-white hover:bg-[var(--color-navy)]/90 transition-colors"
                  >
                    <MapPin className="w-4 h-4" strokeWidth={2} aria-hidden="true" /> {t("getDirections")}
                  </a>
                </Magnetic>
                <Magnetic pattern="tap">
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=11.071439,76.076833`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium border border-[var(--border-strong)] text-[var(--text-primary)] hover:bg-[var(--surface-elevated)] transition-colors"
                  >
                    <Navigation className="w-4 h-4" strokeWidth={2} aria-hidden="true" /> {t("navigateMaps")}
                  </a>
                </Magnetic>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
