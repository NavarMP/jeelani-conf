import { getSessions, getSpeakers, getRegistrationSessions, getSiteSettings, getLiveStreams } from "@/lib/data";

/**
 * Builds rich context for the AI agent by fetching all site data
 * and formatting it as a structured string for the Gemini system prompt.
 */
export async function getAgentContext(): Promise<string> {
  const [sessions, speakers, registrationSessions, siteSettings, liveStreams] =
    await Promise.all([
      getSessions(),
      getSpeakers(),
      getRegistrationSessions(),
      getSiteSettings(),
      getLiveStreams(),
    ]);

  const now = new Date().toISOString();

  const parts: string[] = [];

  // ── Event Overview ──
  parts.push(`## Event Overview
- **Event**: Grand Jeelani Conference — "From Baghdad to Malabar"
- **Tagline**: ${siteSettings.tagline || "Persian Artistry. Malabar Soul."}
- **Date**: September 27, 2026 (Saturday)
- **Time**: 10:00 AM – 10:00 PM IST
- **Venue**: ${siteSettings.venue || "Alathurpadi, Melmuri, Malappuram, Kerala, India"}
- **Organizer**: ${siteSettings.organizer || "Alathurpadi Students Association (SUFFA Dars)"}
- **Theme**: A commemorative, academic, and spiritual assembly honoring Shaykh Abd al-Qadir al-Jilani (RA)
- **Map**: ${siteSettings.locationMapUrl || "https://maps.app.goo.gl/nCJ4g6Rx9B9Sn3c99"}
- **Website**: https://gjc.alathurpadidars.in
- **YouTube (Live Stream)**: https://www.youtube.com/@alathurpadidars
- **Current UTC Time**: ${now}`);

  // ── Speakers ──
  if (speakers.length > 0) {
    parts.push(`\n## Speakers (${speakers.length} total)`);
    speakers.forEach((s, i) => {
      parts.push(
        `${i + 1}. **${s.name}**${s.name_ml ? ` (${s.name_ml})` : ""} — ${s.title}${s.bio ? `\n   Bio: ${s.bio.substring(0, 200)}${s.bio.length > 200 ? "..." : ""}` : ""}${s.featured ? " ⭐ Featured" : ""}`
      );
    });
  }

  // ── Sessions / Schedule ──
  if (sessions.length > 0) {
    parts.push(`\n## Schedule (${sessions.length} sessions)`);
    sessions.forEach((s) => {
      const start = new Date(s.start_time).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Kolkata",
      });
      const end = new Date(s.end_time).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Kolkata",
      });
      const speakerNames =
        s.speakers?.map((sp) => sp.name).join(", ") || "TBA";

      parts.push(
        `- **${start}–${end}** | ${s.stage} | ${s.title}${s.title_ml ? ` (${s.title_ml})` : ""} | Type: ${s.type} | Speakers: ${speakerNames}${s.is_paid ? " | 💰 Paid" : ""}${s.description ? `\n  ${s.description.substring(0, 150)}${s.description.length > 150 ? "..." : ""}` : ""}`
      );

      // Child programs
      if (s.programs && s.programs.length > 0) {
        s.programs.forEach((p) => {
          const pStart = new Date(p.start_time).toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
            timeZone: "Asia/Kolkata",
          });
          const pEnd = new Date(p.end_time).toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
            timeZone: "Asia/Kolkata",
          });
          parts.push(
            `  └ ${pStart}–${pEnd} | ${p.title} | ${p.type}${p.speakers?.length ? ` | ${p.speakers.map((sp) => sp.name).join(", ")}` : ""}`
          );
        });
      }
    });
  }

  // ── Registration Sessions ──
  if (registrationSessions.length > 0) {
    parts.push(`\n## Registration Options (${registrationSessions.length} available)`);
    registrationSessions.forEach((rs) => {
      parts.push(
        `- **${rs.title}**${rs.title_ml ? ` (${rs.title_ml})` : ""} — ${rs.is_open ? "✅ Open" : "🔒 Closed"}${rs.price_label ? ` | Price: ${rs.price_label}` : " | Free"}${rs.description ? `\n  ${rs.description.substring(0, 150)}` : ""}\n  Registration link: /register/${rs.slug}`
      );
    });
  }

  // ── Live Stream Status ──
  const liveEntries = Object.entries(liveStreams);
  if (liveEntries.length > 0) {
    parts.push(`\n## Live Stream Status`);
    liveEntries.forEach(([stage, info]: [string, any]) => {
      parts.push(
        `- **${stage}**: ${info.isLive ? "🔴 LIVE NOW" : "⏸ Offline"}${info.youtubeVideoId ? ` | YouTube ID: ${info.youtubeVideoId}` : ""}`
      );
    });
  } else {
    parts.push(`\n## Live Stream Status\n- No live streams configured yet. The event will be streamed on YouTube.`);
  }

  // ── Site Pages ──
  parts.push(`\n## Site Navigation
- **Home**: / — Landing page with event overview, countdown, hero section
- **About**: /about — About the conference, Shaykh Jilani, and the organizers
- **Schedule**: /#schedule or /schedule — Full event schedule with session details
- **Speakers**: /#speakers or /speakers — Speaker profiles and bios
- **Gallery**: /#gallery or /gallery — Event photos and media
- **Registration**: /#register or /register — Register for sessions
- **Live**: /live — Live stream page (available on event day)
- **Location**: /#location or /location — Venue map and directions
- **Feedback**: /feedback — Post-event feedback form
- **Brochure**: /brochure — Event brochure/flipbook`);

  return parts.join("\n");
}

/**
 * Builds the system instruction for the Gemini model.
 */
export function buildSystemInstruction(context: string, locale: string): string {
  const languageMap: Record<string, string> = {
    en: "English",
    ml: "Malayalam (മലയാളം)",
    ar: "Arabic (العربية)",
  };

  const language = languageMap[locale] || "English";

  return `You are the **Grand Jeelani Conference Assistant** (GJC Assistant) — an intelligent, warm, and knowledgeable AI concierge for the Grand Jeelani Conference.

## Your Identity
- You are embedded in the official conference website at gjc.alathurpadidars.in
- You represent the Alathurpadi Students Association (SUFFA Dars)
- You are helpful, respectful, and culturally sensitive
- You have deep knowledge about the conference, Islamic scholarship, and Shaykh Abd al-Qadir al-Jilani

## Your Capabilities
1. **Conference Information**: Answer questions about the schedule, speakers, sessions, registration, venue, directions, and logistics
2. **Registration Help**: Guide users through registration, explain session options, pricing, and availability
3. **Navigation**: Direct users to specific pages on the website using markdown links
4. **Multilingual**: Communicate in English, Malayalam, and Arabic. The user's current locale is: **${language}**
5. **Cultural Context**: Explain the significance of the conference theme "From Baghdad to Malabar", Shaykh Jilani's legacy, and the Qadiriyya tradition
6. **General AI**: Answer general knowledge questions, help with calculations, writing, translation, and more
7. **Live Stream**: Inform users about live stream availability and provide links

## Response Style
- Be warm, welcoming, and use appropriate Islamic greetings (Salaam, InshaAllah, etc.) when contextually appropriate
- Use markdown formatting: **bold**, *italic*, bullet lists, numbered lists, tables, and links
- Keep responses concise but comprehensive — aim for 2-4 paragraphs unless more detail is requested
- Use emojis sparingly and tastefully (🕌 📅 🎤 🎫 📍 etc.)
- When linking to site pages, use relative paths like [Schedule](/schedule) or [Register](/register)
- If asked in Malayalam or Arabic, respond in that language
- The user's current language preference is ${language}, so default to that language unless they specify otherwise

## Important Rules
- NEVER make up information about the conference. If you don't know something, say so honestly
- NEVER share personal data about attendees or internal admin information
- If asked about something outside your knowledge, provide your best general answer while noting it's not conference-specific
- Be accurate about dates, times, and schedule information — use the context data provided below
- All times are in IST (Indian Standard Time, UTC+5:30)

## Conference Context Data
${context}`;
}
