"use client";

import React, { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";

interface GalleryMediaItem {
  id: string;
  title: string;
  category: string;
  url?: string;
  aspect: string;
  color?: string;
  isPublished: boolean;
  createdAt: string;
}

const initialMedia: GalleryMediaItem[] = [
  { id: "1", title: "Conference Hall Grand Setup", category: "Architecture", aspect: "4/3", color: "from-[#103E79] to-[#218EB6]", isPublished: true, createdAt: "2026-09-10" },
  { id: "2", title: "Stage Design & Lighting", category: "Architecture", aspect: "16/9", color: "from-[#218EB6] to-[#103E79]", isPublished: true, createdAt: "2026-09-11" },
  { id: "3", title: "Arabesque Details & Motifs", category: "Calligraphy", aspect: "1/1", color: "from-[#BA6473] to-[#103E79]", isPublished: true, createdAt: "2026-09-12" },
  { id: "4", title: "Scholarly Discourse Round Table", category: "Gatherings", aspect: "3/2", color: "from-[#103E79] to-[#2B2A29]", isPublished: true, createdAt: "2026-09-13" },
  { id: "5", title: "Islamic Calligraphy Artwork", category: "Calligraphy", aspect: "4/5", color: "from-[#218EB6] to-[#BA6473]", isPublished: false, createdAt: "2026-09-13" },
  { id: "6", title: "Mawlid Gathering Audience", category: "Gatherings", aspect: "16/9", color: "from-[#2B2A29] to-[#103E79]", isPublished: true, createdAt: "2026-09-14" },
  { id: "7", title: "Lamp Brass Detail & Ambient", category: "Heritage", aspect: "3/4", color: "from-[#FFC800]/50 to-[#103E79]", isPublished: true, createdAt: "2026-09-14" },
  { id: "8", title: "Dome Interior Acoustics", category: "Architecture", aspect: "1/1", color: "from-[#103E79] to-[#218EB6]", isPublished: false, createdAt: "2026-09-15" },
];

export default function GalleryManager() {
  const [items, setItems] = useState<GalleryMediaItem[]>(initialMedia);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<GalleryMediaItem | null>(null);

  // New Media Form state
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Architecture");
  const [newUrl, setNewUrl] = useState("");
  const [newAspect, setNewAspect] = useState("16/9");
  const [newPublished, setNewPublished] = useState(true);

  const categories = ["All", "Architecture", "Calligraphy", "Gatherings", "Heritage", "Nature", "Event Day"];

  const filteredItems = items
    .filter((item) => (categoryFilter === "All" ? true : item.category === categoryFilter))
    .sort((a, b) => {
      const tA = new Date(a.createdAt).getTime();
      const tB = new Date(b.createdAt).getTime();
      return sortOrder === "newest" ? tB - tA : tA - tB;
    });

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newItem: GalleryMediaItem = {
      id: String(Date.now()),
      title: newTitle.trim(),
      category: newCategory,
      url: newUrl.trim() || undefined,
      aspect: newAspect,
      color: "from-[var(--color-navy)] to-[var(--color-turquoise)]",
      isPublished: newPublished,
      createdAt: new Date().toISOString().split("T")[0],
    };

    setItems([newItem, ...items]);
    setIsAddOpen(false);
    setNewTitle("");
    setNewUrl("");
  };

  const handleTogglePublish = (id: string) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, isPublished: !it.isPublished } : it))
    );
  };

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gallery Manager</h2>
          <p className="text-gray-500 text-sm mt-1">
            Curate photo collections, exhibition visuals, and public event media
          </p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2 rounded-xl text-sm font-medium bg-[var(--color-navy)] text-white hover:bg-[var(--color-navy)]/90 shadow-sm transition-colors flex items-center gap-2 self-start sm:self-auto"
        >
          <span>＋</span> Add Media
        </button>
      </div>

      {/* Filters bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                categoryFilter === cat
                  ? "bg-[var(--color-navy)] text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>Sort by:</span>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as "newest" | "oldest")}
            className="border border-gray-300 rounded-lg px-2.5 py-1.5 outline-none focus:border-[var(--color-turquoise)] bg-white font-medium text-gray-700"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-shadow group flex flex-col justify-between"
          >
            {/* Visual preview */}
            <div className="relative bg-gray-900 overflow-hidden" style={{ aspectRatio: item.aspect || "16/9" }}>
              {item.url ? (
                <img
                  src={item.url}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div
                  className={`w-full h-full bg-gradient-to-br ${item.color || "from-blue-700 to-indigo-900"} flex items-center justify-center p-4`}
                >
                  <span className="text-white/40 text-xs font-mono select-none text-center">
                    {item.aspect} Preview
                  </span>
                </div>
              )}

              {/* Hover actions */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-xs">
                <button
                  onClick={() => setPreviewItem(item)}
                  className="p-2.5 bg-white/20 hover:bg-white/40 rounded-full text-white backdrop-blur-sm transition-colors"
                  title="Preview"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(item.id, item.title)}
                  className="p-2.5 bg-red-500/80 hover:bg-red-500 rounded-full text-white backdrop-blur-sm transition-colors"
                  title="Delete"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Info & Status */}
            <div className="p-4 space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    {item.category}
                  </span>
                  <button
                    onClick={() => handleTogglePublish(item.id)}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 cursor-pointer transition-colors ${
                      item.isPublished
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        item.isPublished ? "bg-emerald-500" : "bg-amber-500"
                      }`}
                    ></span>
                    {item.isPublished ? "Published" : "Draft"}
                  </button>
                </div>
                <h4 className="text-sm font-semibold text-gray-900 truncate" title={item.title}>
                  {item.title}
                </h4>
              </div>

              <div className="text-[11px] text-gray-400 border-t border-gray-100 pt-2 flex justify-between">
                <span>{item.aspect} ratio</span>
                <span>{item.createdAt}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-500">
          No media items in this category. Click &quot;Add Media&quot; to upload or add.
        </div>
      )}

      {/* Add Media Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="text-lg font-bold text-gray-900">Add Gallery Media</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Title / Caption
                </label>
                <input
                  type="text"
                  placeholder="e.g. Alathoorpadi Dars Inauguration"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg p-2.5 outline-none focus:border-[var(--color-turquoise)]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-lg p-2.5 outline-none focus:border-[var(--color-turquoise)]"
                  >
                    <option value="Architecture">Architecture</option>
                    <option value="Calligraphy">Calligraphy</option>
                    <option value="Gatherings">Gatherings</option>
                    <option value="Heritage">Heritage</option>
                    <option value="Nature">Nature</option>
                    <option value="Event Day">Event Day</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Aspect Ratio
                  </label>
                  <select
                    value={newAspect}
                    onChange={(e) => setNewAspect(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-lg p-2.5 outline-none focus:border-[var(--color-turquoise)]"
                  >
                    <option value="16/9">16:9 Landscape</option>
                    <option value="4/3">4:3 Standard</option>
                    <option value="1/1">1:1 Square</option>
                    <option value="3/4">3:4 Portrait</option>
                    <option value="4/5">4:5 Tall</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Image URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://... or leave empty for geometric backdrop"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg p-2.5 outline-none focus:border-[var(--color-turquoise)]"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="pub-check"
                  checked={newPublished}
                  onChange={(e) => setNewPublished(e.target.checked)}
                  className="w-4 h-4 rounded text-[var(--color-navy)] focus:ring-0"
                />
                <label htmlFor="pub-check" className="text-sm text-gray-700 font-medium">
                  Publish immediately to public gallery
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[var(--color-navy)] text-white rounded-lg text-sm font-medium hover:bg-[var(--color-navy)]/90 transition-colors"
                >
                  Save Media
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
            className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={`w-full ${
                previewItem.url ? "bg-black" : `bg-gradient-to-br ${previewItem.color}`
              } flex items-center justify-center`}
              style={{ aspectRatio: previewItem.aspect }}
            >
              {previewItem.url ? (
                <img src={previewItem.url} alt={previewItem.title} className="max-h-full object-contain" />
              ) : (
                <span className="text-white text-lg font-serif tracking-wider text-center p-6">
                  {previewItem.title}
                </span>
              )}
            </div>
            <div className="p-5 flex justify-between items-center border-t border-gray-100">
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase">{previewItem.category}</span>
                <h3 className="text-base font-bold text-gray-900">{previewItem.title}</h3>
              </div>
              <button
                onClick={() => setPreviewItem(null)}
                className="px-4 py-1.5 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50"
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
