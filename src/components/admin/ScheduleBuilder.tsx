"use client";

import React, { useState } from "react";
import { updateSession, deleteSession, createSession, addSpeakerToSession, removeSpeakerFromSession, fetchScheduleDataAction } from "@/app/[locale]/admin/actions";
import { DateTimePicker } from "@/components/ui/DateTimePicker";

interface Props {
  initialSessions?: any[];
  initialSpeakers?: any[];
}

export default function ScheduleBuilder({ initialSessions = [], initialSpeakers = [] }: Props) {
  const [sessions, setSessions] = useState<any[]>(initialSessions);
  const [speakers, setSpeakers] = useState<any[]>(initialSpeakers);
  const [activeStage, setActiveStage] = useState("stage1");
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchScheduleDataAction();
      setSessions(data.sessions);
      setSpeakers(data.speakers);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (id: string, field: string, value: string | null) => {
    try {
      await updateSession(id, { [field]: value });
      setSessions(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
    } catch (err: any) {
      alert(err?.message || "Failed to update session");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this session?")) return;
    try {
      await deleteSession(id);
      setSessions(prev => prev.filter(s => s.id !== id));
    } catch (err: any) {
      alert(err?.message || "Failed to delete session");
    }
  };

  const handleAddSession = async (parentId?: string) => {
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
    } catch (err: any) {
      alert(err?.message || "Failed to create session");
    }
  };

  const handleAddSpeaker = async (sessionId: string, speakerId: string) => {
    await addSpeakerToSession(sessionId, speakerId);
    fetchData();
  };

  const handleRemoveSpeaker = async (sessionId: string, speakerId: string) => {
    await removeSpeakerFromSession(sessionId, speakerId);
    fetchData();
  };

  // Build hierarchy: top-level sessions with their children
  const allStage = sessions.filter(s => s.stage === activeStage);
  const topLevel = allStage.filter(s => !s.parent_id).sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
  const children = allStage.filter(s => s.parent_id);

  const getChildren = (parentId: string) =>
    children.filter(c => c.parent_id === parentId).sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

  // All top-level sessions across all stages (for parent dropdown)
  const allTopLevel = sessions.filter(s => !s.parent_id);

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading schedule...</div>;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveStage("stage1")}
          className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeStage === 'stage1' ? 'text-[var(--color-navy)] border-[var(--color-navy)]' : 'text-gray-500 border-transparent hover:text-gray-700'}`}
        >
          Stage 1 (Main)
        </button>
        <button
          onClick={() => setActiveStage("stage2")}
          className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeStage === 'stage2' ? 'text-[var(--color-navy)] border-[var(--color-navy)]' : 'text-gray-500 border-transparent hover:text-gray-700'}`}
        >
          Stage 2
        </button>
      </div>

      <div className="p-4 sm:p-6">
        <div className="space-y-4">
          {topLevel.map((session) => {
            const sessionChildren = getChildren(session.id);
            return (
              <div key={session.id} className="space-y-2">
                <SessionCard
                  session={session}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                  onAddSpeaker={handleAddSpeaker}
                  onRemoveSpeaker={handleRemoveSpeaker}
                  allTopLevel={allTopLevel}
                  speakers={speakers}
                />

                {/* Child programs */}
                {sessionChildren.length > 0 && (
                  <div className="space-y-2 pl-2">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-6 mt-2">Sub-programs ({sessionChildren.length})</p>
                    {sessionChildren.map(child => (
                      <SessionCard
                        key={child.id}
                        session={child}
                        isChild
                        onUpdate={handleUpdate}
                        onDelete={handleDelete}
                        onAddSpeaker={handleAddSpeaker}
                        onRemoveSpeaker={handleRemoveSpeaker}
                        allTopLevel={allTopLevel}
                        speakers={speakers}
                      />
                    ))}
                  </div>
                )}

                {/* Add sub-program button */}
                <button
                  onClick={() => handleAddSession(session.id)}
                  className="ml-6 py-2 px-4 border border-dashed border-blue-300 rounded-lg text-xs font-medium text-blue-500 hover:text-blue-700 hover:bg-blue-50 hover:border-blue-400 transition-all"
                >
                  + Add Sub-program to &quot;{session.title}&quot;
                </button>
              </div>
            );
          })}

          {topLevel.length === 0 && (
            <div className="text-center p-8 text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
              No sessions scheduled for this stage yet.
            </div>
          )}

          <button onClick={() => handleAddSession()} className="w-full py-4 border-2 border-dashed border-gray-300 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all">
            + Add New Session to {activeStage === 'stage1' ? 'Stage 1' : 'Stage 2'}
          </button>
        </div>
      </div>
    </div>
  );
}

interface SessionCardProps {
  session: any;
  isChild?: boolean;
  onUpdate: (id: string, field: string, value: string | null) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onAddSpeaker: (sessionId: string, speakerId: string) => Promise<void>;
  onRemoveSpeaker: (sessionId: string, speakerId: string) => Promise<void>;
  allTopLevel: any[];
  speakers: any[];
}

function SessionCard({
  session,
  isChild = false,
  onUpdate,
  onDelete,
  onAddSpeaker,
  onRemoveSpeaker,
  allTopLevel,
  speakers,
}: SessionCardProps) {
  return (
    <div className={`relative group ${isChild ? 'ml-6 border-l-4 border-[var(--color-turquoise)]/30' : ''}`}>
      <div className={`flex flex-col lg:flex-row gap-4 p-4 border rounded-lg relative ${isChild ? 'bg-blue-50/50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
        {!isChild && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[var(--color-turquoise)] rounded-l-lg" />}

        {/* Time column */}
        <div className="flex flex-col gap-2.5 sm:w-56 lg:w-60 shrink-0 lg:border-r border-gray-200 lg:pr-4">
          <div>
            <DateTimePicker
              label="Start Time"
              value={session.start_time}
              onChange={(newVal) => onUpdate(session.id, 'start_time', newVal)}
            />
          </div>
          <div>
            <DateTimePicker
              label="End Time"
              value={session.end_time}
              referenceStartTime={session.start_time}
              onChange={(newVal) => onUpdate(session.id, 'end_time', newVal)}
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-3">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <div className="flex-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Title (EN)</label>
              <input
                type="text"
                value={session.title || ''}
                onChange={(e) => onUpdate(session.id, 'title', e.target.value)}
                className="w-full mt-1 p-1.5 border border-gray-300 rounded text-sm outline-none focus:border-[var(--color-turquoise)] font-bold text-gray-800"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Title (ML)</label>
              <input
                type="text"
                value={session.title_ml || ''}
                onChange={(e) => onUpdate(session.id, 'title_ml', e.target.value)}
                className="w-full mt-1 p-1.5 border border-gray-300 rounded text-sm outline-none focus:border-[var(--color-turquoise)]"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <div className="w-full sm:w-32">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</label>
              <select
                value={session.type || 'talk'}
                onChange={(e) => onUpdate(session.id, 'type', e.target.value)}
                className="w-full mt-1 p-1.5 border border-gray-300 rounded text-sm outline-none focus:border-[var(--color-turquoise)]"
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
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Slug</label>
                <input
                  type="text"
                  value={session.slug || ''}
                  onChange={(e) => onUpdate(session.id, 'slug', e.target.value)}
                  className="w-full mt-1 p-1.5 border border-gray-300 rounded text-sm outline-none focus:border-[var(--color-turquoise)] text-gray-600"
                />
              </div>
            )}
            {isChild && (
              <div className="flex-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Parent Group</label>
                <select
                  value={session.parent_id || ''}
                  onChange={(e) => onUpdate(session.id, 'parent_id', e.target.value === "" ? null : e.target.value)}
                  className="w-full mt-1 p-1.5 border border-gray-300 rounded text-sm outline-none focus:border-[var(--color-turquoise)]"
                >
                  <option value="">(None - Make Top Level)</option>
                  {allTopLevel.filter(s => s.id !== session.id).map(s => (
                    <option key={s.id} value={s.id}>{s.title}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</label>
            <textarea
              rows={2}
              value={session.description || ''}
              onChange={(e) => onUpdate(session.id, 'description', e.target.value)}
              className="w-full mt-1 p-2 border border-gray-300 rounded text-sm outline-none focus:border-[var(--color-turquoise)] resize-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Speakers</label>
            <div className="mt-1 flex flex-wrap gap-2 items-center">
              {session.speakers?.map((speaker: any) => (
                <span key={speaker.id} className="px-2 py-1 bg-[var(--color-turquoise)]/10 text-[var(--color-turquoise)] rounded-md text-xs font-medium flex items-center gap-1">
                  {speaker.name}
                  <button
                    type="button"
                    onClick={() => onRemoveSpeaker(session.id, speaker.id)}
                    className="hover:text-red-500 cursor-pointer"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
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
                className="px-2 py-1 text-xs border border-dashed border-gray-400 text-gray-600 rounded bg-transparent outline-none focus:ring-1 focus:ring-[var(--color-turquoise)]"
              >
                <option value="">+ Assign Speaker</option>
                {speakers.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Delete button */}
        <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <button type="button" onClick={() => onDelete(session.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors cursor-pointer" title="Remove Session">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
