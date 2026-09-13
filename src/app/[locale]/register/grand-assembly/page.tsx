"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function GrandAssemblyRegistration() {
  const [formData, setFormData] = useState({ name: "", phone: "", email: "", dars: "", place: "" });
  const [submitted, setSubmitted] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const t = useTranslations("GrandAssembly");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production: POST to Supabase
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center pt-20 pb-24 px-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-md"
        >
          <div className="text-5xl mb-4">🕌</div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2" style={{ fontFamily: "var(--font-bodoni-moda)" }}>
            {t("successHeading")}
          </h2>
          <p className="text-[var(--text-secondary)] text-sm mb-6">
            {t("successMessage")}
          </p>
          <Link href="/" className="inline-flex items-center px-6 py-2.5 rounded-full text-sm font-medium bg-[var(--color-navy)] text-white hover:bg-[var(--color-navy)]/90 transition-all">
            {t("backToHome")}
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] pt-24 pb-32 px-6">
      <div className="max-w-lg mx-auto">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
          {/* Header */}
          <Link href="/#register" className="text-xs text-[var(--color-turquoise)] hover:underline mb-4 inline-block">{t("backToOptions")}</Link>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-[var(--color-navy)]/10 text-[var(--color-navy)] dark:bg-[var(--color-turquoise)]/10 dark:text-[var(--color-turquoise)]">{t("type")}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-1" style={{ fontFamily: "var(--font-bodoni-moda)" }}>{t("heading")}</h1>
          <p className="text-sm text-[var(--text-secondary)] mb-8">{t("description")}</p>
        </motion.div>

        {/* Form */}
        <motion.form ref={formRef} onSubmit={handleSubmit} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.1 }} className="space-y-5">
          <div>
            <label htmlFor="ga-name" className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">{t("fullName")}</label>
            <input id="ga-name" type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder={t("fullNamePlaceholder")} className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-turquoise)]/40 focus:border-[var(--color-turquoise)] transition-all placeholder:text-[var(--text-muted)]" />
          </div>
          
          <div>
            <label htmlFor="ga-phone" className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">{t("phone")}</label>
            <input id="ga-phone" type="tel" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder={t("phonePlaceholder")} className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-turquoise)]/40 focus:border-[var(--color-turquoise)] transition-all placeholder:text-[var(--text-muted)]" />
          </div>

          <div>
            <label htmlFor="ga-email" className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">{t("email")}</label>
            <input id="ga-email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder={t("emailPlaceholder")} className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-turquoise)]/40 focus:border-[var(--color-turquoise)] transition-all placeholder:text-[var(--text-muted)]" />
          </div>

          <div>
            <label htmlFor="ga-dars" className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">{t("dars")}</label>
            <input id="ga-dars" type="text" required value={formData.dars} onChange={(e) => setFormData({ ...formData, dars: e.target.value })} placeholder={t("darsPlaceholder")} className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-turquoise)]/40 focus:border-[var(--color-turquoise)] transition-all placeholder:text-[var(--text-muted)]" />
          </div>

          <div>
            <label htmlFor="ga-place" className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">{t("place")}</label>
            <input id="ga-place" type="text" required value={formData.place} onChange={(e) => setFormData({ ...formData, place: e.target.value })} placeholder={t("placePlaceholder")} className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-turquoise)]/40 focus:border-[var(--color-turquoise)] transition-all placeholder:text-[var(--text-muted)]" />
          </div>

          <button type="submit" className="w-full py-3.5 rounded-xl text-sm font-semibold bg-[var(--color-navy)] dark:bg-[var(--color-turquoise)] text-white dark:text-[var(--color-black)] hover:bg-[var(--color-navy)]/90 dark:hover:bg-[var(--color-turquoise)]/90 transition-all active:scale-[0.98] shadow-sm mt-4">
            {t("submit")}
          </button>
        </motion.form>
      </div>
    </div>
  );
}
