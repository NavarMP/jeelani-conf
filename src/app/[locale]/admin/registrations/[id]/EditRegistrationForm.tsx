"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { updateRegistrationDetails } from "@/app/[locale]/admin/actions";
import { CheckCircle, XCircle, ArrowLeft, Save } from "lucide-react";

interface Props {
  registration: any;
  sessions: { slug: string; title: string }[];
}

export default function EditRegistrationForm({ registration, sessions }: Props) {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: registration.name || "",
    phone: registration.phone || "",
    place: registration.place || "",
    session_slug: registration.session_slug || "",
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      await updateRegistrationDetails("dynamic_registrations", registration.id, formData);
      setMessage({ type: "success", text: "Registration updated successfully!" });
      setTimeout(() => {
        // We could redirect back to helpdesk or registrations list, let's just go back
        router.back();
      }, 1500);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update registration";
      setMessage({ type: "error", text: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* Header Info */}
      <div className="flex flex-wrap gap-4 items-center justify-between pb-4 border-b border-[var(--admin-border)]">
        <div>
          <p className="text-sm text-[var(--admin-text-secondary)]">Registration ID</p>
          <p className="font-mono font-bold text-lg text-[var(--color-turquoise)]">{registration.registration_id}</p>
        </div>
        <div>
          <p className="text-sm text-[var(--admin-text-secondary)]">Status</p>
          <p className="font-bold text-[var(--admin-text)] uppercase">{registration.status}</p>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 ${
          message.type === "success" 
            ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" 
            : "bg-red-500/10 text-red-600 border border-red-500/20"
        }`}>
          {message.type === "success" ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
          <span className="font-medium text-sm">{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-[var(--admin-text)]">Full Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-[var(--admin-input-border)] rounded-lg outline-none focus:border-[var(--color-turquoise)] bg-[var(--admin-input-bg)] text-[var(--admin-text)]"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[var(--admin-text)]">Phone Number</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-[var(--admin-input-border)] rounded-lg outline-none focus:border-[var(--color-turquoise)] bg-[var(--admin-input-bg)] text-[var(--admin-text)]"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[var(--admin-text)]">Location / Place</label>
          <input
            type="text"
            name="place"
            value={formData.place}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-[var(--admin-input-border)] rounded-lg outline-none focus:border-[var(--color-turquoise)] bg-[var(--admin-input-bg)] text-[var(--admin-text)]"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[var(--admin-text)]">Session / Registration Type</label>
          <select
            name="session_slug"
            value={formData.session_slug}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-[var(--admin-input-border)] rounded-lg outline-none focus:border-[var(--color-turquoise)] bg-[var(--admin-input-bg)] text-[var(--admin-text)] appearance-none"
          >
            <option value="">Select a Session...</option>
            {sessions.map(session => (
              <option key={session.slug} value={session.slug}>
                {session.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="pt-6 border-t border-[var(--admin-border)] flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 flex items-center gap-2 text-sm font-medium text-[var(--admin-text-secondary)] hover:text-[var(--admin-text)] bg-[var(--admin-surface)] border border-[var(--admin-border)] hover:bg-[var(--admin-hover)] rounded-xl transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Cancel
        </button>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 flex items-center gap-2 text-sm font-bold text-white bg-[var(--color-turquoise)] hover:bg-[var(--color-navy)] rounded-xl transition-colors disabled:opacity-50"
        >
          {isSubmitting ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {isSubmitting ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
