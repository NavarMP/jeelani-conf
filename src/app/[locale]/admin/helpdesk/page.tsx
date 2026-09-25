"use client";

import React, { useState, useEffect } from "react";
import { searchAttendeesForCheckIn, checkInByRegistrationId, undoCheckIn, type AttendeeSearchResult } from "@/app/[locale]/admin/event-day-actions";
import { formatForWhatsApp } from "@/lib/phoneUtils";
import {
  LifeBuoy,
  Search,
  MessageCircle,
  Printer,
  CheckCircle,
  XCircle,
  Clock,
  UserCheck,
  AlertTriangle,
  MapPin,
  Phone,
  Undo2,
  ExternalLink,
  Edit,
  UserPlus
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function HelpDeskPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<AttendeeSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error", text: string } | null>(null);

  const router = useRouter();

  // Search logic
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!searchTerm.trim()) {
        setResults([]);
        setHasSearched(false);
        return;
      }
      
      setIsSearching(true);
      setHasSearched(true);
      try {
        // We use the same robust fuzzy search built for the scanner
        const data = await searchAttendeesForCheckIn(searchTerm);
        setResults(data);
      } catch (err) {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const showMessage = (type: "success" | "error", text: string) => {
    setActionMessage({ type, text });
    setTimeout(() => setActionMessage(null), 3000);
  };

  const handleManualCheckIn = async (attendeeId: string) => {
    try {
      const res = await checkInByRegistrationId(attendeeId, "helpdesk", "Help Desk Admin");
      if (res.success) {
        showMessage("success", `Manually checked in ${res.registration?.name}`);
        setResults(prev => prev.map(r => r.id === attendeeId ? { ...r, checked_in: true, checked_in_at: new Date().toISOString() } : r));
      } else {
        showMessage("error", res.message || "Failed to check in");
      }
    } catch {
      showMessage("error", "Network error");
    }
  };

  const handleSendWhatsApp = (attendee: AttendeeSearchResult) => {
    // Generate the public badge link
    const badgeUrl = `${window.location.origin}/badge/${attendee.registration_id}`;
    
    // Create WhatsApp message
    const message = `As-salamu alaykum ${attendee.name},\n\nHere is your digital badge for the Grand Jeelani Conference. Please show this QR code at the entry gate:\n\n${badgeUrl}\n\nSee you there!`;
    
    // Clean phone number (add country code if missing)
    const formattedPhone = formatForWhatsApp(attendee.phone);
    
    const waUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, "_blank");
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--admin-text)] flex items-center gap-2">
            <LifeBuoy className="w-6 h-6 text-indigo-500" />
            Help Desk
          </h1>
          <p className="text-sm text-[var(--admin-text-secondary)] mt-1">
            Resolve attendee issues, re-issue badges, and handle exceptions.
          </p>
        </div>
        <Link
          href="/admin/spot-registration"
          className="px-4 py-2 rounded-xl bg-amber-600 text-white text-sm font-semibold hover:bg-amber-700 flex items-center gap-2 transition-all shadow-sm"
        >
          <UserPlus className="w-4 h-4" />
          Spot Registration
        </Link>
      </div>

      {/* Action Message Toast */}
      {actionMessage && (
        <div className={`p-4 rounded-xl flex items-center gap-3 ${
          actionMessage.type === "success" 
            ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" 
            : "bg-red-500/10 text-red-600 border border-red-500/20"
        }`}>
          {actionMessage.type === "success" ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
          <span className="font-medium text-sm">{actionMessage.text}</span>
        </div>
      )}

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Search & Results */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--admin-text-secondary)]" />
            <input
              type="text"
              placeholder="Search by name, phone, place, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] text-[var(--admin-text)] outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 shadow-sm transition-all"
            />
          </div>

          <div className="space-y-3">
            {isSearching ? (
              <div className="p-8 text-center text-[var(--admin-text-secondary)] animate-pulse">
                Searching...
              </div>
            ) : results.length > 0 ? (
              results.map((attendee) => (
                <div key={attendee.id} className="p-4 rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] hover:border-indigo-500/30 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-[var(--admin-text)] text-lg">{attendee.name}</h3>
                        {attendee.is_spot_registration && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 font-bold border border-amber-500/20">SPOT</span>
                        )}
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${
                          attendee.status === "confirmed" || attendee.status === "selected"
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                        }`}>
                          {attendee.status.toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1 mt-2 text-sm text-[var(--admin-text-secondary)]">
                        <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {attendee.phone}</div>
                        <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {attendee.place || "N/A"}</div>
                        <div className="flex items-center gap-1.5 font-mono mt-1"><span className="text-[10px] bg-[var(--admin-hover)] px-1.5 rounded">{attendee.registration_id}</span></div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block"></span>
                          {attendee.typeName}
                        </div>
                      </div>

                      {/* Check-in Status */}
                      <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-hover)]">
                        {attendee.checked_in ? (
                          <>
                            <UserCheck className="w-4 h-4 text-emerald-500" />
                            <span className="text-xs font-medium text-emerald-600">Checked In</span>
                            <span className="text-[10px] text-[var(--admin-text-secondary)]">
                              ({attendee.checked_in_at ? new Date(attendee.checked_in_at).toLocaleTimeString() : 'Unknown'})
                            </span>
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                            <span className="text-xs font-medium text-amber-600">Not Checked In</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex sm:flex-col gap-2 shrink-0">
                      <Link
                        href={`/admin/registrations/${attendee.registration_id}`}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-[var(--admin-border)] text-xs font-medium text-[var(--admin-text)] hover:bg-[var(--admin-hover)] transition-all"
                      >
                        <Edit className="w-3.5 h-3.5" /> Edit
                      </Link>
                      <button
                        onClick={() => handleSendWhatsApp(attendee)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-green-500/10 text-green-600 text-xs font-medium hover:bg-green-500/20 transition-all border border-green-500/20"
                      >
                        <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                      </button>
                      <Link
                        href={`/badge/${attendee.registration_id}`}
                        target="_blank"
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-indigo-500/10 text-indigo-600 text-xs font-medium hover:bg-indigo-500/20 transition-all border border-indigo-500/20"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Badge
                      </Link>
                      
                      {!attendee.checked_in && (
                        <button
                          onClick={() => handleManualCheckIn(attendee.id)}
                          className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-[var(--admin-text)] text-[var(--admin-bg)] text-xs font-medium hover:opacity-90 transition-all shadow-sm"
                        >
                          <UserCheck className="w-3.5 h-3.5" /> Force Check-in
                        </button>
                      )}
                    </div>
                    
                  </div>
                </div>
              ))
            ) : hasSearched ? (
              <div className="p-8 text-center bg-[var(--admin-card)] border border-[var(--admin-border)] rounded-2xl">
                <p className="text-[var(--admin-text)] font-medium">No attendees found</p>
                <p className="text-sm text-[var(--admin-text-secondary)] mt-1">Try searching by partial name or phone number.</p>
              </div>
            ) : (
              <div className="p-8 text-center text-[var(--admin-text-secondary)] border border-dashed border-[var(--admin-border)] rounded-2xl">
                Search above to find an attendee
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Quick Tools */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)]">
            <h3 className="font-bold text-[var(--admin-text)] mb-3">Quick Tools</h3>
            
            <div className="space-y-2">
              <Link
                href="/admin/badges/print"
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-[var(--admin-border)] hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all group"
              >
                <div className="p-2 rounded-lg bg-[var(--admin-hover)] group-hover:bg-indigo-500/10 group-hover:text-indigo-500 transition-colors">
                  <Printer className="w-4 h-4" />
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm font-semibold text-[var(--admin-text)]">Batch Print Badges</div>
                  <div className="text-xs text-[var(--admin-text-secondary)]">Generate PDFs for printing</div>
                </div>
              </Link>

              <Link
                href="/admin/scanner"
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-[var(--admin-border)] hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all group"
              >
                <div className="p-2 rounded-lg bg-[var(--admin-hover)] group-hover:bg-indigo-500/10 group-hover:text-indigo-500 transition-colors">
                  <Search className="w-4 h-4" />
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm font-semibold text-[var(--admin-text)]">Gate Scanner</div>
                  <div className="text-xs text-[var(--admin-text-secondary)]">Open the QR scanner app</div>
                </div>
              </Link>
            </div>
          </div>

          <div className="p-5 rounded-2xl border-2 border-amber-500/20 bg-amber-500/5">
            <h3 className="font-bold text-amber-700 flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4" />
              Common Issues
            </h3>
            <ul className="text-xs text-amber-700/80 space-y-2">
              <li><strong>Lost badge:</strong> Search name, click "Badge", and print or screenshot.</li>
              <li><strong>Not registered:</strong> Check if spot registration is open.</li>
              <li><strong>Wrong session:</strong> Edit registration, change session, print new badge.</li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}
