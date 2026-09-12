import { sessions, getSpeakersForSession } from "@/lib/data";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

export function generateStaticParams() {
  return sessions.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const session = sessions.find((s) => s.slug === slug);
  if (!session) return { title: "Session Not Found" };
  return {
    title: session.title,
    description: session.description,
  };
}

export default async function SessionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = sessions.find((s) => s.slug === slug);
  if (!session) notFound();

  const sessionSpeakers = getSpeakersForSession(session.id);

  const typeLabels: Record<string, string> = {
    talk: "Academic Talk",
    ceremony: "Ceremony",
    meal: "Break",
    mawlid: "Mawlid Gathering",
    meeting: "Management Meet",
    paid_session: "Paid Session",
    paper_presentation: "Paper Presentation",
    closing: "Closing Ceremony",
  };

  return (
    <div className="min-h-[100dvh] pt-24 pb-32 px-6">
      <div className="max-w-2xl mx-auto">
        <Link href="/#schedule" className="text-xs text-[var(--color-turquoise)] hover:underline mb-6 inline-block">
          ← Back to Schedule
        </Link>

        {/* Badge row */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="text-[10px] px-2.5 py-1 rounded-full font-medium bg-[var(--color-turquoise)]/10 text-[var(--color-turquoise)]">
            Stage {session.stage}
          </span>
          <span className="text-[10px] px-2.5 py-1 rounded-full font-medium bg-[var(--color-navy)]/10 text-[var(--color-navy)]">
            {typeLabels[session.type] || session.type}
          </span>
          {session.isPaid && (
            <span className="text-[10px] px-2.5 py-1 rounded-full font-medium bg-[var(--color-brass)]/10 text-[var(--color-brass)]">
              Paid
            </span>
          )}
        </div>

        {/* Title */}
        <h1
          className="text-2xl md:text-3xl lg:text-4xl font-bold text-[var(--text-primary)] mb-2 leading-snug"
          style={{ fontFamily: "var(--font-bodoni-moda)" }}
        >
          {session.title}
        </h1>

        {session.titleMl && (
          <p className="text-base text-[var(--text-muted)] mb-4" style={{ fontFamily: "var(--font-noto-sans-malayalam)" }}>
            {session.titleMl}
          </p>
        )}

        {/* Time */}
        <div className="flex items-center gap-3 mb-8 text-sm text-[var(--text-secondary)]">
          <span>🕐 {session.startTime} – {session.endTime}</span>
          <span>📍 Stage {session.stage}</span>
        </div>

        {/* Description */}
        <div className="prose prose-sm max-w-none mb-10">
          <p className="text-[var(--text-secondary)] leading-relaxed text-base">{session.description}</p>
        </div>

        {/* Speakers */}
        {sessionSpeakers.length > 0 && (
          <div className="mb-10">
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4" style={{ fontFamily: "var(--font-bodoni-moda)" }}>
              Speaker{sessionSpeakers.length > 1 ? "s" : ""}
            </h2>
            <div className="space-y-4">
              {sessionSpeakers.map((speaker) => (
                <div key={speaker.id} className="flex items-start gap-4 p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)]">
                  {/* Placeholder avatar */}
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[var(--color-navy)] to-[var(--color-turquoise)] flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 80 80" className="w-8 h-8 text-white/30" fill="currentColor"><circle cx="40" cy="28" r="14"/><path d="M15 72 Q15 50 40 45 Q65 50 65 72 Z"/></svg>
                  </div>
                  <div>
                    {speaker.honorific && (
                      <p className="text-[10px] text-[var(--color-turquoise)] font-medium uppercase tracking-wider">{speaker.honorific}</p>
                    )}
                    <h3 className="text-sm font-semibold text-[var(--text-primary)]">{speaker.name}</h3>
                    <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">{speaker.bio}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTAs */}
        <div className="flex flex-wrap gap-3">
          {session.isPaid && (
            <Link href="/register/musthafa-darimi" className="inline-flex items-center px-5 py-2.5 rounded-full text-sm font-semibold bg-[var(--color-brass)] text-[var(--color-black)] hover:bg-[var(--hover-brass)] transition-all">
              Register for this Session
            </Link>
          )}
          <Link href="/#schedule" className="inline-flex items-center px-5 py-2.5 rounded-full text-sm font-medium border border-[var(--border-strong)] text-[var(--text-primary)] hover:bg-[var(--surface-elevated)] transition-all">
            View Full Schedule
          </Link>
        </div>
      </div>
    </div>
  );
}
