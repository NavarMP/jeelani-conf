"use client";

import React, { useState } from "react";
import { updateRegistrationStatus, deleteRegistration } from "@/app/[locale]/admin/actions";
import { X } from "lucide-react";

interface RegistrationDetailModalProps {
  registration: any;
  onClose: () => void;
}

export default function RegistrationDetailModal({ registration, onClose }: RegistrationDetailModalProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateStatus = async (status: string, review_status?: string) => {
    setIsUpdating(true);
    try {
      await updateRegistrationStatus(registration.tableName, registration.id, status, review_status);
      registration.status = status;
    } catch (err) {
      alert("Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this registration? This action cannot be undone.")) return;
    setIsUpdating(true);
    try {
      await deleteRegistration(registration.tableName, registration.id);
      onClose(); // Close modal and the parent will refresh
    } catch (err) {
      alert("Failed to delete registration");
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 sm:p-6 backdrop-blur-sm">
      <div className="bg-[var(--admin-surface)] rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-[var(--admin-border)]">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-[var(--admin-border)] bg-[var(--admin-surface-alt)]">
          <div>
            <h2 className="text-xl font-bold text-[var(--admin-text)] flex items-center gap-2">
              Registration Details
              <span className="text-xs px-2 py-1 bg-[var(--admin-badge-bg)] text-[var(--admin-text-secondary)] border border-[var(--admin-border)] rounded-full font-medium">
                {registration.typeName}
              </span>
            </h2>
            <p className="text-xs text-[var(--admin-text-muted)] mt-1 font-mono">{registration.id}</p>
          </div>
          <button onClick={onClose} className="p-2 text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-full hover:bg-[var(--admin-hover)] transition-colors">
            <X className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick Actions (WhatsApp) */}
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-emerald-800 dark:text-emerald-400 font-semibold flex items-center gap-2">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                </svg>
                WhatsApp Communication
              </h3>
              <p className="text-emerald-700/80 dark:text-emerald-400/80 text-xs mt-1">
                Send a dynamically generated, personalized message to the applicant.
              </p>
            </div>
            <a 
              href={`https://wa.me/${(registration.phone || "").replace(/\D/g, "")}?text=${encodeURIComponent(
                `Hello ${registration.name},\n\nThank you for registering for the *${registration.typeName}*.\n\nYour Registration ID is: *${registration.registration_id}*\nCurrent Status: *${registration.status?.toUpperCase() || "PENDING"}*\n\n${
                  registration.status === "confirmed" 
                  ? "Your registration is confirmed. We look forward to seeing you!" 
                  : registration.status === "cancelled"
                  ? "Unfortunately, your registration has been cancelled. Please contact us if you have any questions."
                  : "Your registration is currently under review. We will notify you once it is confirmed."
                }\n\nBest regards,\nJeelani Conference Team`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="whitespace-nowrap px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-2"
            >
              Send Message
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-[var(--admin-text-secondary)] uppercase tracking-wider mb-3">Contact Info</h3>
              <div className="space-y-3 bg-[var(--admin-surface-alt)] border border-[var(--admin-border-subtle)] p-4 rounded-lg">
                <div>
                  <span className="text-xs text-[var(--admin-text-muted)] block">Name</span>
                  <span className="font-medium text-[var(--admin-text)]">{registration.name}</span>
                </div>
                <div>
                  <span className="text-xs text-[var(--admin-text-muted)] block">Phone</span>
                  <span className="font-medium text-[var(--admin-text)]">{registration.phone}</span>
                </div>
                {registration.email && (
                  <div>
                    <span className="text-xs text-[var(--admin-text-muted)] block">Email</span>
                    <span className="font-medium text-[var(--admin-text)]">{registration.email}</span>
                  </div>
                )}
                <div>
                  <span className="text-xs text-[var(--admin-text-muted)] block">Place / Location</span>
                  <span className="font-medium text-[var(--admin-text)]">{registration.place || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-[var(--admin-text-secondary)] uppercase tracking-wider mb-3">Status</h3>
              <div className="space-y-3 bg-[var(--admin-surface-alt)] border border-[var(--admin-border-subtle)] p-4 rounded-lg">
                <div>
                  <span className="text-xs text-[var(--admin-text-muted)] block mb-1">Registration Status</span>
                  <select 
                    value={registration.status || 'pending'} 
                    onChange={(e) => handleUpdateStatus(e.target.value)}
                    disabled={isUpdating}
                    className="w-full text-sm border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] text-[var(--admin-text)] rounded-md p-2 outline-none focus:ring-1 focus:ring-[var(--color-turquoise)]"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                
              </div>
            </div>
          </div>



          {registration.form_data && Object.keys(registration.form_data).length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-[var(--admin-text-secondary)] uppercase tracking-wider mb-3">Custom Form Data</h3>
              <div className="bg-[var(--admin-surface-alt)] border border-[var(--admin-border-subtle)] p-4 rounded-lg text-sm">
                <pre className="whitespace-pre-wrap font-mono text-xs text-[var(--admin-text)]">
                  {JSON.stringify(registration.form_data, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {registration.receipt_url && (
            <div>
              <h3 className="text-sm font-semibold text-[var(--admin-text-secondary)] uppercase tracking-wider mb-3">Payment Receipt</h3>
              <div className="bg-[var(--admin-surface-alt)] border border-[var(--admin-border-subtle)] p-4 rounded-lg text-sm">
                <a href={registration.receipt_url} target="_blank" rel="noreferrer" className="text-[var(--color-turquoise)] hover:underline">
                  View Receipt Image
                </a>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--admin-border)] flex justify-between bg-[var(--admin-surface-alt)]">
          <button 
            onClick={handleDelete}
            disabled={isUpdating}
            className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-colors border border-transparent hover:border-red-200 dark:hover:border-red-500/20"
          >
            Delete Registration
          </button>
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-[var(--admin-surface)] border border-[var(--admin-border)] text-[var(--admin-text)] text-sm font-medium rounded-md hover:bg-[var(--admin-hover)] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
