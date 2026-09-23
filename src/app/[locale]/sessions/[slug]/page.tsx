import { getSessionBySlug } from "@/lib/data";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { formatSessionTimeRange, getSessionRegistration } from "@/lib/sessionHelpers";
import { ArrowLeft, ArrowRight, ArrowUpRight, Clock, MapPin } from "lucide-react";

import { constructOgImageUrl, truncateText } from "@/lib/og-utils";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const session = await getSessionBySlug(slug);
  if (!session) return { title: "Session Not Found" };
  
  const timeFormatted = formatSessionTimeRange(session.start_time, session.end_time);
  const speakersList = session.speakers?.map(s => s.name).join(", ") || "";
  
  const ogImageUrl = constructOgImageUrl("session", {
    title: truncateText(session.title, 60),
    desc: truncateText(speakersList || session.description, 60),
    time: timeFormatted,
  });

  return {
    title: session.title,
    description: session.description,
    openGraph: {
      title: session.title,
      description: truncateText(session.description, 160),
      images: [{ url: ogImageUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: session.title,
      description: truncateText(session.description, 160),
      images: [ogImageUrl],
    },
  };
}

export default async function SessionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await getSessionBySlug(slug);
  if (!session) notFound();

  const sessionSpeakers = session.speakers || [];
  const regInfo = getSessionRegistration(session);
  const timeFormatted = formatSessionTimeRange(session.start_time, session.end_time);

  const typeLabels: Record<string, string> = {
    talk: "Academic Talk",
    ceremony: "Ceremony",
    meal: "Break",
    mawlid: "Mawlid Gathering",
    meeting: "Management Meet",
    paid_session: "Paid Session",
    competition: "Competition",
    closing: "Closing Ceremony",
    external_redirect: "Grand Assembly",
    // paper_presentation: "Paper Presentation",
  };

  return (
    <div className="min-h-[100dvh] pt-24 pb-32 px-6">
      <div className="max-w-2xl mx-auto">
        <Link href="/#schedule" className="text-xs text-[var(--color-turquoise)] hover:underline mb-6 inline-flex items-center gap-1">
          <ArrowLeft className="w-3 h-3" strokeWidth={2.25} aria-hidden="true" /> Back to Schedule
        </Link>

        {/* Badge row */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="text-[10px] px-2.5 py-1 rounded-full font-medium bg-[var(--color-turquoise)]/10 text-[var(--color-turquoise)]">
            {session.stage}
          </span>
          {/* <span className="text-[10px] px-2.5 py-1 rounded-full font-medium bg-[var(--color-navy)]/10 text-[var(--color-navy)]">
            {typeLabels[session.type] || session.type.replace("_", " ")}
          </span> */}
          {session.is_paid && (
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

        {session.title_ml && (
          <p className="text-base text-[var(--text-muted)] mb-4" style={{ fontFamily: "var(--font-malayalam-title)" }}>
            {session.title_ml}
          </p>
        )}

        {/* Time */}
        <div className="flex items-center gap-3 mb-8 text-sm text-[var(--text-secondary)] font-medium">
          <span className="inline-flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" strokeWidth={2} aria-hidden="true" /> {timeFormatted}</span>
          <span className="inline-flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" strokeWidth={2} aria-hidden="true" />{session.stage}</span>
        </div>

        {/* Description */}
        <div className="prose prose-sm max-w-none mb-10">
          <p className="text-[var(--text-secondary)] leading-relaxed text-base">{session.description}</p>
        </div>

        {/* Nested Programs */}
        {session.programs && session.programs.length > 0 && (
          <div className="mb-10">
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4" style={{ fontFamily: "var(--font-bodoni-moda)" }}>
              Programs
            </h2>
            <div className="space-y-4">
              {session.programs.map((program) => {
                const progSpeakers = program.speakers || [];
                return (
                  <div key={program.id} className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)]">
                    <p className="text-xs font-semibold text-[var(--color-navy)] dark:text-[var(--color-turquoise)] mb-2">
                      {formatSessionTimeRange(program.start_time, program.end_time)}
                    </p>
                    <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">
                      {program.title}
                    </h3>
                    {program.title_ml && (
                      <p className="text-xs text-[var(--text-muted)] mb-3" style={{ fontFamily: "var(--font-malayalam-title)" }}>
                        {program.title_ml}
                      </p>
                    )}
                    {program.description && (
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-3">
                        {program.description}
                      </p>
                    )}
                    {progSpeakers.length > 0 && (
                      <div className="pt-3 border-t border-[var(--border)]/50">
                        <p className="text-xs text-[var(--text-muted)] font-medium mb-2">Speakers:</p>
                        <div className="flex flex-col gap-2">
                          {progSpeakers.map((speaker) => (
                            <div key={speaker.id} className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-navy)] to-[var(--color-turquoise)] flex items-center justify-center shrink-0">
                                <svg viewBox="0 0 80 80" className="w-5 h-5 text-white/30" fill="currentColor"><circle cx="40" cy="28" r="14"/><path d="M15 72 Q15 50 40 45 Q65 50 65 72 Z"/></svg>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-[var(--text-primary)]">{speaker.name}</p>
                                {speaker.title && <p className="text-[10px] text-[var(--text-muted)]">{speaker.title}</p>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Speakers */}
        {sessionSpeakers.length > 0 && (
          <div className="mb-10">
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4" style={{ fontFamily: "var(--font-bodoni-moda)" }}>
              Speaker{sessionSpeakers.length > 1 ? "s" : ""}
            </h2>
            <div className="space-y-4">
              {sessionSpeakers.map((speaker) => (
                <div key={speaker.id} className="flex items-start gap-4 p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)]">
                  {/* Avatar */}
                  {speaker.image_url ? (
                    <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 border border-[var(--border)]">
                      <img src={speaker.image_url} alt={speaker.name} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[var(--color-navy)] to-[var(--color-turquoise)] flex items-center justify-center shrink-0">
                      <svg viewBox="0 0 80 80" className="w-8 h-8 text-white/30" fill="currentColor"><circle cx="40" cy="28" r="14"/><path d="M15 72 Q15 50 40 45 Q65 50 65 72 Z"/></svg>
                    </div>
                  )}
                  <div>
                    {speaker.title && (
                      <p className="text-[10px] text-[var(--color-turquoise)] font-medium uppercase tracking-wider">{speaker.title}</p>
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
        <div className="flex flex-wrap items-center gap-3">
          {regInfo && (
            <Link
              href={regInfo.url}
              target={regInfo.isExternal ? "_blank" : undefined}
              rel={regInfo.isExternal ? "noopener noreferrer" : undefined}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold bg-[var(--color-turquoise)] text-white hover:bg-[var(--hover-turquoise)] shadow-md hover:shadow-lg transition-all"
            >
              <span>{regInfo.label}</span>
              {regInfo.isExternal ? (
                <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={2.25} aria-hidden="true" />
              ) : (
                <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.25} aria-hidden="true" />
              )}
            </Link>
          )}
          <Link
            href="/#schedule"
            className="inline-flex items-center px-5 py-2.5 rounded-full text-sm font-medium border border-[var(--border-strong)] text-[var(--text-primary)] hover:bg-[var(--surface-elevated)] transition-all"
          >
            View Full Schedule
          </Link>
        </div>
      </div>
    </div>
  );
}
