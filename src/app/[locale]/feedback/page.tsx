import { setRequestLocale } from "next-intl/server";
import FeedbackForm from "@/components/sections/FeedbackForm";

export const metadata = {
  title: "Share Your Feedback | Grand Jeelani Conference",
  description:
    "Help us make the Grand Jeelani Conference even better. Share your experience, rate sessions, speakers, and venue — your voice matters.",
};

export default async function FeedbackPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const params = await props.params;
  setRequestLocale(params.locale);

  return (
    <section className="relative min-h-screen py-16 sm:py-24 overflow-hidden">
      {/* Decorative background */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: "url('/motifs/tile-repeat-fill.svg')",
          backgroundRepeat: "repeat",
          backgroundSize: "200px 200px",
        }}
        aria-hidden="true"
      />

      {/* Gradient orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[var(--color-turquoise)] rounded-full opacity-[0.04] blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[var(--color-brass)] rounded-full opacity-[0.05] blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 left-0 w-64 h-64 bg-[var(--color-rose)] rounded-full opacity-[0.03] blur-[80px] pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-14">
          <span className="inline-block text-[var(--color-brass)] text-xs font-semibold tracking-[0.2em] uppercase mb-4">
            ✦ We Value Your Voice ✦
          </span>

          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-4 leading-tight"
            style={{ fontFamily: "var(--font-bodoni-moda)" }}
          >
            Share Your Experience
          </h1>

          <p className="text-[var(--text-secondary)] text-base sm:text-lg max-w-lg mx-auto leading-relaxed">
            Help us make the Grand Jeelani Conference even better. Your feedback shapes the future of this gathering.
          </p>

          {/* Decorative divider */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <div className="w-12 h-[1px] bg-gradient-to-r from-transparent to-[var(--color-brass)]" />
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-brass)]" />
            <div className="w-12 h-[1px] bg-gradient-to-l from-transparent to-[var(--color-brass)]" />
          </div>
        </div>

        {/* Form */}
        <FeedbackForm />

        {/* Footer note */}
        <p className="text-center text-xs text-[var(--text-muted)] mt-10 max-w-sm mx-auto">
          Your feedback is confidential and will be used solely to improve our conference experience. Anonymous submissions are welcome.
        </p>
      </div>
    </section>
  );
}
