"use client";

import React, { useState, useEffect } from "react";
import { BrochureUploader } from "@/components/admin/BrochureUploader";
import { fetchGlobalSettingsAction, saveGlobalSettingsAction } from "@/app/[locale]/admin/actions";
import { Loader2 } from "lucide-react";

export default function ContentManagerPage() {
  const [formData, setFormData] = useState({
    event_date: "2026-09-27T10:00",
    end_date: "2026-09-27T22:00",
    venue: "Alathurpadi, Melmuri",
    map_url: "https://maps.app.goo.gl/nCJ4g6Rx9B9Sn3c99",
    tagline: "From Baghdad to Malabar — Persian Artistry. Malabar Soul.",
    organizer: "Alathurpadi Students Association",
    registrations_open: true,
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const data = await fetchGlobalSettingsAction();
      if (data && Object.keys(data).length > 0) {
        setFormData(prev => ({ ...prev, ...data }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type, checked } = e.target;
    // Map hyphens to underscores for the state
    const key = id.replace(/-/g, '_');
    setFormData(prev => ({
      ...prev,
      [key]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveGlobalSettingsAction(formData);
      alert("Settings saved successfully!");
    } catch (e: any) {
      alert("Failed to save settings: " + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-[var(--admin-text-secondary)]">Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-[var(--admin-text)]">Content Manager</h2>
          <p className="text-[var(--admin-text-secondary)] text-sm mt-1">Manage global site copy, hero sections, and settings</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={loadSettings}
            className="px-4 py-2 border border-[var(--admin-input-border)] rounded-lg text-sm font-medium bg-[var(--admin-surface)] hover:bg-[var(--admin-surface-alt)] text-[var(--admin-text-secondary)] shadow-sm transition-colors"
          >
            Discard Changes
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--color-navy)] text-white hover:bg-[var(--color-navy)]/90 shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
            Publish All
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Nav */}
        <div className="w-full md:w-64 shrink-0">
          <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl overflow-hidden">
            <nav className="flex flex-col">
              <button className="px-4 py-3 text-left text-sm font-medium bg-[var(--admin-surface-alt)] text-[var(--color-navy)] border-l-4 border-[var(--color-navy)]">
                Global Settings
              </button>
              <button className="px-4 py-3 text-left text-sm font-medium text-[var(--admin-text-secondary)] hover:bg-[var(--admin-surface-alt)] border-l-4 border-transparent hover:border-[var(--admin-border)] transition-colors border-t border-[var(--admin-border-subtle)]">
                Hero Section
              </button>
              <button className="px-4 py-3 text-left text-sm font-medium text-[var(--admin-text-secondary)] hover:bg-[var(--admin-surface-alt)] border-l-4 border-transparent hover:border-[var(--admin-border)] transition-colors border-t border-[var(--admin-border-subtle)]">
                About / Central Idea
              </button>
              <button className="px-4 py-3 text-left text-sm font-medium text-[var(--admin-text-secondary)] hover:bg-[var(--admin-surface-alt)] border-l-4 border-transparent hover:border-[var(--admin-border)] transition-colors border-t border-[var(--admin-border-subtle)]">
                Speakers Roster
              </button>
              <button className="px-4 py-3 text-left text-sm font-medium text-[var(--admin-text-secondary)] hover:bg-[var(--admin-surface-alt)] border-l-4 border-transparent hover:border-[var(--admin-border)] transition-colors border-t border-[var(--admin-border-subtle)]">
                Footer & Social Links
              </button>
              <button className="px-4 py-3 text-left text-sm font-medium text-[var(--admin-text-secondary)] hover:bg-[var(--admin-surface-alt)] border-l-4 border-transparent hover:border-[var(--admin-border)] transition-colors border-t border-[var(--admin-border-subtle)]">
                Translation (ML / AR)
              </button>
            </nav>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1">
          <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-[var(--admin-text)] mb-6">Global Site Settings</h3>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                
                <div className="sm:col-span-3">
                  <label htmlFor="event-date" className="block text-sm font-medium text-[var(--admin-text-secondary)]">Event Date</label>
                  <div className="mt-1">
                    <input type="datetime-local" id="event-date" value={formData.event_date} onChange={handleChange} className="block w-full rounded-md border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] text-[var(--admin-text)] shadow-sm focus:border-[var(--color-turquoise)] focus:ring-[var(--color-turquoise)] sm:text-sm p-2 border outline-none" />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="end-date" className="block text-sm font-medium text-[var(--admin-text-secondary)]">Event End Date</label>
                  <div className="mt-1">
                    <input type="datetime-local" id="end-date" value={formData.end_date} onChange={handleChange} className="block w-full rounded-md border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] text-[var(--admin-text)] shadow-sm focus:border-[var(--color-turquoise)] focus:ring-[var(--color-turquoise)] sm:text-sm p-2 border outline-none" />
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <label htmlFor="venue" className="block text-sm font-medium text-[var(--admin-text-secondary)]">Venue / Location Name</label>
                  <div className="mt-1">
                    <input type="text" id="venue" value={formData.venue} onChange={handleChange} className="block w-full rounded-md border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] text-[var(--admin-text)] shadow-sm focus:border-[var(--color-turquoise)] focus:ring-[var(--color-turquoise)] sm:text-sm p-2 border outline-none" />
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <label htmlFor="map-url" className="block text-sm font-medium text-[var(--admin-text-secondary)]">Google Maps URL</label>
                  <div className="mt-1">
                    <input type="url" id="map-url" value={formData.map_url} onChange={handleChange} className="block w-full rounded-md border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] text-[var(--admin-text)] shadow-sm focus:border-[var(--color-turquoise)] focus:ring-[var(--color-turquoise)] sm:text-sm p-2 border outline-none" />
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <label htmlFor="tagline" className="block text-sm font-medium text-[var(--admin-text-secondary)]">Tagline (EN)</label>
                  <div className="mt-1">
                    <input type="text" id="tagline" value={formData.tagline} onChange={handleChange} className="block w-full rounded-md border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] text-[var(--admin-text)] shadow-sm focus:border-[var(--color-turquoise)] focus:ring-[var(--color-turquoise)] sm:text-sm p-2 border outline-none" />
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <label htmlFor="organizer" className="block text-sm font-medium text-[var(--admin-text-secondary)]">Organizer Name</label>
                  <div className="mt-1">
                    <input type="text" id="organizer" value={formData.organizer} onChange={handleChange} className="block w-full rounded-md border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] text-[var(--admin-text)] shadow-sm focus:border-[var(--color-turquoise)] focus:ring-[var(--color-turquoise)] sm:text-sm p-2 border outline-none" />
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <div className="flex items-start">
                    <div className="flex h-5 items-center">
                      <input id="registrations-open" type="checkbox" checked={formData.registrations_open} onChange={handleChange} className="h-4 w-4 rounded border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] text-[var(--color-turquoise)] focus:ring-[var(--color-turquoise)]" />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="registrations-open" className="font-medium text-[var(--admin-text-secondary)]">Registrations Open</label>
                      <p className="text-[var(--admin-text-muted)]">Toggle whether the public registration forms accept new entries.</p>
                    </div>
                  </div>
                </div>

                <BrochureUploader />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
