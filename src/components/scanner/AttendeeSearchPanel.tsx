"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  searchAttendeesForCheckIn,
  checkInByRegistrationId,
  getUniquePlaces,
  createSpotRegistration,
  fetchSpotRegistrationStats,
  type AttendeeSearchResult,
  type CheckInResult,
  type SpotRegistrationResult,
} from "@/app/[locale]/admin/event-day-actions";
import { searchOfflineAttendees, getOfflineSessions, addToSyncQueue } from "@/lib/offline-db";
import {
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  UserPlus,
  MapPin,
  Phone,
  Filter,
  X,
  ArrowLeft,
  Loader2,
  UserCheck,
  Clock,
} from "lucide-react";

interface StaffInfo {
  id: string;
  name: string;
  role: string;
  assigned_gate: string | null;
  permissions: string[];
}

interface Props {
  staff: StaffInfo;
  onBack: () => void;
}

export default function AttendeeSearchPanel({ staff, onBack }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<AttendeeSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Filters
  const [sessionFilter, setSessionFilter] = useState("");
  const [placeFilter, setPlaceFilter] = useState("");
  const [onlyUnchecked, setOnlyUnchecked] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [places, setPlaces] = useState<string[]>([]);

  // Check-in result
  const [checkInResult, setCheckInResult] = useState<CheckInResult | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);

  // Spot registration
  const [showSpotReg, setShowSpotReg] = useState(false);
  const [spotSessions, setSpotSessions] = useState<any[]>([]);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    setIsOnline(navigator.onLine);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  // Load places for filter dropdown
  useEffect(() => {
    if (isOnline) {
      getUniquePlaces().then(setPlaces).catch(() => {});
      fetchSpotRegistrationStats().then(setSpotSessions).catch(() => {});
    } else {
      getOfflineSessions().then(s => setSpotSessions(s)).catch(() => {});
    }
  }, [isOnline]);

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!searchTerm.trim() && !sessionFilter && !placeFilter) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      setHasSearched(true);
      try {
        if (!isOnline) {
          const offlineData = await searchOfflineAttendees(searchTerm, {
            sessionSlug: sessionFilter || undefined,
            place: placeFilter || undefined,
            onlyUnchecked,
          });
          setResults(offlineData as any);
        } else {
          const data = await searchAttendeesForCheckIn(searchTerm, {
            sessionSlug: sessionFilter || undefined,
            place: placeFilter || undefined,
            onlyUnchecked,
          });
          setResults(data);
        }
      } catch {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchTerm, sessionFilter, placeFilter, onlyUnchecked, isOnline]);

  // Sound feedback
  const playSound = useCallback((type: "success" | "error" | "duplicate") => {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      if (type === "success") {
        osc.frequency.value = 880;
        gain.gain.value = 0.3;
        osc.start();
        setTimeout(() => { osc.frequency.value = 1100; }, 100);
        setTimeout(() => { osc.stop(); ctx.close(); }, 200);
      } else if (type === "duplicate") {
        osc.frequency.value = 440;
        gain.gain.value = 0.2;
        osc.start();
        setTimeout(() => { osc.stop(); ctx.close(); }, 300);
      } else {
        osc.frequency.value = 300;
        gain.gain.value = 0.3;
        osc.start();
        setTimeout(() => { osc.frequency.value = 200; }, 150);
        setTimeout(() => { osc.stop(); ctx.close(); }, 300);
      }
    } catch { /* Audio not supported */ }
  }, []);

  // Haptic feedback
  const vibrate = useCallback((pattern: number[]) => {
    try { if (navigator.vibrate) navigator.vibrate(pattern); } catch { /* Not supported */ }
  }, []);

  // Handle check-in from search results
  const handleCheckIn = async (attendee: AttendeeSearchResult) => {
    setProcessingId(attendee.id);
    setCheckInResult(null);
    const gate = staff.assigned_gate || "main";

    if (!isOnline) {
      // Offline mode
      const token = (attendee as any).qr_token || attendee.id; // fallback
      const newScan = { token, gate, checkedInBy: staff.name, timestamp: Date.now() };
      await addToSyncQueue(newScan);
      
      setCheckInResult({
        success: true,
        status: "checked_in",
        message: "Offline Scan Logged 💾",
      });
      playSound("success");
      vibrate([100, 50, 100]);
      setResults(prev =>
        prev.map(r => r.id === attendee.id ? { ...r, checked_in: true, checked_in_at: new Date().toISOString() } : r)
      );
      setTimeout(() => setCheckInResult(null), 4000);
      setProcessingId(null);
      return;
    }

    try {
      const result = await checkInByRegistrationId(attendee.id, gate, staff.name);

      setCheckInResult(result);

      if (result.success) {
        playSound("success");
        vibrate([100, 50, 100]);
        // Update local results to reflect check-in
        setResults(prev =>
          prev.map(r => r.id === attendee.id ? { ...r, checked_in: true, checked_in_at: new Date().toISOString() } : r)
        );
      } else if (result.status === "already_checked_in") {
        playSound("duplicate");
        vibrate([200]);
      } else {
        playSound("error");
        vibrate([300, 100, 300]);
      }

      // Auto-clear result after 4 seconds
      setTimeout(() => setCheckInResult(null), 4000);
    } catch {
      setCheckInResult({
        success: false,
        status: "error",
        message: "Network error. Please try again.",
      });
      playSound("error");
    } finally {
      setProcessingId(null);
    }
  };

  // Spot Registration mode
  if (showSpotReg) {
    return (
      <SpotRegistrationForm
        staff={staff}
        sessions={spotSessions}
        onBack={() => setShowSpotReg(false)}
        onSuccess={(result) => {
          setShowSpotReg(false);
          setCheckInResult({
            success: true,
            status: "checked_in",
            message: `✓ Spot registered & checked in: ${result.registration?.name}`,
            registration: result.registration ? {
              name: result.registration.name,
              registration_id: result.registration.registration_id,
              session_slug: result.registration.session_slug,
              typeName: result.registration.typeName,
              status: "confirmed",
            } : undefined,
          });
          playSound("success");
          vibrate([100, 50, 100]);
          setTimeout(() => setCheckInResult(null), 5000);
        }}
      />
    );
  }

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[var(--admin-bg)]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-[var(--color-navy)] text-white">
        <button
          onClick={onBack}
          className="p-2 -ml-1 rounded-lg hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-sm font-bold">Find Attendee by Name</h1>
          <p className="text-[10px] text-white/70">
            Gate: {staff.assigned_gate || "Main"} • {staff.name}
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 pt-4 pb-2 space-y-3 bg-[var(--admin-bg)] sticky top-0 z-10 border-b border-[var(--admin-border)]">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--admin-text-secondary)]" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search by name, phone, or reg ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-3 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-input-bg)] text-[var(--admin-text)] text-sm outline-none focus:border-[var(--color-turquoise)] focus:ring-1 focus:ring-[var(--color-turquoise)]/20 transition-all"
              autoFocus
              autoComplete="off"
            />
            {searchTerm && (
              <button
                onClick={() => { setSearchTerm(""); searchInputRef.current?.focus(); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-[var(--admin-hover)] text-[var(--admin-text-secondary)]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-3 rounded-xl border transition-all ${
              showFilters || sessionFilter || placeFilter
                ? "border-[var(--color-turquoise)] bg-[var(--color-turquoise)]/10 text-[var(--color-turquoise)]"
                : "border-[var(--admin-border)] text-[var(--admin-text-secondary)] hover:bg-[var(--admin-hover)]"
            }`}
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="flex gap-2 flex-wrap">
            <select
              value={sessionFilter}
              onChange={(e) => setSessionFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-input-bg)] text-[var(--admin-text)] text-xs outline-none"
            >
              <option value="">All Programs</option>
              <option value="burda-qawwali">Burda & Qawwali</option>
              <option value="astro-ai-fiqh">Astronomy & AI Fiqh</option>
              <option value="dars-management-meet">Dars Management Meet</option>
            </select>
            <select
              value={placeFilter}
              onChange={(e) => setPlaceFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-input-bg)] text-[var(--admin-text)] text-xs outline-none flex-1 min-w-0"
            >
              <option value="">All Places / Dars</option>
              {places.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <label className="flex items-center gap-1.5 text-xs text-[var(--admin-text-secondary)] cursor-pointer whitespace-nowrap">
              <input
                type="checkbox"
                checked={onlyUnchecked}
                onChange={(e) => setOnlyUnchecked(e.target.checked)}
                className="accent-[var(--color-turquoise)]"
              />
              Not checked in only
            </label>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {isSearching ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-[var(--color-turquoise)]" />
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-2">
            <p className="text-[11px] text-[var(--admin-text-secondary)] mb-2">
              {results.length} result{results.length !== 1 ? "s" : ""} found
            </p>
            {results.map((attendee) => (
              <div
                key={attendee.id}
                className={`rounded-xl border transition-all ${
                  attendee.checked_in
                    ? "border-blue-500/30 bg-blue-50/5"
                    : "border-[var(--admin-border)] bg-[var(--admin-card)]"
                }`}
              >
                <div className="p-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm text-[var(--admin-text)] truncate">
                          {attendee.name}
                        </h3>
                        {attendee.is_spot_registration && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 border border-amber-500/20 font-medium">
                            SPOT
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 text-[11px] text-[var(--admin-text-secondary)]">
                        {attendee.place && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {attendee.place}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {attendee.phone}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-navy)]/10 text-[var(--color-navy)] font-medium border border-[var(--color-navy)]/20">
                          {attendee.typeName}
                        </span>
                        <span className="font-mono text-[10px] text-[var(--admin-text-secondary)]">
                          {attendee.registration_id}
                        </span>
                      </div>
                    </div>

                    {/* Check-in button */}
                    <div className="shrink-0">
                      {attendee.checked_in ? (
                        <div className="flex flex-col items-center text-center">
                          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                            <UserCheck className="w-5 h-5 text-blue-500" />
                          </div>
                          <span className="text-[9px] text-blue-500 mt-1 font-medium">
                            Checked In
                          </span>
                          {attendee.checked_in_at && (
                            <span className="flex items-center gap-0.5 text-[9px] text-[var(--admin-text-secondary)]">
                              <Clock className="w-2.5 h-2.5" />
                              {new Date(attendee.checked_in_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={() => handleCheckIn(attendee)}
                          disabled={processingId === attendee.id}
                          className="flex flex-col items-center gap-1 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 active:scale-95 disabled:opacity-50 transition-all shadow-md"
                        >
                          {processingId === attendee.id ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <CheckCircle className="w-5 h-5" />
                          )}
                          <span>Check In</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : hasSearched ? (
          <div className="text-center py-12 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-[var(--admin-hover)] flex items-center justify-center">
              <XCircle className="w-8 h-8 text-[var(--admin-text-secondary)]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--admin-text)]">
                No attendees found
              </p>
              <p className="text-xs text-[var(--admin-text-secondary)] mt-1">
                Try a different name, phone number, or clear filters
              </p>
            </div>
            <button
              onClick={() => setShowSpotReg(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 text-white text-sm font-semibold hover:bg-amber-700 active:scale-95 transition-all shadow-md"
            >
              <UserPlus className="w-4 h-4" />
              Spot Registration
            </button>
          </div>
        ) : (
          <div className="text-center py-12 space-y-3">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-[var(--admin-hover)] flex items-center justify-center">
              <Search className="w-8 h-8 text-[var(--admin-text-secondary)]" />
            </div>
            <p className="text-sm text-[var(--admin-text-secondary)]">
              Type a name, phone number, or registration ID to find an attendee
            </p>
          </div>
        )}
      </div>

      {/* Bottom Spot Registration Bar */}
      <div className="sticky bottom-0 px-4 py-3 bg-[var(--admin-bg)] border-t border-[var(--admin-border)]">
        <button
          onClick={() => setShowSpotReg(true)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-amber-500/40 text-amber-600 text-sm font-semibold hover:bg-amber-500/5 active:scale-[0.98] transition-all"
        >
          <UserPlus className="w-4 h-4" />
          Not registered? Spot Registration
        </button>
      </div>

      {/* Check-in Result Toast */}
      {checkInResult && (
        <div
          className={`fixed top-16 left-4 right-4 z-50 rounded-xl shadow-2xl transition-all duration-300 ${
            checkInResult.success
              ? "bg-emerald-600"
              : checkInResult.status === "already_checked_in"
              ? "bg-amber-600"
              : "bg-red-600"
          }`}
        >
          <div className="px-4 py-3 text-white flex items-start gap-3">
            {checkInResult.success ? (
              <CheckCircle className="w-6 h-6 shrink-0 mt-0.5" />
            ) : checkInResult.status === "already_checked_in" ? (
              <AlertTriangle className="w-6 h-6 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-6 h-6 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm truncate">
                {checkInResult.registration?.name || ""}
              </p>
              <p className="text-white/90 text-xs mt-0.5">
                {checkInResult.message}
              </p>
            </div>
            <button
              onClick={() => setCheckInResult(null)}
              className="p-1 rounded-lg hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ==============================================================================
// SPOT REGISTRATION FORM (inline sub-component)
// ==============================================================================

function SpotRegistrationForm({
  staff,
  sessions,
  onBack,
  onSuccess,
}: {
  staff: StaffInfo;
  sessions: any[];
  onBack: () => void;
  onSuccess: (result: SpotRegistrationResult) => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [place, setPlace] = useState("");
  const [sessionSlug, setSessionSlug] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "upi" | "waived" | "none">("none");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [lastSpotReg, setLastSpotReg] = useState<any>(null);

  const openSessions = sessions.filter(s => s.spotEnabled);
  const selectedSession = sessions.find(s => s.slug === sessionSlug);

  const handleSubmit = async () => {
    if (!name.trim()) { setError("Name is required"); return; }
    if (!phone.trim() || phone.replace(/\D/g, "").length < 10) { setError("Valid phone number is required"); return; }
    if (!sessionSlug) { setError("Please select a session"); return; }

    setIsSubmitting(true);
    setError("");

    try {
      const result = await createSpotRegistration({
        name: name.trim(),
        phone: phone.trim(),
        place: place.trim() || undefined,
        sessionSlug,
        paymentMethod,
        registeredBy: staff.name,
        gate: staff.assigned_gate || "main",
      });

      if (result.success) {
        setLastSpotReg(result.registration);
        setName("");
        setPhone("");
        setPlace("");
        onSuccess(result);
      } else {
        setError(result.error || "Failed to register");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[var(--admin-bg)]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-amber-600 text-white">
        <button onClick={onBack} className="p-2 -ml-1 rounded-lg hover:bg-white/10">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-sm font-bold">Spot Registration</h1>
          <p className="text-[10px] text-white/80">Walk-in · Quick Entry · {staff.name}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Open sessions notice */}
        {openSessions.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/10 flex items-center justify-center">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-sm font-semibold text-[var(--admin-text)]">
              Spot registration is closed
            </p>
            <p className="text-xs text-[var(--admin-text-secondary)]">
              No sessions currently have spot registration enabled. An admin must enable it first.
            </p>
          </div>
        ) : (
          <>
            {/* Session Selection */}
            <div>
              <label className="block text-xs font-semibold text-[var(--admin-text)] mb-1.5">
                Session *
              </label>
              <div className="space-y-2">
                {openSessions.map((s) => (
                  <button
                    key={s.slug}
                    onClick={() => {
                      setSessionSlug(s.slug);
                      if (s.spotFee > 0) setPaymentMethod("cash");
                      else setPaymentMethod("none");
                    }}
                    className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                      sessionSlug === s.slug
                        ? "border-amber-500 bg-amber-500/5"
                        : "border-[var(--admin-border)] hover:border-amber-500/30"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-[var(--admin-text)]">{s.title}</span>
                      <span className="text-xs font-bold text-amber-600">
                        {s.spotFee > 0 ? `₹${s.spotFee}` : "Free"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-[10px] text-[var(--admin-text-secondary)]">
                      <span>Registered: {s.totalRegistered}{s.maxCapacity ? `/${s.maxCapacity}` : ""}</span>
                      <span>Spot: {s.spotRegistered}</span>
                      {s.remainingSpots !== null && (
                        <span className={s.remainingSpots < 10 ? "text-red-500 font-bold" : ""}>
                          {s.remainingSpots} spots left
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Form Fields */}
            <div>
              <label className="block text-xs font-semibold text-[var(--admin-text)] mb-1.5">
                Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setError(""); }}
                placeholder="Full name of the attendee"
                className="w-full px-4 py-3 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-input-bg)] text-[var(--admin-text)] text-sm outline-none focus:border-amber-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--admin-text)] mb-1.5">
                Phone *
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => { setPhone(e.target.value); setError(""); }}
                placeholder="Mobile number"
                inputMode="numeric"
                className="w-full px-4 py-3 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-input-bg)] text-[var(--admin-text)] text-sm outline-none focus:border-amber-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--admin-text)] mb-1.5">
                Place / Dars
              </label>
              <input
                type="text"
                value={place}
                onChange={(e) => setPlace(e.target.value)}
                placeholder="Institution or place (optional)"
                className="w-full px-4 py-3 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-input-bg)] text-[var(--admin-text)] text-sm outline-none focus:border-amber-500 transition-all"
              />
            </div>

            {/* Payment method (for paid sessions) */}
            {selectedSession && selectedSession.spotFee > 0 && (
              <div>
                <label className="block text-xs font-semibold text-[var(--admin-text)] mb-1.5">
                  Payment Method — ₹{selectedSession.spotFee}
                </label>
                <div className="flex gap-2">
                  {(["cash", "upi", "waived"] as const).map((method) => (
                    <button
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      className={`flex-1 py-2.5 rounded-xl border-2 text-xs font-semibold transition-all ${
                        paymentMethod === method
                          ? "border-amber-500 bg-amber-500/10 text-amber-700"
                          : "border-[var(--admin-border)] text-[var(--admin-text-secondary)] hover:border-amber-500/30"
                      }`}
                    >
                      {method === "cash" ? "💵 Cash" : method === "upi" ? "📱 UPI" : "🎟️ Waived"}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-xs font-medium">
                <XCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}
          </>
        )}
      </div>

      {/* Submit Button */}
      {openSessions.length > 0 && (
        <div className="sticky bottom-0 px-4 py-3 bg-[var(--admin-bg)] border-t border-[var(--admin-border)]">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !name.trim() || !phone.trim() || !sessionSlug}
            className="w-full py-3.5 rounded-xl font-bold text-sm bg-amber-600 text-white hover:bg-amber-700 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Registering...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Register & Check In
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
