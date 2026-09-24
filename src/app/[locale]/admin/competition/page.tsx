"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  fetchCompetitionEntries,
  syncCompetitionEntries,
  toggleCompetitionPresence,
  drawPerformanceOrder,
  updateStageStatus,
} from "@/app/[locale]/admin/event-day-actions";
import {
  Users,
  RefreshCw,
  Shuffle,
  CheckCircle,
  XCircle,
  Play,
  Pause,
  SkipForward,
  Trophy,
  UserCheck,
  UserX,
  Monitor,
  Eye,
  EyeOff,
} from "lucide-react";

interface CompetitionEntry {
  id: string;
  registration_id: string;
  team_name: string;
  performance_order: number | null;
  is_present: boolean;
  marked_present_at: string | null;
  stage_status: string;
  total_score: number | null;
  judge_scores: any[];
  dynamic_registrations: {
    name: string;
    phone: string;
    place: string;
    registration_id: string;
    form_data: any;
    checked_in: boolean;
  };
}

const stageStatusConfig: Record<string, { label: string; color: string; bg: string }> = {
  waiting: { label: "Waiting", color: "text-gray-600 dark:text-gray-400", bg: "bg-gray-100 dark:bg-gray-500/10" },
  on_stage: { label: "On Stage", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-500/10" },
  performed: { label: "Performed", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-500/10" },
  disqualified: { label: "Disqualified", color: "text-red-600 dark:text-red-400", bg: "bg-red-100 dark:bg-red-500/10" },
};

export default function CompetitionPage() {
  const [entries, setEntries] = useState<CompetitionEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showScores, setShowScores] = useState(false);
  const [stageView, setStageView] = useState(false);

  const loadEntries = useCallback(async () => {
    try {
      const data = await fetchCompetitionEntries();
      setEntries(data);
    } catch (err) {
      console.error("Failed to load entries:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEntries();
    const interval = setInterval(loadEntries, 15000);
    return () => clearInterval(interval);
  }, [loadEntries]);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const result = await syncCompetitionEntries();
      alert(`Synced ${result.synced} new entries.`);
      loadEntries();
    } catch {
      alert("Failed to sync.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDrawLot = async () => {
    if (!confirm("Draw performance order for all present teams? This will randomize the order.")) return;
    setIsDrawing(true);
    try {
      const result = await drawPerformanceOrder();
      alert(`Performance order drawn for ${result.totalTeams} teams!`);
      loadEntries();
    } catch {
      alert("Failed to draw.");
    } finally {
      setIsDrawing(false);
    }
  };

  const handleTogglePresence = async (entryId: string, isPresent: boolean) => {
    try {
      await toggleCompetitionPresence(entryId, !isPresent);
      setEntries((prev) =>
        prev.map((e) =>
          e.id === entryId
            ? { ...e, is_present: !isPresent, marked_present_at: !isPresent ? new Date().toISOString() : null }
            : e
        )
      );
    } catch {
      alert("Failed to update.");
    }
  };

  const handleStageStatus = async (entryId: string, status: string) => {
    try {
      await updateStageStatus(entryId, status);
      setEntries((prev) =>
        prev.map((e) => (e.id === entryId ? { ...e, stage_status: status } : e))
      );
    } catch {
      alert("Failed to update.");
    }
  };

  const presentCount = entries.filter((e) => e.is_present).length;
  const performedCount = entries.filter((e) => e.stage_status === "performed").length;
  const currentPerformer = entries.find((e) => e.stage_status === "on_stage");
  const nextUp = entries
    .filter((e) => e.is_present && e.stage_status === "waiting" && e.performance_order)
    .sort((a, b) => (a.performance_order || 999) - (b.performance_order || 999))[0];

  if (isLoading) {
    return (
      <div className="p-8 text-center text-[var(--admin-text-secondary)]">
        <div className="w-8 h-8 mx-auto mb-4 border-2 border-[var(--admin-border)] border-t-[var(--color-turquoise)] rounded-full animate-spin" />
        Loading competition data...
      </div>
    );
  }

  // Stage View — Full screen display for projector
  if (stageView) {
    return (
      <div className="fixed inset-0 z-50 bg-gradient-to-b from-[#0B1D3A] to-[#102A52] flex flex-col items-center justify-center text-white">
        <button
          onClick={() => setStageView(false)}
          className="absolute top-4 right-4 px-3 py-1.5 bg-white/10 rounded-lg text-xs hover:bg-white/20"
        >
          Exit Stage View
        </button>

        <div className="text-center mb-12">
          <p className="text-[var(--color-brass)] text-sm uppercase tracking-[0.3em] mb-2">
            Grand Jeelani Conference 2026
          </p>
          <h1 className="text-3xl font-bold" style={{ fontFamily: "var(--font-bodoni-moda)" }}>
            Burda & Qawwali Competition
          </h1>
        </div>

        {currentPerformer ? (
          <div className="text-center animate-pulse">
            <p className="text-[var(--color-brass)] text-sm uppercase tracking-widest mb-4">
              Now Performing
            </p>
            <h2 className="text-6xl font-bold mb-4">
              {currentPerformer.team_name || currentPerformer.dynamic_registrations?.name}
            </h2>
            <p className="text-xl text-white/60">
              #{currentPerformer.performance_order} • {currentPerformer.dynamic_registrations?.place}
            </p>
          </div>
        ) : (
          <div className="text-center text-white/40 text-2xl">
            Waiting for next performance...
          </div>
        )}

        {nextUp && !currentPerformer && (
          <div className="mt-16 text-center">
            <p className="text-white/40 text-sm uppercase tracking-widest mb-2">Up Next</p>
            <p className="text-2xl font-semibold text-white/70">
              #{nextUp.performance_order} — {nextUp.team_name || nextUp.dynamic_registrations?.name}
            </p>
          </div>
        )}

        <div className="absolute bottom-8 text-center">
          <p className="text-white/30 text-xs">
            {performedCount}/{presentCount} performances completed
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--admin-text)]">
            🎤 Competition Manager
          </h2>
          <p className="text-[var(--admin-text-secondary)] text-sm mt-1">
            Burda & Qawwali — Team attendance, draw lots, and performance tracking
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setStageView(true)}
            className="px-3 py-2 bg-[var(--color-navy)] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 hover:opacity-90 shadow-sm"
          >
            <Monitor className="w-3.5 h-3.5" /> Stage View
          </button>
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="px-3 py-2 border border-[var(--admin-border)] rounded-xl text-xs font-medium bg-[var(--admin-surface)] hover:bg-[var(--admin-hover)] text-[var(--admin-text-secondary)] shadow-sm flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
            {isSyncing ? "Syncing..." : "Sync Teams"}
          </button>
          <button
            onClick={handleDrawLot}
            disabled={isDrawing || presentCount === 0}
            className="px-3 py-2 border border-amber-500/30 bg-amber-500/5 rounded-xl text-xs font-semibold text-amber-700 dark:text-amber-400 hover:bg-amber-500/10 shadow-sm flex items-center gap-1.5 disabled:opacity-50"
          >
            <Shuffle className="w-3.5 h-3.5" />
            {isDrawing ? "Drawing..." : "Draw Lots"}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[var(--admin-surface)] rounded-2xl border border-[var(--admin-border)] p-4 shadow-sm">
          <div className="text-xs font-medium text-[var(--admin-text-secondary)] mb-1">Total Teams</div>
          <div className="text-2xl font-bold text-[var(--admin-text)]">{entries.length}</div>
        </div>
        <div className="bg-emerald-500/5 rounded-2xl border border-emerald-500/20 p-4 shadow-sm">
          <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-1 flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5" /> Present
          </div>
          <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{presentCount}</div>
        </div>
        <div className="bg-amber-500/5 rounded-2xl border border-amber-500/20 p-4 shadow-sm">
          <div className="text-xs font-medium text-amber-600 dark:text-amber-400 mb-1 flex items-center gap-1">
            <UserX className="w-3.5 h-3.5" /> Absent
          </div>
          <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">{entries.length - presentCount}</div>
        </div>
        <div className="bg-purple-500/5 rounded-2xl border border-purple-500/20 p-4 shadow-sm">
          <div className="text-xs font-medium text-purple-600 dark:text-purple-400 mb-1 flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5" /> Performed
          </div>
          <div className="text-2xl font-bold text-purple-700 dark:text-purple-400">{performedCount}</div>
        </div>
      </div>

      {/* Current Performer Banner */}
      {currentPerformer && (
        <div className="bg-gradient-to-r from-amber-500/10 to-amber-500/5 border border-amber-500/20 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                Now on Stage
              </span>
            </div>
            <h3 className="text-xl font-bold text-[var(--admin-text)]">
              #{currentPerformer.performance_order} — {currentPerformer.team_name || currentPerformer.dynamic_registrations?.name}
            </h3>
            <p className="text-sm text-[var(--admin-text-secondary)]">
              {currentPerformer.dynamic_registrations?.place}
            </p>
          </div>
          <button
            onClick={() => handleStageStatus(currentPerformer.id, "performed")}
            className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-emerald-700"
          >
            <SkipForward className="w-4 h-4" /> Mark Done
          </button>
        </div>
      )}

      {/* Score Toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowScores(!showScores)}
          className="text-xs text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] flex items-center gap-1.5 transition-colors"
        >
          {showScores ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          {showScores ? "Hide Scores" : "Show Scores"}
        </button>
      </div>

      {/* Teams Table */}
      <div className="bg-[var(--admin-surface)] rounded-2xl border border-[var(--admin-border)] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-[var(--admin-text-secondary)] uppercase bg-[var(--admin-surface-alt)] border-b border-[var(--admin-border)]">
              <tr>
                <th className="px-4 py-3.5 font-semibold w-16">#</th>
                <th className="px-4 py-3.5 font-semibold">Team / Name</th>
                <th className="px-4 py-3.5 font-semibold">Place</th>
                <th className="px-4 py-3.5 font-semibold">Present</th>
                <th className="px-4 py-3.5 font-semibold">Stage</th>
                {showScores && <th className="px-4 py-3.5 font-semibold">Score</th>}
                <th className="px-4 py-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--admin-border-subtle)]">
              {entries.map((entry) => {
                const cfg = stageStatusConfig[entry.stage_status] || stageStatusConfig.waiting;
                return (
                  <tr
                    key={entry.id}
                    className={`transition-colors ${
                      entry.stage_status === "on_stage"
                        ? "bg-amber-500/5"
                        : "hover:bg-[var(--admin-hover)]"
                    }`}
                  >
                    <td className="px-4 py-3 text-center">
                      <span className="text-sm font-bold text-[var(--admin-text)]">
                        {entry.performance_order || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-[var(--admin-text)]">
                        {entry.team_name || entry.dynamic_registrations?.name}
                      </div>
                      <div className="text-[10px] font-mono text-[var(--admin-text-muted)]">
                        {entry.dynamic_registrations?.registration_id}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--admin-text-secondary)]">
                      {entry.dynamic_registrations?.place || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleTogglePresence(entry.id, entry.is_present)}
                        className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors ${
                          entry.is_present
                            ? "text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/10"
                            : "text-[var(--admin-text-muted)] bg-[var(--admin-surface-alt)] hover:bg-red-50 dark:hover:bg-red-500/10"
                        }`}
                      >
                        {entry.is_present ? (
                          <><CheckCircle className="w-3.5 h-3.5" /> Present</>
                        ) : (
                          <><XCircle className="w-3.5 h-3.5" /> Absent</>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${cfg.bg} ${cfg.color}`}>
                        {cfg.label}
                      </span>
                    </td>
                    {showScores && (
                      <td className="px-4 py-3 text-sm font-bold text-[var(--admin-text)]">
                        {entry.total_score != null ? entry.total_score.toFixed(1) : "—"}
                      </td>
                    )}
                    <td className="px-4 py-3 text-right">
                      {entry.is_present && entry.stage_status === "waiting" && (
                        <button
                          onClick={() => handleStageStatus(entry.id, "on_stage")}
                          className="px-2.5 py-1 text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/10 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-500/20 transition-colors flex items-center gap-1 ml-auto"
                        >
                          <Play className="w-3 h-3" /> Start
                        </button>
                      )}
                      {entry.stage_status === "on_stage" && (
                        <button
                          onClick={() => handleStageStatus(entry.id, "performed")}
                          className="px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/10 rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-500/20 transition-colors flex items-center gap-1 ml-auto"
                        >
                          <SkipForward className="w-3 h-3" /> Done
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {entries.length === 0 && (
                <tr>
                  <td colSpan={showScores ? 7 : 6} className="px-6 py-12 text-center text-[var(--admin-text-muted)]">
                    No competition entries yet. Click &ldquo;Sync Teams&rdquo; to populate from selected registrations.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
