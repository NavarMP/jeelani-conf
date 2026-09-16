"use client";

import React, { useState, useTransition } from "react";
import { updateLiveStream } from "@/app/[locale]/admin/actions";
import { X, VideoOff } from "lucide-react";

interface Stream {
  stage: string;
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

  // Editable local state for YouTube IDs
  const [stage1Id, setStage1Id] = useState(
    streams.find((s) => s.stage.toLowerCase().includes("1"))?.youtube_id || ""
  );
  const [stage2Id, setStage2Id] = useState(
    streams.find((s) => s.stage.toLowerCase().includes("2"))?.youtube_id || ""
  );

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const getStream = (stageNum: number) => {
    return streams.find((s) => s.stage.toLowerCase().includes(String(stageNum)));
  };

  const handleToggleLive = (stageNum: number) => {
    const current = getStream(stageNum);
    const stageName = stageNum === 1 ? "Stage 1" : "Stage 2";
    const ytId = stageNum === 1 ? stage1Id : stage2Id;
    const nextStatus = !current?.is_live;

    startTransition(async () => {
      try {
        await updateLiveStream(stageName, ytId, nextStatus);
        setStreams((prev) =>
          prev.map((s) =>
            s.stage.toLowerCase().includes(String(stageNum))
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

  const handleSaveVideoId = (stageNum: number) => {
    const current = getStream(stageNum);
    const stageName = stageNum === 1 ? "Stage 1" : "Stage 2";
    const ytId = stageNum === 1 ? stage1Id : stage2Id;

    startTransition(async () => {
      try {
        await updateLiveStream(stageName, ytId, current?.is_live || false);
        setStreams((prev) =>
          prev.map((s) =>
            s.stage.toLowerCase().includes(String(stageNum))
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

  const s1 = getStream(1);
  const s2 = getStream(2);

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
          <h2 className="text-2xl font-bold text-gray-900">Live Stream Control Center</h2>
          <p className="text-gray-500 text-sm mt-1">
            Manage live broadcast feeds, video IDs, and active transmission status for the conference
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Stage 1 Control */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <div className="h-2.5 bg-[var(--color-navy)]"></div>
          <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Stage 1 (Main Hall)</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Grand Assembly & Major Keynotes</p>
                </div>
                <span
                  className={`px-3 py-1 text-xs font-bold rounded-full flex items-center gap-1.5 transition-colors ${
                    s1?.is_live
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      s1?.is_live ? "bg-red-500 animate-pulse" : "bg-gray-400"
                    }`}
                  ></span>
                  {s1?.is_live ? "ON AIR" : "OFFLINE"}
                </span>
              </div>

              {/* Video Preview */}
              <div className="aspect-video bg-gray-950 rounded-xl overflow-hidden mb-6 relative group shadow-inner">
                {stage1Id ? (
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${stage1Id}`}
                    title="Stage 1 Live Stream"
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 text-xs">
                    <VideoOff className="w-5 h-5 mb-1" strokeWidth={1.75} aria-hidden="true" />
                    No Video ID Configured
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    YouTube Video ID or Key
                  </label>
                  <div className="flex rounded-lg shadow-xs overflow-hidden border border-gray-300 focus-within:border-[var(--color-turquoise)]">
                    <span className="inline-flex items-center bg-gray-50 px-3 text-gray-500 text-xs font-mono border-r border-gray-200">
                      watch?v=
                    </span>
                    <input
                      type="text"
                      value={stage1Id}
                      onChange={(e) => setStage1Id(e.target.value)}
                      placeholder="e.g. X7Xw7dRlGJo"
                      className="block w-full min-w-0 flex-1 px-3 py-2 text-sm outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">Broadcast Transmission</h4>
                      <p className="text-xs text-gray-500">
                        {s1?.is_live ? "Stream is visible on homepage" : "Stream is hidden from public"}
                      </p>
                    </div>
                    <button
                      onClick={() => handleToggleLive(1)}
                      disabled={isPending}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        s1?.is_live ? "bg-red-600" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          s1?.is_live ? "translate-x-5" : "translate-x-0"
                        }`}
                      ></span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <button
                onClick={() => handleSaveVideoId(1)}
                disabled={isPending}
                className="w-full bg-[var(--color-navy)] text-white rounded-xl py-2.5 text-sm font-medium hover:bg-[var(--color-navy)]/90 transition-colors shadow-sm disabled:opacity-50"
              >
                {isPending ? "Saving..." : "Save Stage 1 Settings"}
              </button>
            </div>
          </div>
        </div>

        {/* Stage 2 Control */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <div className="h-2.5 bg-[var(--color-turquoise)]"></div>
          <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Stage 2 (Academic Hall)</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Astronomy & AI Fiqh</p>
                </div>
                <span
                  className={`px-3 py-1 text-xs font-bold rounded-full flex items-center gap-1.5 transition-colors ${
                    s2?.is_live
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      s2?.is_live ? "bg-red-500 animate-pulse" : "bg-gray-400"
                    }`}
                  ></span>
                  {s2?.is_live ? "ON AIR" : "OFFLINE"}
                </span>
              </div>

              {/* Video Preview */}
              <div className="aspect-video bg-gray-950 rounded-xl overflow-hidden mb-6 relative group shadow-inner">
                {stage2Id ? (
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${stage2Id}`}
                    title="Stage 2 Live Stream"
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 text-xs">
                    <VideoOff className="w-5 h-5 mb-1" strokeWidth={1.75} aria-hidden="true" />
                    No Video ID Configured
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    YouTube Video ID or Key
                  </label>
                  <div className="flex rounded-lg shadow-xs overflow-hidden border border-gray-300 focus-within:border-[var(--color-turquoise)]">
                    <span className="inline-flex items-center bg-gray-50 px-3 text-gray-500 text-xs font-mono border-r border-gray-200">
                      watch?v=
                    </span>
                    <input
                      type="text"
                      value={stage2Id}
                      onChange={(e) => setStage2Id(e.target.value)}
                      placeholder="e.g. Ycwr1oqQpv0"
                      className="block w-full min-w-0 flex-1 px-3 py-2 text-sm outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">Broadcast Transmission</h4>
                      <p className="text-xs text-gray-500">
                        {s2?.is_live ? "Stream is visible on homepage" : "Stream is hidden from public"}
                      </p>
                    </div>
                    <button
                      onClick={() => handleToggleLive(2)}
                      disabled={isPending}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        s2?.is_live ? "bg-red-600" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          s2?.is_live ? "translate-x-5" : "translate-x-0"
                        }`}
                      ></span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <button
                onClick={() => handleSaveVideoId(2)}
                disabled={isPending}
                className="w-full bg-[var(--color-navy)] text-white rounded-xl py-2.5 text-sm font-medium hover:bg-[var(--color-navy)]/90 transition-colors shadow-sm disabled:opacity-50"
              >
                {isPending ? "Saving..." : "Save Stage 2 Settings"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
