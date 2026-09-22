"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Clock, Lock, Unlock, AlertTriangle } from "lucide-react";
import type { Session } from "@/lib/useSessions";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  session: Session | null;
  onSave: (id: string, payload: {
    status: Session['status'];
    scheduledOpenTime?: string | null;
    scheduledCloseTime?: string | null;
    customClosedMessage?: string | null;
  }) => Promise<void>;
}

export default function SessionStatusModal({ isOpen, onClose, session, onSave }: Props) {
  const [status, setStatus] = useState<Session['status']>('open');
  const [scheduledOpenTime, setScheduledOpenTime] = useState("");
  const [scheduledCloseTime, setScheduledCloseTime] = useState("");
  const [customClosedMessage, setCustomClosedMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (session) {
      setStatus(session.status || (session.isRegistrationOpen ? 'open' : 'closed'));
      setScheduledOpenTime(session.scheduledOpenTime ? new Date(session.scheduledOpenTime).toISOString().slice(0, 16) : "");
      setScheduledCloseTime(session.scheduledCloseTime ? new Date(session.scheduledCloseTime).toISOString().slice(0, 16) : "");
      setCustomClosedMessage(session.customClosedMessage || "");
    }
  }, [session, isOpen]);

  if (!isOpen || !session) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      await onSave(session.id, {
        status,
        scheduledOpenTime: status === 'scheduled' && scheduledOpenTime ? new Date(scheduledOpenTime).toISOString() : null,
        scheduledCloseTime: (status === 'scheduled' || status === 'open') && scheduledCloseTime ? new Date(scheduledCloseTime).toISOString() : null,
        customClosedMessage: status === 'temporarily_closed' ? customClosedMessage : null,
      });
      onClose();
    } catch (error) {
      console.error("Failed to save session status:", error);
      alert("Failed to save status changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const statusOptions = [
    { id: 'open', label: 'Open', icon: <Unlock className="w-4 h-4" />, desc: 'Registration is live and accepting entries.' },
    { id: 'closed', label: 'Closed', icon: <Lock className="w-4 h-4" />, desc: 'Registration is permanently closed.' },
    { id: 'temporarily_closed', label: 'Temporarily Closed', icon: <AlertTriangle className="w-4 h-4" />, desc: 'Pause registration with a custom message.' },
    { id: 'scheduled', label: 'Scheduled', icon: <Calendar className="w-4 h-4" />, desc: 'Automatically open/close at specific times.' },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="bg-[var(--admin-surface)] w-full max-w-lg rounded-2xl shadow-xl overflow-hidden border border-[var(--admin-border)] flex flex-col max-h-[90dvh]"
        >
          {/* Header */}
          <div className="flex justify-between items-center px-6 py-4 border-b border-[var(--admin-border)]">
            <div>
              <h3 className="text-lg font-bold text-[var(--admin-text)]">Edit Registration Status</h3>
              <p className="text-sm text-[var(--admin-text-secondary)]">{session.title}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] hover:bg-[var(--admin-hover)] rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto custom-scrollbar">
            <form id="status-form" onSubmit={handleSubmit} className="space-y-6">
              
              {/* Status Selector */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-[var(--admin-text)]">Select Status</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {statusOptions.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setStatus(opt.id as Session['status'])}
                      className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                        status === opt.id
                          ? "border-[var(--color-turquoise)] bg-[var(--color-turquoise)]/5 ring-1 ring-[var(--color-turquoise)]/20"
                          : "border-[var(--admin-border)] hover:border-[var(--admin-text-muted)]"
                      }`}
                    >
                      <div className={`flex items-center gap-2 font-medium text-sm mb-1 ${status === opt.id ? "text-[var(--color-turquoise)]" : "text-[var(--admin-text)]"}`}>
                        {opt.icon} {opt.label}
                      </div>
                      <div className="text-xs text-[var(--admin-text-muted)]">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Fields */}
              <AnimatePresence mode="popLayout">
                {status === 'open' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2 overflow-hidden"
                  >
                    <label className="block text-sm font-semibold text-[var(--admin-text)]">Registration Deadline (Optional)</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--admin-text-muted)]" />
                      <input
                        type="datetime-local"
                        value={scheduledCloseTime}
                        onChange={(e) => setScheduledCloseTime(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-[var(--admin-input-bg)] border border-[var(--admin-input-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-turquoise)]/50 focus:border-[var(--color-turquoise)] text-[var(--admin-text)]"
                      />
                    </div>
                    <p className="text-xs text-[var(--admin-text-muted)]">
                      Leave blank for no deadline, or set a date/time to show a deadline badge on the form and automatically close when reached.
                    </p>
                  </motion.div>
                )}

                {status === 'temporarily_closed' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2 overflow-hidden"
                  >
                    <label className="block text-sm font-semibold text-[var(--admin-text)]">Custom Message</label>
                    <p className="text-xs text-[var(--admin-text-secondary)] mb-2">This message will be shown to users trying to register.</p>
                    <textarea
                      value={customClosedMessage}
                      onChange={(e) => setCustomClosedMessage(e.target.value)}
                      placeholder="e.g. Registration is paused for maintenance. Please check back in 1 hour."
                      rows={3}
                      className="w-full px-4 py-2 bg-[var(--admin-input-bg)] border border-[var(--admin-input-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-turquoise)]/50 focus:border-[var(--color-turquoise)] text-[var(--admin-text)] resize-none"
                    />
                  </motion.div>
                )}

                {status === 'scheduled' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 overflow-hidden"
                  >
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-[var(--admin-text)]">Open Time (Optional)</label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--admin-text-muted)]" />
                        <input
                          type="datetime-local"
                          value={scheduledOpenTime}
                          onChange={(e) => setScheduledOpenTime(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 bg-[var(--admin-input-bg)] border border-[var(--admin-input-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-turquoise)]/50 focus:border-[var(--color-turquoise)] text-[var(--admin-text)]"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-[var(--admin-text)]">Close Time (Optional)</label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--admin-text-muted)]" />
                        <input
                          type="datetime-local"
                          value={scheduledCloseTime}
                          onChange={(e) => setScheduledCloseTime(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 bg-[var(--admin-input-bg)] border border-[var(--admin-input-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-turquoise)]/50 focus:border-[var(--color-turquoise)] text-[var(--admin-text)]"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-[var(--admin-text-muted)]">
                      Leave either field blank if you only want to set an automatic open OR close time.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

            </form>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-[var(--admin-border)] bg-[var(--admin-surface-alt)] flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl text-sm font-medium border border-[var(--admin-border)] hover:bg-[var(--admin-hover)] text-[var(--admin-text-secondary)] transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="status-form"
              disabled={isSaving}
              className="px-6 py-2 rounded-xl text-sm font-medium bg-[var(--color-navy)] text-white hover:bg-[var(--color-navy)]/90 transition-colors shadow-sm disabled:opacity-70 flex items-center gap-2"
            >
              {isSaving ? "Saving..." : "Save Status"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
