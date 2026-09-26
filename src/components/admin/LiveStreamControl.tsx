"use client";

import React, { useState, useTransition } from "react";
import { updateLiveStream, createStage, removeStage, updateStageFull, updateAllStagesFull } from "@/app/[locale]/admin/actions";
import { X, VideoOff, Plus, Trash2, MapPin, Radio, LayoutDashboard } from "lucide-react";
import { CreateStageModal } from "./CreateStageModal";

interface Stream {
  stage: string;
  name?: string;
  name_ml?: string;
  description?: string;
  location_address?: string;
  map_url?: string;
  embed_url?: string;
  youtube_id: string;
  is_live: boolean;
  current_session_id?: string | null;
}

interface Props {
  initialStreams: Stream[];
  allSessions?: any[];
}

export default function LiveStreamControl({ initialStreams, allSessions = [] }: Props) {
  const [streams, setStreams] = useState<Stream[]>(initialStreams);
  const [isPending, startTransition] = useTransition();
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Editable local state for YouTube IDs, indexed by stage name
  const [videoIds, setVideoIds] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    initialStreams.forEach((s) => {
      initial[s.stage] = s.youtube_id || "";
    });
    return initial;
  });

  const [sessionIds, setSessionIds] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    initialStreams.forEach((s) => {
      initial[s.stage] = s.current_session_id || "";
    });
    return initial;
  });

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Tab state per stage card
  const [activeTabs, setActiveTabs] = useState<Record<string, "location" | "broadcast">>(() => {
    const tabs: Record<string, "location" | "broadcast"> = {};
    initialStreams.forEach((s) => {
      tabs[s.stage] = "location";
    });
    return tabs;
  });

  const [stageProps, setStageProps] = useState<Record<string, any>>(() => {
    const props: Record<string, any> = {};
    initialStreams.forEach(s => { 
      props[s.stage] = {
        name: s.name || "",
        name_ml: s.name_ml || "",
        slug: s.stage,
        location_address: s.location_address || "",
        description: s.description || "",
        map_url: s.map_url || "",
        embed_url: s.embed_url || ""
      }; 
    });
    return props;
  });

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleVideoIdChange = (stageName: string, val: string) => {
    setVideoIds((prev) => ({ ...prev, [stageName]: val }));
  };

  const handleSessionIdChange = (stageName: string, val: string) => {
    setSessionIds((prev) => ({ ...prev, [stageName]: val }));
  };

  const handleToggleLive = (stageName: string) => {
    const current = streams.find((s) => s.stage === stageName);
    const ytId = videoIds[stageName] || "";
    const sessionId = sessionIds[stageName] || null;
    const nextStatus = !current?.is_live;

    startTransition(async () => {
      try {
        await updateLiveStream(stageName, ytId, nextStatus, sessionId);
        setStreams((prev) =>
          prev.map((s) =>
            s.stage === stageName
              ? { ...s, is_live: nextStatus, youtube_id: ytId, current_session_id: sessionId }
              : s
          )
        );
        showToast(`${stageName} is now ${nextStatus ? "LIVE" : "OFFLINE"}`);
      } catch (err: any) {
        showToast(err.message || "Failed to update status", "error");
      }
    });
  };

  const handleSaveAllStages = () => {
    const updates = streams.map(stream => {
      const oldSlug = stream.stage;
      const props = stageProps[oldSlug];
      const ytId = videoIds[oldSlug] || "";
      const sessionId = sessionIds[oldSlug] || null;
      return {
        oldSlug,
        stageData: {
          name: props.name,
          name_ml: props.name_ml,
          slug: props.slug,
          description: props.description,
          location_address: props.location_address,
          map_url: props.map_url,
          embed_url: props.embed_url
        },
        youtubeId: ytId,
        isLive: stream.is_live || false,
        currentSessionId: sessionId
      };
    });
    
    startTransition(async () => {
      try {
        await updateAllStagesFull(updates);
        showToast("All stages saved successfully!");
        window.location.reload();
      } catch (err: any) {
        showToast(err.message || "Failed to save stages", "error");
      }
    });
  };

  const handleAddStage = (stageData: {
    name: string;
    name_ml?: string;
    slug?: string;
    description?: string;
    location_address?: string;
    map_url?: string;
    embed_url?: string;
  }) => {
    startTransition(async () => {
      try {
        await createStage(stageData);
        showToast(`Stage "${stageData.name}" created successfully!`);
        setIsCreateModalOpen(false);
        window.location.reload();
      } catch (err: any) {
        showToast(err.message || "Failed to create stage", "error");
      }
    });
  };

  const handleRemoveStage = (slug: string) => {
    if (!confirm("Are you sure you want to remove this stage entirely? This will also remove its live broadcast settings.")) return;
    startTransition(async () => {
      try {
        await removeStage(slug);
        showToast("Stage removed successfully!");
        window.location.reload();
      } catch (err: any) {
        showToast(err.message || "Failed to remove stage", "error");
      }
    });
  };



  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {notification && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-sm font-medium ${
            notification.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} className="opacity-70 hover:opacity-100">
            <X className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
          </button>
        </div>
      )}

      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[var(--admin-text)]">Unified Stage & Broadcast Center</h2>
          <p className="text-[var(--admin-text-secondary)] text-sm mt-1">
            Manage stage locations, properties, and live broadcast feeds all in one place.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveAllStages}
            disabled={isPending}
            className="bg-[var(--color-navy)] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 flex items-center gap-2 transition-opacity shadow-sm"
          >
            {isPending ? "Saving..." : "Save All Changes"}
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            disabled={isPending}
            className="bg-[var(--color-turquoise)] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 flex items-center gap-2 transition-opacity shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add New Stage
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {streams.map((stream, idx) => {
          const currentId = videoIds[stream.stage] || "";
          const headerColor = stream.is_live ? "bg-red-500" : (idx % 2 === 0 ? "bg-[var(--color-navy)]" : "bg-[var(--color-turquoise)]");
          const activeTab = activeTabs[stream.stage] || "location";
          const props = stageProps[stream.stage] || {};
          
          return (
            <div key={stream.stage} className="bg-[var(--admin-surface)] rounded-2xl border border-[var(--admin-border)] shadow-sm overflow-hidden flex flex-col h-[650px]">
              <div className={`h-2.5 ${headerColor} transition-colors duration-500`}></div>
              
              <div className="p-5 flex-1 flex flex-col overflow-y-auto">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex flex-col flex-1">
                    <h3 className="text-xl font-bold text-[var(--admin-text)]">{props.name || stream.stage}</h3>
                    <p className="text-xs text-[var(--admin-text-muted)] mt-1 font-mono">{stream.stage}</p>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <span
                      className={`px-3 py-1 text-xs font-bold rounded-full flex items-center gap-1.5 transition-colors ${
                        stream.is_live
                          ? "bg-red-100 text-red-700"
                          : "bg-[var(--admin-hover)] text-[var(--admin-text-secondary)]"
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          stream.is_live ? "bg-red-500 animate-pulse" : "bg-gray-400"
                        }`}
                      ></span>
                      {stream.is_live ? "ON AIR" : "OFFLINE"}
                    </span>
                    <button onClick={() => handleRemoveStage(stream.stage)} className="text-red-500 hover:text-red-600 text-xs flex items-center gap-1 opacity-50 hover:opacity-100 transition-opacity mt-1">
                      <Trash2 className="w-3 h-3" /> Remove
                    </button>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex p-1 bg-[var(--admin-surface-alt)] rounded-lg mb-5 shrink-0">
                  <button
                    onClick={() => setActiveTabs({...activeTabs, [stream.stage]: "location"})}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-xs font-semibold transition-colors ${activeTab === "location" ? "bg-[var(--admin-surface)] text-[var(--admin-text)] shadow-sm border border-[var(--admin-border-subtle)]" : "text-[var(--admin-text-secondary)] hover:text-[var(--admin-text)]"}`}
                  >
                    <LayoutDashboard className="w-3 h-3" /> Identity & Location
                  </button>
                  <button
                    onClick={() => setActiveTabs({...activeTabs, [stream.stage]: "broadcast"})}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-xs font-semibold transition-colors ${activeTab === "broadcast" ? "bg-[var(--admin-surface)] text-[var(--admin-text)] shadow-sm border border-[var(--admin-border-subtle)]" : "text-[var(--admin-text-secondary)] hover:text-[var(--admin-text)]"}`}
                  >
                    <Radio className="w-3 h-3" /> Broadcast Control
                  </button>
                </div>

                {/* Tab Content */}
                <div className="flex-1 flex flex-col space-y-4">
                  {activeTab === "location" ? (
                    <>
                      <div>
                        <label className="text-[10px] font-bold text-[var(--admin-text-secondary)] uppercase tracking-wider">Name (English & Malayalam)</label>
                        <div className="flex gap-2 mt-1">
                          <input
                            type="text"
                            value={props.name}
                            onChange={(e) => setStageProps({...stageProps, [stream.stage]: {...props, name: e.target.value}})}
                            className="flex-1 p-2 border border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] text-[var(--admin-text)] rounded-lg text-sm focus:border-[var(--color-turquoise)] outline-none"
                            placeholder="e.g. Main Stage"
                          />
                          <input
                            type="text"
                            value={props.name_ml}
                            onChange={(e) => setStageProps({...stageProps, [stream.stage]: {...props, name_ml: e.target.value}})}
                            className="flex-1 p-2 border border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] text-[var(--admin-text)] rounded-lg text-sm focus:border-[var(--color-turquoise)] outline-none"
                            placeholder="e.g. മെയിൻ സ്റ്റേജ്"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-[var(--admin-text-secondary)] uppercase tracking-wider">Description</label>
                        <textarea
                          value={props.description}
                          onChange={(e) => setStageProps({...stageProps, [stream.stage]: {...props, description: e.target.value}})}
                          className="w-full mt-1 p-2 border border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] text-[var(--admin-text)] rounded-lg text-sm focus:border-[var(--color-turquoise)] outline-none h-16 resize-none"
                          placeholder="Optional description"
                        />
                      </div>

                      <div className="pt-2 border-t border-[var(--admin-border-subtle)]">
                        <label className="text-[10px] font-bold text-[var(--admin-text-secondary)] uppercase tracking-wider">System Identifier (Slug)</label>
                        <input
                          type="text"
                          value={props.slug}
                          onChange={(e) => setStageProps({...stageProps, [stream.stage]: {...props, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')}})}
                          className="w-full mt-1 p-2 border border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] text-[var(--admin-text)] rounded-lg text-sm font-mono focus:border-[var(--color-turquoise)] outline-none"
                          placeholder="e.g. stage1"
                        />
                      </div>

                      <div className="pt-2 border-t border-[var(--admin-border-subtle)]">
                        <label className="text-[10px] font-bold text-[var(--admin-text-secondary)] uppercase tracking-wider">Location / Address</label>
                        <div className="flex items-center gap-2 mt-1 p-2 border border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] rounded-lg focus-within:border-[var(--color-turquoise)]">
                          <MapPin className="w-4 h-4 text-[var(--admin-text-secondary)] shrink-0" />
                          <input
                            type="text"
                            value={props.location_address}
                            onChange={(e) => setStageProps({...stageProps, [stream.stage]: {...props, location_address: e.target.value}})}
                            className="bg-transparent outline-none text-[var(--admin-text)] text-sm w-full"
                            placeholder="e.g. Main Auditorium, Ground Floor"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-[var(--admin-text-secondary)] uppercase tracking-wider">Map Embed URL (Iframe Src)</label>
                        <input
                          type="text"
                          value={props.embed_url}
                          onChange={(e) => setStageProps({...stageProps, [stream.stage]: {...props, embed_url: e.target.value}})}
                          className="w-full mt-1 p-2 border border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] text-[var(--admin-text)] rounded-lg text-xs font-mono focus:border-[var(--color-turquoise)] outline-none"
                          placeholder="https://maps.google.com/maps?q=...&output=embed"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-[var(--admin-text-secondary)] uppercase tracking-wider">Google Maps Link (Get Directions)</label>
                        <input
                          type="text"
                          value={props.map_url}
                          onChange={(e) => setStageProps({...stageProps, [stream.stage]: {...props, map_url: e.target.value}})}
                          className="w-full mt-1 p-2 border border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] text-[var(--admin-text)] rounded-lg text-xs font-mono focus:border-[var(--color-turquoise)] outline-none"
                          placeholder="https://maps.google.com/..."
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Video Preview */}
                      <div className="aspect-video bg-gray-950 rounded-xl overflow-hidden mb-2 relative group shadow-inner">
                        {currentId ? (
                          <iframe
                            src={`https://www.youtube-nocookie.com/embed/${currentId}`}
                            title={`${stream.stage} Live Stream`}
                            className="w-full h-full border-0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          ></iframe>
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-gray-600 text-xs font-medium">
                            <VideoOff className="w-6 h-6 mb-2" strokeWidth={1.5} aria-hidden="true" />
                            No Broadcast ID Configured
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-[var(--admin-text-secondary)] uppercase tracking-wider mb-1">
                          YouTube Video ID
                        </label>
                        <div className="flex rounded-lg shadow-xs overflow-hidden border border-[var(--admin-input-border)] focus-within:border-[var(--color-turquoise)]">
                          <span className="inline-flex items-center bg-[var(--admin-surface-alt)] px-3 text-[var(--admin-text-secondary)] text-xs font-mono border-r border-[var(--admin-border)]">
                            watch?v=
                          </span>
                          <input
                            type="text"
                            value={currentId}
                            onChange={(e) => handleVideoIdChange(stream.stage, e.target.value)}
                            placeholder="e.g. X7Xw7dRlGJo"
                            className="block w-full min-w-0 flex-1 px-3 py-2 text-sm outline-none font-mono bg-[var(--admin-input-bg)] text-[var(--admin-text)]"
                          />
                        </div>
                      </div>

                      <div className="pt-4">
                        <label className="block text-[10px] font-bold text-[var(--admin-text-secondary)] uppercase tracking-wider mb-1">
                          Current Event / Session
                        </label>
                        <select
                          value={sessionIds[stream.stage] || ""}
                          onChange={(e) => handleSessionIdChange(stream.stage, e.target.value)}
                          className="w-full p-2 border border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] text-[var(--admin-text)] rounded-lg text-sm focus:border-[var(--color-turquoise)] outline-none"
                        >
                          <option value="">-- No Session Selected --</option>
                          {allSessions.map(session => (
                            <option key={session.id} value={session.id}>
                              {session.title} ({new Date(session.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="pt-4">
                        <div className="flex items-center justify-between p-4 bg-[var(--admin-surface-alt)] rounded-xl border border-[var(--admin-border-subtle)]">
                          <div>
                            <h4 className="text-sm font-bold text-[var(--admin-text)]">Transmission</h4>
                            <p className="text-xs text-[var(--admin-text-secondary)] mt-0.5">
                              {stream.is_live ? "Currently Broadcasting" : "Stream is Offline"}
                            </p>
                          </div>
                          <button
                            onClick={() => handleToggleLive(stream.stage)}
                            disabled={isPending}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              stream.is_live ? "bg-red-600" : "bg-gray-300"
                            }`}
                          >
                            <span
                              className={`inline-block h-5 w-5 transform rounded-full bg-[var(--admin-surface)] shadow-sm ring-0 transition duration-200 ease-in-out ${
                                stream.is_live ? "translate-x-5" : "translate-x-0"
                              }`}
                            ></span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <CreateStageModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleAddStage}
        isSubmitting={isPending}
      />
    </div>
  );
}
