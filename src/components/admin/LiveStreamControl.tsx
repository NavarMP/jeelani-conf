"use client";

import React, { useState, useTransition } from "react";
import { updateLiveStream } from "@/app/[locale]/admin/actions";
import { X, VideoOff } from "lucide-react";

interface Stream {
  stage: string;
  name?: string;
  youtube_id: string;
  is_live: boolean;
}

interface Props {
  initialStreams: Stream[];
}

export default function LiveStreamControl({ initialStreams }: Props) {
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

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleVideoIdChange = (stageName: string, val: string) => {
    setVideoIds((prev) => ({ ...prev, [stageName]: val }));
  };

  const handleToggleLive = (stageName: string) => {
    const current = streams.find((s) => s.stage === stageName);
    const ytId = videoIds[stageName] || "";
    const nextStatus = !current?.is_live;

    startTransition(async () => {
      try {
        await updateLiveStream(stageName, ytId, nextStatus);
        setStreams((prev) =>
          prev.map((s) =>
            s.stage === stageName
              ? { ...s, is_live: nextStatus, youtube_id: ytId }
              : s
          )
        );
        showToast(`${stageName} is now ${nextStatus ? "LIVE" : "OFFLINE"}`);
      } catch (err: any) {
        showToast(err.message || "Failed to update status", "error");
      }
    });
  };

  const handleSaveVideoId = (stageName: string) => {
    const current = streams.find((s) => s.stage === stageName);
    const ytId = videoIds[stageName] || "";

    startTransition(async () => {
      try {
        await updateLiveStream(stageName, ytId, current?.is_live || false);
        setStreams((prev) =>
          prev.map((s) =>
            s.stage === stageName
              ? { ...s, youtube_id: ytId }
              : s
          )
        );
        showToast(`Saved YouTube ID for ${stageName}`);
      } catch (err: any) {
        showToast(err.message || "Failed to save ID", "error");
      }
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
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

      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-[var(--admin-text)]">Live Stream Control Center</h2>
          <p className="text-[var(--admin-text-secondary)] text-sm mt-1">
            Manage live broadcast feeds, video IDs, and active transmission status for all stages
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {streams.map((stream, idx) => {
          const currentId = videoIds[stream.stage] || "";
          const headerColor = idx % 2 === 0 ? "bg-[var(--color-navy)]" : "bg-[var(--color-turquoise)]";
          
          return (
            <div key={stream.stage} className="bg-[var(--admin-surface)] rounded-2xl border border-[var(--admin-border)] shadow-sm overflow-hidden flex flex-col">
              <div className={`h-2.5 ${headerColor}`}></div>
              <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-[var(--admin-text)] capitalize">{stream.name || stream.stage.replace("stage", "Stage ")}</h3>
                    </div>
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
                  </div>

                  {/* Video Preview */}
                  <div className="aspect-video bg-gray-950 rounded-xl overflow-hidden mb-6 relative group shadow-inner">
                    {currentId ? (
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${currentId}`}
                        title={`${stream.stage} Live Stream`}
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-[var(--admin-text-secondary)] text-xs">
                        <VideoOff className="w-5 h-5 mb-1" strokeWidth={1.75} aria-hidden="true" />
                        No Video ID Configured
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-[var(--admin-text-secondary)] uppercase tracking-wider mb-1">
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
                          className="block w-full min-w-0 flex-1 px-3 py-2 text-sm outline-none font-mono"
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <div className="flex items-center justify-between p-3 bg-[var(--admin-surface-alt)] rounded-xl border border-[var(--admin-border-subtle)]">
                        <div>
                          <h4 className="text-sm font-semibold text-[var(--admin-text)]">Broadcast</h4>
                          <p className="text-xs text-[var(--admin-text-secondary)]">
                            {stream.is_live ? "Visible" : "Hidden"}
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
                  </div>
                </div>

                <div className="pt-4 border-t border-[var(--admin-border-subtle)]">
                  <button
                    onClick={() => handleSaveVideoId(stream.stage)}
                    disabled={isPending}
                    className="w-full bg-[var(--color-navy)] text-white rounded-xl py-2.5 text-sm font-medium hover:bg-[var(--color-navy)]/90 transition-colors shadow-sm disabled:opacity-50 capitalize"
                  >
                    {isPending ? "Saving..." : `Save ${stream.name || stream.stage.replace("stage", "Stage ")}`}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
