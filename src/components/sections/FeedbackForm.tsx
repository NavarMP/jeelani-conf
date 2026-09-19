"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  Star,
  Send,
  ChevronDown,
  User,
  Sparkles,
  MessageSquareHeart,
  CalendarCheck,
  Mic2,
  MapPin,
  UtensilsCrossed,
  ClipboardList,
  Lightbulb,
  Check,
  Loader2,
} from "lucide-react";
import { submitFeedback } from "@/app/[locale]/admin/actions";
import { feedbackSchema } from "@/lib/validation/schemas";
import { Magnetic } from "@/components/ui/Magnetic";

/* ── Category Configuration ──────────────────────────────────────────── */
const FEEDBACK_CATEGORIES = [
  { key: "general", icon: MessageSquareHeart, label: "General" },
  { key: "sessions", icon: CalendarCheck, label: "Sessions & Content" },
  { key: "speakers", icon: Mic2, label: "Speakers" },
  { key: "venue", icon: MapPin, label: "Venue & Logistics" },
  { key: "food", icon: UtensilsCrossed, label: "Food & Hospitality" },
  { key: "registration", icon: ClipboardList, label: "Registration" },
  { key: "suggestion", icon: Lightbulb, label: "Suggestion" },
] as const;

const CATEGORY_RATINGS = [
  { key: "sessions_content", label: "Sessions & Content", icon: CalendarCheck },
  { key: "speakers", label: "Speakers & Presentations", icon: Mic2 },
  { key: "venue_logistics", label: "Venue & Logistics", icon: MapPin },
  { key: "food_hospitality", label: "Food & Hospitality", icon: UtensilsCrossed },
  { key: "registration_process", label: "Registration Process", icon: ClipboardList },
];

/* ── Interactive Star Rating ─────────────────────────────────────────── */
function StarRating({
  value,
  onChange,
  size = "lg",
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  size?: "sm" | "lg";
  label?: string;
}) {
  const [hoverValue, setHoverValue] = useState(0);
  const displayValue = hoverValue || value;

  const starLabels = ["Poor", "Fair", "Good", "Very Good", "Excellent"];
  const starSize = size === "lg" ? "w-10 h-10 sm:w-12 sm:h-12" : "w-6 h-6";

  return (
    <div className="flex flex-col items-center gap-2">
      {label && (
        <span className="text-sm font-medium text-[var(--text-secondary)]">
          {label}
        </span>
      )}
      <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <motion.button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`${star} star${star > 1 ? "s" : ""} - ${starLabels[star - 1]}`}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            onMouseEnter={() => setHoverValue(star)}
            onMouseLeave={() => setHoverValue(0)}
            onClick={() => onChange(star)}
            className="relative cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brass)] rounded-lg p-1 transition-colors"
          >
            <Star
              className={`${starSize} transition-all duration-200 ${
                star <= displayValue
                  ? "fill-[var(--color-brass)] text-[var(--color-brass)] drop-shadow-[0_0_8px_rgba(255,200,0,0.4)]"
                  : "text-[var(--border-strong)] fill-transparent"
              }`}
              strokeWidth={1.5}
            />
            {/* Glow effect */}
            {star <= displayValue && size === "lg" && (
              <motion.div
                className="absolute inset-0 rounded-full bg-[var(--color-brass)] opacity-10 blur-lg"
                initial={{ scale: 0 }}
                animate={{ scale: 1.5 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </motion.button>
        ))}
      </div>
      {/* Label */}
      {size === "lg" && (
        <AnimatePresence mode="wait">
          {displayValue > 0 && (
            <motion.span
              key={displayValue}
              initial={{ y: 5, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -5, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="text-sm font-semibold text-[var(--color-brass)]"
            >
              {starLabels[displayValue - 1]}
            </motion.span>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}

/* ── Confetti Particle ───────────────────────────────────────────────── */
function ConfettiParticle({ delay, color }: { delay: number; color: string }) {
  const x = Math.random() * 400 - 200;
  const rotate = Math.random() * 720 - 360;

  return (
    <motion.div
      className="absolute w-2 h-2 rounded-sm"
      style={{ backgroundColor: color, left: "50%", top: "40%" }}
      initial={{ x: 0, y: 0, rotate: 0, opacity: 1, scale: 1 }}
      animate={{
        x,
        y: [0, -100, 300],
        rotate,
        opacity: [1, 1, 0],
        scale: [1, 1.2, 0.5],
      }}
      transition={{
        duration: 2,
        delay,
        ease: "easeOut",
      }}
    />
  );
}

/* ── Main Form Component ─────────────────────────────────────────────── */
export default function FeedbackForm() {
  const t = useTranslations("Feedback");

  // Form state
  const [overallRating, setOverallRating] = useState(0);
  const [categoryRatings, setCategoryRatings] = useState<Record<string, number>>({});
  const [feedbackText, setFeedbackText] = useState("");
  const [category, setCategory] = useState("general");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  // UI state
  const [showCategoryRatings, setShowCategoryRatings] = useState(false);
  const [showIdentity, setShowIdentity] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const formRef = useRef<HTMLDivElement>(null);

  const handleCategoryRating = (key: string, value: number) => {
    setCategoryRatings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    setErrors({});

    const formData = {
      name: name || undefined,
      phone: phone || undefined,
      email: email || undefined,
      overall_rating: overallRating,
      category_ratings: Object.keys(categoryRatings).length > 0 ? categoryRatings : undefined,
      feedback_text: feedbackText,
      category,
    };

    // Validate
    const result = feedbackSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as string;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      await submitFeedback({
        ...formData,
        source: "web",
        user_agent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
      });
      setIsSuccess(true);
    } catch {
      setErrors({ form: "Something went wrong. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Success State ──
  if (isSuccess) {
    const confettiColors = [
      "var(--color-brass)",
      "var(--color-turquoise)",
      "var(--color-rose)",
      "var(--color-navy)",
      "#4ADE80",
      "#F472B6",
    ];

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, type: "spring" }}
        className="relative flex flex-col items-center justify-center text-center py-16 px-6 overflow-hidden"
      >
        {/* Confetti */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 30 }).map((_, i) => (
            <ConfettiParticle
              key={i}
              delay={i * 0.05}
              color={confettiColors[i % confettiColors.length]}
            />
          ))}
        </div>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--color-brass)] to-amber-500 flex items-center justify-center mb-6 shadow-lg"
        >
          <Check className="w-10 h-10 text-white" strokeWidth={2.5} />
        </motion.div>

        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-3"
          style={{ fontFamily: "var(--font-bodoni-moda)" }}
        >
          {t("successTitle")}
        </motion.h2>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-[var(--text-secondary)] max-w-md text-lg"
        >
          {t("successMessage")}
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-8 flex gap-3"
        >
          <button
            onClick={() => {
              setIsSuccess(false);
              setOverallRating(0);
              setCategoryRatings({});
              setFeedbackText("");
              setCategory("general");
              setName("");
              setPhone("");
              setEmail("");
            }}
            className="px-6 py-3 rounded-xl bg-[var(--color-navy)] text-white font-medium hover:opacity-90 transition-opacity"
          >
            Submit Another
          </button>
        </motion.div>
      </motion.div>
    );
  }

  // ── Main Form ──
  return (
    <div ref={formRef} className="space-y-8">
      {/* ──────── Overall Rating ──────── */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-[var(--surface)] rounded-2xl p-6 sm:p-8 border border-[var(--border)] shadow-sm"
      >
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-5 text-center">
          {t("overallRating")}
        </h3>
        <StarRating value={overallRating} onChange={setOverallRating} />
        {errors.overall_rating && (
          <p className="text-red-500 text-sm text-center mt-3">{errors.overall_rating}</p>
        )}
      </motion.div>

      {/* ──────── Category Selector ──────── */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15 }}
      >
        <label className="text-sm font-medium text-[var(--text-secondary)] mb-3 block">
          {t("categoryLabel") || "What is this feedback about?"}
        </label>
        <div className="flex flex-wrap gap-2">
          {FEEDBACK_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = category === cat.key;
            return (
              <motion.button
                key={cat.key}
                type="button"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setCategory(cat.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 ${
                  isActive
                    ? "bg-[var(--color-navy)] text-white border-[var(--color-navy)] shadow-md"
                    : "bg-[var(--surface)] text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--color-navy)] hover:text-[var(--text-primary)]"
                }`}
              >
                <Icon className="w-4 h-4" strokeWidth={1.75} />
                <span>{t(`categories.${cat.key}`) || cat.label}</span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* ──────── Feedback Text ──────── */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="relative"
      >
        <textarea
          value={feedbackText}
          onChange={(e) => setFeedbackText(e.target.value)}
          placeholder={t("feedbackPlaceholder")}
          rows={5}
          maxLength={2000}
          className={`w-full px-5 py-4 rounded-2xl border text-[var(--text-primary)] bg-[var(--surface)] placeholder-[var(--text-muted)] resize-none transition-all duration-300 focus:outline-none focus:ring-2 ${
            errors.feedback_text
              ? "border-red-400 focus:ring-red-300"
              : "border-[var(--border)] focus:ring-[var(--color-turquoise)] focus:border-[var(--color-turquoise)]"
          }`}
          style={{ fontSize: "0.95rem", lineHeight: "1.7" }}
        />
        <div className="flex justify-between items-center mt-2 px-1">
          {errors.feedback_text ? (
            <p className="text-red-500 text-xs">{errors.feedback_text}</p>
          ) : (
            <span className="text-xs text-[var(--text-muted)]">Min 10 characters</span>
          )}
          <span
            className={`text-xs font-mono ${
              feedbackText.length > 1800
                ? "text-red-500"
                : feedbackText.length > 1500
                ? "text-amber-500"
                : "text-[var(--text-muted)]"
            }`}
          >
            {feedbackText.length}/2000
          </span>
        </div>
      </motion.div>

      {/* ──────── Category Ratings (Collapsible) ──────── */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] overflow-hidden"
      >
        <button
          type="button"
          onClick={() => setShowCategoryRatings(!showCategoryRatings)}
          className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-[var(--surface-elevated)] transition-colors"
        >
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-[var(--color-turquoise)]" strokeWidth={1.75} />
            <span className="font-medium text-[var(--text-primary)]">
              {t("categoryRatings")}
            </span>
            <span className="text-xs text-[var(--text-muted)] bg-[var(--surface-elevated)] px-2 py-0.5 rounded-full">
              Optional
            </span>
          </div>
          <motion.div
            animate={{ rotate: showCategoryRatings ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-5 h-5 text-[var(--text-muted)]" />
          </motion.div>
        </button>

        <AnimatePresence>
          {showCategoryRatings && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="px-6 pb-5 space-y-4 border-t border-[var(--border)]">
                <div className="h-4" />
                {CATEGORY_RATINGS.map((cr) => {
                  const Icon = cr.icon;
                  return (
                    <div
                      key={cr.key}
                      className="flex items-center justify-between gap-4 py-2"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon className="w-4 h-4 text-[var(--color-turquoise)] shrink-0" strokeWidth={1.75} />
                        <span className="text-sm text-[var(--text-primary)] truncate">
                          {cr.label}
                        </span>
                      </div>
                      <StarRating
                        value={categoryRatings[cr.key] || 0}
                        onChange={(v) => handleCategoryRating(cr.key, v)}
                        size="sm"
                      />
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ──────── Identity Section (Collapsible) ──────── */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] overflow-hidden"
      >
        <button
          type="button"
          onClick={() => setShowIdentity(!showIdentity)}
          className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-[var(--surface-elevated)] transition-colors"
        >
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-[var(--color-rose)]" strokeWidth={1.75} />
            <span className="font-medium text-[var(--text-primary)]">
              {t("identityToggle")}
            </span>
            <span className="text-xs text-[var(--text-muted)] bg-[var(--surface-elevated)] px-2 py-0.5 rounded-full">
              Optional
            </span>
          </div>
          <motion.div
            animate={{ rotate: showIdentity ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-5 h-5 text-[var(--text-muted)]" />
          </motion.div>
        </button>

        <AnimatePresence>
          {showIdentity && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="px-6 pb-5 space-y-4 border-t border-[var(--border)]">
                <div className="h-4" />
                {/* Name */}
                <div>
                  <label className="text-sm font-medium text-[var(--text-secondary)] mb-1.5 block">
                    Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-turquoise)] focus:border-[var(--color-turquoise)] transition-all"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="text-sm font-medium text-[var(--text-secondary)] mb-1.5 block">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="10-digit phone number"
                    className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-turquoise)] focus:border-[var(--color-turquoise)] transition-all"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="text-sm font-medium text-[var(--text-secondary)] mb-1.5 block">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-turquoise)] focus:border-[var(--color-turquoise)] transition-all"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ──────── Form Error ──────── */}
      <AnimatePresence>
        {errors.form && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl px-5 py-3 text-red-600 dark:text-red-400 text-sm"
          >
            {errors.form}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ──────── Submit Button ──────── */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="pt-2"
      >
        <Magnetic>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || overallRating === 0}
            className={`w-full flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-semibold text-base transition-all duration-300 shadow-lg ${
              isSubmitting || overallRating === 0
                ? "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed shadow-none"
                : "bg-gradient-to-r from-[var(--color-navy)] via-[var(--color-navy)] to-[var(--color-turquoise)] text-white hover:shadow-xl hover:shadow-[var(--color-navy)]/20 active:scale-[0.98]"
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{t("submitting")}</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" strokeWidth={1.75} />
                <span>{t("submit")}</span>
              </>
            )}
          </button>
        </Magnetic>
      </motion.div>
    </div>
  );
}
