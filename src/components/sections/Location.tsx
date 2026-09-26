"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useTranslations } from "next-intl";
import { useSectionEnterHaptic } from "@/hooks/useHaptics";
import { InteractiveStageCard } from "@/components/ui/InteractiveStageCard";
import { Magnetic } from "@/components/ui/Magnetic";
import { MapPin } from "lucide-react";

export function Location({ locationMapUrl, stages }: { locationMapUrl: string, stages?: any[] }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const t = useTranslations("Location");
  useSectionEnterHaptic(isInView);

  // Default to mock stages if none exist
  const displayStages = stages && stages.length > 0 ? stages : [
    { slug: "main", name: "Main Stage", description: "The central hub for keynotes and major sessions.", location_address: "Main Auditorium, Ground Floor" },
    { slug: "workshop", name: "Workshop Area", description: "Interactive sessions and hands-on training.", location_address: "Hall B, First Floor" }
  ];

  // We want to nicely layout 1, 2, or 3 cards
  const gridClass = 
    displayStages.length === 1 ? "max-w-2xl mx-auto" :
    displayStages.length === 2 ? "grid md:grid-cols-2 gap-8 max-w-5xl mx-auto" :
    "grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto";

  return (
    <section id="location" className="relative py-24 md:py-32 overflow-hidden bg-[var(--background)]" ref={ref}>
      {/* Background ambient gradients */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-[var(--color-turquoise)]/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-[var(--color-navy)]/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="container-site relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-16 md:mb-20"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={isInView ? { scale: 1, opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-block px-4 py-1.5 rounded-full bg-[var(--color-turquoise)]/10 text-[var(--color-turquoise)] text-xs font-bold tracking-[0.2em] uppercase mb-4 shadow-[0_0_15px_var(--color-turquoise)40]"
          >
            {t("eyebrow")}
          </motion.div>
          <h2
            className="text-4xl md:text-5xl lg:text-6xl font-bold mt-2 text-[var(--text-primary)] tracking-tight"
            style={{ fontFamily: "var(--font-bodoni-moda)" }}
          >
            {t("heading") || "Event Stages & Venues"}
          </h2>
          <p className="mt-4 text-[var(--text-secondary)] max-w-2xl mx-auto text-lg md:text-xl">
            {t("venueAddress") || "Explore our immersive stages designed for the ultimate experience."}
          </p>
        </motion.div>

        {/* 3D Interactive Stage Cards Grid */}
        <div className={gridClass} style={{ perspective: "1000px" }}>
          {displayStages.map((stage, index) => (
            <InteractiveStageCard key={stage.slug} stage={stage} index={index} />
          ))}
        </div>

        {/* Global Navigation Hub Fallback */}
        {/* <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-16 text-center flex flex-col items-center gap-6"
        >
          <Magnetic pattern="select">
            <a
              href={locationMapUrl || "https://maps.google.com/?q=11.071439,76.076833"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-base font-bold bg-[var(--text-primary)] text-[var(--background)] hover:scale-105 transition-transform duration-300 shadow-xl"
            >
              <MapPin className="w-5 h-5" aria-hidden="true" /> Open Main Event Map in App
            </a>
          </Magnetic>
        </motion.div> */}
      </div>
    </section>
  );
}
