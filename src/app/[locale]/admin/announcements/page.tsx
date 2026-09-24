"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  fetchAllAnnouncements,
  createAnnouncement,
  toggleAnnouncement,
  deleteAnnouncement,
} from "@/app/[locale]/admin/event-day-actions";
import {
  Megaphone,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  AlertTriangle,
  Info,
  AlertCircle,
  CalendarClock,
  X,
} from "lucide-react";

const typeConfig: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  info: { icon: <Info className="w-4 h-4" />, label: "Info", color: "text-blue-600 bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400" },
  warning: { icon: <AlertTriangle className="w-4 h-4" />, label: "Warning", color: "text-amber-600 bg-amber-100 dark:bg-amber-500/10 dark:text-amber-400" },
  emergency: { icon: <AlertCircle className="w-4 h-4" />, label: "Emergency", color: "text-red-600 bg-red-100 dark:bg-red-500/10 dark:text-red-400" },
  schedule_change: { icon: <CalendarClock className="w-4 h-4" />, label: "Schedule", color: "text-purple-600 bg-purple-100 dark:bg-purple-500/10 dark:text-purple-400" },
};

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    title: "",
    body: "",
    type: "info",
    target_audience: "all",
    priority: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadAnnouncements = useCallback(async () => {
    try {
      const data = await fetchAllAnnouncements();
      setAnnouncements(data);
    } catch (err) {
      console.error("Failed to load:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnnouncements();
  }, [loadAnnouncements]);

  const handleCreate = async () => {
    if (!form.title.trim()) return;
    setIsSubmitting(true);
    try {
      await createAnnouncement(form);
      setForm({ title: "", body: "", type: "info", target_audience: "all", priority: 0 });
      setShowCreate(false);
      loadAnnouncements();
    } catch {
      alert("Failed to create.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      await toggleAnnouncement(id, !isActive);
      setAnnouncements((prev) =>
        prev.map((a) => (a.id === id ? { ...a, is_active: !isActive } : a))
      );
    } catch {
      alert("Failed to toggle.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this announcement?")) return;
    try {
      await deleteAnnouncement(id);
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    } catch {
      alert("Failed to delete.");
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-[var(--admin-text-secondary)]">
        Loading announcements...
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--admin-text)]">📢 Announcements</h2>
          <p className="text-[var(--admin-text-secondary)] text-sm mt-1">
            Broadcast messages to attendees and staff
          </p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="px-4 py-2 bg-[var(--color-turquoise)] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 hover:opacity-90 shadow-sm"
        >
          {showCreate ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          {showCreate ? "Cancel" : "New Announcement"}
        </button>
      </div>

      {/* Create Form */}
      {showCreate && (
        <div className="bg-[var(--admin-surface)] rounded-2xl border border-[var(--admin-border)] shadow-sm p-5 space-y-4">
          <input
            type="text"
            placeholder="Announcement title..."
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="w-full px-4 py-2.5 border border-[var(--admin-input-border)] rounded-xl text-sm bg-[var(--admin-input-bg)] text-[var(--admin-text)] outline-none focus:border-[var(--color-turquoise)] placeholder:text-[var(--admin-text-muted)]"
          />
          <textarea
            placeholder="Additional details (optional)..."
            value={form.body}
            onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
            rows={3}
            className="w-full px-4 py-2.5 border border-[var(--admin-input-border)] rounded-xl text-sm bg-[var(--admin-input-bg)] text-[var(--admin-text)] outline-none focus:border-[var(--color-turquoise)] placeholder:text-[var(--admin-text-muted)] resize-none"
          />
          <div className="flex flex-wrap gap-3">
            <select
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
              className="px-3 py-2 border border-[var(--admin-input-border)] rounded-xl text-xs bg-[var(--admin-input-bg)] text-[var(--admin-text)] outline-none"
            >
              <option value="info">ℹ️ Info</option>
              <option value="warning">⚠️ Warning</option>
              <option value="emergency">🚨 Emergency</option>
              <option value="schedule_change">📅 Schedule Change</option>
            </select>
            <select
              value={form.target_audience}
              onChange={(e) => setForm((f) => ({ ...f, target_audience: e.target.value }))}
              className="px-3 py-2 border border-[var(--admin-input-border)] rounded-xl text-xs bg-[var(--admin-input-bg)] text-[var(--admin-text)] outline-none"
            >
              <option value="all">All Attendees</option>
              <option value="burda">Burda & Qawwali</option>
              <option value="astro">Astro & AI Fiqh</option>
              <option value="dars">Dars Management</option>
              <option value="staff">Staff Only</option>
            </select>
            <select
              value={form.priority}
              onChange={(e) => setForm((f) => ({ ...f, priority: Number(e.target.value) }))}
              className="px-3 py-2 border border-[var(--admin-input-border)] rounded-xl text-xs bg-[var(--admin-input-bg)] text-[var(--admin-text)] outline-none"
            >
              <option value={0}>Normal Priority</option>
              <option value={1}>High Priority</option>
              <option value={2}>Urgent</option>
            </select>
          </div>
          <button
            onClick={handleCreate}
            disabled={isSubmitting || !form.title.trim()}
            className="px-5 py-2.5 bg-[var(--color-navy)] text-white rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
          >
            <Megaphone className="w-4 h-4" />
            {isSubmitting ? "Publishing..." : "Publish Announcement"}
          </button>
        </div>
      )}

      {/* List */}
      <div className="space-y-3">
        {announcements.map((a) => {
          const cfg = typeConfig[a.type] || typeConfig.info;
          return (
            <div
              key={a.id}
              className={`bg-[var(--admin-surface)] rounded-2xl border shadow-sm p-4 transition-opacity ${
                a.is_active
                  ? "border-[var(--admin-border)]"
                  : "border-[var(--admin-border)] opacity-50"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className={`mt-0.5 p-2 rounded-lg ${cfg.color}`}>
                    {cfg.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm text-[var(--admin-text)]">{a.title}</h3>
                    {a.body && (
                      <p className="text-xs text-[var(--admin-text-secondary)] mt-1">{a.body}</p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-[var(--admin-surface-alt)] text-[var(--admin-text-muted)] border border-[var(--admin-border)]">
                        {a.target_audience === "all" ? "All" : a.target_audience}
                      </span>
                      {a.priority > 0 && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400">
                          {a.priority === 2 ? "URGENT" : "HIGH"}
                        </span>
                      )}
                      <span className="text-[10px] text-[var(--admin-text-muted)]">
                        {new Date(a.created_at).toLocaleString("en-IN", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleToggle(a.id, a.is_active)}
                    className={`p-2 rounded-lg transition-colors ${
                      a.is_active
                        ? "text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10"
                        : "text-[var(--admin-text-muted)] hover:bg-[var(--admin-hover)]"
                    }`}
                    title={a.is_active ? "Hide" : "Show"}
                  >
                    {a.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleDelete(a.id)}
                    className="p-2 rounded-lg text-[var(--admin-text-muted)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {announcements.length === 0 && (
          <div className="bg-[var(--admin-surface)] rounded-2xl border border-[var(--admin-border)] p-12 text-center text-[var(--admin-text-muted)]">
            No announcements yet. Create one to broadcast to attendees.
          </div>
        )}
      </div>
    </div>
  );
}
