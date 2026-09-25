"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { checkInByQRToken, manualCheckIn, verifyStaffPin, batchCheckIn, type CheckInResult } from "@/app/[locale]/admin/event-day-actions";
import { decodeQRPayload } from "@/lib/qr-client";
import AttendeeSearchPanel from "@/components/scanner/AttendeeSearchPanel";
import {
  ScanLine,
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  Flashlight,
  FlashlightOff,
  RotateCcw,
  LogOut,
  Wifi,
  WifiOff,
  Users,
} from "lucide-react";

interface StaffInfo {
  id: string;
  name: string;
  role: string;
  assigned_gate: string | null;
  permissions: string[];
}

export default function QRScannerClient() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [staff, setStaff] = useState<StaffInfo | null>(null);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  // Scanner state
  const [scanResult, setScanResult] = useState<CheckInResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanCount, setScanCount] = useState(0);
  const [isOnline, setIsOnline] = useState(true);
  const [showManual, setShowManual] = useState(false);
  const [manualSearch, setManualSearch] = useState("");
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [torch, setTorch] = useState(false);
  
  // Mode: 'scan' or 'search' (Find by Name)
  const [mode, setMode] = useState<"scan" | "search">("scan");

  // Offline sync state
  const [offlineQueue, setOfflineQueue] = useState<{ token: string; gate: string; checkedInBy: string; timestamp: number }[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // Load offline queue on mount
  useEffect(() => {
    try {
      const storedQueue = localStorage.getItem("jeelani_offline_queue");
      if (storedQueue) setOfflineQueue(JSON.parse(storedQueue));
      
      const storedStaff = localStorage.getItem("jeelani_staff_info");
      if (storedStaff) {
        setStaff(JSON.parse(storedStaff));
        setIsAuthenticated(true);
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  // Sync offline queue when online
  const syncOfflineQueue = useCallback(async () => {
    if (offlineQueue.length === 0 || !isOnline || isSyncing) return;
    setIsSyncing(true);
    try {
      const results = await batchCheckIn(offlineQueue);
      setScanCount(c => c + results.length);
      setOfflineQueue([]);
      localStorage.removeItem("jeelani_offline_queue");
    } catch {
      // Failed to sync, keep queue
    } finally {
      setIsSyncing(false);
    }
  }, [offlineQueue, isOnline, isSyncing]);

  useEffect(() => {
    if (isOnline) syncOfflineQueue();
  }, [isOnline, syncOfflineQueue]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  // PIN Authentication
  const handlePinSubmit = async () => {
    if (pin.length !== 6) {
      setPinError("Please enter a 6-digit PIN");
      return;
    }
    setIsVerifying(true);
    setPinError("");
    try {
      const result = await verifyStaffPin(pin);
      if (result.valid && result.staff) {
        setStaff(result.staff);
        setIsAuthenticated(true);
        localStorage.setItem("jeelani_staff_info", JSON.stringify(result.staff));
      } else {
        setPinError("Invalid PIN. Please check with an admin.");
        setPin("");
      }
    } catch {
      setPinError("Connection error. Please try again or use cached login if offline.");
    } finally {
      setIsVerifying(false);
    }
  };

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
    } catch {
      // Audio not supported
    }
  }, []);

  // Haptic feedback
  const vibrate = useCallback((pattern: number[]) => {
    try {
      if (navigator.vibrate) navigator.vibrate(pattern);
    } catch {
      // Not supported
    }
  }, []);

  // Camera initialization
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsCameraActive(true);
      }
    } catch (err) {
      console.error("Camera access denied:", err);
      setShowManual(true);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    setIsCameraActive(false);
  }, []);

  // QR Code scanning using canvas + BarcodeDetector API
  useEffect(() => {
    if (!isCameraActive || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Check for BarcodeDetector support
    const hasBarcodeDetector = "BarcodeDetector" in window;
    let detector: any = null;

    if (hasBarcodeDetector) {
      detector = new (window as any).BarcodeDetector({ formats: ["qr_code"] });
    }

    let lastScannedToken = "";
    let lastScanTime = 0;

    const scanFrame = async () => {
      if (!video.videoWidth || isProcessing) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx?.drawImage(video, 0, 0);

      // Prevent duplicate scans within 3 seconds
      const now = Date.now();
      if (now - lastScanTime < 3000) return;

      if (detector) {
        try {
          const barcodes = await detector.detect(canvas);
          if (barcodes.length > 0) {
            const rawValue = barcodes[0].rawValue;
            const token = decodeQRPayload(rawValue);
            if (token && token !== lastScannedToken) {
              lastScannedToken = token;
              lastScanTime = now;
              handleQRScan(token);
            }
          }
        } catch {
          // Detection failed
        }
      }
    };

    scanIntervalRef.current = setInterval(scanFrame, 250);

    return () => {
      if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
    };
  }, [isCameraActive, isProcessing]);

  // Handle QR scan result
  const handleQRScan = async (token: string) => {
    if (isProcessing) return;
    setIsProcessing(true);
    setScanResult(null);

    const gate = staff?.assigned_gate || "main";
    const checkedInBy = staff?.name || "Scanner";

    if (!isOnline) {
      // Offline mode: queue scan locally
      const newScan = { token, gate, checkedInBy, timestamp: Date.now() };
      const newQueue = [...offlineQueue, newScan];
      setOfflineQueue(newQueue);
      localStorage.setItem("jeelani_offline_queue", JSON.stringify(newQueue));
      
      setScanResult({
        success: true,
        status: "checked_in",
        message: "Offline Scan Logged 💾",
      });
      setScanCount((c) => c + 1);
      playSound("success");
      vibrate([100, 50, 100]);
      setTimeout(() => setIsProcessing(false), 1000);
      return;
    }

    try {
      const result = await checkInByQRToken(token, gate, checkedInBy);

      setScanResult(result);
      setScanCount((c) => c + 1);

      if (result.success) {
        playSound("success");
        vibrate([100, 50, 100]);
      } else if (result.status === "already_checked_in") {
        playSound("duplicate");
        vibrate([200]);
      } else {
        playSound("error");
        vibrate([300, 100, 300]);
      }
    } catch {
      // Fallback to offline if network request fails
      const newScan = { token, gate, checkedInBy, timestamp: Date.now() };
      const newQueue = [...offlineQueue, newScan];
      setOfflineQueue(newQueue);
      localStorage.setItem("jeelani_offline_queue", JSON.stringify(newQueue));
      
      setScanResult({
        success: true,
        status: "checked_in",
        message: "Network error. Logged offline 💾",
      });
      setScanCount((c) => c + 1);
      playSound("success");
      vibrate([100, 50, 100]);
    } finally {
      setTimeout(() => setIsProcessing(false), 1500);
    }
  };

  // Manual check-in
  const handleManualCheckIn = async () => {
    if (!manualSearch.trim()) return;
    setIsProcessing(true);
    setScanResult(null);

    try {
      const gate = staff?.assigned_gate || "main";
      const result = await manualCheckIn(manualSearch.trim(), gate, staff?.name || "Scanner");

      setScanResult(result);
      setScanCount((c) => c + 1);

      if (result.success) {
        playSound("success");
        vibrate([100, 50, 100]);
        setManualSearch("");
      } else {
        playSound("error");
        vibrate([300]);
      }
    } catch {
      setScanResult({
        success: false,
        status: "error",
        message: "Network error. Please try again.",
      });
      playSound("error");
    } finally {
      setIsProcessing(false);
    }
  };

  // Start camera when authenticated
  useEffect(() => {
    if (isAuthenticated && !showManual) {
      startCamera();
    }
    return () => stopCamera();
  }, [isAuthenticated, showManual, startCamera, stopCamera]);

  // Toggle torch
  const toggleTorch = async () => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (track) {
      try {
        await (track as any).applyConstraints({
          advanced: [{ torch: !torch } as any],
        });
        setTorch(!torch);
      } catch {
        // Torch not supported
      }
    }
  };

  // PIN Entry Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center px-6 bg-[var(--admin-bg)]">
        <div className="w-full max-w-xs space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[var(--color-navy)] flex items-center justify-center shadow-lg">
              <ScanLine className="w-8 h-8 text-[var(--color-gold)]" />
            </div>
            <h1
              className="text-xl font-bold text-[var(--admin-text)]"
              style={{ fontFamily: "var(--font-bodoni-moda)" }}
            >
              Staff Ticket Scanner
            </h1>
            <p className="text-xs text-[var(--admin-text-secondary)] mt-1">
              Enter your assigned 6-digit staff PIN code to unlock
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex justify-center gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-10 h-12 rounded-lg border-2 flex items-center justify-center text-lg font-bold transition-all ${
                    pin.length > i
                      ? "border-[var(--color-turquoise)] bg-[var(--color-turquoise)]/10 text-[var(--admin-text)]"
                      : "border-[var(--admin-border)] text-transparent"
                  }`}
                >
                  {pin[i] ? "●" : ""}
                </div>
              ))}
            </div>

            <input
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={pin}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, "").slice(0, 6);
                setPin(v);
                setPinError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && pin.length === 6) handlePinSubmit();
              }}
              className="w-full px-4 py-3 text-center text-xl tracking-[0.5em] font-mono border border-[var(--admin-border)] rounded-xl bg-[var(--admin-input-bg)] text-[var(--admin-text)] outline-none focus:border-[var(--color-turquoise)]"
              placeholder="••••••"
              autoFocus
              autoComplete="off"
            />

            {pinError && (
              <p className="text-center text-xs text-red-500 font-medium">{pinError}</p>
            )}

            <button
              onClick={handlePinSubmit}
              disabled={pin.length !== 6 || isVerifying}
              className="w-full py-3 rounded-xl font-semibold text-sm bg-[var(--color-navy)] text-white hover:bg-[var(--color-navy)]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
            >
              {isVerifying ? "Verifying PIN..." : "Unlock Scanner"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Attendee Search Mode (Find by Name)
  if (mode === "search") {
    return (
      <AttendeeSearchPanel
        staff={staff!}
        onBack={() => setMode("scan")}
      />
    );
  }

  // Scanner Screen
  return (
    <div className="min-h-[100dvh] flex flex-col bg-black relative">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-[var(--color-navy)] text-white z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
            <User className="w-4 h-4 text-[var(--color-gold)]" />
          </div>
          <div>
            <div className="text-xs font-semibold">{staff?.name}</div>
            <div className="text-[10px] text-white/70">
              Gate: {staff?.assigned_gate || "Main"} • {scanCount} scanned
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isSyncing ? (
            <span className="flex items-center gap-1 text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              <span className="animate-spin">⟳</span> Syncing...
            </span>
          ) : isOnline ? (
            <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <Wifi className="w-3 h-3" /> Live
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[10px] text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
              <WifiOff className="w-3 h-3" /> Offline {offlineQueue.length > 0 && `(${offlineQueue.length} queued)`}
            </span>
          )}
          <button
            onClick={() => {
              stopCamera();
              setIsAuthenticated(false);
              setStaff(null);
              setPin("");
              setScanCount(0);
            }}
            className="p-2 rounded-lg hover:bg-white/10 text-white/80 hover:text-white"
            title="Lock Scanner"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Camera View / Manual Entry */}
      <div className="flex-1 relative">
        {!showManual ? (
          <>
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover"
              playsInline
              muted
            />
            <canvas ref={canvasRef} className="hidden" />

            {/* Scan overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative w-64 h-64">
                {/* Corner markers */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg" />

                {/* Scanning line animation */}
                {!isProcessing && (
                  <div className="absolute left-4 right-4 h-0.5 bg-[var(--color-turquoise)] animate-bounce shadow-[0_0_12px_var(--color-turquoise)]" />
                )}
              </div>
            </div>

            {/* Dark overlay outside scan area */}
            <div className="absolute inset-0 bg-black/40 pointer-events-none" />

            {/* Camera controls */}
            <div className="absolute bottom-28 left-0 right-0 flex justify-center gap-4 z-10">
              <button
                onClick={toggleTorch}
                className="p-3 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-all"
                title="Toggle Torch"
              >
                {torch ? <FlashlightOff className="w-5 h-5 text-amber-300" /> : <Flashlight className="w-5 h-5" />}
              </button>
              <button
                onClick={() => {
                  stopCamera();
                  setMode("search");
                }}
                className="px-4 py-3 rounded-full bg-amber-500/90 backdrop-blur-sm text-white hover:bg-amber-500 transition-all flex items-center gap-2 font-semibold text-xs shadow-lg"
                title="Find by Name"
              >
                <Users className="w-4 h-4" />
                Find by Name
              </button>
              <button
                onClick={() => setShowManual(true)}
                className="p-3 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-all"
                title="Manual Lookup"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
          </>
        ) : (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-white text-lg font-bold">Manual Registration Lookup</h2>
              <button
                onClick={() => {
                  setShowManual(false);
                  startCamera();
                }}
                className="text-white/70 hover:text-white text-xs flex items-center gap-1 bg-white/10 px-2.5 py-1.5 rounded-lg"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Back to Camera
              </button>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter Registration ID or Phone Number"
                value={manualSearch}
                onChange={(e) => setManualSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleManualCheckIn();
                }}
                className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 outline-none focus:border-[var(--color-turquoise)] text-sm"
                autoFocus
              />
              <button
                onClick={handleManualCheckIn}
                disabled={isProcessing || !manualSearch.trim()}
                className="px-5 py-3 rounded-xl bg-[var(--color-turquoise)] text-white font-semibold text-sm disabled:opacity-50"
              >
                {isProcessing ? "..." : "Check In"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Result Display */}
      {scanResult && (
        <div
          className={`absolute bottom-0 left-0 right-0 z-30 transition-all duration-300 ${
            scanResult.success
              ? "bg-emerald-600"
              : scanResult.status === "already_checked_in"
              ? "bg-amber-600"
              : "bg-red-600"
          }`}
        >
          <div className="px-6 py-5 text-white">
            <div className="flex items-start gap-3">
              {scanResult.success ? (
                <CheckCircle className="w-8 h-8 shrink-0 mt-0.5" />
              ) : scanResult.status === "already_checked_in" ? (
                <AlertTriangle className="w-8 h-8 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-8 h-8 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-lg font-bold truncate">
                  {scanResult.registration?.name || scanResult.message}
                </p>
                {scanResult.registration && (
                  <div className="mt-1 space-y-0.5 text-white/80 text-sm">
                    <p className="font-mono text-xs">{scanResult.registration.registration_id}</p>
                    <p>{scanResult.registration.typeName}</p>
                  </div>
                )}
                <p className="mt-2 text-white/90 text-sm font-medium">
                  {scanResult.message}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Processing Overlay */}
      {isProcessing && !scanResult && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60">
          <div className="w-16 h-16 rounded-full border-4 border-white/30 border-t-white animate-spin" />
        </div>
      )}
    </div>
  );
}
