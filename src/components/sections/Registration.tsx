"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { type RegistrationSession } from "@/lib/data";

const GRAND_ASSEMBLY_EXTERNAL_URL = "https://grand-jeelani-conference-2026.web.app/";

// Map slugs to their registration page routes
function getRegistrationHref(session: RegistrationSession): string {
  if (session.href_override) return session.href_override;
  switch (session.slug) {
    case "burda-qawwali":
      return "/register/burda-qawwali";
    case "astro-ai-fiqh":
      return "/register/astro-ai-fiqh";
    case "dars-management-meet":
      return "/register/dars-management";
    default:
      return `/register/${session.slug}`;
  }
}

export function Registration({ registrationSessions }: { registrationSessions: RegistrationSession[] }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const t = useTranslations("Registration");

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
            {t("eyebrow")}
          </span>
          <h2
            className="text-3xl md:text-4xl font-bold mt-2 text-[var(--text-primary)]"
            style={{ fontFamily: "var(--font-bodoni-moda)" }}
          >
            {t("heading")}
          </h2>
          <p className="text-[var(--text-secondary)] mt-3 max-w-lg mx-auto text-sm">
            {t("description")}
          </p>
        </motion.div>

        {/* Registration cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
          {/* Grand Assembly — External redirect card */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <a
              href={GRAND_ASSEMBLY_EXTERNAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group block p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--color-turquoise)]/30 hover:shadow-lg transition-all h-full"
            >
              <div className="text-3xl mb-4">🕌</div>
              <span className="text-[10px] px-2.5 py-1 rounded-full font-medium bg-[var(--color-navy)]/10 text-[var(--color-navy)] dark:bg-[var(--color-turquoise)]/10 dark:text-[var(--color-turquoise)]">
                {t("grandAssemblyType")}
              </span>
              <h3
                className="text-lg font-bold text-[var(--text-primary)] mt-3 mb-1 group-hover:text-[var(--color-turquoise)] transition-colors"
                style={{ fontFamily: "var(--font-bodoni-moda)" }}
              >
                {t("grandAssembly")}
              </h3>
              <p className="text-xs text-[var(--text-muted)] mb-3" style={{ fontFamily: "var(--font-noto-sans-malayalam)" }}>
                {t("grandAssemblyMl")}
              </p>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-4">
                {t("grandAssemblyDesc")}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-[var(--color-brass)]">{t("free")}</span>
                <span className="text-xs font-medium text-[var(--color-turquoise)] group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  {t("registerCta")} <span className="text-[10px]">↗</span>
                </span>
              </div>
            </a>
          </motion.div>

          {/* Dynamic registration session cards */}
          {registrationSessions.map((session, i) => {
            const href = getRegistrationHref(session);
            const isExternal = href.startsWith("http");
            const CardWrapper = isExternal ? "a" : Link;
            const cardProps = isExternal
              ? { href, target: "_blank", rel: "noopener noreferrer" }
              : { href };

            return (
              <motion.div
                key={session.slug}
                initial={{ y: 30, opacity: 0 }}
                animate={isInView ? { y: 0, opacity: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
              >
                <CardWrapper
                  {...(cardProps as any)}
                  className="group block p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--color-turquoise)]/30 hover:shadow-lg transition-all h-full"
                >
                  <div className="text-3xl mb-4">{session.icon || "📋"}</div>
                  <span
                    className="text-[10px] px-2.5 py-1 rounded-full font-medium"
                    style={{
                      backgroundColor: `color-mix(in srgb, ${session.color || "var(--color-turquoise)"} 10%, transparent)`,
                      color: session.color || "var(--color-turquoise)",
                    }}
                  >
                    {session.price_label || "Free"}
                  </span>
                  <h3
                    className="text-lg font-bold text-[var(--text-primary)] mt-3 mb-1 group-hover:text-[var(--color-turquoise)] transition-colors"
                    style={{ fontFamily: "var(--font-bodoni-moda)" }}
                  >
                    {session.title}
                  </h3>
                  {session.title_ml && (
                    <p className="text-xs text-[var(--text-muted)] mb-3" style={{ fontFamily: "var(--font-noto-sans-malayalam)" }}>
                      {session.title_ml}
                    </p>
                  )}
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-4">
                    {session.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-[var(--color-brass)]">{session.price_label || "Free"}</span>
                    <span className="text-xs font-medium text-[var(--color-turquoise)] group-hover:translate-x-1 transition-transform">
                      {t("registerCta")}
                    </span>
                  </div>
                </CardWrapper>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
