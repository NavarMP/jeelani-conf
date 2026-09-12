"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function PaperPresentationRegistration() {
  const [formData, setFormData] = useState({ name: "", phone: "", email: "", place: "", paperTitle: "", abstract: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center pt-20 pb-24 px-6">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center max-w-md">
          <div className="text-5xl mb-4">📝</div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2" style={{ fontFamily: "var(--font-bodoni-moda)" }}>Paper Submitted</h2>
          <p className="text-[var(--text-secondary)] text-sm mb-6">Your paper presentation registration has been submitted. The academic committee will review your submission.</p>
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
            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-[var(--color-turquoise)]/10 text-[var(--color-turquoise)]">Public • Free</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-1" style={{ fontFamily: "var(--font-bodoni-moda)" }}>Paper Presentation</h1>
          <p className="text-sm text-[var(--text-secondary)] mb-2">Submit your research on:</p>
          <p className="text-sm font-medium text-[var(--color-navy)] dark:text-[var(--color-turquoise)] italic mb-8">&quot;Muhyiddin Mala and the Social Life of Malabar Muslims: A Study&quot;</p>
        </motion.div>

        <motion.form onSubmit={handleSubmit} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.1 }} className="space-y-5">
          <div>
            <label htmlFor="pp-name" className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">Full Name *</label>
            <input id="pp-name" type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Your full name" className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-turquoise)]/40 focus:border-[var(--color-turquoise)] transition-all placeholder:text-[var(--text-muted)]" />
          </div>
          <div>
            <label htmlFor="pp-phone" className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">Phone Number *</label>
            <input id="pp-phone" type="tel" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+91 XXXXX XXXXX" className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-turquoise)]/40 focus:border-[var(--color-turquoise)] transition-all placeholder:text-[var(--text-muted)]" />
          </div>
          <div>
            <label htmlFor="pp-email" className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">Email <span className="text-[var(--text-muted)]">(optional)</span></label>
            <input id="pp-email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="your@email.com" className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-turquoise)]/40 focus:border-[var(--color-turquoise)] transition-all placeholder:text-[var(--text-muted)]" />
          </div>
          <div>
            <label htmlFor="pp-place" className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">Place *</label>
            <input id="pp-place" type="text" required value={formData.place} onChange={(e) => setFormData({ ...formData, place: e.target.value })} placeholder="Your place / locality" className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-turquoise)]/40 focus:border-[var(--color-turquoise)] transition-all placeholder:text-[var(--text-muted)]" />
          </div>
          <div>
            <label htmlFor="pp-title" className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">Paper Title *</label>
            <input id="pp-title" type="text" required value={formData.paperTitle} onChange={(e) => setFormData({ ...formData, paperTitle: e.target.value })} placeholder="Title of your research paper" className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-turquoise)]/40 focus:border-[var(--color-turquoise)] transition-all placeholder:text-[var(--text-muted)]" />
          </div>
          <div>
            <label htmlFor="pp-abstract" className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">Abstract *</label>
            <textarea id="pp-abstract" required rows={5} value={formData.abstract} onChange={(e) => setFormData({ ...formData, abstract: e.target.value })} placeholder="Provide a brief abstract of your paper (200-500 words)" className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-turquoise)]/40 focus:border-[var(--color-turquoise)] transition-all placeholder:text-[var(--text-muted)] resize-y" />
          </div>

          {/* File upload placeholder */}
          <div>
            <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">Upload Paper <span className="text-[var(--text-muted)]">(optional, PDF)</span></label>
            <div className="w-full px-4 py-6 rounded-xl border-2 border-dashed border-[var(--border)] bg-[var(--surface)] text-center cursor-pointer hover:border-[var(--color-turquoise)]/40 transition-all">
              <p className="text-sm text-[var(--text-muted)]">📄 Click to upload or drag & drop</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">PDF, max 10MB</p>
            </div>
          </div>

          <button type="submit" className="w-full py-3.5 rounded-xl text-sm font-semibold bg-[var(--color-turquoise)] text-white hover:bg-[var(--hover-turquoise)] transition-all active:scale-[0.98]">
            Submit Paper
          </button>
        </motion.form>
      </div>
    </div>
  );
}
