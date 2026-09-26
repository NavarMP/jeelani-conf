"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Trash2, Edit, ScanLine, Loader2, Save, X } from "lucide-react";

interface QuizLocation {
  id: string;
  name: string;
  slug: string;
  description: string;
  is_active: boolean;
}

export default function QuizLocationsManager() {
  const [locations, setLocations] = useState<QuizLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<QuizLocation>>({});
  const [isCreating, setIsCreating] = useState(false);

  const supabase = createClient();

  const fetchLocations = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("quiz_locations")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (!error && data) {
      setLocations(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleSave = async () => {
    if (isCreating) {
      const { error } = await supabase.from("quiz_locations").insert([
        { 
          name: editForm.name, 
          slug: editForm.slug, 
          description: editForm.description,
          is_active: editForm.is_active ?? true
        }
      ]);
      if (!error) {
        setIsCreating(false);
        setEditForm({});
        fetchLocations();
      }
    } else if (isEditing) {
      const { error } = await supabase
        .from("quiz_locations")
        .update({
          name: editForm.name,
          slug: editForm.slug,
          description: editForm.description,
          is_active: editForm.is_active
        })
        .eq("id", isEditing);
      if (!error) {
        setIsEditing(null);
        setEditForm({});
        fetchLocations();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this location? It will delete associated questions.")) {
      const { error } = await supabase.from("quiz_locations").delete().eq("id", id);
      if (!error) fetchLocations();
    }
  };

  const startEdit = (loc: QuizLocation) => {
    setIsEditing(loc.id);
    setEditForm(loc);
    setIsCreating(false);
  };

  const startCreate = () => {
    setIsCreating(true);
    setIsEditing(null);
    setEditForm({ name: "", slug: "", description: "", is_active: true });
  };

  const generateQRCodeURL = (slug: string) => {
    return `${window.location.origin}/quiz?loc=${slug}`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-turquoise)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Quiz Locations</h2>
          <p className="text-white/60 text-sm">Manage physical spots and their QR codes.</p>
        </div>
        <button
          onClick={startCreate}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--color-turquoise)] hover:bg-[var(--color-turquoise)]/90 text-[var(--color-navy)] font-bold rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Location
        </button>
      </div>

      {(isCreating || isEditing) && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-6">
          <h3 className="text-lg font-bold text-white mb-4">
            {isCreating ? "Create New Location" : "Edit Location"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">Name</label>
              <input 
                type="text" 
                value={editForm.name || ""} 
                onChange={(e) => setEditForm({...editForm, name: e.target.value, slug: isCreating ? e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-') : editForm.slug})}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[var(--color-turquoise)]"
                placeholder="e.g. Main Hall A"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">Slug (URL Parameter)</label>
              <input 
                type="text" 
                value={editForm.slug || ""} 
                onChange={(e) => setEditForm({...editForm, slug: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[var(--color-turquoise)]"
                placeholder="main-hall-a"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider mb-1.5">Description</label>
              <input 
                type="text" 
                value={editForm.description || ""} 
                onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[var(--color-turquoise)]"
              />
            </div>
            <div className="md:col-span-2 flex items-center gap-3">
              <input 
                type="checkbox" 
                id="is_active"
                checked={editForm.is_active || false} 
                onChange={(e) => setEditForm({...editForm, is_active: e.target.checked})}
                className="w-4 h-4 rounded border-white/20 bg-white/5 text-[var(--color-turquoise)] focus:ring-[var(--color-turquoise)]/30"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-white/80">Active (Visible to users)</label>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button 
              onClick={() => { setIsCreating(false); setIsEditing(null); }}
              className="px-4 py-2 rounded-lg font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--color-turquoise)] hover:bg-[var(--color-turquoise)]/90 text-[var(--color-navy)] font-bold rounded-lg transition-colors"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
          </div>
        </div>
      )}

      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="p-4 text-xs font-semibold text-white/50 uppercase tracking-wider">Location</th>
                <th className="p-4 text-xs font-semibold text-white/50 uppercase tracking-wider">URL / QR</th>
                <th className="p-4 text-xs font-semibold text-white/50 uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-semibold text-white/50 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {locations.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-white/40">No locations found. Create one above.</td>
                </tr>
              ) : (
                locations.map((loc) => (
                  <tr key={loc.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-white">{loc.name}</div>
                      <div className="text-xs text-white/50 mt-0.5">{loc.description}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 bg-black/20 rounded px-2 py-1 w-fit border border-white/5">
                        <ScanLine className="w-3.5 h-3.5 text-[var(--color-brass)]" />
                        <code className="text-xs text-white/70">?loc={loc.slug}</code>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${loc.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {loc.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(generateQRCodeURL(loc.slug));
                            alert("URL copied to clipboard!");
                          }}
                          className="p-1.5 rounded-lg text-white/40 hover:text-[var(--color-turquoise)] hover:bg-white/5 transition-colors"
                          title="Copy Link"
                        >
                          <ScanLine className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => startEdit(loc)}
                          className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(loc.id)}
                          className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
