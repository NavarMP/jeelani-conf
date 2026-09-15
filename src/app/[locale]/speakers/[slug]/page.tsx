import { getSpeakers, getSessions } from "@/lib/data";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata, ResolvingMetadata } from "next";
import { formatSessionTimeRange } from "@/lib/sessionHelpers";

type Props = {
  params: Promise<{ slug: string }>;
};



export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;
  const speakers = await getSpeakers();
  const speaker = speakers.find((s) => s.slug === slug);
  if (!speaker) return { title: "Not Found" };
  return {
    title: `${speaker.name} | Speakers`,
    description: speaker.bio,
  };
}

export default async function SpeakerPage({ params }: Props) {
  const { slug } = await params;
  const speakers = await getSpeakers();
  const speaker = speakers.find((s) => s.slug === slug);

  if (!speaker) {
    notFound();
  }

  const sessions = await getSessions();
  const speakerSessions = sessions.filter((s) =>
    s.speakers?.some((sp) => sp.id === speaker.id)
  );

  return (
    <div className="min-h-[100dvh] pt-24 pb-32 bg-[var(--background)]">
      <div className="container-site max-w-4xl mx-auto">
        <Link
          href="/speakers"
          className="inline-flex items-center text-sm text-[var(--color-turquoise)] mb-8 hover:underline"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to all speakers
        </Link>

        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Avatar */}
          <div
            className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-gradient-to-br from-[var(--color-navy)] to-[var(--color-turquoise)] flex items-center justify-center shrink-0 shadow-lg shadow-[var(--color-turquoise)]/10"
            style={{
              clipPath:
                "polygon(50% 0%, 61% 5%, 72% 2%, 80% 10%, 90% 8%, 95% 18%, 100% 25%, 98% 37%, 100% 50%, 98% 63%, 100% 75%, 95% 82%, 90% 92%, 80% 90%, 72% 98%, 61% 95%, 50% 100%, 39% 95%, 28% 98%, 20% 90%, 10% 92%, 5% 82%, 0% 75%, 2% 63%, 0% 50%, 2% 37%, 0% 25%, 5% 18%, 10% 8%, 20% 10%, 28% 2%, 39% 5%)",
            }}
          >
            <svg viewBox="0 0 80 80" className="w-20 h-20 md:w-24 md:h-24 text-white/30" fill="currentColor">
              <circle cx="40" cy="28" r="14" />
              <path d="M15 72 Q15 50 40 45 Q65 50 65 72 Z" />
            </svg>
          </div>

          <div className="flex-1">
            {speaker.title && (
              <p className="text-sm text-[var(--color-turquoise)] font-medium uppercase tracking-wider mb-2">
                {speaker.title}
              </p>
            )}
            <h1
              className="text-3xl md:text-5xl font-bold text-[var(--text-primary)] mb-6"
              style={{ fontFamily: "var(--font-bodoni-moda)" }}
            >
              {speaker.name}
            </h1>
            <div className="prose prose-invert max-w-none text-[var(--text-secondary)]">
              <p className="text-lg leading-relaxed">{speaker.bio}</p>
            </div>
          </div>
        </div>

        {/* Sessions Section */}
        {speakerSessions.length > 0 && (
          <div className="mt-16 pt-12 border-t border-[var(--border)]">
            <h2
              className="text-2xl font-bold text-[var(--text-primary)] mb-8"
              style={{ fontFamily: "var(--font-bodoni-moda)" }}
            >
              Sessions by {speaker.name}
            </h2>
            <div className="grid gap-6 sm:grid-cols-2">
              {speakerSessions.map((session) => (
                <Link
                  key={session.id}
                  href={`/sessions/${session.slug}`}
                  className="group block p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--color-turquoise)]/30 hover:shadow-md transition-all"
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[var(--color-turquoise)]/10 text-[var(--color-turquoise)] border border-[var(--color-turquoise)]/20">
                      Stage {session.stage}
                    </span>
                    <span className="text-sm text-[var(--text-muted)] font-medium">
                      {formatSessionTimeRange(session.start_time, session.end_time)}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2 group-hover:text-[var(--color-turquoise)] transition-colors">
                    {session.title}
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)] line-clamp-2">
                    {session.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
