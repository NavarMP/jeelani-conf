"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

interface BadgeData {
  id: string;
  name: string;
  phone: string;
  place: string;
  session: string;
  sessionMl: string;
  sessionColor: string;
  sessionIcon: string;
  status: string;
  qrToken: string;
  formData: any;
  checkedIn: boolean;
  checkedInAt: string | null;
}

interface BadgeClientProps {
  badge: BadgeData;
  qrSvg: string;
}

const roleColors: Record<string, string> = {
  "burda-qawwali": "#FFC800",
  "astro-ai-fiqh": "#A855F7",
  "dars-management-meet": "#0EA5E9",
};

const roleLabels: Record<string, string> = {
  "burda-qawwali": "Competition Participant",
  "astro-ai-fiqh": "Academic Session",
  "dars-management-meet": "Delegate",
};

export default function BadgeClient({ badge, qrSvg }: BadgeClientProps) {
  const sessionSlug = badge.formData?.session_slug || "";
  const roleBandColor = roleColors[sessionSlug] || "#FFC800";
  const roleLabel = roleLabels[sessionSlug] || badge.session;

  // Extract team name for burda registrations
  const teamName = badge.formData?.team_name || badge.formData?.teamName || "";
  const darsName = badge.formData?.dars_name || badge.formData?.darsName || badge.place;

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center pt-24 pb-32 px-6 bg-[var(--surface)] relative overflow-hidden">
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "url('/motifs/arabesque-tile-pattern.svg')",
          backgroundRepeat: "repeat",
          backgroundSize: "120px 120px",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-md w-full">
        <div className="text-center mb-8">
          <h1
            className="text-2xl font-bold text-[var(--text-primary)]"
            style={{ fontFamily: "var(--font-bodoni-moda)" }}
          >
            Digital Entry Pass
          </h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1">
            Present this badge at the venue entrance.
          </p>
        </div>

        {/* Check-in Status Banner */}
        {badge.checkedIn && (
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-4 px-4 py-3 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-center"
          >
            <span className="text-emerald-700 dark:text-emerald-400 text-sm font-semibold">
              ✅ Checked In
              {badge.checkedInAt && (
                <span className="font-normal text-emerald-600 dark:text-emerald-500 ml-1">
                  at{" "}
                  {new Date(badge.checkedInAt).toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              )}
            </span>
          </motion.div>
        )}

        {/* The Badge */}
        <motion.div
          initial={{ y: 30, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, type: "spring" }}
          className="bg-white rounded-3xl overflow-hidden shadow-2xl shadow-[var(--color-navy)]/10 border border-[var(--border)] relative"
        >
          {/* Badge Header with Dome Graphic */}
          <div className="relative h-48 bg-gradient-to-b from-[var(--color-navy)] to-[var(--color-turquoise)] p-6 text-center flex flex-col items-center justify-center">
            <div className="absolute inset-0 opacity-20">
              <Image
                src="/jeelani-dome.png"
                alt=""
                fill
                className="object-cover object-bottom"
                priority
              />
            </div>

            <div className="relative z-10 mt-4">
              <Image
                src="/wordmark-en.svg"
                alt="Grand Jeelani Conference"
                width={200}
                height={70}
                className="w-48 h-auto invert brightness-200"
              />
              <p className="text-[var(--color-brass)] text-[10px] uppercase tracking-[0.2em] mt-2 font-medium">
                Alathurpadi • Sept 27
              </p>
            </div>

            {/* Lanyard hole */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-12 h-3 rounded-full bg-[var(--surface)] shadow-inner" />
          </div>

          {/* Badge Body */}
          <div className="p-8 text-center bg-white">
            <h2 className="text-2xl font-bold text-[#103E79] mb-1 uppercase tracking-wide">
              {badge.name}
            </h2>
            {darsName && (
              <p className="text-sm text-gray-500 font-medium mb-1">{darsName}</p>
            )}
            {teamName && (
              <p className="text-xs text-gray-400 mb-1">Team: {teamName}</p>
            )}
            <p className="text-xs text-gray-400 mb-6">
              {badge.place}
            </p>

            {/* QR Code — rendered from server-generated SVG */}
            <div className="inline-block p-3 bg-white rounded-xl border border-gray-100 shadow-sm mb-6">
              <div
                className="w-40 h-40"
                dangerouslySetInnerHTML={{ __html: qrSvg }}
              />
            </div>

            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-mono">
              {badge.id}
            </p>
          </div>

          {/* Status Badge */}
          {badge.status !== "confirmed" && badge.status !== "selected" && (
            <div className="px-4 pb-3 bg-white text-center">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">
                Status: {badge.status?.toUpperCase()}
              </span>
            </div>
          )}

          {/* Footer Band */}
          <div className="py-3 text-center" style={{ backgroundColor: roleBandColor }}>
            <span
              className="text-sm font-bold uppercase tracking-widest"
              style={{
                color: roleBandColor === "#FFC800" ? "#2B2A29" : "#FFFFFF",
              }}
            >
              {roleLabel}
            </span>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 flex justify-center gap-3"
        >
          <button
            onClick={() => window.print()}
            className="px-6 py-2.5 rounded-full text-sm font-semibold bg-[var(--color-navy)] text-white hover:bg-[var(--color-navy)]/90 transition-all shadow-md"
          >
            Save as PDF / Print
          </button>
          <Link
            href="/"
            className="px-6 py-2.5 rounded-full text-sm font-medium border border-[var(--border-strong)] text-[var(--text-primary)] hover:bg-[var(--surface-elevated)] transition-all"
          >
            Home
          </Link>
        </motion.div>

        {/* Watermark */}
        <div className="mt-6 text-center text-[10px] text-gray-300 font-mono select-none pointer-events-none">
          {badge.id} • {badge.name.toUpperCase()}
        </div>
      </div>
    </div>
  );
}
