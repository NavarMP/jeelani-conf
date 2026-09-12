"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function MustafaDarimiRegistration() {
  const [formData, setFormData] = useState({ name: "", phone: "", email: "", place: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production: POST to Supabase + Razorpay checkout
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center pt-20 pb-24 px-6">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center max-w-md">
          <div className="text-5xl mb-4">📚</div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2" style={{ fontFamily: "var(--font-bodoni-moda)" }}>Registration Submitted</h2>
          <p className="text-[var(--text-secondary)] text-sm mb-6">Your registration for the Musthafa Darimi Session has been submitted. Payment integration will be connected soon.</p>
          <Link href="/" className="inline-flex items-center px-6 py-2.5 rounded-full text-sm font-medium bg-[var(--color-navy)] text-white hover:bg-[var(--color-navy)]/90 transition-all">← Back to Home</Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] pt-24 pb-32 px-6">
      <div className="max-w-lg mx-auto">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
          <Link href="/#register" className="text-xs text-[var(--color-turquoise)] hover:underline mb-4 inline-block">← Back to registration options</Link>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-[var(--color-rose)]/10 text-[var(--color-rose)]">Public • Paid</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-1" style={{ fontFamily: "var(--font-bodoni-moda)" }}>Musthafa Darimi Session</h1>
          <p className="text-sm text-[var(--text-secondary)] mb-8">A paid specialized session that continues as an ongoing course with Dr. Musthafa Darimi Karippur.</p>
        </motion.div>

        <motion.form onSubmit={handleSubmit} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.1 }} className="space-y-5">
          <div>
            <label htmlFor="md-name" className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">Full Name *</label>
            <input id="md-name" type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Your full name" className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-turquoise)]/40 focus:border-[var(--color-turquoise)] transition-all placeholder:text-[var(--text-muted)]" />
          </div>
          <div>
            <label htmlFor="md-phone" className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">Phone Number *</label>
            <input id="md-phone" type="tel" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+91 XXXXX XXXXX" className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-turquoise)]/40 focus:border-[var(--color-turquoise)] transition-all placeholder:text-[var(--text-muted)]" />
          </div>
          <div>
            <label htmlFor="md-email" className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">Email <span className="text-[var(--text-muted)]">(optional)</span></label>
            <input id="md-email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="your@email.com" className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-turquoise)]/40 focus:border-[var(--color-turquoise)] transition-all placeholder:text-[var(--text-muted)]" />
          </div>
          <div>
            <label htmlFor="md-place" className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">Place *</label>
            <input id="md-place" type="text" required value={formData.place} onChange={(e) => setFormData({ ...formData, place: e.target.value })} placeholder="Your place / locality" className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-turquoise)]/40 focus:border-[var(--color-turquoise)] transition-all placeholder:text-[var(--text-muted)]" />
          </div>

          {/* Payment notice */}
          <div className="p-4 rounded-xl bg-[var(--color-brass)]/5 border border-[var(--color-brass)]/20">
            <p className="text-xs text-[var(--text-secondary)]">
              <strong className="text-[var(--color-brass)]">💳 Payment:</strong> Payment integration (Razorpay) will be connected in a future update. Registration is currently free for demo purposes.
            </p>
          </div>

          <button type="submit" className="w-full py-3.5 rounded-xl text-sm font-semibold bg-[var(--color-rose)] text-white hover:bg-[var(--color-rose)]/90 transition-all active:scale-[0.98]">
            Register & Proceed to Payment
          </button>
        </motion.form>
      </div>
    </div>
  );
}
