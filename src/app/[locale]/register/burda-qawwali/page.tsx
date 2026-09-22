"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useTranslations } from "next-intl";
import { BURDA_RULES_DATA, RULES_LANGUAGES, type RulesLanguage } from "./rulesData";
import { CircleCheckBig, Clock } from "lucide-react";
import RegistrationGuard, { useRegistrationContext, RegistrationDeadline } from "@/components/RegistrationGuard";

function BurdaQawwaliForm() {
  const { deadline } = useRegistrationContext();
  const [rulesLang, setRulesLang] = useState<RulesLanguage>("ml");
  const [formData, setFormData] = useState({ 
    teamName: "", 
    members: ["", "", "", "", ""], 
    phone: "", 
    telegramLink: "",
    screenshot: null as File | null
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const t = useTranslations("BurdaRegistration");

  const supabase = createClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validation
    if (formData.members.length < 5 || formData.members.some(m => m.trim() === "")) {
      setFormError(t("membersError") || "Please provide at least 5 valid team members.");
      return;
    }
    
    if (formData.screenshot && formData.screenshot.size > 5 * 1024 * 1024) {
      setFormError(t("imageSizeError") || "Screenshot must be less than 5MB.");
      return;
    }

    setIsSubmitting(true);
    try {
      let receipt_url = "";
      
      // Upload screenshot if exists
      if (formData.screenshot) {
        const fileExt = formData.screenshot.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `burda/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('receipts')
          .upload(filePath, formData.screenshot);
          
        if (uploadError) throw uploadError;
        
        const { data: publicUrlData } = supabase.storage
          .from('receipts')
          .getPublicUrl(filePath);
          
        receipt_url = publicUrlData.publicUrl;
      }

      // Generate a unique registration ID
      const registration_id = `REG-BURDA-${Math.floor(1000 + Math.random() * 9000)}`;

      // Insert into dynamic_registrations
      const { error: insertError } = await supabase
        .from('dynamic_registrations')
        .insert({
          registration_id,
          session_slug: 'burda-qawwali',
          name: formData.teamName, // Store team name in main name field
          phone: formData.phone,
          status: 'pending',
          receipt_url,
          form_data: {
            members: formData.members,
            telegramLink: formData.telegramLink
          }
        });

      if (insertError) throw insertError;
      
      setSubmitted(true);
    } catch (error: any) {
      console.error("Submission failed:", error);
      setFormError(error?.message || "Registration failed. Please try again or contact support.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const [copyQRSuccess, setCopyQRSuccess] = useState(false);

  const handleDownloadQR = async () => {
    try {
      const res = await fetch("/upi-qr.png");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "burda-qawwali-upi-qr.png";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Failed to download QR code:", err);
      const a = document.createElement("a");
      a.href = "/upi-qr.png";
      a.download = "burda-qawwali-upi-qr.png";
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

  const handleMemberChange = (index: number, value: string) => {
    const newMembers = [...formData.members];
    newMembers[index] = value;
    setFormData({ ...formData, members: newMembers });
  };

  const addMember = () => {
    if (formData.members.length < 7) {
      setFormData({ ...formData, members: [...formData.members, ""] });
    }
  };

  const removeMember = (index: number) => {
    if (formData.members.length > 5) {
      const newMembers = formData.members.filter((_, i) => i !== index);
      setFormData({ ...formData, members: newMembers });
    }
  };

  if (submitted) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center pt-20 pb-24 px-4 sm:px-6 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-[var(--color-turquoise)]/10 to-transparent -z-10" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[var(--color-brass)]/5 rounded-full blur-3xl -z-10" />

        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 20 }} 
          animate={{ scale: 1, opacity: 1, y: 0 }} 
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="text-center max-w-lg w-full bg-[var(--surface-elevated)] p-8 sm:p-12 rounded-[2rem] shadow-xl border border-[var(--border)] relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-[var(--color-turquoise)]" />
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-[var(--color-turquoise)]/10 flex items-center justify-center text-[var(--color-turquoise)] rotate-3">
            <CircleCheckBig className="w-10 h-10" strokeWidth={1.75} aria-hidden="true" />
          </div>
          <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-3" style={{ fontFamily: "var(--font-bodoni-moda)" }}>
            {t("successHeading")}
          </h2>
          <p className="text-[var(--text-secondary)] text-sm mb-8 leading-relaxed">
            {t("successMessage")}
          </p>
          <Link href="/" className="inline-flex items-center justify-center w-full px-6 py-3.5 rounded-xl text-sm font-semibold bg-[var(--color-navy)] text-white hover:bg-[var(--color-navy)]/90 transition-all shadow-md hover:shadow-lg">
            {t("returnHome")}
          </Link>
        </motion.div>
      </div>
    );
  }

  const renderWithTelegramLink = (text: string) => {
    if (!text.includes("@adsadars") && !text.includes("t.me/adsadars")) {
      return text;
    }
    const parts = text.split(/(@adsadars|https?:\/\/t\.me\/adsadars)/g);
    return (
      <>
        {parts.map((part, index) => {
          if (
            part === "@adsadars" ||
            part === "http://t.me/adsadars" ||
            part === "https://t.me/adsadars"
          ) {
            return (
              <a
                key={index}
                href="https://t.me/adsadars"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-turquoise)] font-bold underline hover:opacity-80 transition-opacity inline-flex items-center gap-0.5"
              >
                @adsadars
              </a>
            );
          }
          return part;
        })}
      </>
    );
  };

  const currentRules = BURDA_RULES_DATA[rulesLang] || BURDA_RULES_DATA.ml;

  return (
    <div className="min-h-[100dvh] pt-24 pb-32 px-4 sm:px-6 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-[var(--color-turquoise)]/10 to-transparent -z-10" />
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-[var(--color-brass)]/10 rounded-full blur-3xl -z-10" />
      
      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-8 items-start">
        {/* Left Column - Info & Rules */}
        <motion.div 
          initial={{ x: -20, opacity: 0 }} 
          animate={{ x: 0, opacity: 1 }} 
          transition={{ duration: 0.6 }}
          className="lg:col-span-3 space-y-8"
        >
          <div>
            <Link href="/#register" className="inline-flex items-center text-xs font-medium text-[var(--color-turquoise)] hover:text-[var(--color-navy)] dark:hover:text-[var(--color-brass)] transition-colors mb-6 bg-[var(--surface)]/80 backdrop-blur px-3 py-1.5 rounded-full shadow-sm border border-[var(--border)]">
              <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              {t("backToRegistration")}
            </Link>
            
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full font-bold bg-[var(--color-brass)]/20 text-[var(--color-brass)] border border-[var(--color-brass)]/30">
                  {t("competitionRegistration")}
                </span>
              </div>
              <RegistrationDeadline />
            </div>
            
            <h1 className="text-3xl md:text-5xl font-bold text-[var(--text-primary)] mb-4 leading-tight" style={{ fontFamily: "var(--font-bodoni-moda)" }}>
              {t("title")} <br />
              <span className="text-[var(--color-turquoise)]">{t("titleHighlight")}</span>
            </h1>
            
            <p className="text-[var(--text-secondary)] text-lg max-w-xl">
              {t("subtitle")}
            </p>
          </div>

          <div className="bg-[var(--surface)] rounded-3xl p-6 md:p-8 shadow-sm border border-[var(--border)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--surface-elevated)] rounded-bl-full -z-10" />
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[var(--border)]/60">
              <h3 className="text-xl font-bold text-[var(--text-primary)] flex items-center">
                <svg className="w-5 h-5 mr-2 text-[var(--color-brass)] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {currentRules.heading}
              </h3>

              {/* Language toggle for rules defaulting to Malayalam */}
              <div className="inline-flex items-center p-1 bg-[var(--surface-elevated)] rounded-xl border border-[var(--border)] text-xs font-semibold self-start sm:self-auto shadow-inner">
                {RULES_LANGUAGES.map((lang) => {
                  const isActive = rulesLang === lang.code;
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => setRulesLang(lang.code)}
                      className={`relative px-3 py-1 rounded-lg text-xs transition-all cursor-pointer ${
                        isActive
                          ? "text-white dark:text-gray-900 font-bold"
                          : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium"
                      }`}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="rules-lang-active"
                          className="absolute inset-0 bg-[var(--color-navy)] dark:bg-[var(--color-turquoise)] rounded-lg shadow-sm"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.35 }}
                        />
                      )}
                      <span className="relative z-10">{lang.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            
            <ul className="space-y-4" dir={rulesLang === "ar" ? "rtl" : "ltr"}>
              {currentRules.rules.map((rule, idx) => (
                <li key={idx} className="flex items-start text-sm text-[var(--text-secondary)]">
                  <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-[var(--surface-elevated)] text-[var(--text-muted)] text-xs font-bold mr-3 rtl:mr-0 rtl:ml-3 mt-0.5 border border-[var(--border)]">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{renderWithTelegramLink(rule)}</span>
                </li>
              ))}
            </ul>
            
            <div className="mt-8 p-4 bg-[var(--surface-elevated)] rounded-2xl border border-[var(--border)] flex items-start gap-4" dir={rulesLang === "ar" ? "rtl" : "ltr"}>
              <div className="w-10 h-10 rounded-full bg-[var(--color-turquoise)]/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-[var(--color-turquoise)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              </div>
              <div>
                <h4 className="text-sm font-bold text-[var(--text-primary)] mb-1">{currentRules.helpHeading}</h4>
                <p className="text-xs text-[var(--text-muted)]">
                  {currentRules.helpText}{" "}
                  <a href="tel:9074525205" className="font-semibold text-[var(--text-primary)] hover:underline">9074525205</a>{" "}
                  {currentRules.or}{" "}
                  <a href="tel:7034585359" className="font-semibold text-[var(--text-primary)] hover:underline">7034585359</a>.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Column - Registration Form */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }} 
          transition={{ duration: 0.6, delay: 0.2 }}
          className="lg:col-span-2"
        >
          <div className="bg-[var(--surface)] rounded-3xl p-6 md:p-8 shadow-lg border border-[var(--border)]">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">{t("registerTeam")}</h2>
              <p className="text-sm text-[var(--text-muted)]">{t("formSubtitle")}</p>
            </div>

            <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
              {/* Team Name */}
              <div>
                <label htmlFor="bq-team" className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide mb-2">{t("teamName")}</label>
                <input id="bq-team" type="text" required value={formData.teamName} onChange={(e) => setFormData({ ...formData, teamName: e.target.value })} placeholder={t("teamNamePlaceholder")} className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-turquoise)]/30 focus:border-[var(--color-turquoise)] focus:bg-[var(--surface)] transition-all placeholder:text-[var(--text-muted)] font-medium" />
              </div>

              {/* Members */}
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide mb-2">{t("teamMembers")} (Min 5, Max 7)</label>
                <div className="space-y-3">
                  {formData.members.map((member, index) => (
                    <div key={index} className="flex gap-2">
                      <input 
                        type="text" 
                        required={index < 5} 
                        value={member} 
                        onChange={(e) => handleMemberChange(index, e.target.value)} 
                        placeholder={t("memberPlaceholder", { number: index + 1 }) + (index === 0 ? ` ${t("leaderSuffix")}` : "")} 
                        className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-turquoise)]/30 focus:border-[var(--color-turquoise)] focus:bg-[var(--surface)] transition-all placeholder:text-[var(--text-muted)] font-medium" 
                      />
                      {index >= 5 && (
                        <button type="button" onClick={() => removeMember(index)} className="px-3 py-2 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 transition-colors">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      )}
                    </div>
                  ))}
                  {formData.members.length < 7 && (
                    <button type="button" onClick={addMember} className="text-sm font-medium text-[var(--color-turquoise)] hover:text-[var(--color-navy)] dark:hover:text-[var(--color-brass)] transition-colors flex items-center gap-1 mt-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                      {t("addMember") || "Add Member"}
                    </button>
                  )}
                </div>
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="bq-phone" className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide mb-2">{t("teamPhone")}</label>
                <input id="bq-phone" type="tel" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder={t("phonePlaceholder")} className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-turquoise)]/30 focus:border-[var(--color-turquoise)] focus:bg-[var(--surface)] transition-all placeholder:text-[var(--text-muted)] font-medium" />
              </div>

              {/* Telegram Link Info */}
              <div className="p-4 bg-[var(--color-turquoise)]/5 rounded-xl border border-[var(--color-turquoise)]/20">
                <label htmlFor="bq-telegram" className="block text-xs font-bold text-[var(--color-turquoise)] uppercase tracking-wide mb-2">{t("telegramLabel")}</label>
                <input id="bq-telegram" type="text" required value={formData.telegramLink} onChange={(e) => setFormData({ ...formData, telegramLink: e.target.value })} placeholder={t("telegramPlaceholder")} className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-turquoise)]/30 focus:border-[var(--color-turquoise)] transition-all placeholder:text-[var(--text-muted)] font-medium mb-3" />
                <div className="text-xs text-[var(--color-turquoise)]/80 leading-tight">
                  <span className="font-bold">{t("telegramImportant")}</span>{" "}
                  {renderWithTelegramLink(t("telegramInstructions"))}
                </div>
              </div>

              {/* Payment Details & Upload */}
              <div className="p-5 bg-[var(--surface-elevated)] rounded-xl border border-[var(--border)]">
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
                    <div className="text-xs text-[var(--text-secondary)] font-medium bg-[var(--surface)] px-3 py-2 rounded-lg border border-[var(--border)] shadow-sm flex justify-between items-center cursor-pointer hover:bg-[var(--surface-elevated)] transition-colors" onClick={() => { navigator.clipboard.writeText('300'); alert('Amount copied!'); }}>
                      <span>{t("amount")} <span className="font-bold text-[var(--color-navy)] dark:text-[var(--color-turquoise)]">₹300</span></span>
                      <svg className="w-3.5 h-3.5 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    </div>
                    <div className="text-xs text-[var(--text-secondary)] font-medium bg-[var(--surface)] px-3 py-2 rounded-lg border border-[var(--border)] shadow-sm flex justify-between items-center">
                      <span>{t("name")} <span className="font-bold">{t("payeeName") || "Muhammed Sinan"}</span></span>
                    </div>
                    <div className="text-xs text-[var(--text-secondary)] font-medium bg-[var(--surface)] px-3 py-2 rounded-lg border border-[var(--border)] shadow-sm flex justify-between items-center cursor-pointer hover:bg-[var(--surface-elevated)] transition-colors" onClick={() => { navigator.clipboard.writeText('sinanvettam@okicici'); alert('UPI ID copied!'); }}>
                      <span>{t("upiId")} <span className="font-mono text-[var(--color-navy)] dark:text-[var(--color-turquoise)]">sinanvettam@okicici</span></span>
                      <svg className="w-3.5 h-3.5 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    </div>
                    <div className="text-xs text-[var(--text-secondary)] font-medium bg-[var(--surface)] px-3 py-2 rounded-lg border border-[var(--border)] shadow-sm flex justify-between items-center cursor-pointer hover:bg-[var(--surface-elevated)] transition-colors" onClick={() => { navigator.clipboard.writeText('7034585359'); alert('Phone number copied!'); }}>
                      <span>{t("phone")} <span className="font-mono text-[var(--color-navy)] dark:text-[var(--color-turquoise)]">7034585359</span></span>
                      <svg className="w-3.5 h-3.5 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    </div>
                  </div>
                </div>

                <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide mb-2">{t("uploadScreenshot")}</label>
                <div className="flex items-center justify-center w-full">
                  <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-[var(--border-strong)] border-dashed rounded-xl cursor-pointer bg-[var(--surface)] hover:bg-[var(--surface-elevated)] transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg className="w-8 h-8 mb-2 text-[var(--text-muted)]" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                      </svg>
                      <p className="mb-1 text-sm text-[var(--text-muted)]"><span className="font-semibold">{t("clickToUpload")}</span> {t("orDragDrop")}</p>
                      <p className="text-xs text-[var(--text-muted)]">{t("fileTypes")}</p>
                    </div>
                    <input id="dropzone-file" type="file" className="hidden" accept="image/*" required onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file && file.size > 5 * 1024 * 1024) {
                        setFormError(t("imageSizeError") || "Screenshot must be less than 5MB.");
                        setFormData({ ...formData, screenshot: null });
                      } else {
                        setFormError(null);
                        setFormData({ ...formData, screenshot: file || null });
                      }
                    }} />
                  </label>
                </div>
                {formData.screenshot && (
                  <div className="mt-2 text-xs text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    {t("fileSelected")} {formData.screenshot.name}
                  </div>
                )}
              </div>

              {formError && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-red-600 dark:text-red-400 font-medium">{formError}</p>
                </div>
              )}

              {/* Submit */}
              <button disabled={isSubmitting} type="submit" className="w-full py-4 rounded-xl text-sm font-bold tracking-wide uppercase bg-[var(--color-navy)] text-white hover:bg-[var(--color-navy)]/90 transition-all active:scale-[0.98] shadow-md hover:shadow-xl mt-6 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed">
                {isSubmitting ? (t("submitting") || "Submitting...") : t("submitRegistration")}
                {!isSubmitting && <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function BurdaQawwaliRegistration() {
  return (
    <RegistrationGuard slug="burda-qawwali">
      <BurdaQawwaliForm />
    </RegistrationGuard>
  );
}
