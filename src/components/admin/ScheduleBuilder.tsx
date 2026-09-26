"use client";

import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import {
  updateSession,
  deleteSession,
  createSession,
  addSpeakerToSession,
  removeSpeakerFromSession,
  fetchScheduleDataAction,
} from "@/app/[locale]/admin/actions";
import { DateTimePicker } from "@/components/ui/DateTimePicker";
import { Search, Filter, Copy, ChevronDown, ChevronRight, Trash2, Plus, Check } from "lucide-react";

interface Props {
  initialSessions?: any[];
  initialSpeakers?: any[];
  initialStages?: any[];
}

export default function ScheduleBuilder({ initialSessions = [], initialSpeakers = [], initialStages = [] }: Props) {
  const [sessions, setSessions] = useState<any[]>(initialSessions);
  const [speakers, setSpeakers] = useState<any[]>(initialSpeakers);
  const [stages, setStages] = useState<any[]>(initialStages);
  const [activeStage, setActiveStage] = useState(() => {
    return stages.length > 0 ? stages[0].slug : "stage1";
  });
  
  const uniqueStages = useMemo(() => {
    return stages.map(s => s.slug);
  }, [stages]);
  const [isLoading, setIsLoading] = useState(false);

  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  // Collapse State (store IDs of expanded parent sessions)
  const [expandedParents, setExpandedParents] = useState<Set<string>>(
    () => new Set(initialSessions.filter((s) => !s.parent_id).map((s) => s.id))
  );

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchScheduleDataAction();
      setSessions(data.sessions);
      setSpeakers(data.speakers);
      setStages(data.stages);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleUpdate = useCallback(async (id: string, updates: Record<string, any>) => {
    // Optimistically update local session state immediately so UI and filters react with zero delay
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));

    try {
      await updateSession(id, updates);
    } catch (err: any) {
      console.error("Failed to update session:", err);
      // Revert to latest server data if error occurs
      fetchData();
      alert(err?.message || "Failed to update session. Changes reverted.");
      throw err;
    }
  }, [fetchData]);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm("Delete this session?")) return;
    try {
      await deleteSession(id);
      setSessions((prev) => prev.filter((s) => s.id !== id));
    } catch (err: any) {
      alert(err?.message || "Failed to delete session");
    }
  }, []);

  const toggleExpand = useCallback((id: string) => {
    setExpandedParents((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleAddSession = useCallback(async (parentId?: string) => {
    try {
      const parentSession = parentId ? sessions.find((s) => s.id === parentId) : null;
      const newSession: any = {
        title: parentId ? "New Program" : "New Session",
        start_time: parentSession ? parentSession.start_time : "2026-09-27T10:00:00+05:30",
        end_time: parentSession ? parentSession.end_time : "2026-09-27T11:00:00+05:30",
        stage: activeStage,
        type: "talk",
        description: "",
      };
      if (parentId) newSession.parent_id = parentId;
      await createSession(newSession);
      fetchData();

      if (parentId) {
        setExpandedParents((prev) => {
          const next = new Set(prev);
          next.add(parentId);
          return next;
        });
      }
    } catch (err: any) {
      alert(err?.message || "Failed to create session");
    }
  }, [sessions, activeStage, fetchData]);

  const handleDuplicate = useCallback(async (session: any) => {
    try {
      const newSession = {
        title: `${session.title} (Copy)`,
        title_ml: session.title_ml ? `${session.title_ml} (Copy)` : null,
        start_time: session.start_time,
        end_time: session.end_time,
        stage: session.stage,
        type: session.type,
        description: session.description,
        slug: session.slug ? `${session.slug}-copy` : null,
        parent_id: session.parent_id,
      };
      await createSession(newSession);
      fetchData();
    } catch (err: any) {
      alert(err?.message || "Failed to duplicate session");
    }
  }, [fetchData]);

  const handleAddSpeaker = useCallback(async (sessionId: string, speakerId: string) => {
    await addSpeakerToSession(sessionId, speakerId);
    fetchData();
  }, [fetchData]);

  const handleRemoveSpeaker = useCallback(async (sessionId: string, speakerId: string) => {
    await removeSpeakerFromSession(sessionId, speakerId);
    fetchData();
  }, [fetchData]);

  // Build hierarchy: top-level sessions with their children
  const allStage = useMemo(() => sessions.filter((s) => s.stage === activeStage), [sessions, activeStage]);

  const matchSearch = useCallback((s: any) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const titleMatch = s.title?.toLowerCase().includes(q) || s.title_ml?.toLowerCase().includes(q);
    const descMatch = s.description?.toLowerCase().includes(q);
    const speakerMatch = s.speakers?.some((sp: any) => sp.name?.toLowerCase().includes(q));
    return titleMatch || descMatch || speakerMatch;
  }, [searchQuery]);

  const matchFilter = useCallback((s: any) => {
    if (typeFilter === "all") return true;
    return s.type === typeFilter;
  }, [typeFilter]);

  // For top-level, include it if IT matches OR if any of its children match
  const topLevel = useMemo(() => {
    return allStage
      .filter((s) => !s.parent_id)
      .filter((parent) => {
        const children = allStage.filter((c) => c.parent_id === parent.id);
        const parentMatches = matchSearch(parent) && matchFilter(parent);
        const childrenMatch = children.some((c) => matchSearch(c) && matchFilter(c));
        return parentMatches || childrenMatch;
      })
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
  }, [allStage, matchSearch, matchFilter]);

  const allChildren = useMemo(() => allStage.filter((s) => s.parent_id), [allStage]);

  const getFilteredChildren = useCallback(
    (parentId: string) =>
      allChildren
        .filter((c) => c.parent_id === parentId && matchSearch(c) && matchFilter(c))
        .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()),
    [allChildren, matchSearch, matchFilter]
  );

  // All top-level sessions across all stages (for parent dropdown)
  const allTopLevel = useMemo(() => sessions.filter((s) => !s.parent_id), [sessions]);

  if (isLoading) {
    return <div className="p-8 text-center text-[var(--admin-text-secondary)]">Loading schedule...</div>;
  }

  return (
    <div className="bg-[var(--admin-surface)] rounded-xl border border-[var(--admin-border-subtle)] shadow-sm overflow-hidden">
      {/* Header Controls */}
      <div className="p-4 border-b border-[var(--admin-border)] flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex border border-[var(--admin-border)] rounded-lg overflow-hidden bg-[var(--admin-surface-alt)] flex-wrap">
          {uniqueStages.map((stage) => (
            <button
              key={stage}
              onClick={() => setActiveStage(stage)}
              className={`px-4 py-2 text-sm font-medium transition-colors capitalize ${
                activeStage === stage
                  ? "bg-[var(--color-navy)] text-white"
                  : "text-[var(--admin-text-secondary)] hover:text-[var(--admin-text)]"
              }`}
            >
              {stages.find(st => st.slug === stage)?.name || stage.replace("stage", "Stage ")}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-56">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--admin-text-muted)]" />
            <input
              type="text"
              placeholder="Search sessions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] text-[var(--admin-text)] rounded-lg focus:outline-none focus:border-[var(--color-turquoise)]"
            />
          </div>
          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="pl-8 pr-3 py-2 text-sm border border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] text-[var(--admin-text)] rounded-lg focus:outline-none focus:border-[var(--color-turquoise)] appearance-none"
            >
              <option value="all">All Types</option>
              <option value="ceremony">Ceremony</option>
              <option value="talk">Talk</option>
              <option value="meal">Meal</option>
              <option value="meeting">Meeting</option>
              <option value="paid_session">Paid Session</option>
              <option value="competition">Competition</option>
              <option value="mawlid">Mawlid</option>
              <option value="closing">Closing</option>
              <option value="external_redirect">External</option>
            </select>
            <Filter className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--admin-text-muted)] pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        <div className="space-y-4">
          {topLevel.map((session) => {
            const sessionChildren = getFilteredChildren(session.id);
            const isExpanded = expandedParents.has(session.id);

            return (
              <div key={session.id} className="space-y-2 relative">
                {sessionChildren.length > 0 && (
                  <button
                    onClick={() => toggleExpand(session.id)}
                    className="absolute -left-2 top-4 p-1 bg-white border border-[var(--admin-border)] rounded-full shadow-sm text-[var(--admin-text-secondary)] hover:text-[var(--admin-text)] z-10 hover:bg-[var(--admin-hover)]"
                  >
                    {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                  </button>
                )}

                <SessionCard
                  session={session}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                  onDuplicate={handleDuplicate}
                  onAddSpeaker={handleAddSpeaker}
                  onRemoveSpeaker={handleRemoveSpeaker}
                  allTopLevel={allTopLevel}
                  speakers={speakers}
                  stages={stages}
                />

                {/* Child programs */}
                {isExpanded && sessionChildren.length > 0 && (
                  <div className="space-y-2 pl-2">
                    <p className="text-xs font-semibold text-[var(--admin-text-muted)] uppercase tracking-wider ml-6 mt-2">
                      Sub-programs ({sessionChildren.length})
                    </p>
                    {sessionChildren.map((child) => (
                      <SessionCard
                        key={child.id}
                        session={child}
                        isChild
                        onUpdate={handleUpdate}
                        onDelete={handleDelete}
                        onDuplicate={handleDuplicate}
                        onAddSpeaker={handleAddSpeaker}
                        onRemoveSpeaker={handleRemoveSpeaker}
                        allTopLevel={allTopLevel}
                        speakers={speakers}
                        stages={stages}
                      />
                    ))}
                  </div>
                )}

                {/* Add sub-program button */}
                {isExpanded && (
                  <button
                    onClick={() => handleAddSession(session.id)}
                    className="ml-6 py-2 px-4 border border-dashed border-[var(--color-turquoise)]/50 rounded-lg text-xs font-medium text-[var(--color-turquoise)] hover:bg-[var(--color-turquoise)]/10 transition-all flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Sub-program
                  </button>
                )}
              </div>
            );
          })}

          {topLevel.length === 0 && (
            <div className="text-center p-8 text-[var(--admin-text-secondary)] bg-[var(--admin-surface-alt)] rounded-lg border border-[var(--admin-border)]">
              No sessions found matching criteria.
            </div>
          )}

          <button
            onClick={() => handleAddSession()}
            className="w-full py-4 border-2 border-dashed border-[var(--admin-input-border)] rounded-lg text-sm font-medium text-[var(--admin-text-secondary)] hover:text-[var(--admin-text)] hover:bg-[var(--admin-hover)] hover:border-gray-400 transition-all"
          >
            + Add New Session to {activeStage.replace("stage", "Stage ")}
          </button>
        </div>
      </div>
    </div>
  );
}

interface SessionCardProps {
  session: any;
  isChild?: boolean;
  onUpdate: (id: string, updates: Record<string, any>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onDuplicate: (session: any) => Promise<void>;
  onAddSpeaker: (sessionId: string, speakerId: string) => Promise<void>;
  onRemoveSpeaker: (sessionId: string, speakerId: string) => Promise<void>;
  allTopLevel: any[];
  speakers: any[];
  stages: any[];
}

const SessionCard = React.memo(function SessionCard({
  session,
  isChild = false,
  onUpdate,
  onDelete,
  onDuplicate,
  onAddSpeaker,
  onRemoveSpeaker,
  allTopLevel,
  speakers,
  stages,
}: SessionCardProps) {
  // Local state for instant typing with zero latency or lag
  const [localValues, setLocalValues] = useState({
    title: session.title || "",
    title_ml: session.title_ml || "",
    slug: session.slug || "",
    description: session.description || "",
    stage: session.stage || "",
  });

  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const pendingUpdatesRef = useRef<Record<string, any>>({});
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync state if session prop updates externally, preserving any pending local edits
  useEffect(() => {
    setLocalValues((prev) => {
      const pending = pendingUpdatesRef.current;
      return {
        title: "title" in pending ? prev.title : session.title || "",
        title_ml: "title_ml" in pending ? prev.title_ml : session.title_ml || "",
        slug: "slug" in pending ? prev.slug : session.slug || "",
        description: "description" in pending ? prev.description : session.description || "",
        stage: "stage" in pending ? prev.stage : session.stage || "",
      };
    });
  }, [session.id, session.title, session.title_ml, session.slug, session.description, session.stage]);

  // Flush any pending updates immediately to parent and database
  const flushUpdates = useCallback(async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
    const updates = { ...pendingUpdatesRef.current };
    if (Object.keys(updates).length > 0) {
      pendingUpdatesRef.current = {};
      setSaveStatus("saving");
      try {
        await onUpdate(session.id, updates);
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 1800);
      } catch {
        setSaveStatus("idle");
      }
    }
  }, [session.id, onUpdate]);

  // Flush pending updates when component unmounts
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      const updates = { ...pendingUpdatesRef.current };
      if (Object.keys(updates).length > 0) {
        pendingUpdatesRef.current = {};
        onUpdate(session.id, updates);
      }
    };
  }, [session.id, onUpdate]);

  // Handle instant local input change with debounced save (600ms)
  const handleFieldChange = (field: string, value: string) => {
    setLocalValues((prev) => ({ ...prev, [field]: value }));
    pendingUpdatesRef.current[field] = value;
    setSaveStatus("saving");

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      const updates = { ...pendingUpdatesRef.current };
      if (Object.keys(updates).length > 0) {
        pendingUpdatesRef.current = {};
        try {
          await onUpdate(session.id, updates);
          setSaveStatus("saved");
          setTimeout(() => setSaveStatus("idle"), 1800);
        } catch {
          setSaveStatus("idle");
        }
      }
    }, 600);
  };

  // Immediate save on blur
  const handleBlur = (field: string) => {
    if (field in pendingUpdatesRef.current) {
      flushUpdates();
    }
  };

  const handleDuplicateClick = async () => {
    await flushUpdates();
    onDuplicate({ ...session, ...localValues });
  };

  const handleDeleteClick = () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    pendingUpdatesRef.current = {};
    onDelete(session.id);
  };

  return (
    <div className={`relative group ${isChild ? "ml-6 border-l-4 border-[var(--color-turquoise)]/30 pl-2" : ""}`}>
      <div
        className={`flex flex-col lg:flex-row gap-4 p-4 border rounded-lg relative ${
          isChild
            ? "bg-[var(--color-turquoise)]/5 border-[var(--color-turquoise)]/20"
            : "bg-[var(--admin-surface)] border-[var(--admin-border)]"
        }`}
      >
        {!isChild && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[var(--color-turquoise)] rounded-l-lg" />}

        {/* Time column */}
        <div className="flex flex-col gap-2.5 sm:w-56 lg:w-60 shrink-0 lg:border-r border-[var(--admin-border)] lg:pr-4">
          <div>
            <DateTimePicker
              label="Start Time"
              value={session.start_time}
              onChange={(newVal) => onUpdate(session.id, { start_time: newVal })}
            />
          </div>
          <div>
            <DateTimePicker
              label="End Time"
              value={session.end_time}
              referenceStartTime={session.start_time}
              onChange={(newVal) => onUpdate(session.id, { end_time: newVal })}
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-3">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <div className="flex-1">
              <label className="text-xs font-semibold text-[var(--admin-text-secondary)] uppercase tracking-wider">
                Title (EN)
              </label>
              <input
                type="text"
                value={localValues.title}
                onChange={(e) => handleFieldChange("title", e.target.value)}
                onBlur={() => handleBlur("title")}
                className="w-full mt-1 p-1.5 border border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] text-[var(--admin-text)] rounded text-sm outline-none focus:border-[var(--color-turquoise)] font-bold transition-colors"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs font-semibold text-[var(--admin-text-secondary)] uppercase tracking-wider">
                Title (ML)
              </label>
              <input
                type="text"
                value={localValues.title_ml}
                onChange={(e) => handleFieldChange("title_ml", e.target.value)}
                onBlur={() => handleBlur("title_ml")}
                className="w-full mt-1 p-1.5 border border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] text-[var(--admin-text)] rounded text-sm outline-none focus:border-[var(--color-turquoise)] transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <div className="w-full sm:w-32">
              <label className="text-xs font-semibold text-[var(--admin-text-secondary)] uppercase tracking-wider">
                Type
              </label>
              <select
                value={session.type || "talk"}
                onChange={(e) => onUpdate(session.id, { type: e.target.value })}
                className="w-full mt-1 p-1.5 border border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] text-[var(--admin-text)] rounded text-sm outline-none focus:border-[var(--color-turquoise)]"
              >
                <option value="ceremony">Ceremony</option>
                <option value="talk">Talk</option>
                <option value="meal">Meal</option>
                <option value="meeting">Meeting</option>
                <option value="paid_session">Paid Session</option>
                <option value="competition">Competition</option>
                <option value="mawlid">Mawlid</option>
                <option value="closing">Closing</option>
                <option value="external_redirect">External</option>
              </select>
            </div>
            {!isChild && (
              <div className="flex-1">
                <label className="text-xs font-semibold text-[var(--admin-text-secondary)] uppercase tracking-wider">
                  Slug
                </label>
                <input
                  type="text"
                  value={localValues.slug}
                  onChange={(e) => handleFieldChange("slug", e.target.value)}
                  onBlur={() => handleBlur("slug")}
                  className="w-full mt-1 p-1.5 border border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] rounded text-sm outline-none focus:border-[var(--color-turquoise)] text-[var(--admin-text-secondary)] transition-colors"
                />
              </div>
            )}
            <div className="w-full sm:w-32">
              <label className="text-xs font-semibold text-[var(--admin-text-secondary)] uppercase tracking-wider">
                Stage
              </label>
              <select
                value={localValues.stage}
                onChange={(e) => handleFieldChange("stage", e.target.value)}
                onBlur={() => handleBlur("stage")}
                className="w-full mt-1 p-1.5 border border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] text-[var(--admin-text)] rounded text-sm outline-none focus:border-[var(--color-turquoise)] transition-colors"
              >
                {stages.map((stage) => (
                  <option key={stage.slug} value={stage.slug}>
                    {stage.name}
                  </option>
                ))}
              </select>
            </div>
            {isChild && (
              <div className="flex-1">
                <label className="text-xs font-semibold text-[var(--admin-text-secondary)] uppercase tracking-wider">
                  Parent Group
                </label>
                <select
                  value={session.parent_id || ""}
                  onChange={(e) => onUpdate(session.id, { parent_id: e.target.value === "" ? null : e.target.value })}
                  className="w-full mt-1 p-1.5 border border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] text-[var(--admin-text)] rounded text-sm outline-none focus:border-[var(--color-turquoise)]"
                >
                  <option value="">(None - Make Top Level)</option>
                  {allTopLevel
                    .filter((s) => s.id !== session.id)
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title}
                      </option>
                    ))}
                </select>
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold text-[var(--admin-text-secondary)] uppercase tracking-wider">
              Description
            </label>
            <textarea
              rows={2}
              value={localValues.description}
              onChange={(e) => handleFieldChange("description", e.target.value)}
              onBlur={() => handleBlur("description")}
              className="w-full mt-1 p-2 border border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] text-[var(--admin-text)] rounded text-sm outline-none focus:border-[var(--color-turquoise)] resize-none transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[var(--admin-text-secondary)] uppercase tracking-wider">
              Speakers
            </label>
            <div className="mt-1 flex flex-wrap gap-2 items-center">
              {session.speakers?.map((speaker: any) => (
                <span
                  key={speaker.id}
                  className="px-2 py-1 bg-[var(--color-turquoise)]/10 text-[var(--color-turquoise)] border border-[var(--color-turquoise)]/20 rounded-md text-xs font-medium flex items-center gap-1"
                >
                  {speaker.name}
                  <button
                    type="button"
                    onClick={() => onRemoveSpeaker(session.id, speaker.id)}
                    className="hover:text-red-500 cursor-pointer"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    onAddSpeaker(session.id, e.target.value);
                    e.target.value = "";
                  }
                }}
                className="px-2 py-1 text-xs border border-dashed border-[var(--admin-input-border)] text-[var(--admin-text-secondary)] rounded outline-none focus:ring-1 bg-[var(--admin-input-bg)] focus:ring-[var(--color-turquoise)]"
              >
                <option value="">+ Assign Speaker</option>
                {speakers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Save Status Badge */}
        {saveStatus !== "idle" && (
          <div className="absolute right-16 top-3.5 flex items-center gap-1.5 text-xs font-medium pointer-events-none">
            {saveStatus === "saving" && (
              <span className="flex items-center gap-1.5 text-[var(--color-turquoise)] bg-[var(--color-turquoise)]/10 px-2 py-0.5 rounded-full text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-turquoise)] animate-ping" />
                Saving...
              </span>
            )}
            {saveStatus === "saved" && (
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full text-[11px] transition-opacity duration-300">
                <Check className="w-3 h-3 text-emerald-500" />
                Saved
              </span>
            )}
          </div>
        )}

        {/* Hover Actions: Duplicate & Delete */}
        <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-2">
          <button
            type="button"
            onClick={handleDuplicateClick}
            className="p-1.5 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-md text-[var(--admin-text-secondary)] hover:text-[var(--color-turquoise)] transition-colors cursor-pointer shadow-sm"
            title="Duplicate Session"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleDeleteClick}
            className="p-1.5 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-md text-[var(--admin-text-secondary)] hover:text-red-500 transition-colors cursor-pointer shadow-sm"
            title="Remove Session"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
});
