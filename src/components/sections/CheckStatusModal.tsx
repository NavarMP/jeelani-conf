"use client";

import { useState } from "react";
import { checkRegistrationStatus } from "@/app/[locale]/register/actions";
import { X, Search, Loader2 } from "lucide-react";

export function CheckStatusModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await checkRegistrationStatus(identifier);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[var(--surface)] w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-[var(--border)]">
        <div className="flex justify-between items-center p-5 border-b border-[var(--border)]">
          <h2 className="text-xl font-bold text-[var(--text-primary)]" style={{ fontFamily: "var(--font-bodoni-moda)" }}>
            Check Status
          </h2>
          <button onClick={onClose} className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-full hover:bg-[var(--surface-alt)] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={handleCheck} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                Registration ID, Phone, or Email
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Enter details..."
                  className="w-full px-4 py-3 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-turquoise)] focus:ring-1 focus:ring-[var(--color-turquoise)]"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !identifier.trim()}
              className="w-full py-3 bg-[var(--color-navy)] hover:bg-[var(--color-navy)]/90 text-white rounded-xl font-bold transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
              {loading ? "Checking..." : "Check Status"}
            </button>
          </form>

          {error && (
            <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm font-medium">
              {error}
            </div>
          )}

          {result && (
            <div className="mt-6 p-5 rounded-xl bg-[var(--surface-alt)] border border-[var(--border)] space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-[var(--text-primary)] text-lg">{result.name}</h3>
                  <p className="text-sm font-mono text-[var(--text-muted)] mt-0.5">{result.registration_id}</p>
                </div>
                <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                  result.status === 'confirmed' || result.status === 'approved' ? 'bg-green-500/10 text-green-600 dark:text-green-400' :
                  result.status === 'cancelled' || result.status === 'rejected' ? 'bg-red-500/10 text-red-600 dark:text-red-400' :
                  'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                }`}>
                  {result.status.toUpperCase()}
                </span>
              </div>
              
              <div className="pt-3 border-t border-[var(--border)]">
                <p className="text-sm text-[var(--text-secondary)]">
                  <span className="font-semibold">Event:</span> {result.type}
                </p>
                <p className="text-sm text-[var(--text-secondary)] mt-1">
                  <span className="font-semibold">Registered on:</span> {result.date}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
