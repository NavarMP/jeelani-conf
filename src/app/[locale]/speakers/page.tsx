import { getSpeakers, getSessions } from "@/lib/data";
import type { Metadata } from "next";
import SpeakersGridClient from "./SpeakersGridClient";

export const metadata: Metadata = {
  title: "Speakers",
  description: "Distinguished scholars, spiritual leaders, and academics at the Grand Jeelani Conference.",
};

export default async function SpeakersPage() {
  const speakers = await getSpeakers();
  const sessions = await getSessions();

  return (
    <div className="min-h-[100dvh] pt-24 pb-32 bg-[var(--background)] overflow-hidden relative">
      {/* Decorative Background Glows */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[var(--color-turquoise)]/5 rounded-full blur-[120px] pointer-events-none translate-x-1/3 -translate-y-1/3"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[var(--color-navy)]/10 rounded-full blur-[150px] pointer-events-none -translate-x-1/3 translate-y-1/3"></div>

      <div className="container-site relative z-10">
        {/* Header */}
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-[2px] bg-[var(--color-brass)]"></div>
            <span className="text-[var(--color-brass)] text-xs font-bold tracking-[0.2em] uppercase">
              The Luminaries
            </span>
            <div className="w-8 h-[2px] bg-[var(--color-brass)]"></div>
          </div>
          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--text-primary)] leading-tight mb-6"
            style={{ fontFamily: "var(--font-bodoni-moda)" }}
          >
            Distinguished <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-turquoise)] to-[var(--color-navy)]">Guests</span>
          </h1>
          <p className="text-[var(--text-secondary)] text-base md:text-lg leading-relaxed">
            Scholars, spiritual leaders, and academics who carry the torch of the Jilani tradition. Explore their profiles and upcoming sessions.
          </p>
        </div>

        {/* Animated Client Grid */}
        <SpeakersGridClient speakers={speakers} sessions={sessions} />
      </div>
    </div>
  );
}
