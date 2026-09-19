"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { X, Upload, Trash2, CheckSquare, Square, Edit2, Plus, Eye, EyeOff } from "lucide-react";
import { 
  getGalleryCategories, 
  createGalleryCategory, 
  updateGalleryCategory, 
  deleteGalleryCategory,
  getGalleryMedia,
  uploadGalleryMedia,
  togglePublishGalleryMedia,
  deleteGalleryMedia,
  bulkDeleteGalleryMedia,
  bulkTogglePublishGalleryMedia
} from "@/app/[locale]/admin/gallery-actions";
import imageCompression from 'browser-image-compression';
import { getMediaType, getYouTubeThumbnail, getEmbedUrl } from "@/lib/mediaUtils";
import { InstagramEmbed } from 'react-social-media-embed';

export default function GalleryManager() {
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  
  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isCategoryManageOpen, setIsCategoryManageOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<any | null>(null);

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [progressStatus, setProgressStatus] = useState("");

  // Bulk Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // New Media Form state
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newAspect, setNewAspect] = useState("16/9");
  const [newPublished, setNewPublished] = useState(true);
  const [files, setFiles] = useState<File[]>([]);
  
  // Category Form state
  const [editingCategory, setEditingCategory] = useState<any | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [cats, media] = await Promise.all([
        getGalleryCategories(),
        getGalleryMedia()
      ]);
      setCategories(cats || []);
      if (cats && cats.length > 0 && !newCategory) {
        setNewCategory(cats[0].id);
      }
      setItems(media || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredItems = items
    .filter((item) => (categoryFilter === "All" ? true : item.category?.name === categoryFilter))
    .sort((a, b) => {
      const tA = new Date(a.created_at).getTime();
      const tB = new Date(b.created_at).getTime();
      return sortOrder === "newest" ? tB - tA : tA - tB;
    });

  // --- Category Handlers ---
  const handleCategorySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    
    if (editingCategory) {
      await updateGalleryCategory(editingCategory.id, formData);
      setEditingCategory(null);
    } else {
      await createGalleryCategory(formData);
    }
    
    (e.target as HTMLFormElement).reset();
    await loadData();
    setIsSaving(false);
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!confirm(`Delete category "${name}"? This will delete all associated media!`)) return;
    setIsSaving(true);
    await deleteGalleryCategory(id);
    await loadData();
    setIsSaving(false);
  };

  // --- Media Handlers ---
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0 && !newUrl) return alert("Please select a file or provide a URL.");
    if (!newCategory) return alert("Please select a category.");

    setIsSaving(true);
    setProgressStatus("Preparing upload...");
    
    try {
      if (files.length > 0) {
        // Bulk Upload
        for (let i = 0; i < files.length; i++) {
          let file = files[i];
          
          if (file.type.startsWith('image/')) {
            setProgressStatus(`Compressing image ${i + 1} of ${files.length}...`);
            const options = {
              maxSizeMB: 4.5, // Keep under 5MB limit
              maxWidthOrHeight: 2560, // Keep high quality resolution
              useWebWorker: true,
              initialQuality: 0.9, // High quality output
            };
            try {
              file = await imageCompression(file, options);
            } catch (error) {
              console.error("Image compression error:", error);
            }
          }

          const fd = new FormData();
          fd.append("file", file);
          fd.append("title", files.length > 1 ? `${newTitle} ${i + 1}` : newTitle);
          fd.append("category_id", newCategory);
          fd.append("aspect", newAspect);
          fd.append("is_published", String(newPublished));
          
          setProgressStatus(`Uploading file ${i + 1} of ${files.length}...`);
          await uploadGalleryMedia(fd);
        }
      } else if (newUrl) {
        setProgressStatus("Saving media record...");
        // URL only
        const fd = new FormData();
        fd.append("url", newUrl);
        fd.append("title", newTitle);
        fd.append("category_id", newCategory);
        fd.append("aspect", newAspect);
        fd.append("is_published", String(newPublished));
        
        await uploadGalleryMedia(fd);
      }
      
      setIsAddOpen(false);
      setNewTitle("");
      setNewUrl("");
      setFiles([]);
      setProgressStatus("Reloading gallery...");
      await loadData();
    } catch (error) {
      console.error(error);
      alert("Failed to upload media.");
    } finally {
      setIsSaving(false);
      setProgressStatus("");
    }
  };

  const handleTogglePublish = async (id: string, current: boolean) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, is_published: !current } : it)));
    await togglePublishGalleryMedia(id, current);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    setItems((prev) => prev.filter((it) => it.id !== id));
    await deleteGalleryMedia(id);
  };

  // --- Bulk Handlers ---
  const toggleSelection = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const selectAll = () => {
    if (selectedIds.size === filteredItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredItems.map(i => i.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedIds.size} selected items?`)) return;
    setIsSaving(true);
    await bulkDeleteGalleryMedia(Array.from(selectedIds));
    setSelectedIds(new Set());
    await loadData();
    setIsSaving(false);
  };

  const handleBulkPublish = async (status: boolean) => {
    setIsSaving(true);
    await bulkTogglePublishGalleryMedia(Array.from(selectedIds), status);
    setSelectedIds(new Set());
    await loadData();
    setIsSaving(false);
  };

  if (isLoading) {
    return <div className="p-8 text-center text-[var(--admin-text-secondary)]">Loading Gallery...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--admin-text)]">Gallery Manager</h2>
          <p className="text-[var(--admin-text-secondary)] text-sm mt-1">
            Curate photo collections, exhibition visuals, and public event media
          </p>
        </div>
        <div className="flex gap-2 self-start sm:self-auto">
          <button
            onClick={() => setIsCategoryManageOpen(true)}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-[var(--admin-surface)] text-[var(--admin-text)] hover:bg-[var(--admin-hover)] border border-[var(--admin-border)] shadow-sm transition-colors flex items-center gap-2"
          >
            Manage Categories
          </button>
          <button
            onClick={() => setIsAddOpen(true)}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-[var(--color-navy)] text-white hover:bg-[var(--color-navy)]/90 shadow-sm transition-colors flex items-center gap-2"
          >
            <Upload className="w-4 h-4" /> Add Media
          </button>
        </div>
      </div>

      {/* Bulk Actions & Filters */}
      <div className="bg-[var(--admin-surface)] p-4 rounded-2xl border border-[var(--admin-border)] shadow-sm flex flex-col lg:flex-row gap-4 justify-between items-center">
        
        {/* Categories */}
        <div className="flex flex-wrap gap-2 flex-1">
          <button
            onClick={() => setCategoryFilter("All")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              categoryFilter === "All" ? "bg-[var(--color-navy)] text-white" : "text-[var(--admin-text-secondary)] hover:bg-[var(--admin-hover)]"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.name)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                categoryFilter === cat.name
                  ? "bg-[var(--color-navy)] text-white"
                  : "text-[var(--admin-text-secondary)] hover:bg-[var(--admin-hover)]"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Bulk Actions */}
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20">
            <span className="text-xs font-bold text-amber-700 dark:text-amber-500">{selectedIds.size} Selected</span>
            <div className="h-4 w-px bg-amber-500/30 mx-1"></div>
            <button onClick={() => handleBulkPublish(true)} className="text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 px-2 py-1 rounded transition-colors" title="Publish Selected"><Eye className="w-4 h-4"/></button>
            <button onClick={() => handleBulkPublish(false)} className="text-xs font-medium text-[var(--admin-text-secondary)] hover:bg-[var(--admin-hover)] px-2 py-1 rounded transition-colors" title="Unpublish Selected"><EyeOff className="w-4 h-4"/></button>
            <button onClick={handleBulkDelete} className="text-xs font-medium text-red-700 dark:text-red-400 hover:bg-red-500/20 px-2 py-1 rounded transition-colors" title="Delete Selected"><Trash2 className="w-4 h-4"/></button>
          </div>
        )}

        <div className="flex items-center gap-4 text-xs text-[var(--admin-text-secondary)] shrink-0">
          <button onClick={selectAll} className="flex items-center gap-1 hover:text-[var(--admin-text)] transition-colors">
            {selectedIds.size === filteredItems.length && filteredItems.length > 0 ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
            Select All
          </button>
          <div className="flex items-center gap-2">
            <span>Sort by:</span>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as "newest" | "oldest")}
              className="border border-[var(--admin-input-border)] rounded-lg px-2.5 py-1.5 outline-none focus:border-[var(--color-turquoise)] bg-[var(--admin-input-bg)] font-medium text-[var(--admin-text)]"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {filteredItems.map((item) => {
          const mediaType = getMediaType(item.url);
          const ytThumb = mediaType === 'youtube' ? getYouTubeThumbnail(item.url) : null;
          
          return (
          <div
            key={item.id}
            className={`bg-[var(--admin-surface)] border rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-shadow group flex flex-col justify-between relative ${selectedIds.has(item.id) ? 'border-amber-400 ring-2 ring-amber-400/20' : 'border-[var(--admin-border)]'}`}
          >
            {/* Selection Overlay */}
            <div 
              className="absolute top-2 left-2 z-10 cursor-pointer"
              onClick={(e) => { e.stopPropagation(); toggleSelection(item.id); }}
            >
              {selectedIds.has(item.id) ? (
                <CheckSquare className="w-6 h-6 text-amber-500 bg-white rounded" />
              ) : (
                <Square className="w-6 h-6 text-white bg-black/30 rounded opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </div>

            {/* Visual preview */}
            <div className="relative bg-gray-900 overflow-hidden" style={{ aspectRatio: item.aspect || "16/9" }}>
              {mediaType === 'video' ? (
                <video
                  src={item.url}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  muted
                  playsInline
                />
              ) : mediaType === 'youtube' && ytThumb ? (
                <img
                  src={ytThumb}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : item.url ? (
                <img
                  src={item.url}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div
                  className={`w-full h-full bg-gradient-to-br ${item.color || "from-[#103E79] to-[#218EB6]"} flex items-center justify-center p-4`}
                >
                  <span className="text-white/40 text-xs font-mono select-none text-center">
                    {item.aspect} Preview
                  </span>
                </div>
              )}

              {/* Hover actions */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-xs pointer-events-none">
                <button
                  onClick={(e) => { e.stopPropagation(); setPreviewItem(item); }}
                  className="p-2.5 bg-white/20 hover:bg-white/40 rounded-full text-white backdrop-blur-sm transition-colors pointer-events-auto"
                  title="Preview"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(item.id, item.title); }}
                  className="p-2.5 bg-red-500/80 hover:bg-red-500 rounded-full text-white backdrop-blur-sm transition-colors pointer-events-auto"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Info & Status */}
            <div className="p-4 space-y-3 bg-[var(--admin-surface)]">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[11px] font-bold text-[var(--admin-text-muted)] uppercase tracking-wider">
                    {item.category?.name || "Uncategorized"}
                  </span>
                  <button
                    onClick={() => handleTogglePublish(item.id, item.is_published)}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 cursor-pointer transition-colors ${
                      item.is_published
                        ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        item.is_published ? "bg-emerald-500" : "bg-amber-500"
                      }`}
                    ></span>
                    {item.is_published ? "Published" : "Draft"}
                  </button>
                </div>
                <h4 className="text-sm font-semibold text-[var(--admin-text)] truncate" title={item.title}>
                  {item.title}
                </h4>
              </div>

              <div className="text-[11px] text-[var(--admin-text-muted)] border-t border-[var(--admin-border)] pt-2 flex justify-between">
                <span>{item.aspect} ratio</span>
                <span>{new Date(item.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        )})}
      </div>

      {filteredItems.length === 0 && (
        <div className="bg-[var(--admin-surface)] rounded-2xl border border-[var(--admin-border)] p-12 text-center text-[var(--admin-text-secondary)]">
          No media items in this category. Click &quot;Add Media&quot; to upload or add.
        </div>
      )}

      {/* Manage Categories Modal */}
      {isCategoryManageOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--admin-surface)] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-[var(--admin-border)]">
             <div className="flex justify-between items-center border-b border-[var(--admin-border)] pb-3">
              <h3 className="text-lg font-bold text-[var(--admin-text)]">Manage Categories</h3>
              <button onClick={() => { setIsCategoryManageOpen(false); setEditingCategory(null); }} className="text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]">
                <X className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>
            
            <form onSubmit={handleCategorySubmit} className="flex gap-2">
              <input 
                type="text" 
                name="name"
                placeholder="New category name" 
                defaultValue={editingCategory?.name || ""}
                required
                className="flex-1 text-sm border border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] text-[var(--admin-text)] rounded-lg p-2.5 outline-none focus:border-[var(--color-turquoise)]"
              />
              <button 
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 bg-[var(--color-navy)] text-white rounded-lg text-sm font-medium hover:bg-[var(--color-navy)]/90 disabled:opacity-50"
              >
                {editingCategory ? "Update" : "Add"}
              </button>
              {editingCategory && (
                <button type="button" onClick={() => setEditingCategory(null)} className="px-3 py-2 bg-[var(--admin-surface-alt)] border border-[var(--admin-border)] text-[var(--admin-text)] rounded-lg text-sm">Cancel</button>
              )}
            </form>
            
            <div className="max-h-60 overflow-y-auto mt-4 space-y-2 border border-[var(--admin-border)] rounded-lg p-2">
              {categories.map(cat => (
                <div key={cat.id} className="flex justify-between items-center p-2 hover:bg-[var(--admin-hover)] rounded-lg group">
                  <span className="text-sm font-medium text-[var(--admin-text)]">{cat.name}</span>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setEditingCategory(cat)} className="text-blue-500 hover:bg-blue-500/10 p-1 rounded"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDeleteCategory(cat.id, cat.name)} className="text-red-500 hover:bg-red-500/10 p-1 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
              {categories.length === 0 && <p className="text-xs text-[var(--admin-text-muted)] p-2 text-center">No categories yet.</p>}
            </div>
          </div>
        </div>
      )}

      {/* Add Media Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--admin-surface)] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-[var(--admin-border)]">
            <div className="flex justify-between items-center border-b border-[var(--admin-border)] pb-3">
              <h3 className="text-lg font-bold text-[var(--admin-text)]">Add Gallery Media</h3>
              <button onClick={() => { setIsAddOpen(false); setFiles([]); setNewUrl(""); }} className="text-[var(--admin-text-muted)] hover:text-[var(--admin-text)]">
                <X className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--admin-text-secondary)] uppercase tracking-wider mb-1">
                  Upload File(s)
                </label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-[var(--admin-border)] border-dashed rounded-lg cursor-pointer bg-[var(--admin-surface-alt)] hover:bg-[var(--admin-hover)] transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-6 h-6 text-[var(--admin-text-muted)] mb-2" />
                      <p className="text-xs text-[var(--admin-text-secondary)]"><span className="font-semibold">Click to upload</span> (Multi-select allowed)</p>
                    </div>
                    <input 
                      type="file" 
                      className="hidden" 
                      multiple 
                      accept="image/*,video/*"
                      onChange={(e) => {
                        if (e.target.files) {
                          setFiles(Array.from(e.target.files));
                          setNewUrl(""); // clear URL if files selected
                        }
                      }} 
                    />
                  </label>
                </div>
                {files.length > 0 && (
                  <p className="text-xs text-emerald-500 mt-1 font-medium">{files.length} file(s) selected.</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--admin-text-secondary)] uppercase tracking-wider mb-1">
                  Or Provide Image URL
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={newUrl}
                  disabled={files.length > 0}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full text-sm border border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] text-[var(--admin-text)] rounded-lg p-2.5 outline-none focus:border-[var(--color-turquoise)] disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--admin-text-secondary)] uppercase tracking-wider mb-1">
                  Title / Caption (Prefix for bulk)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Alathoorpadi Dars Inauguration"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full text-sm border border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] text-[var(--admin-text)] rounded-lg p-2.5 outline-none focus:border-[var(--color-turquoise)]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--admin-text-secondary)] uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full text-sm border border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] text-[var(--admin-text)] rounded-lg p-2.5 outline-none focus:border-[var(--color-turquoise)]"
                    required
                  >
                    <option value="" disabled>Select category...</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--admin-text-secondary)] uppercase tracking-wider mb-1">
                    Aspect Ratio
                  </label>
                  <select
                    value={newAspect}
                    onChange={(e) => setNewAspect(e.target.value)}
                    className="w-full text-sm border border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] text-[var(--admin-text)] rounded-lg p-2.5 outline-none focus:border-[var(--color-turquoise)]"
                  >
                    <option value="16/9">16:9 Landscape</option>
                    <option value="4/3">4:3 Standard</option>
                    <option value="1/1">1:1 Square</option>
                    <option value="3/4">3:4 Portrait</option>
                    <option value="4/5">4:5 Tall</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="pub-check"
                  checked={newPublished}
                  onChange={(e) => setNewPublished(e.target.checked)}
                  className="w-4 h-4 rounded text-[var(--color-navy)] border-[var(--admin-input-border)] focus:ring-0 bg-[var(--admin-input-bg)]"
                />
                <label htmlFor="pub-check" className="text-sm text-[var(--admin-text)] font-medium">
                  Publish immediately to public gallery
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-[var(--admin-border)]">
                <button
                  type="button"
                  onClick={() => { setIsAddOpen(false); setFiles([]); setNewUrl(""); }}
                  className="px-4 py-2 border border-[var(--admin-border)] text-[var(--admin-text)] rounded-lg text-sm hover:bg-[var(--admin-hover)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving || (files.length === 0 && !newUrl)}
                  className="px-5 py-2 bg-[var(--color-navy)] text-white rounded-lg text-sm font-medium hover:bg-[var(--color-navy)]/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      {progressStatus || "Saving..."}
                    </>
                  ) : (
                    "Save Media"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox Preview Modal */}
      {previewItem && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setPreviewItem(null)}
        >
          <div
            className="bg-[var(--admin-surface)] rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={`w-full ${
                previewItem.url ? "bg-black" : `bg-gradient-to-br ${previewItem.color}`
              } flex items-center justify-center relative`}
              style={{ aspectRatio: previewItem.aspect }}
            >
              {(() => {
                const type = getMediaType(previewItem.url);
                if (type === 'video') {
                  return <video src={previewItem.url} controls className="w-full h-full object-contain" autoPlay />;
                } else if (type === 'youtube' || type === 'vimeo') {
                  const embedUrl = getEmbedUrl(previewItem.url, type);
                  return (
                    <iframe
                      src={embedUrl}
                      title={previewItem.title || "Embedded video"}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  );
                } else if (type === 'instagram') {
                  return <div className="max-w-[400px] max-h-full overflow-y-auto bg-[var(--admin-surface)] rounded-xl shadow-2xl p-4"><InstagramEmbed url={previewItem.url} width="100%" /></div>;
                } else if (previewItem.url) {
                  return <img src={previewItem.url} alt={previewItem.title} className="max-h-full object-contain" />;
                } else {
                  return <span className="text-white text-lg font-serif tracking-wider text-center p-6">{previewItem.title}</span>;
                }
              })()}
            </div>
            <div className="p-5 flex justify-between items-center border-t border-[var(--admin-border)]">
              <div>
                <span className="text-xs font-bold text-[var(--admin-text-muted)] uppercase">{previewItem.category?.name || "Uncategorized"}</span>
                <h3 className="text-base font-bold text-[var(--admin-text)]">{previewItem.title}</h3>
              </div>
              <button
                onClick={() => setPreviewItem(null)}
                className="px-4 py-1.5 border border-[var(--admin-border)] rounded-lg text-xs font-medium text-[var(--admin-text)] hover:bg-[var(--admin-hover)] bg-[var(--admin-surface-alt)]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
