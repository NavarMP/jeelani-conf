"use client";

import React, { useState, useEffect, useTransition } from "react";
import { X, Mic, FileText, Play, Settings2, Globe, Activity, Clock } from "lucide-react";
import { type Session, type Speaker } from "@/lib/data";
import { createClient } from "@/lib/supabase/client";
import { useAllLiveEventStates } from "@/lib/useLiveEventState";

interface Props {
  stages: string[];
  allSessions: Session[];
  allSpeakers: Speaker[];
}

export default function LiveEventDirector({ stages, allSessions, allSpeakers }: Props) {
  const [activeStage, setActiveStage] = useState(stages[0] || "stage1");
  const [state, setState] = useState<any>(null);
  const [isPending, startTransition] = useTransition();
  const supabase = createClient();
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Form State
  const [mode, setMode] = useState<"auto" | "manual">("auto");
  const [currentSessionId, setCurrentSessionId] = useState("");
  const [currentSpeakerId, setCurrentSpeakerId] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [documentUrl, setDocumentUrl] = useState("");

  const { allStates } = useAllLiveEventStates();

  const extendedStages = ["global", ...stages];

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  useEffect(() => {
    const fetchState = async () => {
      const { data, error } = await supabase
        .from("live_event_state")
        .select("*")
        .eq("stage", activeStage)
        .single();
        
      if (data) {
        setState(data);
        setMode(data.mode || "auto");
        setCurrentSessionId(data.current_session_id || "");
        setCurrentSpeakerId(data.current_speaker_id || "");
        setSubtitle(data.subtitle_text || "");
        setDocumentUrl(data.document_url || "");
      }
    };
    fetchState();
  }, [activeStage]);

  const handleSave = async () => {
    startTransition(async () => {
      try {
        const payload = {
          stage: activeStage,
          mode,
          current_session_id: currentSessionId || null,
          current_speaker_id: currentSpeakerId || null,
          subtitle_text: subtitle || null,
          document_url: documentUrl || null,
          updated_at: new Date().toISOString(),
        };

        const { error } = await supabase.from("live_event_state").upsert(payload);
        if (error) throw error;
        
        showToast(`Live state broadcasted successfully to ${activeStage.toUpperCase()}!`);
      } catch (err: any) {
        showToast("Database table 'live_event_state' might not exist. Run migration.", "error");
      }
    });
  };

  const stageSessions = activeStage === "global" ? allSessions : allSessions.filter(s => s.stage === activeStage);
  const activeSessionObj = stageSessions.find(s => s.id === currentSessionId);
  const availableSpeakers = activeSessionObj?.speakers || allSpeakers;

  // Calculate upcoming session for the admin info
  const now = new Date();
  const upcomingSession = stageSessions.find(s => new Date(s.start_time) > now);

  return (
    <div className="bg-[var(--admin-surface)] rounded-2xl border border-[var(--admin-border)] shadow-sm p-6 max-w-4xl mx-auto">
      {notification && (
        <div className={`mb-4 p-4 rounded-xl border flex items-center justify-between text-sm font-medium ${notification.type === "success" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"}`}>
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b border-[var(--admin-border-subtle)] pb-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--admin-text)] flex items-center gap-2">
            <Settings2 className="text-[var(--color-turquoise)]" /> Director's Control Panel
          </h2>
          <p className="text-[var(--admin-text-secondary)] text-sm">Control what the audience sees on the schedule page in real-time.</p>
        </div>
        
        <div className="flex gap-2 mt-4 md:mt-0 flex-wrap">
          {extendedStages.map(stage => {
            const isGlobal = stage === "global";
            const isActive = activeStage === stage;
            return (
              <button
                key={stage}
                onClick={() => setActiveStage(stage)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                  isActive 
                    ? (isGlobal ? "bg-red-600 text-white shadow-[0_0_10px_rgba(220,38,38,0.5)]" : "bg-[var(--color-navy)] text-white") 
                    : "bg-[var(--admin-surface-alt)] text-[var(--admin-text)] hover:bg-[var(--admin-hover)]"
                }`}
              >
                {isGlobal && <Globe className="w-4 h-4" />}
                {isGlobal ? "GLOBAL OVERRIDE" : stage.toUpperCase()}
              </button>
            );
          })}
        </div>
      </div>

      {/* Global Dashboard Status */}
      <div className="mb-8 p-5 bg-[var(--admin-surface-alt)] rounded-xl border border-[var(--admin-border-subtle)]">
        <h3 className="text-sm font-bold text-[var(--admin-text)] uppercase tracking-widest mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4 text-[var(--color-turquoise)]" /> All Stages Status
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {extendedStages.map(stage => {
            const stageState = allStates.find(s => s.stage === stage);
            const activeSess = allSessions.find(s => s.id === stageState?.current_session_id);
            const isAuto = !stageState || stageState.mode === "auto";
            return (
              <div key={stage} className={`p-3 rounded-lg border ${stage === 'global' && stageState?.mode === 'manual' ? 'border-red-500 bg-red-500/10' : 'border-[var(--admin-border)] bg-[var(--admin-surface)]'}`}>
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-xs font-bold ${stage === 'global' ? 'text-red-500' : 'text-[var(--admin-text)]'}`}>{stage.toUpperCase()}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${isAuto ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                    {isAuto ? 'AUTO' : 'MANUAL'}
                  </span>
                </div>
                <div className="text-xs text-[var(--admin-text-secondary)] truncate">
                  {stageState?.mode === 'manual' && activeSess ? activeSess.title : (isAuto ? 'Following Schedule' : 'No Session')}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-5">
          <div className="p-4 rounded-xl border border-[var(--admin-border-subtle)] bg-[var(--admin-surface-alt)]">
            <label className="text-xs font-bold text-[var(--admin-text-secondary)] uppercase tracking-wider mb-2 block">Control Mode</label>
            <div className="flex gap-2">
              <button
                onClick={() => setMode("auto")}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${mode === "auto" ? "bg-[var(--color-turquoise)] text-white shadow" : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"}`}
              >
                Auto (Schedule Based)
              </button>
              <button
                onClick={() => setMode("manual")}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${mode === "manual" ? "bg-[var(--color-navy)] text-white shadow" : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"}`}
              >
                Manual Override
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[var(--admin-text-secondary)] uppercase tracking-wider mb-1 block">Live Event (Session)</label>
            <select
              value={currentSessionId}
              onChange={(e) => setCurrentSessionId(e.target.value)}
              disabled={mode === "auto"}
              className="w-full p-3 rounded-lg border border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] text-[var(--admin-text)] text-sm disabled:opacity-50"
            >
              <option value="">-- No Session --</option>
              {stageSessions.map(s => (
                <option key={s.id} value={s.id}>{s.title}</option>
              ))}
            </select>
            {upcomingSession && (
              <div className="mt-2 text-xs text-[var(--admin-text-secondary)] flex items-center gap-1.5 p-2 bg-[var(--color-brass)]/10 rounded-md border border-[var(--color-brass)]/20">
                <Clock className="w-3.5 h-3.5 text-[var(--color-brass)]" /> 
                <span className="font-semibold text-[var(--color-brass)]">Up Next:</span> {upcomingSession.title}
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-bold text-[var(--admin-text-secondary)] uppercase tracking-wider mb-1 block flex items-center gap-1"><Mic className="w-3 h-3" /> Speaker on Stage</label>
            <select
              value={currentSpeakerId}
              onChange={(e) => setCurrentSpeakerId(e.target.value)}
              className="w-full p-3 rounded-lg border border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] text-[var(--admin-text)] text-sm"
            >
              <option value="">-- Let System Decide / No Speaker --</option>
              {availableSpeakers.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <label className="text-xs font-bold text-[var(--admin-text-secondary)] uppercase tracking-wider mb-1 block">Live Subtitle / Lower Third</label>
            <textarea
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="e.g. Please join us for prayer..."
              className="w-full p-3 h-24 resize-none rounded-lg border border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] text-[var(--admin-text)] text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[var(--admin-text-secondary)] uppercase tracking-wider mb-1 block flex items-center gap-1"><FileText className="w-3 h-3" /> Push Live Document URL</label>
            <input
              type="text"
              value={documentUrl}
              onChange={(e) => setDocumentUrl(e.target.value)}
              placeholder="https://.../notes.pdf"
              className="w-full p-3 rounded-lg border border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] text-[var(--admin-text)] text-sm"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={isPending}
            className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95"
          >
            <Play className="w-5 h-5" />
            {isPending ? "Broadcasting..." : "Go Live & Broadcast Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
