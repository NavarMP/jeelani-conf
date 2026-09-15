"use client";

import React, { useState, useEffect } from "react";
import { updateSession, deleteSession, createSession, addSpeakerToSession, removeSpeakerFromSession, fetchScheduleDataAction } from "@/app/[locale]/admin/actions";

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


  const handleUpdate = async (id: string, field: string, value: string) => {
    try {
      await updateSession(id, { [field]: value });
      setSessions(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
    } catch (err) {
      alert("Failed to update session");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this session?")) return;
    try {
      await deleteSession(id);
      setSessions(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      alert("Failed to delete session");
    }
  };

  const handleAddSession = async () => {
    try {
      // Basic default values for a new session
      const newSession = {
        title: "New Session",
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + 3600000).toISOString(),
        stage: activeStage,
        type: "talk",
        description: "",
      };
      await createSession(newSession);
      fetchData(); // Refresh to get the new ID
    } catch (err) {
      alert("Failed to create session");
    }
  };

  const activeSessions = sessions.filter(s => s.stage === activeStage).sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

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

      <div className="p-6">
        <div className="space-y-4">
          {activeSessions.map((session) => (
            <div key={session.id} className="flex gap-4 p-4 border border-gray-200 rounded-lg bg-gray-50 relative group">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[var(--color-turquoise)] rounded-l-lg"></div>
              
              <div className="flex flex-col gap-2 w-32 shrink-0 border-r border-gray-200 pr-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Start</label>
                  <input 
                    type="datetime-local" 
                    value={new Date(session.start_time).toISOString().slice(0, 16)} 
                    onChange={(e) => handleUpdate(session.id, 'start_time', new Date(e.target.value).toISOString())}
                    className="w-full mt-1 p-1.5 border border-gray-300 rounded text-xs outline-none focus:border-[var(--color-turquoise)]" 
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">End</label>
                  <input 
                    type="datetime-local" 
                    value={new Date(session.end_time).toISOString().slice(0, 16)} 
                    onChange={(e) => handleUpdate(session.id, 'end_time', new Date(e.target.value).toISOString())}
                    className="w-full mt-1 p-1.5 border border-gray-300 rounded text-xs outline-none focus:border-[var(--color-turquoise)]" 
                  />
                </div>
              </div>
              
              <div className="flex-1 space-y-3">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Title (EN)</label>
                    <input 
                      type="text" 
                      value={session.title || ''} 
                      onChange={(e) => handleUpdate(session.id, 'title', e.target.value)}
                      className="w-full mt-1 p-1.5 border border-gray-300 rounded text-sm outline-none focus:border-[var(--color-turquoise)] font-bold text-gray-800" 
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Title (ML)</label>
                    <input 
                      type="text" 
                      value={session.title_ml || ''} 
                      onChange={(e) => handleUpdate(session.id, 'title_ml', e.target.value)}
                      className="w-full mt-1 p-1.5 border border-gray-300 rounded text-sm outline-none focus:border-[var(--color-turquoise)]" 
                    />
                  </div>
                  <div className="w-32">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</label>
                    <select 
                      value={session.type || 'talk'} 
                      onChange={(e) => handleUpdate(session.id, 'type', e.target.value)}
                      className="w-full mt-1 p-1.5 border border-gray-300 rounded text-sm outline-none focus:border-[var(--color-turquoise)]"
                    >
                      <option value="ceremony">Ceremony</option>
                      <option value="talk">Talk</option>
                      <option value="meal">Meal</option>
                      <option value="meeting">Meeting</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</label>
                  <textarea 
                    rows={2} 
                    value={session.description || ''}
                    onChange={(e) => handleUpdate(session.id, 'description', e.target.value)}
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
                          onClick={async () => {
                            await removeSpeakerFromSession(session.id, speaker.id);
                            fetchData();
                          }}
                          className="hover:text-red-500"
                        >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </span>
                    ))}
                    <select 
                      onChange={async (e) => {
                        if (e.target.value) {
                          await addSpeakerToSession(session.id, e.target.value);
                          e.target.value = "";
                          fetchData();
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
              
              <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleDelete(session.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors" title="Remove Session">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}

          {activeSessions.length === 0 && (
            <div className="text-center p-8 text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
              No sessions scheduled for this stage yet.
            </div>
          )}

          <button onClick={handleAddSession} className="w-full py-4 border-2 border-dashed border-gray-300 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all">
            + Add New Session to {activeStage === 'stage1' ? 'Stage 1' : 'Stage 2'}
          </button>
        </div>
      </div>
    </div>
  );
}
