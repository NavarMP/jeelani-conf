"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { CircleCheckBig } from "lucide-react";

export default function DarimiAcademicRegistration() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    place: "",
    occupation: "study" as "study" | "work",
    occupationPlace: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const t = useTranslations("AstroAIFiqh");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const supabase = createClient();
      const registrationId = `REG-ACAD-${Date.now().toString(36).toUpperCase()}`;

      const { error: insertError } = await supabase.from("dynamic_registrations").insert({
        registration_id: registrationId,
        session_slug: "astro-ai-fiqh",
        name: formData.name,
        phone: formData.phone,
        place: formData.place,
        form_data: {
          occupation: formData.occupation,
          occupation_place: formData.occupationPlace,
        },
      });

      if (insertError) throw insertError;
      setSubmitted(true);
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.message || "Failed to submit registration. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center pt-20 pb-24 px-6">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--color-brass)]/10 flex items-center justify-center text-[var(--color-brass)]">
            <CircleCheckBig className="w-8 h-8" strokeWidth={1.75} aria-hidden="true" />
          </div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2" style={{ fontFamily: "var(--font-bodoni-moda)" }}>
            {t("successHeading")}
          </h2>
          <p className="text-[var(--text-secondary)] text-sm mb-6">{t("successMessage")}</p>
          <Link href="/" className="inline-flex items-center px-6 py-2.5 rounded-full text-sm font-medium bg-[var(--color-navy)] text-white hover:bg-[var(--color-navy)]/90 transition-all">
            {t("backToHome")}
          </Link>
        </motion.div>
      </div>
    );
  }

  const inputClass = "w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-turquoise)]/40 focus:border-[var(--color-turquoise)] transition-all placeholder:text-[var(--text-muted)]";

  return (
    <div className="min-h-[100dvh] pt-24 pb-32 px-6">
      <div className="max-w-lg mx-auto">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
          <Link href="/#register" className="text-xs text-[var(--color-turquoise)] hover:underline mb-4 inline-block">
            {t("backToOptions")}
          </Link>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-[var(--color-rose)]/10 text-[var(--color-rose)]">
              {t("type")}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-1" style={{ fontFamily: "var(--font-bodoni-moda)" }}>
            {t("heading")}
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mb-2">{t("description")}</p>

          {/* Session list */}
          <div className="bg-[var(--surface-elevated)] rounded-xl p-4 mb-8 border border-[var(--border)] space-y-2">
            <div className="flex items-start gap-2 text-xs text-[var(--text-secondary)]">
              <span className="text-[var(--color-rose)] mt-0.5">●</span>
              <div>
                <span className="font-semibold text-[var(--text-primary)]">2:00 PM – 3:00 PM</span> — {t("session1")}
              </div>
            </div>
            <div className="flex items-start gap-2 text-xs text-[var(--text-secondary)]">
              <span className="text-[var(--color-rose)] mt-0.5">●</span>
              <div>
                <span className="font-semibold text-[var(--text-primary)]">3:00 PM – 5:00 PM</span> — {t("session2")}
              </div>
            </div>
            <div className="flex items-start gap-2 text-xs text-[var(--text-secondary)]">
              <span className="text-[var(--color-rose)] mt-0.5">●</span>
              <div>
                <span className="font-semibold text-[var(--text-primary)]">5:00 PM – 6:30 PM</span> — {t("session3")}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.form onSubmit={handleSubmit} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.1 }} className="space-y-5">
          <div>
            <label htmlFor="da-name" className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">{t("fullName")}</label>
            <input id="da-name" type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder={t("fullNamePlaceholder")} className={inputClass} />
          </div>

          <div>
            <label htmlFor="da-place" className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">{t("place")}</label>
            <input id="da-place" type="text" required value={formData.place} onChange={(e) => setFormData({ ...formData, place: e.target.value })} placeholder={t("placePlaceholder")} className={inputClass} />
          </div>

          <div>
            <label htmlFor="da-phone" className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">{t("phone")}</label>
            <input id="da-phone" type="tel" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder={t("phonePlaceholder")} className={inputClass} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-primary)] mb-2">{t("occupation")}</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, occupation: "study", occupationPlace: "" })}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                  formData.occupation === "study"
                    ? "border-[var(--color-turquoise)] bg-[var(--color-turquoise)]/10 text-[var(--color-turquoise)]"
                    : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--color-turquoise)]/30"
                }`}
              >
                {t("study")}
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, occupation: "work", occupationPlace: "" })}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                  formData.occupation === "work"
                    ? "border-[var(--color-turquoise)] bg-[var(--color-turquoise)]/10 text-[var(--color-turquoise)]"
                    : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--color-turquoise)]/30"
                }`}
              >
                {t("work")}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="da-occ-place" className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
              {formData.occupation === "study" ? t("placeOfStudy") : t("placeOfWork")}
            </label>
            <input
              id="da-occ-place"
              type="text"
              required
              value={formData.occupationPlace}
              onChange={(e) => setFormData({ ...formData, occupationPlace: e.target.value })}
              placeholder={formData.occupation === "study" ? t("placeOfStudyPlaceholder") : t("placeOfWorkPlaceholder")}
              className={inputClass}
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-xl text-sm font-semibold bg-[var(--color-rose)] text-white hover:bg-[var(--color-rose)]/90 transition-all active:scale-[0.98] shadow-sm hover:shadow-md mt-4 disabled:opacity-60"
          >
            {isSubmitting ? t("submitting") : t("submit")}
          </button>
        </motion.form>
      </div>
    </div>
  );
}
