"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

// Mock data for demo purposes since Supabase isn't wired up
const mockRegistration = {
  id: "REG-2026-X79M",
  name: "Mohammed Bilal",
  dars: "Jamia Nooriyya",
  place: "Pattikkad",
  type: "Grand Assembly",
  role: "Delegate",
};

export default function BadgePage({ params }: { params: { registrationId: string } }) {
  const badgeRef = useRef<HTMLDivElement>(null);

  // In production, fetch registration details based on params.registrationId

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
          <h1 className="text-2xl font-bold text-[var(--text-primary)]" style={{ fontFamily: "var(--font-bodoni-moda)" }}>
            Digital Entry Pass
          </h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1">
            Present this badge at the venue entrance.
          </p>
        </div>

        {/* The Badge */}
        <motion.div
          ref={badgeRef}
          initial={{ y: 30, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, type: "spring" }}
          className="bg-white rounded-3xl overflow-hidden shadow-2xl shadow-[var(--color-navy)]/10 border border-[var(--border)] relative"
        >
          {/* Badge Header with Dome Graphic */}
          <div className="relative h-48 bg-gradient-to-b from-[var(--color-navy)] to-[var(--color-turquoise)] p-6 text-center flex flex-col items-center justify-center">
            <div className="absolute inset-0 opacity-20">
              <Image src="/jeelani-dome.png" alt="" fill className="object-cover object-bottom" priority />
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
                Alathoorpadi • Sept 27
              </p>
            </div>
            
            {/* Lanyard hole */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-12 h-3 rounded-full bg-[var(--surface)] shadow-inner" />
          </div>

          {/* Badge Body */}
          <div className="p-8 text-center bg-white">
            <h2 className="text-2xl font-bold text-[#103E79] mb-1 uppercase tracking-wide">
              {mockRegistration.name}
            </h2>
            <p className="text-sm text-gray-500 font-medium mb-1">
              {mockRegistration.dars}
            </p>
            <p className="text-xs text-gray-400 mb-8">
              {mockRegistration.place}
            </p>

            {/* QR Code Placeholder */}
            <div className="inline-block p-2 bg-white rounded-xl border border-gray-100 shadow-sm mb-6">
              <div className="w-40 h-40 bg-gray-100 rounded-lg flex items-center justify-center text-gray-300">
                <svg viewBox="0 0 24 24" className="w-20 h-20" fill="currentColor">
                  <path d="M3 3h8v8H3V3zm2 2v4h4V5H5zm8-2h8v8h-8V3zm2 2v4h4V5h-4zM3 13h8v8H3v-8zm2 2v4h4v-4H5zm13-2h-3v2h3v-2zm-3 4h-2v2h2v-2zm2 2h-2v2h2v-2zm0-4h2v2h-2v-2zm2 2h2v2h-2v-2z" />
                </svg>
              </div>
            </div>
            
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-mono">
              {mockRegistration.id}
            </p>
          </div>

          {/* Footer Band */}
          <div className="bg-[#FFC800] py-3 text-center">
            <span className="text-[#2B2A29] text-sm font-bold uppercase tracking-widest">
              {mockRegistration.role}
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
      </div>
    </div>
  );
}
