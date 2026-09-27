"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  fetchSpotRegistrationStats,
  toggleSpotRegistration,
  updateSessionCapacity,
  createSpotRegistration,
  type SpotRegistrationResult,
} from "@/app/[locale]/admin/event-day-actions";
import QRCode from "qrcode";
import {
  UserPlus,
  RefreshCw,
  Users,
  ToggleLeft,
  ToggleRight,
  CheckCircle,
  XCircle,
  Loader2,
  Settings,
  AlertTriangle,
} from "lucide-react";

interface SessionStats {
  slug: string;
  title: string;
  maxCapacity: number | null;
  spotEnabled: boolean;
  spotFee: number;
  spotFeeLabel: string;
  totalRegistered: number;
  spotRegistered: number;
  remainingSpots: number | null;
}

export default function SpotRegistrationPage() {
  const [sessions, setSessions] = useState<SessionStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [togglingSlug, setTogglingSlug] = useState<string | null>(null);

  // Quick registration form
  const [showQuickReg, setShowQuickReg] = useState(false);
  const [selectedSession, setSelectedSession] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [place, setPlace] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "upi" | "waived" | "none">("none");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [lastResult, setLastResult] = useState<SpotRegistrationResult | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  // Capacity editing
  const [editingCapacity, setEditingCapacity] = useState<string | null>(null);
  const [capacityInput, setCapacityInput] = useState("");
  const [feeInput, setFeeInput] = useState("");

  const [copyQRSuccess, setCopyQRSuccess] = useState(false);

  const handleDownloadQR = async () => {
    try {
      const res = await fetch("/upi-qr.png");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "upi-qr.png";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Failed to download QR code:", err);
      const a = document.createElement("a");
      a.href = "/upi-qr.png";
      a.download = "upi-qr.png";
      a.target = "_blank";
      a.click();
    }
  };

  const handleCopyQR = async () => {
    try {
      const res = await fetch("/upi-qr.png");
      const blob = await res.blob();
      if (typeof window !== "undefined" && navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({
            "image/png": blob,
          }),
        ]);
        setCopyQRSuccess(true);
        setTimeout(() => setCopyQRSuccess(false), 2000);
      } else {
        throw new Error("ClipboardItem API not supported");
      }
    } catch (err) {
      console.error("Failed to copy QR code image:", err);
      alert("Direct image copying is not supported on this browser. Please use 'Download QR' instead.");
    }
  };

  const loadStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchSpotRegistrationStats();
      setSessions(data);
    } catch {
      // Failed to load
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);

  const handleToggle = async (slug: string, currentEnabled: boolean) => {
    setTogglingSlug(slug);
    try {
      await toggleSpotRegistration(slug, !currentEnabled);
      setSessions(prev =>
        prev.map(s => s.slug === slug ? { ...s, spotEnabled: !currentEnabled } : s)
      );
    } catch {
      // Failed
    } finally {
      setTogglingSlug(null);
    }
  };

  const handleCapacitySave = async (slug: string) => {
    try {
      const cap = capacityInput ? parseInt(capacityInput) : null;
      const fee = feeInput ? parseFloat(feeInput) : undefined;
      await updateSessionCapacity(slug, cap, fee);
      setEditingCapacity(null);
      await loadStats();
    } catch {
      // Failed
    }
  };

  const handleQuickRegister = async () => {
    if (!name.trim()) { setFormError("Name is required"); return; }
    if (!phone.trim() || phone.replace(/\D/g, "").length < 10) { setFormError("Valid phone number is required"); return; }
    if (!selectedSession) { setFormError("Select a session"); return; }

    setIsSubmitting(true);
    setFormError("");
    setLastResult(null);

    try {
      const result = await createSpotRegistration({
        name: name.trim(),
        phone: phone.trim(),
        place: place.trim() || undefined,
        sessionSlug: selectedSession,
        paymentMethod,
        registeredBy: "Admin",
        gate: "main",
      });

      setLastResult(result);

      if (result.success) {
        setName("");
        setPhone("");
        setPlace("");
        await loadStats();
        
        if (result.registration?.qr_token) {
          const payload = `JC26:${result.registration.qr_token}`;
          const url = await QRCode.toDataURL(payload, {
            margin: 1,
            width: 200,
            color: { dark: "#103E79", light: "#FFFFFF" },
          });
          setQrDataUrl(url);
        } else {
          setQrDataUrl(null);
        }
      }
    } catch {
      setFormError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openSessions = sessions.filter(s => s.spotEnabled);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--admin-text)]">
            Spot Registration Control
          </h1>
          <p className="text-sm text-[var(--admin-text-secondary)] mt-1">
            Enable/disable walk-in registration per session and manage capacity
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowQuickReg(!showQuickReg)}
            className="px-4 py-2 rounded-xl bg-amber-600 text-white text-sm font-semibold hover:bg-amber-700 flex items-center gap-2 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            Quick Register
          </button>
          <button
            onClick={loadStats}
            disabled={isLoading}
            className="p-2.5 rounded-xl border border-[var(--admin-border)] text-[var(--admin-text-secondary)] hover:bg-[var(--admin-hover)] transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Quick Registration Form */}
      {showQuickReg && (
        <div className="rounded-2xl border-2 border-amber-500/30 bg-amber-500/5 p-5 space-y-4">
          <h2 className="text-base font-bold text-[var(--admin-text)] flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-amber-600" />
            Quick Spot Registration
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--admin-text)] mb-1">Session *</label>
              <select
                value={selectedSession}
                onChange={(e) => {
                  setSelectedSession(e.target.value);
                  const s = sessions.find(s => s.slug === e.target.value);
                  if (s && s.spotFee > 0) setPaymentMethod("cash");
                  else setPaymentMethod("none");
                }}
                className="w-full px-3 py-2.5 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-input-bg)] text-[var(--admin-text)] text-sm outline-none"
              >
                <option value="">Select session...</option>
                {openSessions.map(s => (
                  <option key={s.slug} value={s.slug}>
                    {s.title} {s.spotFee > 0 ? `(₹${s.spotFee})` : "(Free)"} — {s.remainingSpots !== null ? `${s.remainingSpots} spots left` : "Open"}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--admin-text)] mb-1">Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setFormError(""); }}
                placeholder="Full name"
                className="w-full px-3 py-2.5 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-input-bg)] text-[var(--admin-text)] text-sm outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--admin-text)] mb-1">Phone *</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => { setPhone(e.target.value); setFormError(""); }}
                placeholder="Mobile number"
                className="w-full px-3 py-2.5 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-input-bg)] text-[var(--admin-text)] text-sm outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--admin-text)] mb-1">Place / Dars</label>
              <input
                type="text"
                value={place}
                onChange={(e) => setPlace(e.target.value)}
                placeholder="Institution (optional)"
                className="w-full px-3 py-2.5 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-input-bg)] text-[var(--admin-text)] text-sm outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Payment (if paid session) */}
          {selectedSession && sessions.find(s => s.slug === selectedSession)?.spotFee! > 0 && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--admin-text)] mb-1.5">
                  Payment — ₹{sessions.find(s => s.slug === selectedSession)?.spotFee}
                </label>
                <div className="flex gap-2">
                  {(["cash", "upi", "waived"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setPaymentMethod(m)}
                      className={`flex-1 py-2 rounded-xl border-2 text-xs font-semibold transition-all ${
                        paymentMethod === m
                          ? "border-amber-500 bg-amber-500/10 text-amber-700"
                          : "border-[var(--admin-border)] text-[var(--admin-text-secondary)]"
                      }`}
                    >
                      {m === "cash" ? "💵 Cash" : m === "upi" ? "📱 UPI" : "🎟️ Waived"}
                    </button>
                  ))}
                </div>
              </div>

              {paymentMethod === "upi" && (
                <div className="p-4 bg-white dark:bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border)] shadow-sm flex flex-col items-center">
                  <div className="w-32 h-32 mb-3 bg-white p-1 rounded-lg border border-gray-200">
                    <img src="/upi-qr.png" alt="UPI QR Code" className="w-full h-full object-contain" />
                  </div>

                  {/* QR Action Buttons */}
                  <div className="flex items-center gap-2 mb-4">
                    <button
                      type="button"
                      onClick={handleDownloadQR}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-bg)] hover:bg-[var(--admin-hover)] text-xs font-semibold text-[var(--admin-text-secondary)] shadow-sm transition-all active:scale-95 cursor-pointer"
                      title="Download QR code as PNG"
                    >
                      <svg className="w-3.5 h-3.5 text-[var(--admin-text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download QR
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyQR}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-bg)] hover:bg-[var(--admin-hover)] text-xs font-semibold text-[var(--admin-text-secondary)] shadow-sm transition-all active:scale-95 cursor-pointer"
                      title="Copy QR code image to clipboard"
                    >
                      {copyQRSuccess ? (
                        <>
                          <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-emerald-500 font-medium">Copied!</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5 text-[var(--admin-text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Copy QR
                        </>
                      )}
                    </button>
                  </div>

                  <div className="w-full space-y-2 text-center text-xs">
                    <div
                      className="bg-[var(--admin-bg)] px-3 py-2 rounded-lg border border-[var(--admin-border)] shadow-sm flex justify-between items-center cursor-pointer hover:bg-[var(--admin-hover)] transition-colors"
                      onClick={() => {
                        const fee = sessions.find(s => s.slug === selectedSession)?.spotFee;
                        if (fee) {
                          navigator.clipboard.writeText(fee.toString());
                          alert("Amount copied!");
                        }
                      }}
                    >
                      <span className="text-[var(--admin-text-secondary)]">Amount: <span className="font-bold text-[var(--admin-text)]">₹{sessions.find(s => s.slug === selectedSession)?.spotFee}</span></span>
                      <svg className="w-3.5 h-3.5 text-[var(--admin-text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="bg-[var(--admin-bg)] px-3 py-2 rounded-lg border border-[var(--admin-border)] shadow-sm flex justify-between items-center">
                      <span className="text-[var(--admin-text-secondary)]">Name: <span className="font-bold text-[var(--admin-text)]">Muhammed Sinan</span></span>
                    </div>
                    <div
                      className="bg-[var(--admin-bg)] px-3 py-2 rounded-lg border border-[var(--admin-border)] shadow-sm flex justify-between items-center cursor-pointer hover:bg-[var(--admin-hover)] transition-colors"
                      onClick={() => {
                        navigator.clipboard.writeText("sinanvettam@okicici");
                        alert("UPI ID copied!");
                      }}
                    >
                      <span className="text-[var(--admin-text-secondary)]">UPI ID: <span className="font-mono text-[var(--admin-text)]">sinanvettam@okicici</span></span>
                      <svg className="w-3.5 h-3.5 text-[var(--admin-text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div
                      className="bg-[var(--admin-bg)] px-3 py-2 rounded-lg border border-[var(--admin-border)] shadow-sm flex justify-between items-center cursor-pointer hover:bg-[var(--admin-hover)] transition-colors"
                      onClick={() => {
                        navigator.clipboard.writeText("7034585359");
                        alert("Phone number copied!");
                      }}
                    >
                      <span className="text-[var(--admin-text-secondary)]">Phone: <span className="font-mono text-[var(--admin-text)]">7034585359</span></span>
                      <svg className="w-3.5 h-3.5 text-[var(--admin-text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {formError && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/10 text-red-600 text-xs font-medium border border-red-500/20">
              <XCircle className="w-4 h-4 shrink-0" />
              {formError}
            </div>
          )}

          {lastResult && (
            <div className={`flex flex-col gap-3 p-4 rounded-xl text-sm font-medium border ${
              lastResult.success
                ? "bg-emerald-500/10 text-emerald-800 border-emerald-500/30"
                : "bg-red-500/10 text-red-600 border-red-500/20"
            }`}>
              <div className="flex items-start gap-2">
                {lastResult.success ? <CheckCircle className="w-5 h-5 shrink-0 text-emerald-600" /> : <XCircle className="w-5 h-5 shrink-0" />}
                <div>
                  {lastResult.success ? (
                    <>
                      <p className="font-bold text-emerald-700">✓ Spot registration successful!</p>
                      <p className="text-emerald-700/80 mt-0.5">Attendee checked in automatically.</p>
                    </>
                  ) : (
                    lastResult.error
                  )}
                </div>
              </div>

              {lastResult.success && lastResult.registration && (
                <div className="mt-2 p-3 bg-white rounded-lg border border-emerald-500/20 shadow-sm flex items-start gap-4">
                  {qrDataUrl && (
                    <div className="shrink-0">
                      <img src={qrDataUrl} alt="QR Code" className="w-24 h-24 rounded shadow-sm border border-gray-100" />
                      <p className="text-[10px] text-center text-gray-400 mt-1 uppercase font-mono">{lastResult.registration.registration_id.slice(-6)}</p>
                    </div>
                  )}
                  <div className="flex-1 space-y-1 py-1">
                    <p className="text-sm font-bold text-gray-900">{lastResult.registration.name}</p>
                    <p className="text-xs text-gray-500">ID: <span className="font-mono text-gray-700">{lastResult.registration.registration_id}</span></p>
                    <p className="text-xs text-gray-500">Session: <span className="text-gray-700">{lastResult.registration.typeName}</span></p>
                    <a 
                      href={`/admin/registrations/${lastResult.registration.registration_id}`}
                      target="_blank" 
                      className="inline-block mt-2 text-xs font-semibold text-emerald-600 hover:text-emerald-700 underline"
                    >
                      View Details ↗
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}

          <button
            onClick={handleQuickRegister}
            disabled={isSubmitting || !name.trim() || !phone.trim() || !selectedSession}
            className="w-full py-3 rounded-xl bg-amber-600 text-white font-bold text-sm hover:bg-amber-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Registering...</>
            ) : (
              <><CheckCircle className="w-4 h-4" /> Register & Check In</>
            )}
          </button>
        </div>
      )}

      {/* Session Cards */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-[var(--admin-text-secondary)]" />
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((s) => {
            const percentFull = s.maxCapacity ? Math.round((s.totalRegistered / s.maxCapacity) * 100) : 0;
            const isNearFull = s.maxCapacity ? percentFull >= 90 : false;

            return (
              <div
                key={s.slug}
                className={`rounded-2xl border p-5 transition-all ${
                  s.spotEnabled
                    ? "border-emerald-500/30 bg-emerald-500/5"
                    : "border-[var(--admin-border)] bg-[var(--admin-card)]"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-[var(--admin-text)]">{s.title}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-[var(--admin-text-secondary)]">
                      <span className="flex items-center gap-1.5">
                        <Users className="w-4 h-4" />
                        {s.totalRegistered}{s.maxCapacity ? `/${s.maxCapacity}` : ""} registered
                      </span>
                      {s.spotRegistered > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 text-xs font-medium">
                          {s.spotRegistered} spot
                        </span>
                      )}
                      <span className="text-xs font-medium">
                        Fee: {s.spotFee > 0 ? `₹${s.spotFee}` : "Free"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (editingCapacity === s.slug) {
                          setEditingCapacity(null);
                        } else {
                          setEditingCapacity(s.slug);
                          setCapacityInput(s.maxCapacity?.toString() || "");
                          setFeeInput(s.spotFee?.toString() || "0");
                        }
                      }}
                      className="p-2 rounded-lg border border-[var(--admin-border)] text-[var(--admin-text-secondary)] hover:bg-[var(--admin-hover)] transition-all"
                      title="Edit Capacity & Fee"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleToggle(s.slug, s.spotEnabled)}
                      disabled={togglingSlug === s.slug}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all"
                      style={{
                        background: s.spotEnabled ? "var(--color-turquoise)" : "transparent",
                        color: s.spotEnabled ? "white" : "var(--admin-text-secondary)",
                        border: s.spotEnabled ? "none" : "1px solid var(--admin-border)",
                      }}
                    >
                      {togglingSlug === s.slug ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : s.spotEnabled ? (
                        <ToggleRight className="w-5 h-5" />
                      ) : (
                        <ToggleLeft className="w-5 h-5" />
                      )}
                      {s.spotEnabled ? "OPEN" : "CLOSED"}
                    </button>
                  </div>
                </div>

                {/* Capacity bar */}
                {s.maxCapacity && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] text-[var(--admin-text-secondary)]">
                        {s.remainingSpots !== null ? `${s.remainingSpots} spots remaining` : ""}
                      </span>
                      <span className="text-[11px] font-mono text-[var(--admin-text-secondary)]">
                        {percentFull}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-[var(--admin-border)] overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isNearFull ? "bg-red-500" : s.spotEnabled ? "bg-emerald-500" : "bg-[var(--color-navy)]"
                        }`}
                        style={{ width: `${Math.min(percentFull, 100)}%` }}
                      />
                    </div>
                    {isNearFull && (
                      <p className="flex items-center gap-1 mt-1.5 text-[10px] text-red-500 font-medium">
                        <AlertTriangle className="w-3 h-3" />
                        Nearly full — consider closing spot registration soon
                      </p>
                    )}
                  </div>
                )}

                {/* Capacity/Fee Editor */}
                {editingCapacity === s.slug && (
                  <div className="mt-4 p-3 rounded-xl bg-[var(--admin-bg)] border border-[var(--admin-border)] space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-[var(--admin-text)] mb-1">Max Capacity</label>
                        <input
                          type="number"
                          value={capacityInput}
                          onChange={(e) => setCapacityInput(e.target.value)}
                          placeholder="No limit"
                          className="w-full px-3 py-2 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-input-bg)] text-[var(--admin-text)] text-sm outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[var(--admin-text)] mb-1">Spot Fee (₹)</label>
                        <input
                          type="number"
                          value={feeInput}
                          onChange={(e) => setFeeInput(e.target.value)}
                          placeholder="0"
                          className="w-full px-3 py-2 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-input-bg)] text-[var(--admin-text)] text-sm outline-none"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCapacitySave(s.slug)}
                        className="px-4 py-2 rounded-lg bg-[var(--color-navy)] text-white text-xs font-semibold"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingCapacity(null)}
                        className="px-4 py-2 rounded-lg border border-[var(--admin-border)] text-[var(--admin-text-secondary)] text-xs font-semibold"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Summary */}
      <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] p-4">
        <h3 className="text-sm font-bold text-[var(--admin-text)] mb-2">Summary</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-[var(--admin-text)]">
              {sessions.reduce((acc, s) => acc + s.spotRegistered, 0)}
            </div>
            <div className="text-xs text-[var(--admin-text-secondary)]">Total Walk-ins</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-600">
              {openSessions.length}
            </div>
            <div className="text-xs text-[var(--admin-text-secondary)]">Sessions Open</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[var(--admin-text)]">
              {sessions.reduce((acc, s) => acc + s.totalRegistered, 0)}
            </div>
            <div className="text-xs text-[var(--admin-text-secondary)]">Total Registered</div>
          </div>
        </div>
      </div>
    </div>
  );
}
