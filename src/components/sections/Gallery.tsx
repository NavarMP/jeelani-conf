"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Maximize2 } from "lucide-react";
import { useSectionEnterHaptic } from "@/hooks/useHaptics";
import { haptic } from "@/lib/haptics";
import { Magnetic } from "@/components/ui/Magnetic";

export function Gallery() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const t = useTranslations("Gallery");
  useSectionEnterHaptic(isInView);

  const galleryItems = [
    { id: 1, aspect: "4/5", color: "from-[#103E79] to-[#218EB6]", labelKey: "conferenceHall" },
    { id: 2, aspect: "3/4", color: "from-[#218EB6] to-[#103E79]", labelKey: "stageDesign" },
    { id: 3, aspect: "1/1", color: "from-[#BA6473] to-[#103E79]", labelKey: "arabesqueDetails" },
    { id: 4, aspect: "3/4", color: "from-[#103E79] to-[#2B2A29]", labelKey: "scholarlyDiscourse" },
    { id: 5, aspect: "4/5", color: "from-[#218EB6] to-[#BA6473]", labelKey: "calligraphy" },
    { id: 6, aspect: "1/1", color: "from-[#2B2A29] to-[#103E79]", labelKey: "mawlidGathering" },
  ];

  return (
    <section id="gallery" className="relative py-20 md:py-28" ref={ref}>
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
          <p className="text-[var(--text-secondary)] mt-3 max-w-md mx-auto text-sm">
            {t("description")}
          </p>
        </motion.div>

        {/* Masonry-like grid */}
        <div className="columns-2 md:columns-3 gap-3 space-y-3 max-w-4xl mx-auto">
          {galleryItems.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              whileTap={{ scale: 0.96 }}
              onTapStart={() => haptic("tap")}
              className="break-inside-avoid group cursor-pointer"
            >
              <div
                className={`relative rounded-xl overflow-hidden bg-gradient-to-br ${item.color} shadow-sm group-hover:shadow-lg transition-all`}
                style={{ aspectRatio: item.aspect }}
              >
                {/* Pattern overlay */}
                <div
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage: "url('/motifs/tile-repeat-stroke.svg')",
                    backgroundRepeat: "repeat",
                    backgroundSize: "80px 80px",
                  }}
                  aria-hidden="true"
                />

                {/* Center dome motif */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className="w-20 h-20 bg-white/20"
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

                {/* Label */}
                <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/50">
                  <p className="text-xs text-white/80 font-medium">{t(item.labelKey)}</p>
                </div>

                {/* Hover expand icon */}
                <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                  <Maximize2 className="w-3.5 h-3.5 text-white" strokeWidth={2} aria-hidden="true" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View full gallery link */}
        <div className="text-center mt-10">
          <Magnetic pattern="tap">
            <Link
              href="/gallery"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium border border-[var(--border-strong)] text-[var(--text-primary)] hover:bg-[var(--surface-elevated)] transition-all"
            >
              {t("viewFullGallery")}
            </Link>
          </Magnetic>
        </div>
      </div>
    </section>
  );
}
