"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";

const registrationFlows = [
  {
    id: "grand-assembly",
    title: "Grand Assembly",
    titleMl: "മഹാ സമ്മേളനം",
    description: "Join the main conference gathering. Private registration for community members and invited guests.",
    type: "Private (Invite Only)",
    price: "Free",
    icon: "🕌",
    color: "var(--color-navy)",
    href: "/register/grand-assembly",
  },
  {
    id: "musthafa-darimi",
    title: "Musthafa Darimi Session",
    titleMl: "മുസ്തഫ ദരീമി സെഷൻ",
    description: "A paid specialized session by Dr. Musthafa Darimi Karippur that continues as an ongoing course.",
    type: "Public (Paid)",
    price: "Paid",
    icon: "📚",
    color: "var(--color-rose)",
    href: "/register/musthafa-darimi",
  },
  {
    id: "paper-presentation",
    title: "Paper Presentation",
    titleMl: "പേപ്പർ പ്രസന്റേഷൻ",
    description: "Submit your research paper on 'Muhyiddin Mala and the Social Life of Malabar Muslims.'",
    type: "Public (Free)",
    price: "Free",
    icon: "📝",
    color: "var(--color-turquoise)",
    href: "/register/paper-presentation",
  },
];

export function Registration() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <section id="register" className="relative py-20 md:py-28 overflow-hidden" ref={ref}>
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: "url('/motifs/tile-repeat-fill.svg')",
          backgroundRepeat: "repeat",
          backgroundSize: "200px 200px",
        }}
        aria-hidden="true"
      />

      <div className="container-site relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="text-[var(--color-brass)] text-xs font-semibold tracking-[0.2em] uppercase">
            Be Part of the Legacy
          </span>
          <h2
            className="text-3xl md:text-4xl font-bold mt-2 text-[var(--text-primary)]"
            style={{ fontFamily: "var(--font-bodoni-moda)" }}
          >
            Register Now
          </h2>
          <p className="text-[var(--text-secondary)] mt-3 max-w-lg mx-auto text-sm">
            Choose from three registration options based on your interest and participation.
          </p>
        </motion.div>

        {/* Registration cards */}
        <div className="grid md:grid-cols-3 gap-5 max-w-4xl mx-auto">
          {registrationFlows.map((flow, i) => (
            <motion.div
              key={flow.id}
              initial={{ y: 30, opacity: 0 }}
              animate={isInView ? { y: 0, opacity: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
            >
              <Link
                href={flow.href}
                className="group block p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--color-turquoise)]/30 hover:shadow-lg transition-all h-full"
              >
                {/* Icon */}
                <div className="text-3xl mb-4">{flow.icon}</div>

                {/* Type badge */}
                <span className="text-[10px] px-2.5 py-1 rounded-full font-medium bg-[var(--color-turquoise)]/10 text-[var(--color-turquoise)]">
                  {flow.type}
                </span>

                {/* Title */}
                <h3
                  className="text-lg font-bold text-[var(--text-primary)] mt-3 mb-1 group-hover:text-[var(--color-turquoise)] transition-colors"
                  style={{ fontFamily: "var(--font-bodoni-moda)" }}
                >
                  {flow.title}
                </h3>
                {flow.titleMl && (
                  <p className="text-xs text-[var(--text-muted)] mb-3" style={{ fontFamily: "var(--font-noto-sans-malayalam)" }}>
                    {flow.titleMl}
                  </p>
                )}

                <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-4">
                  {flow.description}
                </p>

                {/* Price & CTA */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-[var(--color-brass)]">{flow.price}</span>
                  <span className="text-xs font-medium text-[var(--color-turquoise)] group-hover:translate-x-1 transition-transform">
                    Register →
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
