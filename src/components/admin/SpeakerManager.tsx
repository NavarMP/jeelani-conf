"use client";

import React, { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Camera, Star, Trash2 } from "lucide-react";

interface Speaker {
  id: string;
  name: string;
  name_ml?: string;
  slug: string;
  title: string;
  bio: string;
  description?: string;
  image_url?: string;
  featured: boolean;
  order_index: number;
}

export default function SpeakerManager() {
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingSpeaker, setEditingSpeaker] = useState<Speaker | null>(null);
  const [isUploading, setIsUploading] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const fetchSpeakers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("speakers")
        .select("*")
        .order("order_index", { ascending: true });
      if (error) throw error;
      setSpeakers(data || []);
    } catch (err) {
      console.error("Failed to fetch speakers:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSpeakers();
  }, []);

  const handlePhotoUpload = async (speakerId: string, file: File) => {
    setIsUploading(speakerId);
    try {
      const ext = file.name.split(".").pop();
      const filePath = `${speakerId}.${ext}`;

      // Delete old photo if exists
      await supabase.storage.from("speaker-photos").remove([filePath]);

      // Upload new
      const { error: uploadError } = await supabase.storage
        .from("speaker-photos")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("speaker-photos")
        .getPublicUrl(filePath);

      // Update speaker record
      const { error: updateError } = await supabase
        .from("speakers")
        .update({ image_url: urlData.publicUrl, updated_at: new Date().toISOString() })
        .eq("id", speakerId);

      if (updateError) throw updateError;

      setSpeakers((prev) =>
        prev.map((s) => (s.id === speakerId ? { ...s, image_url: urlData.publicUrl } : s))
      );
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Failed to upload photo. Check console.");
    } finally {
      setIsUploading(null);
    }
  };

  const handleUpdate = async (id: string, updates: Partial<Speaker>) => {
    try {
      const { error } = await supabase
        .from("speakers")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
      setSpeakers((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
      setEditingSpeaker(null);
    } catch (err) {
      console.error("Update failed:", err);
      alert("Failed to update speaker.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this speaker? This will also remove them from all sessions.")) return;
    try {
      const { error } = await supabase.from("speakers").delete().eq("id", id);
      if (error) throw error;
      setSpeakers((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete speaker.");
    }
  };

  const handleAddSpeaker = async () => {
    try {
      const slug = `speaker-${Date.now()}`;
      const { data, error } = await supabase
        .from("speakers")
        .insert({
          name: "New Speaker",
          slug,
          title: "Speaker",
          bio: "",
          order_index: speakers.length + 1,
        })
        .select()
        .single();
      if (error) throw error;
      if (data) {
        setSpeakers((prev) => [...prev, data]);
        setEditingSpeaker(data);
      }
    } catch (err) {
      console.error("Failed to add speaker:", err);
      alert("Failed to add speaker.");
    }
  };

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading speakers...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Speaker Management</h2>
          <p className="text-gray-500 text-sm mt-1">
            Manage speakers, upload photos, and edit details. Changes sync with schedule and sessions.
          </p>
        </div>
        <button
          onClick={handleAddSpeaker}
          className="px-4 py-2 rounded-xl text-sm font-medium bg-[var(--color-navy)] text-white hover:bg-[var(--color-navy)]/90 shadow-sm transition-colors"
        >
          + Add Speaker
        </button>
      </div>

      {/* Speakers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {speakers.map((speaker) => (
          <div
            key={speaker.id}
            className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Photo Section */}
            <div className="relative h-44 bg-gradient-to-br from-[var(--color-navy)] to-[var(--color-turquoise)] flex items-center justify-center">
              {speaker.image_url ? (
                <img
                  src={speaker.image_url}
                  alt={speaker.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg viewBox="0 0 80 80" className="w-20 h-20 text-white/30" fill="currentColor">
                  <circle cx="40" cy="28" r="14" />
                  <path d="M15 72 Q15 50 40 45 Q65 50 65 72 Z" />
                </svg>
              )}

              {/* Upload overlay */}
              <label className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/40 transition-colors cursor-pointer group">
                <span className="opacity-0 group-hover:opacity-100 text-white text-xs font-medium bg-black/60 px-3 py-1.5 rounded-full transition-opacity flex items-center gap-1.5">
                  {isUploading === speaker.id ? (
                    "Uploading..."
                  ) : (
                    <>
                      <Camera className="w-3.5 h-3.5" strokeWidth={2} aria-hidden="true" /> Upload Photo
                    </>
                  )}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={isUploading === speaker.id}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handlePhotoUpload(speaker.id, file);
                    e.target.value = "";
                  }}
                />
              </label>

              {/* Featured badge */}
              {speaker.featured && (
                <span className="absolute top-2 right-2 px-2 py-0.5 bg-[var(--color-brass)] text-white text-[10px] font-bold rounded-full">
                  Featured
                </span>
              )}
            </div>

            {/* Details */}
            <div className="p-4">
              {editingSpeaker?.id === speaker.id ? (
                <EditSpeakerForm
                  speaker={editingSpeaker}
                  onSave={(updates) => handleUpdate(speaker.id, updates)}
                  onCancel={() => setEditingSpeaker(null)}
                />
              ) : (
                <>
                  <h3 className="font-bold text-gray-900 text-sm">{speaker.name}</h3>
                  {speaker.name_ml && (
                    <p className="text-xs text-gray-500 mt-0.5">{speaker.name_ml}</p>
                  )}
                  <p className="text-xs text-[var(--color-turquoise)] font-medium mt-1">
                    {speaker.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-2 line-clamp-2">{speaker.bio}</p>

                  <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => setEditingSpeaker(speaker)}
                      className="flex-1 py-1.5 text-xs font-medium text-[var(--color-navy)] bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() =>
                        handleUpdate(speaker.id, { featured: !speaker.featured })
                      }
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                        speaker.featured
                          ? "bg-[var(--color-brass)]/10 text-[var(--color-brass)]"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                    >
                      <Star className="w-3.5 h-3.5" strokeWidth={2} fill={speaker.featured ? "currentColor" : "none"} aria-hidden="true" />
                    </button>
                    <button
                      onClick={() => handleDelete(speaker.id)}
                      className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" strokeWidth={2} aria-hidden="true" />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {speakers.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
          No speakers found. Add speakers to get started.
        </div>
      )}

      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" />
    </div>
  );
}

function EditSpeakerForm({
  speaker,
  onSave,
  onCancel,
}: {
  speaker: Speaker;
  onSave: (updates: Partial<Speaker>) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    name: speaker.name,
    name_ml: speaker.name_ml || "",
    title: speaker.title,
    bio: speaker.bio || "",
    description: speaker.description || "",
  });

  const inputClass =
    "w-full px-3 py-2 border border-gray-300 rounded-lg text-xs outline-none focus:border-[var(--color-turquoise)] focus:ring-1 focus:ring-[var(--color-turquoise)]/30";

  return (
    <div className="space-y-2">
      <input
        type="text"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        placeholder="Name (EN)"
        className={inputClass}
      />
      <input
        type="text"
        value={form.name_ml}
        onChange={(e) => setForm({ ...form, name_ml: e.target.value })}
        placeholder="Name (ML)"
        className={inputClass}
      />
      <input
        type="text"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        placeholder="Title / Role"
        className={inputClass}
      />
      <textarea
        value={form.bio}
        onChange={(e) => setForm({ ...form, bio: e.target.value })}
        placeholder="Short bio"
        rows={2}
        className={`${inputClass} resize-none`}
      />
      <textarea
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        placeholder="Detailed description"
        rows={2}
        className={`${inputClass} resize-none`}
      />
      <div className="flex gap-2">
        <button
          onClick={() => onSave(form)}
          className="flex-1 py-1.5 text-xs font-medium bg-[var(--color-turquoise)] text-white rounded-lg hover:bg-[var(--color-turquoise)]/90 transition-colors"
        >
          Save
        </button>
        <button
          onClick={onCancel}
          className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
