import { NextResponse } from "next/server";

export async function GET() {
  const event = {
    title: "Grand Jeelani Conference",
    description: "From Baghdad to Malabar — Persian Artistry. Malabar Soul.\\nA commemorative, academic, and spiritual assembly honoring Shaykh Abd al-Qadir al-Jilani.\\nOrganized by Alathoorpadi Students Association.",
    location: "Alathoorpadi, Melmuri, Malappuram, Kerala",
    startDate: "20260927T043000Z", // 10:00 AM IST
    endDate: "20260927T163000Z",   // 10:00 PM IST
  };

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Grand Jeelani Conference//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `DTSTART:${event.startDate}`,
    `DTEND:${event.endDate}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description}`,
    `LOCATION:${event.location}`,
    "STATUS:CONFIRMED",
    `UID:gjc-2026@alathurpadidars.in`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="jeelani-conference.ics"',
    },
  });
}
