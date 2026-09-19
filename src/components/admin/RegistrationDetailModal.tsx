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
