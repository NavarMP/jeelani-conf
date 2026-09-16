"use client";

import React, { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Camera, Star, Trash2, LayoutGrid, List, Search, ArrowUpDown, CheckSquare } from "lucide-react";
import { revalidateGuestPages } from "@/app/[locale]/admin/actions";

interface Guest {
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

export default function GuestManager() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [isUploading, setIsUploading] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const fetchGuests = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("speakers")
        .select("*")
        .order("order_index", { ascending: true });
      if (error) throw error;
      setGuests(data || []);
    } catch (err) {
      console.error("Failed to fetch guests:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGuests();
  }, []);

  const handlePhotoUpload = async (guestId: string, file: File) => {
    setIsUploading(guestId);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const filePath = `${guestId}-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("speaker-photos")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("speaker-photos")
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      const { error: updateError } = await supabase
        .from("speakers")
        .update({ image_url: publicUrl, updated_at: new Date().toISOString() })
        .eq("id", guestId);

      if (updateError) throw updateError;

      setGuests((prev) =>
        prev.map((s) => (s.id === guestId ? { ...s, image_url: publicUrl } : s))
      );
      await revalidateGuestPages();
    } catch (err: any) {
      console.error("Upload failed:", err);
      alert(err.message ? `Upload failed: ${err.message}` : "Failed to upload photo.");
    } finally {
      setIsUploading(null);
    }
  };

  const handleUpdate = async (id: string, updates: Partial<Guest>) => {
    try {
      const { error } = await supabase
        .from("speakers")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
      setGuests((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
      setEditingGuest(null);
      await revalidateGuestPages();
    } catch (err: any) {
      console.error("Update failed:", err);
      alert(`Failed to update guest: ${err.message || "Check permissions."}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this guest? This will also remove them from all sessions.")) return;
    try {
      const { error } = await supabase.from("speakers").delete().eq("id", id);
      if (error) throw error;
      setGuests((prev) => prev.filter((s) => s.id !== id));
      await revalidateGuestPages();
    } catch (err: any) {
      console.error("Delete failed:", err);
      alert(`Failed to delete guest: ${err.message || "Check permissions."}`);
    }
  };

  const handleAddGuest = async () => {
    try {
      const slug = `guest-${Date.now()}`;
      
      // We pass only required/useful fields. 
      // If there was an issue before, it might be due to a missing required field not present here, 
      // but usually `name` and `slug` are the only ones.
      const payload = {
        name: "New Guest",
        slug,
        title: "Guest Role",
        bio: "",
        order_index: guests.length + 1,
      };

      const { data, error } = await supabase
        .from("speakers")
        .insert(payload)
        .select()
        .single();
        
      if (error) {
        console.error("Insert error details:", error);
        throw error;
      }
      
      if (data) {
        setGuests((prev) => [...prev, data]);
        setEditingGuest(data);
        await revalidateGuestPages();
      }
    } catch (err: any) {
      console.error("Failed to add guest:", err);
      alert(`Failed to add guest: ${err.message || "Check permissions."}`);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Delete ${selectedIds.size} guests?`)) return;
    try {
      const { error } = await supabase.from("speakers").delete().in("id", Array.from(selectedIds));
      if (error) throw error;
      setGuests((prev) => prev.filter((s) => !selectedIds.has(s.id)));
      setSelectedIds(new Set());
      await revalidateGuestPages();
    } catch (err: any) {
      console.error("Bulk delete failed:", err);
      alert("Failed to delete selected guests.");
    }
  };

  const toggleSelection = (id: string) => {
    const newSel = new Set(selectedIds);
    if (newSel.has(id)) newSel.delete(id);
    else newSel.add(id);
    setSelectedIds(newSel);
  };

  const toggleAll = () => {
    if (selectedIds.size === filteredGuests.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredGuests.map((g) => g.id)));
    }
  };

  const moveGuest = async (index: number, direction: -1 | 1) => {
    if (index + direction < 0 || index + direction >= filteredGuests.length) return;
    
    const newGuests = [...filteredGuests];
    const current = newGuests[index];
    const target = newGuests[index + direction];
    
    // Swap order_index
    const currentOrder = current.order_index;
    current.order_index = target.order_index;
    target.order_index = currentOrder;
    
    // Update local state temporarily to feel snappy
    newGuests[index] = target;
    newGuests[index + direction] = current;
    
    // Update DB
    await supabase.from("speakers").upsert([
      { id: current.id, order_index: current.order_index },
      { id: target.id, order_index: target.order_index }
    ]);
    
    fetchGuests();
  };

  const filteredGuests = guests.filter((g) => 
    g.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (g.title && g.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading guests...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Guest Management</h2>
          <p className="text-gray-500 text-sm mt-1">
            Manage guests, speakers, VIPs. Changes sync with schedule and sessions.
          </p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search guests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--color-turquoise)]/20 focus:border-[var(--color-turquoise)] outline-none"
            />
          </div>
          <div className="flex bg-gray-100 rounded-xl p-1 border border-gray-200">
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === "table" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === "grid" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={handleAddGuest}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-[var(--color-navy)] text-white hover:bg-[var(--color-navy)]/90 shadow-sm transition-colors whitespace-nowrap"
          >
            + Add Guest
          </button>
        </div>
      </div>

      {selectedIds.size > 0 && (
        <div className="bg-[var(--color-turquoise)]/10 border border-[var(--color-turquoise)]/20 rounded-xl p-3 flex items-center justify-between">
          <span className="text-sm font-medium text-[var(--color-navy)]">
            {selectedIds.size} selected
          </span>
          <div className="flex gap-2">
            <button
              onClick={handleBulkDelete}
              className="text-xs px-3 py-1.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete Selected
            </button>
          </div>
        </div>
      )}

      {viewMode === "table" ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === filteredGuests.length && filteredGuests.length > 0}
                      onChange={toggleAll}
                      className="rounded text-[var(--color-turquoise)] focus:ring-[var(--color-turquoise)] border-gray-300"
                    />
                  </th>
                  <th className="px-4 py-3 w-16">Reorder</th>
                  <th className="px-4 py-3">Photo</th>
                  <th className="px-4 py-3">Details</th>
                  <th className="px-4 py-3">Featured</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredGuests.map((guest, idx) => (
                  <tr key={guest.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-4 py-3 text-center align-middle">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(guest.id)}
                        onChange={() => toggleSelection(guest.id)}
                        className="rounded text-[var(--color-turquoise)] focus:ring-[var(--color-turquoise)] border-gray-300"
                      />
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <div className="flex flex-col gap-1 items-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => moveGuest(idx, -1)} disabled={idx === 0} className="text-gray-400 hover:text-[var(--color-navy)] disabled:opacity-30"><ArrowUpDown className="w-3 h-3 rotate-180" /></button>
                        <button onClick={() => moveGuest(idx, 1)} disabled={idx === filteredGuests.length - 1} className="text-gray-400 hover:text-[var(--color-navy)] disabled:opacity-30"><ArrowUpDown className="w-3 h-3" /></button>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-100 border border-gray-200">
                        {guest.image_url ? (
                          <img src={guest.image_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400"><Camera className="w-4 h-4" /></div>
                        )}
                        <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 cursor-pointer transition-opacity">
                          <Camera className="w-4 h-4 text-white" />
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handlePhotoUpload(guest.id, e.target.files[0]); }} />
                        </label>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      {editingGuest?.id === guest.id ? (
                        <EditGuestForm guest={editingGuest} onSave={(updates) => handleUpdate(guest.id, updates)} onCancel={() => setEditingGuest(null)} />
                      ) : (
                        <div>
                          <div className="font-bold text-gray-900">{guest.name}</div>
                          {guest.name_ml && <div className="text-xs text-gray-500">{guest.name_ml}</div>}
                          <div className="text-xs text-[var(--color-turquoise)] font-medium mt-0.5">{guest.title}</div>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <button
                        onClick={() => handleUpdate(guest.id, { featured: !guest.featured })}
                        className={`p-1.5 rounded-lg transition-colors ${guest.featured ? "bg-[var(--color-brass)]/10 text-[var(--color-brass)]" : "text-gray-300 hover:text-gray-500"}`}
                      >
                        <Star className="w-4 h-4" fill={guest.featured ? "currentColor" : "none"} />
                      </button>
                    </td>
                    <td className="px-4 py-3 align-middle text-right space-x-2">
                      <button
                        onClick={() => setEditingGuest(guest)}
                        className="text-xs font-medium text-[var(--color-navy)] hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(guest.id)}
                        className="text-xs font-medium text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredGuests.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      No guests found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGuests.map((guest) => (
            <div key={guest.id} className={`bg-white rounded-xl border ${selectedIds.has(guest.id) ? "border-[var(--color-turquoise)] ring-1 ring-[var(--color-turquoise)]/20" : "border-gray-200"} shadow-sm overflow-hidden hover:shadow-md transition-shadow relative`}>
              <div className="absolute top-3 left-3 z-10">
                <input
                  type="checkbox"
                  checked={selectedIds.has(guest.id)}
                  onChange={() => toggleSelection(guest.id)}
                  className="rounded text-[var(--color-turquoise)] focus:ring-[var(--color-turquoise)] border-gray-300 shadow-sm"
                />
              </div>
              <div className="relative h-44 bg-gradient-to-br from-[var(--color-navy)] to-[var(--color-turquoise)] flex items-center justify-center">
                {guest.image_url ? (
                  <img src={guest.image_url} alt={guest.name} className="w-full h-full object-cover" />
                ) : (
                  <svg viewBox="0 0 80 80" className="w-20 h-20 text-white/30" fill="currentColor">
                    <circle cx="40" cy="28" r="14" />
                    <path d="M15 72 Q15 50 40 45 Q65 50 65 72 Z" />
                  </svg>
                )}
                <label className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/40 transition-colors cursor-pointer group">
                  <span className="opacity-0 group-hover:opacity-100 text-white text-xs font-medium bg-black/60 px-3 py-1.5 rounded-full transition-opacity flex items-center gap-1.5">
                    {isUploading === guest.id ? "Uploading..." : <><Camera className="w-3.5 h-3.5" /> Upload Photo</>}
                  </span>
                  <input type="file" accept="image/*" className="hidden" disabled={isUploading === guest.id} onChange={(e) => { if (e.target.files?.[0]) handlePhotoUpload(guest.id, e.target.files[0]); }} />
                </label>
                {guest.featured && (
                  <span className="absolute top-2 right-2 px-2 py-0.5 bg-[var(--color-brass)] text-white text-[10px] font-bold rounded-full">
                    Featured
                  </span>
                )}
              </div>
              <div className="p-4">
                {editingGuest?.id === guest.id ? (
                  <EditGuestForm guest={editingGuest} onSave={(updates) => handleUpdate(guest.id, updates)} onCancel={() => setEditingGuest(null)} />
                ) : (
                  <>
                    <h3 className="font-bold text-gray-900 text-sm">{guest.name}</h3>
                    {guest.name_ml && <p className="text-xs text-gray-500 mt-0.5">{guest.name_ml}</p>}
                    <p className="text-xs text-[var(--color-turquoise)] font-medium mt-1">{guest.title}</p>
                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">{guest.bio}</p>
                    <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                      <button onClick={() => setEditingGuest(guest)} className="flex-1 py-1.5 text-xs font-medium text-[var(--color-navy)] bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Edit</button>
                      <button onClick={() => handleUpdate(guest.id, { featured: !guest.featured })} className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${guest.featured ? "bg-[var(--color-brass)]/10 text-[var(--color-brass)]" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                        <Star className="w-3.5 h-3.5" fill={guest.featured ? "currentColor" : "none"} />
                      </button>
                      <button onClick={() => handleDelete(guest.id)} className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EditGuestForm({ guest, onSave, onCancel }: { guest: Guest; onSave: (u: Partial<Guest>) => void; onCancel: () => void }) {
  const [form, setForm] = useState({ name: guest.name, name_ml: guest.name_ml || "", title: guest.title, bio: guest.bio || "", description: guest.description || "" });
  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-lg text-xs outline-none focus:border-[var(--color-turquoise)] focus:ring-1 focus:ring-[var(--color-turquoise)]/30";
  return (
    <div className="space-y-2">
      <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name (EN)" className={inputClass} />
      <input type="text" value={form.name_ml} onChange={(e) => setForm({ ...form, name_ml: e.target.value })} placeholder="Name (ML)" className={inputClass} />
      <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title / Role" className={inputClass} />
      <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Short bio" rows={2} className={`${inputClass} resize-none`} />
      <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Detailed description" rows={2} className={`${inputClass} resize-none`} />
      <div className="flex gap-2">
        <button onClick={() => onSave(form)} className="flex-1 py-1.5 text-xs font-medium bg-[var(--color-turquoise)] text-white rounded-lg hover:bg-[var(--color-turquoise)]/90 transition-colors">Save</button>
        <button onClick={onCancel} className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
      </div>
    </div>
  );
}
