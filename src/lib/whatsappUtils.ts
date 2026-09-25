export function generateWhatsAppMessage(registration: any): string {
  const slug = registration.typeSlug || registration.session_slug;
  
  let scheduleText = "*Date:* September 27, 2026\n\n";
  if (slug === "astro-ai-fiqh") {
    scheduleText = "*Date:* September 27, 2026\n *Schedule:*\n• Astronomy Session: 3:00 PM - 5:00 PM\n• AI Fiqh Session: 5:00 PM - 6:30 PM\n\n";
  } else if (slug === "burda-qawwali") {
    scheduleText = "*Date:* September 27, 2026\n *Time:* 3:00 PM - 6:30 PM\n\n";
  } else if (slug === "dars-management-meet") {
    scheduleText = "*Date:* September 27, 2026\n *Time:* 11:00 AM - 3:00 PM\n\n";
  }

  let statusText = "Your registration is currently under review. We will notify you once it is confirmed.";
  if (registration.status === "confirmed") {
    statusText = `Your registration is confirmed. We look forward to seeing you!\n\nDownload your Entry Badge here:\n${process.env.NEXT_PUBLIC_SITE_URL || 'https://jeelani-conference.com'}/en/badge/${registration.registration_id}`;
  } else if (registration.status === "selected") {
    statusText = "Congratulations! Your team has been selected. We look forward to seeing you!";
  } else if (registration.status === "cancelled") {
    statusText = "Unfortunately, your registration has been cancelled. Please contact us if you have any questions.";
  }

  return `Hello ${registration.name},\n\nThank you for registering for the *${registration.typeName}*.\n\nYour Registration ID is: *${registration.registration_id}*\nCurrent Status: *${registration.status?.toUpperCase() || "PENDING"}*\n\n${scheduleText}${statusText}\n\nBest regards,\nJeelani Conference Team`;
}
