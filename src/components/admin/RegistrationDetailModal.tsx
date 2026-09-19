"use client";

import React, { useState } from "react";
import { updateRegistrationStatus, deleteRegistration } from "@/app/[locale]/admin/actions";

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
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              Registration Details
              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full font-medium">
                {registration.typeName}
              </span>
            </h2>
            <p className="text-xs text-gray-500 mt-1 font-mono">{registration.id}</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Contact Info</h3>
              <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                <div>
                  <span className="text-xs text-gray-500 block">Name</span>
                  <span className="font-medium text-gray-900">{registration.name}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 block">Phone</span>
                  <span className="font-medium text-gray-900">{registration.phone}</span>
                </div>
                {registration.email && (
                  <div>
                    <span className="text-xs text-gray-500 block">Email</span>
                    <span className="font-medium text-gray-900">{registration.email}</span>
                  </div>
                )}
                <div>
                  <span className="text-xs text-gray-500 block">Place / Location</span>
                  <span className="font-medium text-gray-900">{registration.place || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Status</h3>
              <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                <div>
                  <span className="text-xs text-gray-500 block mb-1">Registration Status</span>
                  <select 
                    value={registration.status || 'pending'} 
                    onChange={(e) => handleUpdateStatus(e.target.value)}
                    disabled={isUpdating}
                    className="w-full text-sm border-gray-300 rounded-md p-2 outline-none focus:ring-1 focus:ring-[var(--color-turquoise)]"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                
              </div>
            </div>
          </div>

          {/* Type-specific details */}
          {registration.tableName === 'registrations_grand_assembly' && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Assembly Details</h3>
              <div className="bg-gray-50 p-4 rounded-lg flex flex-wrap gap-6">
                <div>
                  <span className="text-xs text-gray-500 block">Dars Name</span>
                  <span className="font-medium text-gray-900">{registration.dars_name}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 block">Zone Assigned</span>
                  <span className="font-medium text-gray-900">{registration.zone || 'Not Assigned'}</span>
                </div>
              </div>
            </div>
          )}


          {registration.form_data && Object.keys(registration.form_data).length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Custom Form Data</h3>
              <div className="bg-gray-50 p-4 rounded-lg text-sm">
                <pre className="whitespace-pre-wrap font-mono text-xs text-gray-700">
                  {JSON.stringify(registration.form_data, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {registration.receipt_url && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Payment Receipt</h3>
              <div className="bg-gray-50 p-4 rounded-lg text-sm">
                <a href={registration.receipt_url} target="_blank" rel="noreferrer" className="text-[var(--color-turquoise)] hover:underline">
                  View Receipt Image
                </a>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 flex justify-between bg-gray-50">
          <button 
            onClick={handleDelete}
            disabled={isUpdating}
            className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors border border-transparent hover:border-red-200"
          >
            Delete Registration
          </button>
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 text-sm font-medium rounded-md hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
