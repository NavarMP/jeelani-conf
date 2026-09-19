"use client";

import React, { useState, useMemo } from "react";
import {
  Star,
  Search,
  Filter,
  Eye,
  EyeOff,
  Sparkles,
  SparklesIcon,
  Trash2,
  X,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Minus,
  Download,
  StickyNote,
  LayoutGrid,
  LayoutList,
  ChevronDown,
  Check,
} from "lucide-react";
import { type Feedback } from "@/lib/data";
import {
  toggleFeedbackRead,
  toggleFeedbackFeatured,
  updateFeedbackNotes,
  deleteFeedback,
} from "@/app/[locale]/admin/actions";

/* ── Types ────────────────────────────────────────────────────────────── */
interface FeedbackStats {
  total: number;
  avgRating: number;
  unreadCount: number;
  sentimentCounts: { positive: number; neutral: number; negative: number };
  categoryCounts: Record<string, number>;
}

interface FeedbackManagerProps {
  initialFeedback: Feedback[];
  stats: FeedbackStats;
}

/* ── Helpers ──────────────────────────────────────────────────────────── */
function timeAgo(dateString: string) {
  const diff = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateString).toLocaleDateString();
}

const SENTIMENT_CONFIG = {
  positive: { label: "Positive", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10", Icon: TrendingUp },
  neutral: { label: "Neutral", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10", Icon: Minus },
  negative: { label: "Negative", color: "text-red-600 dark:text-red-400", bg: "bg-red-500/10", Icon: TrendingDown },
};

const CATEGORY_COLORS: Record<string, string> = {
  general: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  sessions: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  speakers: "bg-teal-500/10 text-teal-600 dark:text-teal-400",
  venue: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  food: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  registration: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
  suggestion: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
};

function InlineStars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`${s <= rating ? "fill-[var(--color-brass)] text-[var(--color-brass)]" : "text-[var(--admin-border)] fill-transparent"}`}
          style={{ width: size, height: size }}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}

/* ── Detail Modal ─────────────────────────────────────────────────────── */
function FeedbackDetailModal({
  feedback,
  onClose,
  onAction,
}: {
  feedback: Feedback;
  onClose: () => void;
  onAction: () => void;
}) {
  const [notes, setNotes] = useState(feedback.admin_notes || "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleSaveNotes = async () => {
    setSaving(true);
    try {
      await updateFeedbackNotes(feedback.id, notes);
      onAction();
    } catch { /* ignore */ }
    setSaving(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteFeedback(feedback.id);
      onAction();
      onClose();
    } catch { /* ignore */ }
    setDeleting(false);
  };

  const handleToggleRead = async () => {
    try {
      await toggleFeedbackRead(feedback.id, !feedback.is_read);
      onAction();
    } catch { /* ignore */ }
  };

  const handleToggleFeatured = async () => {
    try {
      await toggleFeedbackFeatured(feedback.id, !feedback.is_featured);
      onAction();
    } catch { /* ignore */ }
  };

  const sentimentConf = SENTIMENT_CONFIG[feedback.sentiment as keyof typeof SENTIMENT_CONFIG] || SENTIMENT_CONFIG.neutral;
  const SentimentIcon = sentimentConf.Icon;
  const categoryRatings = feedback.category_ratings || {};
  const catRatingEntries = Object.entries(categoryRatings).filter(([, v]) => typeof v === "number" && v > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-xs" onClick={onClose} />
      <div className="relative bg-[var(--admin-surface)] rounded-2xl border border-[var(--admin-border)] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[var(--admin-surface)] border-b border-[var(--admin-border)] px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <InlineStars rating={feedback.overall_rating} size={18} />
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${sentimentConf.bg} ${sentimentConf.color}`}>
              <SentimentIcon className="w-3 h-3 inline mr-1" />
              {sentimentConf.label}
            </span>
            {feedback.is_featured && (
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-[var(--color-brass)]/10 text-[var(--color-brass)]">
                ★ Featured
              </span>
            )}
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[var(--admin-hover)] transition-colors text-[var(--admin-text-muted)]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* Submitter info */}
          <div className="flex items-center gap-4 text-sm">
            <div className="w-10 h-10 rounded-full bg-[var(--color-navy)] flex items-center justify-center text-white font-bold text-sm">
              {feedback.name ? feedback.name[0].toUpperCase() : "?"}
            </div>
            <div>
              <p className="font-semibold text-[var(--admin-text)]">
                {feedback.name || "Anonymous"}
              </p>
              <p className="text-[var(--admin-text-muted)] text-xs">
                {feedback.email || feedback.phone || "No contact info"} · {timeAgo(feedback.created_at)}
              </p>
            </div>
            <span className={`ml-auto px-2.5 py-1 rounded-full text-xs font-medium ${CATEGORY_COLORS[feedback.category] || CATEGORY_COLORS.general}`}>
              {feedback.category}
            </span>
          </div>

          {/* Feedback text */}
          <div className="bg-[var(--admin-surface-alt)] rounded-xl p-5 border border-[var(--admin-border-subtle)]">
            <p className="text-[var(--admin-text)] leading-relaxed whitespace-pre-wrap">
              {feedback.feedback_text}
            </p>
          </div>

          {/* Category ratings */}
          {catRatingEntries.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-[var(--admin-text)] mb-3">Category Ratings</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {catRatingEntries.map(([key, val]) => (
                  <div key={key} className="flex items-center justify-between bg-[var(--admin-surface-alt)] rounded-lg px-4 py-2.5 border border-[var(--admin-border-subtle)]">
                    <span className="text-sm text-[var(--admin-text-secondary)] capitalize">
                      {key.replace(/_/g, " ")}
                    </span>
                    <InlineStars rating={val as number} size={14} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Admin notes */}
          <div>
            <label className="text-sm font-semibold text-[var(--admin-text)] mb-2 flex items-center gap-2">
              <StickyNote className="w-4 h-4 text-[var(--color-turquoise)]" />
              Admin Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add internal notes about this feedback..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] text-[var(--admin-text)] placeholder-[var(--admin-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-turquoise)] resize-none text-sm"
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={handleSaveNotes}
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-[var(--color-turquoise)] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Notes"}
              </button>
            </div>
          </div>

          {/* Metadata */}
          <div className="text-xs text-[var(--admin-text-muted)] flex flex-wrap gap-4 border-t border-[var(--admin-border-subtle)] pt-4">
            <span>Source: {feedback.source}</span>
            <span>Created: {new Date(feedback.created_at).toLocaleString()}</span>
            {feedback.user_agent && (
              <span className="truncate max-w-xs" title={feedback.user_agent}>
                UA: {feedback.user_agent.substring(0, 50)}...
              </span>
            )}
          </div>
        </div>

        {/* Actions bar */}
        <div className="sticky bottom-0 bg-[var(--admin-surface)] border-t border-[var(--admin-border)] px-6 py-3 flex items-center justify-between rounded-b-2xl">
          <div className="flex gap-2">
            <button
              onClick={handleToggleRead}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium hover:bg-[var(--admin-hover)] transition-colors text-[var(--admin-text-secondary)]"
            >
              {feedback.is_read ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {feedback.is_read ? "Mark Unread" : "Mark Read"}
            </button>
            <button
              onClick={handleToggleFeatured}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium hover:bg-[var(--admin-hover)] transition-colors text-[var(--admin-text-secondary)]"
            >
              {feedback.is_featured ? <SparklesIcon className="w-4 h-4 text-[var(--color-brass)]" /> : <Sparkles className="w-4 h-4" />}
              {feedback.is_featured ? "Unfeature" : "Feature"}
            </button>
          </div>

          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-red-500">Delete permanently?</span>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Confirm"}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-3 py-1.5 rounded-lg border border-[var(--admin-border)] text-xs text-[var(--admin-text-secondary)] hover:bg-[var(--admin-hover)] transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-500/10 transition-colors text-red-500"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Main Manager Component ───────────────────────────────────────────── */
export default function FeedbackManager({
  initialFeedback,
  stats,
}: FeedbackManagerProps) {
  const [feedback, setFeedback] = useState<Feedback[]>(initialFeedback);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterRating, setFilterRating] = useState(0);
  const [filterSentiment, setFilterSentiment] = useState("all");
  const [filterReadStatus, setFilterReadStatus] = useState("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "highest" | "lowest">("newest");
  const [viewMode, setViewMode] = useState<"table" | "card">("table");
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Refetch after mutations
  const handleRefetch = async () => {
    try {
      const { fetchAllFeedbackAction } = await import("@/app/[locale]/admin/actions");
      const updated = await fetchAllFeedbackAction();
      setFeedback(updated);
    } catch { /* ignore */ }
  };

  // Filtered + sorted feedback
  const filteredFeedback = useMemo(() => {
    let items = [...feedback];

    // Search
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(
        (f) =>
          (f.name?.toLowerCase().includes(q)) ||
          f.feedback_text.toLowerCase().includes(q) ||
          (f.email?.toLowerCase().includes(q))
      );
    }

    // Category
    if (filterCategory !== "all") {
      items = items.filter((f) => f.category === filterCategory);
    }

    // Rating
    if (filterRating > 0) {
      items = items.filter((f) => f.overall_rating === filterRating);
    }

    // Sentiment
    if (filterSentiment !== "all") {
      items = items.filter((f) => f.sentiment === filterSentiment);
    }

    // Read status
    if (filterReadStatus === "read") items = items.filter((f) => f.is_read);
    if (filterReadStatus === "unread") items = items.filter((f) => !f.is_read);

    // Sort
    switch (sortBy) {
      case "newest":
        items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case "oldest":
        items.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case "highest":
        items.sort((a, b) => b.overall_rating - a.overall_rating);
        break;
      case "lowest":
        items.sort((a, b) => a.overall_rating - b.overall_rating);
        break;
    }

    return items;
  }, [feedback, search, filterCategory, filterRating, filterSentiment, filterReadStatus, sortBy]);

  // Bulk actions
  const handleBulkMarkRead = async () => {
    for (const id of selectedIds) {
      try { await toggleFeedbackRead(id, true); } catch { /* ignore */ }
    }
    setSelectedIds(new Set());
    handleRefetch();
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedIds.size} feedback entries permanently?`)) return;
    for (const id of selectedIds) {
      try { await deleteFeedback(id); } catch { /* ignore */ }
    }
    setSelectedIds(new Set());
    handleRefetch();
  };

  // CSV export
  const handleExportCSV = () => {
    const headers = ["Name", "Email", "Phone", "Rating", "Category", "Sentiment", "Feedback", "Date"];
    const rows = filteredFeedback.map((f) => [
      f.name || "Anonymous",
      f.email || "",
      f.phone || "",
      f.overall_rating.toString(),
      f.category,
      f.sentiment,
      `"${f.feedback_text.replace(/"/g, '""')}"`,
      new Date(f.created_at).toISOString(),
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `feedback_export_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredFeedback.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredFeedback.map((f) => f.id)));
    }
  };

  return (
    <div className="space-y-6">
      {/* ──────── Stats Bar ──────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[var(--admin-surface)] p-5 rounded-xl border border-[var(--admin-border)] shadow-sm">
          <h3 className="text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Total Feedback</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[var(--admin-text)]">{stats.total}</span>
          </div>
        </div>

        <div className="bg-[var(--admin-surface)] p-5 rounded-xl border border-[var(--admin-border)] shadow-sm">
          <h3 className="text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Avg Rating</h3>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold text-[var(--admin-text)]">{stats.avgRating}</span>
            <InlineStars rating={Math.round(stats.avgRating)} size={14} />
          </div>
        </div>

        <div className="bg-[var(--admin-surface)] p-5 rounded-xl border border-[var(--admin-border)] shadow-sm">
          <h3 className="text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Unread</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[var(--admin-text)]">{stats.unreadCount}</span>
            {stats.unreadCount > 0 && (
              <span className="text-xs text-amber-500 font-medium">Needs attention</span>
            )}
          </div>
        </div>

        <div className="bg-[var(--admin-surface)] p-5 rounded-xl border border-[var(--admin-border)] shadow-sm">
          <h3 className="text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Sentiment</h3>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-emerald-500 font-semibold">👍 {stats.sentimentCounts.positive}</span>
            <span className="text-amber-500 font-semibold">🤝 {stats.sentimentCounts.neutral}</span>
            <span className="text-red-500 font-semibold">👎 {stats.sentimentCounts.negative}</span>
          </div>
        </div>
      </div>

      {/* ──────── Toolbar ──────── */}
      <div className="bg-[var(--admin-surface)] rounded-xl border border-[var(--admin-border)] p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--admin-text-muted)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search feedback..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] text-[var(--admin-text)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-turquoise)]"
            />
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
              showFilters
                ? "bg-[var(--color-navy)] text-white border-[var(--color-navy)]"
                : "border-[var(--admin-input-border)] text-[var(--admin-text-secondary)] hover:bg-[var(--admin-hover)]"
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
            <ChevronDown className={`w-3 h-3 transition-transform ${showFilters ? "rotate-180" : ""}`} />
          </button>

          {/* View toggle */}
          <div className="flex rounded-lg border border-[var(--admin-input-border)] overflow-hidden">
            <button
              onClick={() => setViewMode("table")}
              className={`px-3 py-2.5 text-sm ${viewMode === "table" ? "bg-[var(--color-navy)] text-white" : "text-[var(--admin-text-secondary)] hover:bg-[var(--admin-hover)]"}`}
            >
              <LayoutList className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("card")}
              className={`px-3 py-2.5 text-sm ${viewMode === "card" ? "bg-[var(--color-navy)] text-white" : "text-[var(--admin-text-secondary)] hover:bg-[var(--admin-hover)]"}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2.5 rounded-lg border border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] text-[var(--admin-text)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-turquoise)]"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="highest">Highest Rated</option>
            <option value="lowest">Lowest Rated</option>
          </select>

          {/* Export */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--color-navy)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>

        {/* Filter row */}
        {showFilters && (
          <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-[var(--admin-border-subtle)]">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 rounded-lg border border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] text-[var(--admin-text)] text-sm"
            >
              <option value="all">All Categories</option>
              <option value="general">General</option>
              <option value="sessions">Sessions</option>
              <option value="speakers">Speakers</option>
              <option value="venue">Venue</option>
              <option value="food">Food</option>
              <option value="registration">Registration</option>
              <option value="suggestion">Suggestion</option>
            </select>

            <select
              value={filterRating}
              onChange={(e) => setFilterRating(Number(e.target.value))}
              className="px-3 py-2 rounded-lg border border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] text-[var(--admin-text)] text-sm"
            >
              <option value={0}>All Ratings</option>
              <option value={5}>5 Stars</option>
              <option value={4}>4 Stars</option>
              <option value={3}>3 Stars</option>
              <option value={2}>2 Stars</option>
              <option value={1}>1 Star</option>
            </select>

            <select
              value={filterSentiment}
              onChange={(e) => setFilterSentiment(e.target.value)}
              className="px-3 py-2 rounded-lg border border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] text-[var(--admin-text)] text-sm"
            >
              <option value="all">All Sentiment</option>
              <option value="positive">Positive</option>
              <option value="neutral">Neutral</option>
              <option value="negative">Negative</option>
            </select>

            <select
              value={filterReadStatus}
              onChange={(e) => setFilterReadStatus(e.target.value)}
              className="px-3 py-2 rounded-lg border border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] text-[var(--admin-text)] text-sm"
            >
              <option value="all">All Status</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>
          </div>
        )}
      </div>

      {/* ──────── Bulk Actions ──────── */}
      {selectedIds.size > 0 && (
        <div className="bg-[var(--color-navy)] text-white rounded-xl px-5 py-3 flex items-center justify-between">
          <span className="text-sm font-medium">{selectedIds.size} selected</span>
          <div className="flex gap-2">
            <button onClick={handleBulkMarkRead} className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-sm transition-colors">
              Mark Read
            </button>
            <button onClick={handleBulkDelete} className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-200 text-sm transition-colors">
              Delete
            </button>
            <button onClick={() => setSelectedIds(new Set())} className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-sm transition-colors">
              Clear
            </button>
          </div>
        </div>
      )}

      {/* ──────── Results Count ──────── */}
      <div className="flex items-center justify-between text-sm text-[var(--admin-text-secondary)]">
        <span>{filteredFeedback.length} result{filteredFeedback.length !== 1 ? "s" : ""}</span>
      </div>

      {/* ──────── Table View ──────── */}
      {viewMode === "table" && (
        <div className="bg-[var(--admin-surface)] rounded-xl border border-[var(--admin-border)] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-[var(--admin-text-secondary)] uppercase bg-[var(--admin-surface-alt)]">
                <tr>
                  <th className="px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === filteredFeedback.length && filteredFeedback.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded"
                    />
                  </th>
                  <th className="px-4 py-3">Rating</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Feedback</th>
                  <th className="px-4 py-3">Sentiment</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFeedback.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-[var(--admin-text-muted)]">
                      <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      No feedback found
                    </td>
                  </tr>
                ) : (
                  filteredFeedback.map((f) => {
                    const sentConf = SENTIMENT_CONFIG[f.sentiment as keyof typeof SENTIMENT_CONFIG] || SENTIMENT_CONFIG.neutral;
                    return (
                      <tr
                        key={f.id}
                        className={`border-b border-[var(--admin-border-subtle)] hover:bg-[var(--admin-hover)] cursor-pointer transition-colors ${
                          !f.is_read ? "bg-[var(--color-turquoise)]/[0.03]" : ""
                        }`}
                        onClick={() => setSelectedFeedback(f)}
                      >
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedIds.has(f.id)}
                            onChange={() => toggleSelect(f.id)}
                            className="rounded"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <InlineStars rating={f.overall_rating} size={12} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {!f.is_read && <div className="w-2 h-2 rounded-full bg-[var(--color-turquoise)] shrink-0" />}
                            <span className="font-medium text-[var(--admin-text)]">
                              {f.name || "Anonymous"}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${CATEGORY_COLORS[f.category] || CATEGORY_COLORS.general}`}>
                            {f.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 max-w-xs">
                          <p className="text-[var(--admin-text-secondary)] truncate">
                            {f.feedback_text}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-medium ${sentConf.color}`}>
                            {sentConf.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[var(--admin-text-muted)] whitespace-nowrap">
                          {timeAgo(f.created_at)}
                        </td>
                        <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            {f.is_featured && (
                              <Star className="w-3.5 h-3.5 fill-[var(--color-brass)] text-[var(--color-brass)]" />
                            )}
                            <button
                              onClick={() => setSelectedFeedback(f)}
                              className="p-1.5 rounded-lg hover:bg-[var(--admin-surface-alt)] transition-colors text-[var(--admin-text-muted)]"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ──────── Card View ──────── */}
      {viewMode === "card" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredFeedback.length === 0 ? (
            <div className="md:col-span-2 bg-[var(--admin-surface)] rounded-xl border border-[var(--admin-border)] p-12 text-center text-[var(--admin-text-muted)]">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
              No feedback found
            </div>
          ) : (
            filteredFeedback.map((f) => {
              const sentConf = SENTIMENT_CONFIG[f.sentiment as keyof typeof SENTIMENT_CONFIG] || SENTIMENT_CONFIG.neutral;
              const SentIcon = sentConf.Icon;
              return (
                <div
                  key={f.id}
                  onClick={() => setSelectedFeedback(f)}
                  className={`bg-[var(--admin-surface)] rounded-xl border border-[var(--admin-border)] p-5 cursor-pointer hover:shadow-md transition-all hover:border-[var(--color-turquoise)]/30 ${
                    !f.is_read ? "ring-1 ring-[var(--color-turquoise)]/20" : ""
                  }`}
                >
                  {/* Card header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[var(--color-navy)] flex items-center justify-center text-white font-bold text-xs">
                        {f.name ? f.name[0].toUpperCase() : "?"}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-[var(--admin-text)]">
                          {f.name || "Anonymous"}
                        </p>
                        <p className="text-xs text-[var(--admin-text-muted)]">{timeAgo(f.created_at)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {f.is_featured && (
                        <Star className="w-3.5 h-3.5 fill-[var(--color-brass)] text-[var(--color-brass)]" />
                      )}
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${sentConf.bg} ${sentConf.color}`}>
                        <SentIcon className="w-3 h-3 inline mr-0.5" />
                        {sentConf.label}
                      </span>
                    </div>
                  </div>

                  {/* Rating + Category */}
                  <div className="flex items-center gap-3 mb-3">
                    <InlineStars rating={f.overall_rating} size={14} />
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${CATEGORY_COLORS[f.category] || CATEGORY_COLORS.general}`}>
                      {f.category}
                    </span>
                  </div>

                  {/* Feedback text */}
                  <p className="text-sm text-[var(--admin-text-secondary)] line-clamp-3 leading-relaxed">
                    {f.feedback_text}
                  </p>

                  {/* Admin notes indicator */}
                  {f.admin_notes && (
                    <div className="mt-3 flex items-center gap-1.5 text-xs text-[var(--color-turquoise)]">
                      <StickyNote className="w-3 h-3" />
                      Has admin notes
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ──────── Detail Modal ──────── */}
      {selectedFeedback && (
        <FeedbackDetailModal
          feedback={selectedFeedback}
          onClose={() => setSelectedFeedback(null)}
          onAction={handleRefetch}
        />
      )}
    </div>
  );
}
