/**
 * Grand Jeelani Conference — Date & Time Utilities
 * Standardized on Asia/Kolkata (IST, UTC+05:30) for conference scheduling.
 */

export interface IstDateTimeParts {
  year: number;
  month: number; // 1-12
  day: number; // 1-31
  hours24: number; // 0-23
  hours12: number; // 1-12
  minutes: number; // 0-59
  ampm: "AM" | "PM";
  dateString: string; // YYYY-MM-DD
  time24String: string; // HH:mm
  time12String: string; // h:mm AM/PM
  displayDate: string; // e.g. "27 Sep 2026"
  displayDayName: string; // e.g. "Sunday"
  displayFull: string; // e.g. "Sun, 27 Sep 2026, 10:00 AM IST"
}

const MONTH_NAMES_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const DAY_NAMES_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * Normalizes any timestamp/ISO string or Date into IST components.
 * Guarantees consistent wall-clock time in Asia/Kolkata regardless of user machine timezone.
 */
export function parseToIstParts(value: string | Date | null | undefined): IstDateTimeParts {
  let date: Date;

  if (!value) {
    // Default to the conference date in 2026 if empty
    date = new Date("2026-09-27T10:00:00+05:30");
  } else if (typeof value === "string") {
    const trimmed = value.trim();
    // If it's already YYYY-MM-DDTHH:mm or similar without tz offset, assume IST (+05:30)
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?$/.test(trimmed)) {
      date = new Date(`${trimmed}+05:30`);
    } else {
      date = new Date(trimmed);
    }
  } else {
    date = value;
  }

  if (isNaN(date.getTime())) {
    date = new Date("2026-09-27T10:00:00+05:30");
  }

  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    weekday: "short"
  });

  const parts = formatter.formatToParts(date);
  const partMap: Record<string, string> = {};
  parts.forEach((p) => {
    partMap[p.type] = p.value;
  });

  const year = parseInt(partMap.year, 10);
  const month = parseInt(partMap.month, 10);
  const day = parseInt(partMap.day, 10);
  let hours24 = parseInt(partMap.hour === "24" ? "0" : partMap.hour, 10);
  if (isNaN(hours24)) hours24 = 0;
  const minutes = parseInt(partMap.minute, 10) || 0;

  const ampm: "AM" | "PM" = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 % 12 || 12;

  const pad = (n: number) => String(n).padStart(2, "0");
  const dateString = `${year}-${pad(month)}-${pad(day)}`;
  const time24String = `${pad(hours24)}:${pad(minutes)}`;
  const time12String = `${hours12}:${pad(minutes)} ${ampm}`;
  const displayDate = `${day} ${MONTH_NAMES_SHORT[month - 1]} ${year}`;
  const displayDayName = partMap.weekday || DAY_NAMES_SHORT[date.getDay()];
  const displayFull = `${displayDayName}, ${displayDate} • ${time12String} IST`;

  return {
    year,
    month,
    day,
    hours24,
    hours12,
    minutes,
    ampm,
    dateString,
    time24String,
    time12String,
    displayDate,
    displayDayName,
    displayFull,
  };
}

/**
 * Builds a standardized ISO-8601 string with IST offset (+05:30)
 * e.g. "2026-09-27T10:00:00+05:30"
 */
export function buildIstIsoString(
  dateString: string, // YYYY-MM-DD
  hours24: number,
  minutes: number
): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const h = pad(Math.max(0, Math.min(23, hours24)));
  const m = pad(Math.max(0, Math.min(59, minutes)));
  return `${dateString}T${h}:${m}:00+05:30`;
}

/**
 * Converts 12h time (hour, minute, ampm) to 24h hours (0-23)
 */
export function to24Hour(hour12: number, ampm: "AM" | "PM"): number {
  if (ampm === "AM") {
    return hour12 === 12 ? 0 : hour12;
  } else {
    return hour12 === 12 ? 12 : hour12 + 12;
  }
}

/**
 * Converts 24h hour (0-23) to 12h hour (1-12) and AM/PM
 */
export function to12Hour(hour24: number): { hour12: number; ampm: "AM" | "PM" } {
  const ampm: "AM" | "PM" = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 || 12;
  return { hour12, ampm };
}

/**
 * Adds minutes to an ISO string and returns a new IST ISO string.
 */
export function addMinutesToIst(isoString: string | null | undefined, minutesToAdd: number): string {
  const parts = parseToIstParts(isoString);
  // Calculate total minutes since start of day
  const totalMinutes = parts.hours24 * 60 + parts.minutes + minutesToAdd;
  
  // Date calculation
  const dateObj = new Date(`${parts.dateString}T00:00:00+05:30`);
  const dayOffset = Math.floor(totalMinutes / (24 * 60));
  dateObj.setDate(dateObj.getDate() + dayOffset);
  
  let remMinutes = totalMinutes % (24 * 60);
  if (remMinutes < 0) remMinutes += 24 * 60;
  
  const h = Math.floor(remMinutes / 60);
  const m = remMinutes % 60;
  
  const pad = (n: number) => String(n).padStart(2, "0");
  const year = dateObj.getFullYear();
  const month = pad(dateObj.getMonth() + 1);
  const day = pad(dateObj.getDate());
  
  return `${year}-${month}-${day}T${pad(h)}:${pad(m)}:00+05:30`;
}

/**
 * Known Grand Jeelani Conference date presets
 */
export const CONFERENCE_DATES = [
  { label: "Conference Day", sub: "Main Event", date: "2026-09-27", isMain: true },
  { label: "Day -1", sub: "Prep / Arrivals", date: "2026-09-26", isMain: false },
  { label: "Day +1", sub: "Post-Assembly", date: "2026-09-28", isMain: false },
];

/**
 * Common conference schedule time presets (12-hour IST)
 */
export const COMMON_TIME_PRESETS = [
  { label: "09:30 AM", h: 9, m: 30, desc: "Registration" },
  { label: "10:00 AM", h: 10, m: 0, desc: "Assembly" },
  { label: "11:00 AM", h: 11, m: 0, desc: "Inaugural" },
  { label: "12:00 PM", h: 12, m: 0, desc: "Main Talk" },
  { label: "01:30 PM", h: 13, m: 30, desc: "Dhuhr / Lunch" },
  { label: "03:00 PM", h: 15, m: 0, desc: "Burda" },
  { label: "04:30 PM", h: 16, m: 30, desc: "Asr Meet" },
  { label: "06:45 PM", h: 18, m: 45, desc: "Mawlid Jalsa" },
  { label: "08:00 PM", h: 20, m: 0, desc: "Conference" },
  { label: "09:30 PM", h: 21, m: 30, desc: "Closing" },
];
