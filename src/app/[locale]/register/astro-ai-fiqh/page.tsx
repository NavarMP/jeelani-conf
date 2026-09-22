"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { CircleCheckBig, ArrowRight, Clock } from "lucide-react";

import RegistrationGuard, { useRegistrationContext, RegistrationDeadline } from "@/components/RegistrationGuard";

function AstroAIFiqhForm() {
  const { deadline } = useRegistrationContext();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    place: "",
    occupation: "study" as "study" | "work",
    occupationPlace: "",
    screenshot: null as File | null,
  });
  const [copyQRSuccess, setCopyQRSuccess] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const t = useTranslations("AstroAIFiqh");

  const handleDownloadQR = async () => {
    try {
      const res = await fetch("/upi-qr.png");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "astro-ai-fiqh-upi-qr.png";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Failed to download QR code:", err);
      const a = document.createElement("a");
      a.href = "/upi-qr.png";
      a.download = "astro-ai-fiqh-upi-qr.png";
      a.target = "_blank";
      a.click();
    }
  };

  const handleCopyQR = async () => {
    try {
      const res = await fetch("/upi-qr.png");
      const blob = await res.blob();
      if (typeof window !== "undefined" && navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({
            "image/png": blob,
          }),
        ]);
        setCopyQRSuccess(true);
        setTimeout(() => setCopyQRSuccess(false), 2000);
      } else {
        throw new Error("ClipboardItem API not supported");
      }
    } catch (err) {
      console.error("Failed to copy QR code image:", err);
      alert("Direct image copying is not supported on this browser. Please use 'Download QR' instead.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.screenshot) {
      setError(t("screenshotRequired") || "Please upload your payment screenshot.");
      return;
    }

    if (formData.screenshot.size > 5 * 1024 * 1024) {
      setError(t("imageSizeError") || "Screenshot must be less than 5MB.");
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createClient();
      let receipt_url = "";

      // Upload screenshot to receipts bucket
      if (formData.screenshot) {
        const fileExt = formData.screenshot.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `astro-ai-fiqh/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("receipts")
          .upload(filePath, formData.screenshot);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from("receipts")
          .getPublicUrl(filePath);

        receipt_url = publicUrlData.publicUrl;
      }

      const registrationId = `REG-ACAD-${Date.now().toString(36).toUpperCase()}`;

      const { error: insertError } = await supabase.from("dynamic_registrations").insert({
        registration_id: registrationId,
        session_slug: "astro-ai-fiqh",
        name: formData.name,
        phone: formData.phone,
        place: formData.place,
        status: "pending",
        receipt_url,
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
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center max-w-md bg-[var(--surface)] p-8 rounded-3xl shadow-md border border-[var(--border)]">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--color-brass)]/10 flex items-center justify-center text-[var(--color-brass)]">
            <CircleCheckBig className="w-8 h-8" strokeWidth={1.75} aria-hidden="true" />
          </div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2" style={{ fontFamily: "var(--font-bodoni-moda)" }}>
            {t("successHeading")}
          </h2>
          <p className="text-[var(--text-secondary)] text-sm mb-6 leading-relaxed">{t("successMessage")}</p>
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
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-[var(--color-rose)]/10 text-[var(--color-rose)]">
              {t("type")}
            </span>
          </div>
          <RegistrationDeadline />
        </div>
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-1" style={{ fontFamily: "var(--font-bodoni-moda)" }}>
            {t("heading")}
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mb-2">{t("description")}</p>

          {/* Session list */}
          <div className="bg-[var(--surface-elevated)] rounded-xl p-4 mb-4 border border-[var(--border)] space-y-2">
            <div className="flex items-start gap-2 text-xs text-[var(--text-secondary)]">
              <span className="text-[var(--color-rose)] mt-0.5">●</span>
              <div>
                <span className="font-semibold text-[var(--text-primary)]">3:00 PM – 5:00 PM</span> — {t("session1")}
              </div>
            </div>
            <div className="flex items-start gap-2 text-xs text-[var(--text-secondary)]">
              <span className="text-[var(--color-rose)] mt-0.5">●</span>
              <div>
                <span className="font-semibold text-[var(--text-primary)]">5:00 PM – 6:30 PM</span> — {t("session2")}
              </div>
            </div>
          </div>
          
          <Link href="/sessions/astro-ai-fiqh" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-turquoise)] hover:underline mb-8">
            View Session Details <ArrowRight className="w-3 h-3" />
          </Link>
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
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all cursor-pointer ${
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
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all cursor-pointer ${
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

          {/* Payment Details & Upload */}
          <div className="p-5 bg-[var(--surface-elevated)] rounded-2xl border border-[var(--border)]">
            <div className="flex flex-col items-center mb-5 pb-5 border-b border-[var(--border)]">
              <div className="w-40 h-40 bg-[var(--surface)] p-2 rounded-xl shadow-sm border border-[var(--border)] flex items-center justify-center relative group">
                <img src="/upi-qr.png" alt="UPI QR Code" className="w-full h-full object-contain rounded-lg" />
              </div>

              {/* QR Action Buttons */}
              <div className="flex items-center gap-2 mt-3">
                <button
                  type="button"
                  onClick={handleDownloadQR}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-elevated)] text-xs font-semibold text-[var(--text-secondary)] shadow-sm transition-all active:scale-95 cursor-pointer"
                  title="Download QR code as PNG"
                >
                  <svg className="w-3.5 h-3.5 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  {t("downloadQR")}
                </button>
                <button
                  type="button"
                  onClick={handleCopyQR}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-elevated)] text-xs font-semibold text-[var(--text-secondary)] shadow-sm transition-all active:scale-95 cursor-pointer"
                  title="Copy QR code image to clipboard"
                >
                  {copyQRSuccess ? (
                    <>
                      <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-emerald-500 font-medium">{t("copiedQR")}</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      {t("copyQR")}
                    </>
                  )}
                </button>
              </div>

              <div className="mt-4 w-full max-w-xs space-y-2 text-center">
                <div className="text-sm font-bold text-[var(--text-primary)]">{t("scanToPay")}</div>
                <div
                  className="text-xs text-[var(--text-secondary)] font-medium bg-[var(--surface)] px-3 py-2 rounded-lg border border-[var(--border)] shadow-sm flex justify-between items-center cursor-pointer hover:bg-[var(--surface-elevated)] transition-colors"
                  onClick={() => {
                    navigator.clipboard.writeText("50");
                    alert(t("amountCopied") || "Amount copied!");
                  }}
                >
                  <span>{t("amount")} <span className="font-bold text-[var(--color-navy)] dark:text-[var(--color-turquoise)]">₹50</span></span>
                  <svg className="w-3.5 h-3.5 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="text-xs text-[var(--text-secondary)] font-medium bg-[var(--surface)] px-3 py-2 rounded-lg border border-[var(--border)] shadow-sm flex justify-between items-center">
                  <span>{t("payeeNameLabel")} <span className="font-bold">{t("payeeName") || "Muhammed Sinan"}</span></span>
                </div>
                <div
                  className="text-xs text-[var(--text-secondary)] font-medium bg-[var(--surface)] px-3 py-2 rounded-lg border border-[var(--border)] shadow-sm flex justify-between items-center cursor-pointer hover:bg-[var(--surface-elevated)] transition-colors"
                  onClick={() => {
                    navigator.clipboard.writeText("sinanvettam@okicici");
                    alert(t("upiCopied") || "UPI ID copied!");
                  }}
                >
                  <span>{t("upiId")} <span className="font-mono text-[var(--color-navy)] dark:text-[var(--color-turquoise)]">sinanvettam@okicici</span></span>
                  <svg className="w-3.5 h-3.5 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <div
                  className="text-xs text-[var(--text-secondary)] font-medium bg-[var(--surface)] px-3 py-2 rounded-lg border border-[var(--border)] shadow-sm flex justify-between items-center cursor-pointer hover:bg-[var(--surface-elevated)] transition-colors"
                  onClick={() => {
                    navigator.clipboard.writeText("7034585359");
                    alert(t("phoneCopied") || "Phone number copied!");
                  }}
                >
                  <span>{t("payeePhone")} <span className="font-mono text-[var(--color-navy)] dark:text-[var(--color-turquoise)]">7034585359</span></span>
                  <svg className="w-3.5 h-3.5 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide mb-2">
              {t("uploadScreenshot")}
            </label>
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="astro-dropzone-file"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-[var(--border-strong)] border-dashed rounded-xl cursor-pointer bg-[var(--surface)] hover:bg-[var(--surface-elevated)] transition-colors"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg className="w-8 h-8 mb-2 text-[var(--text-muted)]" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                  </svg>
                  <p className="mb-1 text-sm text-[var(--text-muted)]">
                    <span className="font-semibold">{t("clickToUpload")}</span> {t("orDragDrop")}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">{t("fileTypes")}</p>
                </div>
                <input
                  id="astro-dropzone-file"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  required
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file && file.size > 5 * 1024 * 1024) {
                      setError(t("imageSizeError") || "Screenshot must be less than 5MB.");
                      setFormData({ ...formData, screenshot: null });
                    } else {
                      setError("");
                      setFormData({ ...formData, screenshot: file || null });
                    }
                  }}
                />
              </label>
            </div>
            {formData.screenshot && (
              <div className="mt-2 text-xs text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {t("fileSelected")} {formData.screenshot.name}
              </div>
            )}
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-xl text-sm font-bold tracking-wide uppercase bg-[var(--color-navy)] text-white hover:bg-[var(--color-navy)]/90 transition-all active:scale-[0.98] shadow-md hover:shadow-xl mt-6 flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (t("submitting") || "Submitting...") : t("submit")}
            {!isSubmitting && (
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            )}
          </button>
        </motion.form>
      </div>
    </div>
  );
}

export default function AstroAIFiqhRegistration() {
  return (
    <RegistrationGuard slug="astro-ai-fiqh">
      <AstroAIFiqhForm />
    </RegistrationGuard>
  );
}

