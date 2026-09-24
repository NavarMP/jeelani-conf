import { fetchBadgeData } from "@/app/[locale]/admin/event-day-actions";
import { generateQRCodeSVG } from "@/lib/qr";
import BadgeClient from "./BadgeClient";

export async function generateMetadata({ params }: { params: Promise<{ registrationId: string }> }) {
  const { registrationId } = await params;
  return {
    title: `Digital Entry Pass — ${registrationId} | Jeelani Conference`,
    description: "Your digital entry pass for the Grand Jeelani Conference 2026",
  };
}

export default async function BadgePage({
  params,
}: {
  params: Promise<{ registrationId: string }>;
}) {
  const { registrationId } = await params;
  const badge = await fetchBadgeData(registrationId);

  if (!badge) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center px-6 bg-[var(--surface)]">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <span className="text-2xl">❌</span>
          </div>
          <h1 className="text-xl font-bold text-[var(--text-primary)] mb-2">
            Badge Not Found
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mb-6">
            Registration ID <span className="font-mono font-bold">{registrationId}</span> was not found.
            Please check the ID and try again.
          </p>
          <a
            href="/"
            className="inline-block px-6 py-2.5 rounded-full text-sm font-semibold bg-[var(--color-navy)] text-white hover:bg-[var(--color-navy)]/90 transition-all"
          >
            Go Home
          </a>
        </div>
      </div>
    );
  }

  // Generate QR code SVG on the server
  const qrSvg = await generateQRCodeSVG(badge.qrToken);

  return <BadgeClient badge={badge} qrSvg={qrSvg} />;
}
