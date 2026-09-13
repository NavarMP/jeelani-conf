import { getSpeakers, getSessions } from "@/lib/data";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Speakers",
  description: "Distinguished scholars, spiritual leaders, and academics at the Grand Jeelani Conference.",
};

export default async function SpeakersPage() {
  const speakers = await getSpeakers();
  const sessions = await getSessions();

  return (
    <div className="min-h-[100dvh] pt-24 pb-32">
      <div className="container-site">
        {/* Header */}
        <div className="text-center mb-12">
          <h1
            className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]"
            style={{ fontFamily: "var(--font-bodoni-moda)" }}
          >
            Distinguished Speakers
          </h1>
          <p className="text-[var(--text-secondary)] text-sm mt-2 max-w-lg mx-auto">
            Scholars, spiritual leaders, and academics who carry the torch of the Jilani tradition.
          </p>
        </div>

        {/* Speakers grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-4xl mx-auto">
          {speakers.map((speaker) => {
            // Find sessions this speaker is part of
            const speakerSessions = sessions.filter((s) =>
              s.speakers?.some(sp => sp.id === speaker.id)
            );

            return (
              <div
                key={speaker.id}
                className="group p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--color-turquoise)]/30 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div
                    className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--color-navy)] to-[var(--color-turquoise)] flex items-center justify-center shrink-0 group-hover:shadow-lg group-hover:shadow-[var(--color-turquoise)]/10 transition-all"
                    style={{
                      clipPath:
                        "polygon(50% 0%, 61% 5%, 72% 2%, 80% 10%, 90% 8%, 95% 18%, 100% 25%, 98% 37%, 100% 50%, 98% 63%, 100% 75%, 95% 82%, 90% 92%, 80% 90%, 72% 98%, 61% 95%, 50% 100%, 39% 95%, 28% 98%, 20% 90%, 10% 92%, 5% 82%, 0% 75%, 2% 63%, 0% 50%, 2% 37%, 0% 25%, 5% 18%, 10% 8%, 20% 10%, 28% 2%, 39% 5%)",
                    }}
                  >
                    <svg viewBox="0 0 80 80" className="w-9 h-9 text-white/30" fill="currentColor">
                      <circle cx="40" cy="28" r="14" />
                      <path d="M15 72 Q15 50 40 45 Q65 50 65 72 Z" />
                    </svg>
                  </div>

                  <div className="flex-1 min-w-0">
                    {speaker.title && (
                      <p className="text-[10px] text-[var(--color-turquoise)] font-medium uppercase tracking-wider">
                        {speaker.title}
                      </p>
                    )}
                    <h2 className="text-sm font-semibold text-[var(--text-primary)] leading-snug">
                      {speaker.name}
                    </h2>
                  </div>
                </div>

                <p className="text-xs text-[var(--text-muted)] mt-3 leading-relaxed">
                  {speaker.bio}
                </p>

                {/* Sessions this speaker appears in */}
                {speakerSessions.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-[var(--border)]">
                    <p className="text-[10px] text-[var(--text-muted)] font-medium uppercase tracking-wider mb-1.5">Sessions</p>
                    <div className="flex flex-wrap gap-1.5">
                      {speakerSessions.map((s) => (
                        <Link
                          key={s.id}
                          href={`/sessions/${s.slug}`}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-turquoise)]/8 text-[var(--color-turquoise)] hover:bg-[var(--color-turquoise)]/15 transition-colors border border-[var(--color-turquoise)]/10"
                        >
                          {s.title.length > 35 ? s.title.slice(0, 35) + "…" : s.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
