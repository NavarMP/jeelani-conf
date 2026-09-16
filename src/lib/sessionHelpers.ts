import { type Session } from "./data";

/**
 * Normalizes ISO date string or timestamp and formats it into clean 12-hour IST time (e.g., "10:00 AM").
 * Handles raw ISO timestamps, truncated timezone offsets (like +00:0), and plain HH:mm strings.
 */
export function formatSessionTime(timeStr: string | null | undefined): string {
  if (!timeStr) return "";
  const trimmed = timeStr.trim();

  // If already formatted like "10:00 AM" or "10:30 am"
  if (/^\d{1,2}:\d{2}\s*(AM|PM|am|pm)$/i.test(trimmed)) {
    return trimmed;
  }

  // If plain HH:mm or HH:mm:ss without date
  const timeOnlyMatch = trimmed.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (timeOnlyMatch) {
    let hours = parseInt(timeOnlyMatch[1], 10);
    const minutes = timeOnlyMatch[2];
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
  }

  // Handle ISO / timestamp strings
  try {
    let normalized = trimmed;
    // Fix truncated timezone offsets like +00:0 or -05:3
    normalized = normalized.replace(/([+-]\d{2}):(\d)$/, "$1:$20");
    // Fix truncated timezone offsets like +00 or -05
    normalized = normalized.replace(/([+-]\d{2})$/, "$1:00");

    const date = new Date(normalized);
    if (!isNaN(date.getTime())) {
      return new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Kolkata",
      }).format(date);
    }
  } catch {
    // fallback
  }

  return timeStr;
}

export function formatSessionTimeRange(start: string | null | undefined, end: string | null | undefined): string {
  const formattedStart = formatSessionTime(start);
  const formattedEnd = formatSessionTime(end);
  if (formattedStart && formattedEnd) {
    return `${formattedStart} – ${formattedEnd}`;
  }
  return formattedStart || formattedEnd || "";
}

export interface SessionRegistrationInfo {
  url: string;
  isExternal: boolean;
  label: string;
}

/**
 * Determines if a session has an associated registration form or portal link.
 */
export function getSessionRegistration(
  session: Partial<Session> | null | undefined
): SessionRegistrationInfo | null {
  if (!session) return null;

  // 1. If explicit external redirect URL
  if (session.external_url) {
    const isGrandAssembly = session.slug === "grand-assembly" || session.title?.toLowerCase().includes("grand assembly");
    return {
      url: session.external_url,
      isExternal: true,
      label: isGrandAssembly ? "Register on Portal" : "Visit Portal",
    };
  }

  // 2. Check registration_session_slug or known session slugs
  const regSlug = session.registration_session_slug || (
    session.slug === "burda-qawwali" ? "burda-qawwali" :
    session.slug === "dars-management-meet" ? "dars-management-meet" :
    session.slug === "grand-assembly" ? "grand-assembly" :
    null
  );

  if (regSlug) {
    switch (regSlug) {
      case "burda-qawwali":
        return {
          url: "/register/burda-qawwali",
          isExternal: false,
          label: "Register Team",
        };
      case "astro-ai-fiqh":
        return {
          url: "/register/astro-ai-fiqh",
          isExternal: false,
          label: "Register for Session",
        };
      case "dars-management":
      case "dars-management-meet":
        return {
          url: "/register/dars-management",
          isExternal: false,
          label: "Register Delegation",
        };
      case "grand-assembly":
        return {
          url: "https://grand-jeelani-conference-2026.web.app/",
          isExternal: true,
          label: "Register on Portal",
        };
      default:
        return {
          url: `/register/${regSlug}`,
          isExternal: false,
          label: "Register",
        };
    }
  }

  // 3. Paid sessions default to Astronomy & AI Fiqh pass
  if (session.is_paid || session.type === "paid_session") {
    return {
      url: "/register/astro-ai-fiqh",
      isExternal: false,
      label: "Register for Session",
    };
  }

  return null;
}
