"use client";

import React, { useState } from "react";
import { checkRegistrationStatus } from "@/app/[locale]/register/actions";
import { Search, Loader2, ArrowRight, ShieldCheck, Ticket, X } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function BadgeSearchPage() {
  const params = useParams();
  const locale = params.locale as string;
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await checkRegistrationStatus(identifier.trim());
      if (res.error) {
        setError(res.error);
      } else if (res.success) {
        setResult(res.data);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      {/* Header */}
      <header className="py-6 px-6 sm:px-12 flex justify-between items-center border-b border-[var(--border)] bg-[var(--surface)]/50 backdrop-blur-md sticky top-0 z-10">
        <Link href={`/${locale}`} className="text-2xl font-bold text-[var(--color-navy)] flex items-center gap-2" style={{ fontFamily: 'var(--font-bodoni-moda)' }}>
          <span className="w-8 h-8 rounded-full bg-[var(--color-navy)] flex items-center justify-center">
            <span className="text-white text-lg">J</span>
          </span>
          Jeelani
        </Link>
        <Link href={`/${locale}`} className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
          Back to Home
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-[var(--color-turquoise)]/10 text-[var(--color-turquoise)] mb-4">
              <Ticket className="w-8 h-8" strokeWidth={1.5} />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-3" style={{ fontFamily: 'var(--font-bodoni-moda)' }}>
              Get Your Entry Badge
            </h1>
            <p className="text-[var(--text-secondary)] text-sm sm:text-base">
              Enter your Registration ID, Phone Number, or Email to retrieve and download your conference pass.
            </p>
          </div>

          <div className="bg-[var(--surface)] p-6 sm:p-8 rounded-3xl shadow-xl shadow-[var(--color-navy)]/5 border border-[var(--border)]">
            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Registration Details
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="w-5 h-5 text-[var(--text-muted)]" />
                  </div>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. REG-1234, +91987..., email@..."
                    className="w-full pl-11 pr-4 py-3.5 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-2xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-turquoise)] focus:ring-2 focus:ring-[var(--color-turquoise)]/20 transition-all text-base"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !identifier.trim()}
                className="w-full py-3.5 bg-[var(--color-navy)] hover:bg-[var(--color-navy)]/90 text-white rounded-2xl font-bold transition-all disabled:opacity-50 disabled:scale-100 active:scale-[0.98] flex justify-center items-center gap-2 shadow-lg shadow-[var(--color-navy)]/20"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Search Pass"}
              </button>
            </form>

            {error && (
              <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm font-medium flex items-center gap-3">
                <div className="p-1.5 bg-red-500/20 rounded-lg">
                  <X className="w-4 h-4" />
                </div>
                {error}
              </div>
            )}

            {result && (
              <div className="mt-6 p-1 rounded-2xl bg-gradient-to-br from-[var(--color-turquoise)]/20 via-[var(--color-navy)]/10 to-transparent">
                <div className="p-5 rounded-[15px] bg-[var(--surface-alt)]">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-[var(--text-primary)] text-xl mb-1">{result.name}</h3>
                      <p className="text-sm font-mono text-[var(--text-muted)]">{result.registration_id}</p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-bold rounded-full border ${
                      result.status === 'confirmed' || result.status === 'approved' ? 'bg-green-500/10 text-green-600 border-green-500/20' :
                      result.status === 'cancelled' || result.status === 'rejected' ? 'bg-red-500/10 text-red-600 border-red-500/20' :
                      'bg-amber-500/10 text-amber-600 border-amber-500/20'
                    }`}>
                      {result.status.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-6">
                    <p className="text-sm text-[var(--text-secondary)]">
                      <span className="font-semibold text-[var(--text-primary)]">Program:</span> {result.session_title}
                    </p>
                    {result.category && (
                      <p className="text-sm text-[var(--text-secondary)]">
                        <span className="font-semibold text-[var(--text-primary)]">Category:</span> {result.category}
                      </p>
                    )}
                  </div>
                  
                  {(result.status === 'confirmed' || result.status === 'approved') ? (
                    <Link
                      href={`/${locale}/badge/${result.registration_id}`}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-[var(--color-turquoise)] hover:bg-[var(--color-turquoise)]/90 text-white rounded-xl font-bold transition-all shadow-lg shadow-[var(--color-turquoise)]/20 group"
                    >
                      <ShieldCheck className="w-5 h-5" />
                      View & Download Badge
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  ) : (
                    <div className="w-full text-center py-3 bg-[var(--background)] rounded-xl border border-[var(--border)] text-sm text-[var(--text-muted)] font-medium">
                      Badge unavailable. Status must be Confirmed.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-8 text-center text-sm text-[var(--text-muted)] flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            Secure Check-in System
          </div>
        </div>
      </main>
    </div>
  );
}
