"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { CircleCheckBig } from "lucide-react";
import RegistrationGuard from "@/components/RegistrationGuard";

interface Member {
  name: string;
  phone: string;
}

export default function DarsManagementRegistration() {
  const [formData, setFormData] = useState({
    mahall: "",
    darsInstitution: "",
    memberCount: 1,
  });
  const [members, setMembers] = useState<Member[]>([{ name: "", phone: "" }]);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const t = useTranslations("DarsManagement");

  const handleMemberCountChange = (count: number) => {
    setFormData({ ...formData, memberCount: count });
    const newMembers = [...members];
    while (newMembers.length < count) {
      newMembers.push({ name: "", phone: "" });
    }
    setMembers(newMembers.slice(0, count));
  };

  const updateMember = (index: number, field: keyof Member, value: string) => {
    const newMembers = [...members];
    newMembers[index] = { ...newMembers[index], [field]: value };
    setMembers(newMembers);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    // Validate all members have name and phone
    const invalidMember = members.find((m, i) => !m.name.trim() || !m.phone.trim());
    if (invalidMember) {
      setError(t("membersError"));
      setIsSubmitting(false);
      return;
    }

    try {
      const supabase = createClient();
      const registrationId = `REG-DARS-${Date.now().toString(36).toUpperCase()}`;

      const { error: insertError } = await supabase.from("dynamic_registrations").insert({
        registration_id: registrationId,
        session_slug: "dars-management-meet",
        name: formData.mahall, // Use mahall as primary name
        phone: members[0].phone, // Primary contact
        place: formData.mahall,
        form_data: {
          mahall: formData.mahall,
          dars_institution: formData.darsInstitution || null,
          member_count: formData.memberCount,
          members: members,
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
    <RegistrationGuard slug="dars-management-meet">
    <div className="min-h-[100dvh] pt-24 pb-32 px-6">
      <div className="max-w-lg mx-auto">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
          <Link href="/#register" className="text-xs text-[var(--color-turquoise)] hover:underline mb-4 inline-block">
            {t("backToOptions")}
          </Link>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-[var(--color-navy)]/10 text-[var(--color-navy)] dark:bg-[var(--color-turquoise)]/10 dark:text-[var(--color-turquoise)]">
              {t("type")}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-1" style={{ fontFamily: "var(--font-bodoni-moda)" }}>
            {t("heading")}
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mb-2">{t("description")}</p>
          <p className="text-xs text-[var(--text-muted)] italic mb-8">{t("subtitle")}</p>
        </motion.div>

        <motion.form onSubmit={handleSubmit} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.1 }} className="space-y-5">
          <div>
            <label htmlFor="dm-mahall" className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">{t("mahall")}</label>
            <input id="dm-mahall" type="text" required value={formData.mahall} onChange={(e) => setFormData({ ...formData, mahall: e.target.value })} placeholder={t("mahallPlaceholder")} className={inputClass} />
          </div>

          <div>
            <label htmlFor="dm-dars" className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">{t("darsInstitution")}</label>
            <input id="dm-dars" type="text" value={formData.darsInstitution} onChange={(e) => setFormData({ ...formData, darsInstitution: e.target.value })} placeholder={t("darsPlaceholder")} className={inputClass} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-primary)] mb-2">{t("memberCount")}</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleMemberCountChange(num)}
                  className={`w-10 h-10 rounded-xl text-sm font-bold border transition-all ${
                    formData.memberCount === num
                      ? "border-[var(--color-turquoise)] bg-[var(--color-turquoise)] text-white shadow-sm"
                      : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--color-turquoise)]/30"
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-[var(--border)]">
            <h3 className="text-xs font-semibold text-[var(--text-primary)] mb-4 mt-2">{t("membersHeading")}</h3>
            <div className="space-y-4">
              {members.map((member, index) => (
                <div key={index} className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] space-y-3">
                  <div className="text-xs font-bold text-[var(--color-turquoise)]">
                    {t("member")} {index + 1} {index === 0 && <span className="text-[var(--text-muted)] font-normal">({t("primaryContact")})</span>}
                  </div>
                  <input
                    type="text"
                    required
                    value={member.name}
                    onChange={(e) => updateMember(index, "name", e.target.value)}
                    placeholder={t("memberNamePlaceholder")}
                    className={inputClass}
                  />
                  <input
                    type="tel"
                    required
                    value={member.phone}
                    onChange={(e) => updateMember(index, "phone", e.target.value)}
                    placeholder={t("memberPhonePlaceholder")}
                    className={inputClass}
                  />
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-xl text-sm font-semibold bg-[var(--color-navy)] dark:bg-[var(--color-turquoise)] text-white dark:text-[var(--color-black)] hover:bg-[var(--color-navy)]/90 dark:hover:bg-[var(--color-turquoise)]/90 transition-all active:scale-[0.98] shadow-sm mt-4 disabled:opacity-60"
          >
            {isSubmitting ? t("submitting") : t("submit")}
          </button>
        </motion.form>
      </div>
    </div>
    </RegistrationGuard>
  );
}
