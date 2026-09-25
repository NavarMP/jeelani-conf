"use client";

import React, { useState } from "react";
import { updateRegistrationStatus, deleteRegistration, updateRegistrationAdminNotes, updateRegistrationWhatsAppSent, updateRegistrationDetails } from "@/app/[locale]/admin/actions";
import { X, Copy, Check, Download, Calendar } from "lucide-react";
import { formatForWhatsApp } from "@/lib/phoneUtils";
import { generateWhatsAppMessage } from "@/lib/whatsappUtils";

interface RegistrationDetailModalProps {
  registration: any;
  onClose: () => void;
}

export default function RegistrationDetailModal({ registration, onClose }: RegistrationDetailModalProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState(registration.admin_notes || "");
  const [isWhatsappSent, setIsWhatsappSent] = useState(registration.is_whatsapp_sent || false);
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: registration.name || "",
    phone: registration.phone || "",
    whatsapp_number: registration.whatsapp_number || "",
    email: registration.email || "",
    place: registration.place || ""
  });

  const [isEditingAdditional, setIsEditingAdditional] = useState(false);
  const [editFormDataObj, setEditFormDataObj] = useState<Record<string, any>>(registration.form_data || {});
  
  const [isEditingReceipt, setIsEditingReceipt] = useState(false);
  const [editReceiptUrl, setEditReceiptUrl] = useState(registration.receipt_url || "");

  const handleSaveNotes = async () => {
    setIsUpdating(true);
    try {
      await updateRegistrationAdminNotes(registration.tableName, registration.id, adminNotes);
      registration.admin_notes = adminNotes;
    } catch (err) {
      alert("Failed to save notes");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleWhatsappSent = async () => {
    setIsUpdating(true);
    try {
      const newStatus = !isWhatsappSent;
      await updateRegistrationWhatsAppSent(registration.tableName, registration.id, newStatus);
      setIsWhatsappSent(newStatus);
      registration.is_whatsapp_sent = newStatus;
    } catch (err) {
      alert("Failed to update whatsapp sent status");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveContactInfo = async () => {
    setIsUpdating(true);
    try {
      await updateRegistrationDetails(registration.tableName, registration.id, editFormData);
      Object.assign(registration, editFormData);
      setIsEditingContact(false);
    } catch (err) {
      alert("Failed to update contact info");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveAdditional = async () => {
    setIsUpdating(true);
    try {
      await updateRegistrationDetails(registration.tableName, registration.id, { form_data: editFormDataObj });
      registration.form_data = editFormDataObj;
      setIsEditingAdditional(false);
    } catch (err) {
      alert("Failed to update additional details");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveReceipt = async () => {
    setIsUpdating(true);
    try {
      await updateRegistrationDetails(registration.tableName, registration.id, { receipt_url: editReceiptUrl });
      registration.receipt_url = editReceiptUrl;
      setIsEditingReceipt(false);
    } catch (err) {
      alert("Failed to update receipt");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCopy = (text: string, field: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

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
            <p className="text-xs text-[var(--admin-text-muted)] mt-1 flex items-center gap-2">
              <span className="font-mono">{registration.id}</span>
              {registration.created_at && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(registration.created_at).toLocaleString()}
                  </span>
                </>
              )}
            </p>
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
            <div className="flex items-center gap-2">
              <a 
                href={`https://wa.me/${formatForWhatsApp(registration.whatsapp_number || registration.phone)}?text=${encodeURIComponent(
                generateWhatsAppMessage(registration)
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
              <button 
                onClick={handleToggleWhatsappSent} 
                disabled={isUpdating} 
                className={`p-2 rounded-lg border transition-colors ${isWhatsappSent ? 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/30 dark:border-emerald-700/50 dark:text-emerald-400' : 'bg-[var(--admin-surface)] border-[var(--admin-border)] text-[var(--admin-text-muted)] hover:bg-[var(--admin-hover)]'}`}
                title={isWhatsappSent ? "Mark as unsent" : "Mark as sent"}
              >
                 <Check className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-semibold text-[var(--admin-text-secondary)] uppercase tracking-wider">Contact Info</h3>
                {!isEditingContact ? (
                  <button onClick={() => setIsEditingContact(true)} className="text-xs text-[var(--color-turquoise)] hover:underline font-medium">Edit</button>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={() => setIsEditingContact(false)} className="text-xs text-[var(--admin-text-muted)] hover:underline font-medium">Cancel</button>
                    <button onClick={handleSaveContactInfo} disabled={isUpdating} className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-bold">Save</button>
                  </div>
                )}
              </div>
              <div className="space-y-3 bg-[var(--admin-surface-alt)] border border-[var(--admin-border-subtle)] p-4 rounded-lg">
                {!isEditingContact ? (
                  <>
                    <div className="flex items-center justify-between group">
                      <div>
                        <span className="text-xs text-[var(--admin-text-muted)] block">Name</span>
                        <span className="font-medium text-[var(--admin-text)]">{registration.name}</span>
                      </div>
                      <button onClick={() => handleCopy(registration.name, 'name')} className="text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] p-1.5 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        {copiedField === 'name' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <div className="flex items-center justify-between group">
                      <div>
                        <span className="text-xs text-[var(--admin-text-muted)] block">Phone</span>
                        <span className="font-medium text-[var(--admin-text)]">{registration.phone}</span>
                      </div>
                      <button onClick={() => handleCopy(registration.phone, 'phone')} className="text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] p-1.5 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        {copiedField === 'phone' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <div className="flex items-center justify-between group">
                      <div>
                        <span className="text-xs text-[var(--admin-text-muted)] block">WhatsApp</span>
                        <span className="font-medium text-[var(--admin-text)]">{registration.whatsapp_number || 'Same as phone'}</span>
                      </div>
                      <button onClick={() => handleCopy(registration.whatsapp_number || registration.phone, 'whatsapp')} className="text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] p-1.5 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        {copiedField === 'whatsapp' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    {registration.email && (
                      <div className="flex items-center justify-between group">
                        <div>
                          <span className="text-xs text-[var(--admin-text-muted)] block">Email</span>
                          <span className="font-medium text-[var(--admin-text)]">{registration.email}</span>
                        </div>
                        <button onClick={() => handleCopy(registration.email, 'email')} className="text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] p-1.5 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                          {copiedField === 'email' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    )}
                    <div>
                      <span className="text-xs text-[var(--admin-text-muted)] block">Place / Location</span>
                      <span className="font-medium text-[var(--admin-text)]">{registration.place || 'N/A'}</span>
                    </div>
                  </>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <span className="text-xs text-[var(--admin-text-muted)] block mb-1">Name</span>
                      <input type="text" value={editFormData.name} onChange={e => setEditFormData({...editFormData, name: e.target.value})} className="w-full text-sm border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] text-[var(--admin-text)] rounded-md p-2 outline-none focus:ring-1 focus:ring-[var(--color-turquoise)]" />
                    </div>
                    <div>
                      <span className="text-xs text-[var(--admin-text-muted)] block mb-1">Phone</span>
                      <input type="tel" value={editFormData.phone} onChange={e => setEditFormData({...editFormData, phone: e.target.value})} className="w-full text-sm border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] text-[var(--admin-text)] rounded-md p-2 outline-none focus:ring-1 focus:ring-[var(--color-turquoise)]" />
                    </div>
                    <div>
                      <span className="text-xs text-[var(--admin-text-muted)] block mb-1">WhatsApp</span>
                      <input type="tel" value={editFormData.whatsapp_number} onChange={e => setEditFormData({...editFormData, whatsapp_number: e.target.value})} className="w-full text-sm border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] text-[var(--admin-text)] rounded-md p-2 outline-none focus:ring-1 focus:ring-[var(--color-turquoise)]" />
                    </div>
                    <div>
                      <span className="text-xs text-[var(--admin-text-muted)] block mb-1">Email</span>
                      <input type="email" value={editFormData.email} onChange={e => setEditFormData({...editFormData, email: e.target.value})} className="w-full text-sm border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] text-[var(--admin-text)] rounded-md p-2 outline-none focus:ring-1 focus:ring-[var(--color-turquoise)]" />
                    </div>
                    <div>
                      <span className="text-xs text-[var(--admin-text-muted)] block mb-1">Place / Location</span>
                      <input type="text" value={editFormData.place} onChange={e => setEditFormData({...editFormData, place: e.target.value})} className="w-full text-sm border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] text-[var(--admin-text)] rounded-md p-2 outline-none focus:ring-1 focus:ring-[var(--color-turquoise)]" />
                    </div>
                  </div>
                )}
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
                
                <div className="pt-2 border-t border-[var(--admin-border-subtle)] mt-2">
                  <span className="text-xs text-[var(--admin-text-muted)] block mb-1">Admin Notes</span>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add internal notes here..."
                    disabled={isUpdating}
                    rows={3}
                    className="w-full text-sm border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] text-[var(--admin-text)] rounded-md p-2 outline-none focus:ring-1 focus:ring-[var(--color-turquoise)] resize-none"
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={handleSaveNotes}
                      disabled={isUpdating || adminNotes === (registration.admin_notes || "")}
                      className="px-3 py-1.5 bg-[var(--admin-surface)] border border-[var(--admin-border)] hover:bg-[var(--admin-hover)] text-[var(--admin-text)] text-xs font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Save Notes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>



          {((registration.form_data && Object.keys(registration.form_data).length > 0) || isEditingAdditional) && (
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-semibold text-[var(--admin-text-secondary)] uppercase tracking-wider">Additional Details</h3>
                {!isEditingAdditional ? (
                  <button onClick={() => setIsEditingAdditional(true)} className="text-xs text-[var(--color-turquoise)] hover:underline font-medium">Edit</button>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={() => { setIsEditingAdditional(false); setEditFormDataObj(registration.form_data || {}); }} className="text-xs text-[var(--admin-text-muted)] hover:underline font-medium">Cancel</button>
                    <button onClick={handleSaveAdditional} disabled={isUpdating} className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-bold">Save</button>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {!isEditingAdditional ? (
                  Object.entries(registration.form_data).map(([key, value], idx) => {
                    const displayKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => (str as string).toUpperCase());
                    return (
                      <div key={idx} className="bg-[var(--admin-surface-alt)] border border-[var(--admin-border-subtle)] p-4 rounded-lg flex flex-col justify-center">
                        <div className="flex justify-between items-start group">
                          <div className="w-full">
                            <span className="text-xs text-[var(--admin-text-muted)] block mb-2">{displayKey}</span>
                            {Array.isArray(value) ? (
                              <div className="flex flex-wrap gap-2 mt-1">
                                {value.map((item: any, i: number) => (
                                  <span key={i} className="px-2.5 py-1.5 bg-[var(--admin-surface)] border border-[var(--admin-border)] text-[var(--admin-text)] text-xs rounded-md shadow-sm">
                                    {String(item)}
                                  </span>
                                ))}
                              </div>
                            ) : typeof value === 'string' && (value.startsWith('http') || value.startsWith('www')) ? (
                              <a href={value.startsWith('http') ? value : `https://${value}`} target="_blank" rel="noreferrer" className="text-[var(--color-turquoise)] hover:underline break-all">
                                {value}
                              </a>
                            ) : (
                              <span className="font-medium text-[var(--admin-text)] break-all">
                                {String(value)}
                              </span>
                            )}
                          </div>
                          {typeof value === 'string' && (
                            <button onClick={() => handleCopy(String(value), `custom_${idx}`)} className="text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] p-1.5 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded md:opacity-0 md:group-hover:opacity-100 transition-opacity shrink-0 ml-2">
                              {copiedField === `custom_${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  Object.entries(editFormDataObj).map(([key, value], idx) => {
                    const displayKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => (str as string).toUpperCase());
                    return (
                      <div key={idx} className="bg-[var(--admin-surface-alt)] border border-[var(--admin-border-subtle)] p-4 rounded-lg flex flex-col justify-center">
                        <span className="text-xs text-[var(--admin-text-muted)] block mb-2">{displayKey}</span>
                        {typeof value === 'boolean' ? (
                          <select 
                            value={value ? 'true' : 'false'}
                            onChange={e => setEditFormDataObj({...editFormDataObj, [key]: e.target.value === 'true'})}
                            className="w-full text-sm border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] text-[var(--admin-text)] rounded-md p-2 outline-none focus:ring-1 focus:ring-[var(--color-turquoise)]"
                          >
                            <option value="true">Yes</option>
                            <option value="false">No</option>
                          </select>
                        ) : Array.isArray(value) ? (
                          <input 
                            type="text" 
                            value={value.join(', ')} 
                            onChange={e => setEditFormDataObj({...editFormDataObj, [key]: e.target.value.split(',').map(s => s.trim())})} 
                            placeholder="Comma separated values"
                            className="w-full text-sm border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] text-[var(--admin-text)] rounded-md p-2 outline-none focus:ring-1 focus:ring-[var(--color-turquoise)]" 
                          />
                        ) : (
                          <input 
                            type="text" 
                            value={String(value)} 
                            onChange={e => setEditFormDataObj({...editFormDataObj, [key]: e.target.value})} 
                            className="w-full text-sm border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] text-[var(--admin-text)] rounded-md p-2 outline-none focus:ring-1 focus:ring-[var(--color-turquoise)]" 
                          />
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )}

          {(registration.receipt_url || isEditingReceipt) && (
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-semibold text-[var(--admin-text-secondary)] uppercase tracking-wider">Payment Receipt</h3>
                {!isEditingReceipt ? (
                  <button onClick={() => setIsEditingReceipt(true)} className="text-xs text-[var(--color-turquoise)] hover:underline font-medium">Edit URL</button>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={() => { setIsEditingReceipt(false); setEditReceiptUrl(registration.receipt_url || ""); }} className="text-xs text-[var(--admin-text-muted)] hover:underline font-medium">Cancel</button>
                    <button onClick={handleSaveReceipt} disabled={isUpdating} className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-bold">Save</button>
                  </div>
                )}
              </div>
              <div className="bg-[var(--admin-surface-alt)] border border-[var(--admin-border-subtle)] p-4 rounded-lg overflow-hidden flex flex-col items-center gap-4">
                {!isEditingReceipt ? (
                  <>
                    {registration.receipt_url && (
                      <img 
                        src={registration.receipt_url} 
                        alt="Payment Receipt" 
                        className="max-w-full max-h-[400px] object-contain rounded-md border border-[var(--admin-border)] bg-[var(--admin-surface)] p-1 shadow-sm"
                      />
                    )}
                    {registration.receipt_url && (
                      <a 
                        href={registration.receipt_url} 
                        download={`Receipt_${registration.registration_id || registration.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-[var(--color-turquoise)]/10 text-[var(--color-turquoise)] border border-[var(--color-turquoise)]/20 rounded-md hover:bg-[var(--color-turquoise)]/20 transition-colors text-sm font-medium"
                      >
                        <Download className="w-4 h-4" />
                        Download / Open Image
                      </a>
                    )}
                  </>
                ) : (
                  <div className="w-full">
                    <span className="text-xs text-[var(--admin-text-muted)] block mb-1">Receipt URL</span>
                    <input 
                      type="url" 
                      value={editReceiptUrl} 
                      onChange={e => setEditReceiptUrl(e.target.value)} 
                      placeholder="https://..."
                      className="w-full text-sm border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] text-[var(--admin-text)] rounded-md p-2 outline-none focus:ring-1 focus:ring-[var(--color-turquoise)]" 
                    />
                  </div>
                )}
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
