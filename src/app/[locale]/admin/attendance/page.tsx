"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  fetchAttendanceStats,
  fetchAbsentList,
  generateQRTokensForAll,
  undoCheckIn,
} from "@/app/[locale]/admin/event-day-actions";
import {
  Users,
  UserCheck,
  UserX,
  RefreshCw,
  Download,
  ScanLine,
  QrCode,
  Clock,
  MapPin,
  ChevronDown,
  ChevronUp,
  Undo2,
  Zap,
} from "lucide-react";
import Link from "next/link";

interface AttendanceLog {
  id: string;
  name: string;
  registration_id: string;
  program: string;
  gate: string;
  check_in_time: string;
  method: string;
  checked_in_by: string;
}

interface AttendanceData {
  totalRegistered: number;
  totalCheckedIn: number;
  sessionCounts: Record<string, number>;
  sessionRegisteredCounts: Record<string, number>;
  gateCounts: Record<string, number>;
  recentLogs: AttendanceLog[];
  registrationSessions: { slug: string; title: string }[];
}

export default function AttendancePage() {
  const [data, setData] = useState<AttendanceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAbsent, setShowAbsent] = useState(false);
  const [absentList, setAbsentList] = useState<any[]>([]);
  const [absentLoading, setAbsentLoading] = useState(false);
  const [generatingTokens, setGeneratingTokens] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>("recent");

  const loadData = useCallback(async () => {
    try {
      const stats = await fetchAttendanceStats();
      setData(stats);
    } catch (err) {
      console.error("Failed to load attendance:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    // Auto-refresh every 10 seconds
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, [loadData]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadData();
  };

  const handleGenerateTokens = async () => {
    setGeneratingTokens(true);
    try {
      const result = await generateQRTokensForAll();
      alert(`Generated ${result.generated} QR tokens.`);
    } catch (err) {
      alert("Failed to generate tokens.");
    } finally {
      setGeneratingTokens(false);
    }
  };

  const handleShowAbsent = async () => {
    if (showAbsent) {
      setShowAbsent(false);
      return;
    }
    setAbsentLoading(true);
    try {
      const list = await fetchAbsentList();
      setAbsentList(list);
      setShowAbsent(true);
    } catch {
      alert("Failed to load absent list.");
    } finally {
      setAbsentLoading(false);
    }
  };

  const handleUndoCheckIn = async (logId: string) => {
    if (!confirm("Undo this check-in?")) return;
    try {
      await undoCheckIn(logId);
      loadData();
    } catch {
      alert("Failed to undo.");
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-[var(--admin-text-secondary)]">
        <div className="w-8 h-8 mx-auto mb-4 border-2 border-[var(--admin-border)] border-t-[var(--color-turquoise)] rounded-full animate-spin" />
        Loading attendance data...
      </div>
    );
  }

  if (!data) return null;

  const checkedInPercent =
    data.totalRegistered > 0
      ? Math.round((data.totalCheckedIn / data.totalRegistered) * 100)
      : 0;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-2xl font-bold text-[var(--admin-text)]">
              Live Attendance
            </h2>
          </div>
          <p className="text-[var(--admin-text-secondary)] text-sm mt-1">
            Real-time check-in tracking • Auto-refreshes every 10s
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link
            href="/admin/scanner"
            className="px-4 py-2 bg-[var(--color-turquoise)] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 hover:opacity-90 transition-opacity shadow-sm"
          >
            <ScanLine className="w-3.5 h-3.5" /> Open Scanner
          </Link>
          <button
            onClick={handleGenerateTokens}
            disabled={generatingTokens}
            className="px-3 py-2 border border-[var(--admin-border)] rounded-xl text-xs font-medium bg-[var(--admin-surface)] hover:bg-[var(--admin-hover)] text-[var(--admin-text-secondary)] shadow-sm flex items-center gap-1.5"
          >
            <QrCode className="w-3.5 h-3.5" />
            {generatingTokens ? "Generating..." : "Gen QR Tokens"}
          </button>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-3 py-2 border border-[var(--admin-border)] rounded-xl text-xs font-medium bg-[var(--admin-surface)] hover:bg-[var(--admin-hover)] text-[var(--admin-text-secondary)] shadow-sm flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Registered */}
        <div className="bg-[var(--admin-surface)] rounded-2xl border border-[var(--admin-border)] p-4 shadow-sm">
          <div className="flex items-center gap-2 text-[var(--admin-text-secondary)] mb-2">
            <Users className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Registered</span>
          </div>
          <div className="text-3xl font-bold text-[var(--admin-text)]">
            {data.totalRegistered}
          </div>
          <div className="text-[10px] text-[var(--admin-text-muted)] mt-1">Confirmed + Selected</div>
        </div>

        {/* Checked In */}
        <div className="bg-emerald-500/5 rounded-2xl border border-emerald-500/20 p-4 shadow-sm">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-2">
            <UserCheck className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Checked In</span>
          </div>
          <div className="text-3xl font-bold text-emerald-700 dark:text-emerald-400">
            {data.totalCheckedIn}
          </div>
          <div className="text-[10px] text-emerald-600/60 mt-1">{checkedInPercent}% attendance</div>
        </div>

        {/* Absent */}
        <div
          className="bg-amber-500/5 rounded-2xl border border-amber-500/20 p-4 shadow-sm cursor-pointer hover:bg-amber-500/10 transition-colors"
          onClick={handleShowAbsent}
        >
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-2">
            <UserX className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Not Yet In</span>
          </div>
          <div className="text-3xl font-bold text-amber-700 dark:text-amber-400">
            {data.totalRegistered - data.totalCheckedIn}
          </div>
          <div className="text-[10px] text-amber-600/60 mt-1">
            {absentLoading ? "Loading..." : "Click to view list"}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-[var(--admin-surface)] rounded-2xl border border-[var(--admin-border)] p-4 shadow-sm flex flex-col justify-center">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[var(--admin-text-secondary)]">Progress</span>
            <span className="text-lg font-bold text-[var(--admin-text)]">{checkedInPercent}%</span>
          </div>
          <div className="w-full h-3 bg-[var(--admin-border)] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[var(--color-turquoise)] to-emerald-500 transition-all duration-1000"
              style={{ width: `${checkedInPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Per-Session Breakdown */}
      <div className="bg-[var(--admin-surface)] rounded-2xl border border-[var(--admin-border)] shadow-sm p-5">
        <h3 className="text-sm font-bold text-[var(--admin-text)] mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-[var(--color-turquoise)]" />
          Attendance by Program
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {data.registrationSessions.map((rs) => {
            const checkedIn = data.sessionCounts[rs.slug] || 0;
            const registered = data.sessionRegisteredCounts[rs.slug] || 0;
            const pct = registered > 0 ? Math.round((checkedIn / registered) * 100) : 0;
            return (
              <div
                key={rs.slug}
                className="bg-[var(--admin-surface-alt)] rounded-xl p-3.5 border border-[var(--admin-border-subtle)]"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-[var(--admin-text)] truncate">
                    {rs.title}
                  </span>
                  <span className="text-xs font-bold text-[var(--admin-text-secondary)]">
                    {pct}%
                  </span>
                </div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-xl font-bold text-[var(--admin-text)]">{checkedIn}</span>
                  <span className="text-xs text-[var(--admin-text-muted)]">/ {registered}</span>
                </div>
                <div className="w-full h-1.5 bg-[var(--admin-border)] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[var(--color-turquoise)] transition-all duration-700"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Gate Breakdown */}
      {Object.keys(data.gateCounts).length > 0 && (
        <div className="bg-[var(--admin-surface)] rounded-2xl border border-[var(--admin-border)] shadow-sm p-5">
          <h3 className="text-sm font-bold text-[var(--admin-text)] mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[var(--color-turquoise)]" />
            Scans by Gate
          </h3>
          <div className="flex flex-wrap gap-3">
            {Object.entries(data.gateCounts).map(([gate, count]) => (
              <div
                key={gate}
                className="px-4 py-3 bg-[var(--admin-surface-alt)] rounded-xl border border-[var(--admin-border-subtle)]"
              >
                <div className="text-xs font-semibold text-[var(--admin-text-secondary)] uppercase mb-1">
                  {gate}
                </div>
                <div className="text-xl font-bold text-[var(--admin-text)]">{count}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Check-ins */}
      <div className="bg-[var(--admin-surface)] rounded-2xl border border-[var(--admin-border)] shadow-sm overflow-hidden">
        <button
          onClick={() => setExpandedSection(expandedSection === "recent" ? null : "recent")}
          className="w-full px-5 py-4 flex items-center justify-between hover:bg-[var(--admin-hover)] transition-colors"
        >
          <h3 className="text-sm font-bold text-[var(--admin-text)] flex items-center gap-2">
            <Clock className="w-4 h-4 text-[var(--color-turquoise)]" />
            Recent Check-ins ({data.recentLogs.length})
          </h3>
          {expandedSection === "recent" ? (
            <ChevronUp className="w-4 h-4 text-[var(--admin-text-muted)]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[var(--admin-text-muted)]" />
          )}
        </button>

        {expandedSection === "recent" && (
          <div className="border-t border-[var(--admin-border)]">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-[var(--admin-text-secondary)] uppercase bg-[var(--admin-surface-alt)]">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Time</th>
                    <th className="px-4 py-3 text-left font-semibold">Name</th>
                    <th className="px-4 py-3 text-left font-semibold">Program</th>
                    <th className="px-4 py-3 text-left font-semibold">Gate</th>
                    <th className="px-4 py-3 text-left font-semibold">By</th>
                    <th className="px-4 py-3 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--admin-border-subtle)]">
                  {data.recentLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-[var(--admin-hover)] transition-colors">
                      <td className="px-4 py-3 text-xs font-mono text-[var(--admin-text-secondary)] whitespace-nowrap">
                        {new Date(log.check_in_time).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-[var(--admin-text)]">{log.name}</div>
                        <div className="text-[10px] font-mono text-[var(--admin-text-muted)]">
                          {log.registration_id}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-[var(--admin-text-secondary)]">
                        {log.program}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[var(--admin-badge-bg)] text-[var(--admin-text-secondary)] border border-[var(--admin-border)]">
                          {log.gate}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-[var(--admin-text-muted)]">
                        {log.checked_in_by}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleUndoCheckIn(log.id)}
                          className="p-1.5 text-[var(--admin-text-muted)] hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                          title="Undo check-in"
                        >
                          <Undo2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {data.recentLogs.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-[var(--admin-text-muted)]">
                        No check-ins yet. Open the scanner to start!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Absent List */}
      {showAbsent && (
        <div className="bg-[var(--admin-surface)] rounded-2xl border border-amber-500/20 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--admin-border)] flex items-center justify-between">
            <h3 className="text-sm font-bold text-amber-700 dark:text-amber-400 flex items-center gap-2">
              <UserX className="w-4 h-4" />
              Not Checked In ({absentList.length})
            </h3>
            <button
              onClick={() => setShowAbsent(false)}
              className="text-xs text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]"
            >
              Close
            </button>
          </div>
          <div className="divide-y divide-[var(--admin-border-subtle)] max-h-96 overflow-y-auto">
            {absentList.map((r: any) => (
              <div
                key={r.id}
                className="px-5 py-3 flex items-center justify-between hover:bg-[var(--admin-hover)] transition-colors"
              >
                <div>
                  <div className="font-semibold text-sm text-[var(--admin-text)]">{r.name}</div>
                  <div className="text-xs text-[var(--admin-text-muted)]">
                    {r.registration_id} • {r.typeName} • {r.place}
                  </div>
                </div>
                <a
                  href={`tel:${r.phone}`}
                  className="text-xs text-[var(--color-turquoise)] hover:underline font-mono"
                >
                  {r.phone}
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
