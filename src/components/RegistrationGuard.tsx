"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useTranslations } from "next-intl";
import { Lock, Clock, CalendarClock } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

interface Props {
  slug: string;
  children: React.ReactNode;
}

export default function RegistrationGuard({ slug, children }: Props) {
  const [status, setStatus] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkStatus() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("registration_sessions")
          .select("status, is_open, scheduled_open_time, scheduled_close_time, custom_closed_message")
          .eq("slug", slug)
          .single();

        if (error) throw error;
        
        if (data) {
          const currentStatus = data.status || (data.is_open ? 'open' : 'closed');
          
          if (currentStatus === 'open') {
            setStatus('open');
          } else if (currentStatus === 'closed') {
            setStatus('closed');
          } else if (currentStatus === 'temporarily_closed') {
            setStatus('temporarily_closed');
            setMessage(data.custom_closed_message || "Registration is temporarily paused.");
          } else if (currentStatus === 'scheduled') {
            const now = new Date();
            const openTime = data.scheduled_open_time ? new Date(data.scheduled_open_time) : null;
            const closeTime = data.scheduled_close_time ? new Date(data.scheduled_close_time) : null;

            if (openTime && now < openTime) {
              setStatus('scheduled_future');
              setMessage(`Registration will open on ${openTime.toLocaleString()}`);
            } else if (closeTime && now > closeTime) {
              setStatus('closed');
              setMessage("Registration time has expired.");
            } else {
              // It's currently in the open window
              setStatus('open');
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch registration status:", err);
        // Default to closed if we can't verify
        setStatus('closed');
      } finally {
        setIsLoading(false);
      }
    }

    checkStatus();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center pt-24 pb-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-turquoise)]"></div>
      </div>
    );
  }

  if (status === 'open') {
    return <>{children}</>;
  }

  // Render blocked UI
  let icon = <Lock className="w-12 h-12 mb-4 text-[var(--color-rose)]" />;
  let title = "Registration Closed";
  let desc = message || "We are no longer accepting registrations for this event.";

  if (status === 'temporarily_closed') {
    icon = <Clock className="w-12 h-12 mb-4 text-orange-500" />;
    title = "Registration Paused";
  } else if (status === 'scheduled_future') {
    icon = <CalendarClock className="w-12 h-12 mb-4 text-[var(--color-turquoise)]" />;
    title = "Registration Not Yet Open";
  }

  return (
    <div className="min-h-[100dvh] flex items-center justify-center px-6 pt-24 pb-32">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-[var(--surface-elevated)] p-8 rounded-3xl border border-[var(--border)] shadow-xl text-center"
      >
        <div className="flex justify-center">{icon}</div>
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-3" style={{ fontFamily: 'var(--font-bodoni-moda)' }}>
          {title}
        </h2>
        <p className="text-[var(--text-secondary)] mb-8">
          {desc}
        </p>
        <Link 
          href="/#register"
          className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold bg-[var(--color-navy)] text-white hover:bg-[var(--color-navy)]/90 transition-colors"
        >
          View Other Events
        </Link>
      </motion.div>
    </div>
  );
}
