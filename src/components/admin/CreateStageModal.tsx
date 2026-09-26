"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Link as LinkIcon, FileText, LayoutDashboard } from "lucide-react";

interface CreateStageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (stageData: {
    name: string;
    name_ml?: string;
    slug?: string;
    description?: string;
    location_address?: string;
    map_url?: string;
    embed_url?: string;
  }) => void;
  isSubmitting: boolean;
}

export function CreateStageModal({ isOpen, onClose, onSubmit, isSubmitting }: CreateStageModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    name_ml: "",
    slug: "",
    description: "",
    location_address: "",
    map_url: "",
    embed_url: ""
  });

  const [autoGenerateSlug, setAutoGenerateSlug] = useState(true);

  // Auto-generate slug when name changes, if user hasn't manually overridden it
  useEffect(() => {
    if (autoGenerateSlug && formData.name) {
      const generated = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      setFormData(prev => ({ ...prev, slug: generated }));
    }
  }, [formData.name, autoGenerateSlug]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === "slug") {
      setAutoGenerateSlug(false);
      // Sanitize manual slug input
      const sanitized = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
      setFormData(prev => ({ ...prev, [name]: sanitized }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    onSubmit(formData);
  };

  // Reset form when opened
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: "",
        name_ml: "",
        slug: "",
        description: "",
        location_address: "",
        map_url: "",
        embed_url: ""
      });
      setAutoGenerateSlug(true);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Glassmorphic Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            onClick={!isSubmitting ? onClose : undefined}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] shadow-2xl rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col pointer-events-auto shadow-[0_0_50px_rgba(0,0,0,0.5)]">
              
              {/* Header */}
              <div className="px-6 py-4 border-b border-[var(--admin-border)] flex justify-between items-center bg-[var(--admin-surface-alt)]">
                <div className="flex items-center gap-2 text-[var(--admin-text)]">
                  <LayoutDashboard className="w-5 h-5 text-[var(--color-turquoise)]" />
                  <h2 className="text-xl font-bold">Create New Stage</h2>
                </div>
                <button 
                  onClick={onClose} 
                  disabled={isSubmitting}
                  className="p-2 rounded-full hover:bg-[var(--admin-hover)] text-[var(--admin-text-secondary)] transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Body */}
              <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                <form id="create-stage-form" onSubmit={handleSubmit} className="space-y-6">
                  
                  {/* Section 1: Basic Identity */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-[var(--color-turquoise)] uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-4 h-4" /> Basic Identity
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[var(--admin-text-secondary)] uppercase mb-1">
                          Stage Name (English) *
                        </label>
                        <input
                          required
                          name="name"
                          type="text"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="e.g. Main Conference Stage"
                          className="w-full p-2.5 border border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] text-[var(--admin-text)] rounded-lg text-sm focus:border-[var(--color-turquoise)] outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[var(--admin-text-secondary)] uppercase mb-1">
                          Stage Name (Malayalam)
                        </label>
                        <input
                          name="name_ml"
                          type="text"
                          value={formData.name_ml}
                          onChange={handleChange}
                          placeholder="e.g. മെയിൻ സ്റ്റേജ്"
                          className="w-full p-2.5 border border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] text-[var(--admin-text)] rounded-lg text-sm focus:border-[var(--color-turquoise)] outline-none transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[var(--admin-text-secondary)] uppercase mb-1">
                        System Identifier (Slug) *
                      </label>
                      <div className="relative">
                        <input
                          required
                          name="slug"
                          type="text"
                          value={formData.slug}
                          onChange={handleChange}
                          placeholder="e.g. stage1"
                          className={`w-full p-2.5 border bg-[var(--admin-input-bg)] text-[var(--admin-text)] rounded-lg text-sm outline-none transition-colors font-mono ${
                            !autoGenerateSlug ? 'border-[var(--color-brass)] focus:border-[var(--color-brass)]' : 'border-[var(--admin-input-border)] focus:border-[var(--color-turquoise)]'
                          }`}
                        />
                        {!autoGenerateSlug && (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[var(--color-brass)] uppercase bg-[var(--admin-input-bg)] px-1">
                            Manual
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-[var(--admin-text-muted)] mt-1">
                        This is used internally by the schedule builder. Change this to match existing session schedules (e.g. <code>stage1</code>).
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[var(--admin-text-secondary)] uppercase mb-1">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={2}
                        placeholder="A brief description of this stage's purpose..."
                        className="w-full p-2.5 border border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] text-[var(--admin-text)] rounded-lg text-sm focus:border-[var(--color-turquoise)] outline-none resize-none transition-colors"
                      />
                    </div>
                  </div>

                  <hr className="border-[var(--admin-border-subtle)]" />

                  {/* Section 2: Location & Mapping */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-[var(--color-turquoise)] uppercase tracking-wider flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" /> Location & Mapping
                    </h3>
                    
                    <div>
                      <label className="block text-xs font-bold text-[var(--admin-text-secondary)] uppercase mb-1">
                        Physical Address
                      </label>
                      <div className="flex items-center gap-2 p-2.5 border border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] rounded-lg focus-within:border-[var(--color-turquoise)] transition-colors">
                        <MapPin className="w-4 h-4 text-[var(--admin-text-secondary)] shrink-0" />
                        <input
                          name="location_address"
                          type="text"
                          value={formData.location_address}
                          onChange={handleChange}
                          placeholder="e.g. Main Auditorium, Ground Floor"
                          className="bg-transparent outline-none text-[var(--admin-text)] text-sm w-full"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[var(--admin-text-secondary)] uppercase mb-1 flex items-center gap-1">
                          <LinkIcon className="w-3 h-3" /> Map Embed (Iframe Src)
                        </label>
                        <input
                          name="embed_url"
                          type="text"
                          value={formData.embed_url}
                          onChange={handleChange}
                          placeholder="https://maps.google.com/maps?q=..."
                          className="w-full p-2.5 border border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] text-[var(--admin-text)] rounded-lg text-xs font-mono focus:border-[var(--color-turquoise)] outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[var(--admin-text-secondary)] uppercase mb-1 flex items-center gap-1">
                          <LinkIcon className="w-3 h-3" /> Google Maps Link
                        </label>
                        <input
                          name="map_url"
                          type="text"
                          value={formData.map_url}
                          onChange={handleChange}
                          placeholder="https://maps.google.com/..."
                          className="w-full p-2.5 border border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] text-[var(--admin-text)] rounded-lg text-xs font-mono focus:border-[var(--color-turquoise)] outline-none transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                </form>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-[var(--admin-border)] bg-[var(--admin-surface-alt)] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl text-sm font-semibold text-[var(--admin-text)] bg-[var(--admin-surface)] border border-[var(--admin-border)] hover:bg-[var(--admin-hover)] transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  form="create-stage-form"
                  type="submit"
                  disabled={isSubmitting || !formData.name || !formData.slug}
                  className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-[var(--color-turquoise)] hover:bg-[var(--color-turquoise)]/90 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Stage"
                  )}
                </button>
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
