"use client";

import React, { useState, useEffect, useCallback } from "react";
import { saveStagesAction, fetchStagesAction } from "@/app/[locale]/admin/actions";
import { Plus, Trash2, Save, GripVertical } from "lucide-react";

export default function StagesPage() {
  const [stages, setStages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchStages = useCallback(async () => {
    try {
      const data = await fetchStagesAction();
      setStages(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStages();
  }, [fetchStages]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveStagesAction(stages);
      alert("Stages saved successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to save stages.");
    } finally {
      setIsSaving(false);
    }
  };

  const addStage = () => {
    setStages([...stages, { slug: `stage${stages.length + 1}`, name: "", name_ml: "", description: "" }]);
  };

  const removeStage = (index: number) => {
    if (!confirm("Remove this stage? Note: Any sessions assigned to this stage will still exist, but their stage string might not map to a named stage unless you fix them.")) return;
    const newStages = [...stages];
    newStages.splice(index, 1);
    setStages(newStages);
  };

  const updateStage = (index: number, field: string, value: string) => {
    const newStages = [...stages];
    newStages[index][field] = value;
    setStages(newStages);
  };

  if (isLoading) {
    return <div className="p-8 text-center text-[var(--admin-text-secondary)]">Loading stages...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-[var(--admin-text)]">Stage Management</h2>
          <p className="text-[var(--admin-text-secondary)] text-sm mt-1">Manage the available stages and venues for your events.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-2 bg-[var(--color-turquoise)] text-white rounded-lg text-sm font-semibold flex items-center gap-2 hover:opacity-90 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {isSaving ? "Saving..." : "Save Stages"}
        </button>
      </div>

      <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl shadow-sm p-6 space-y-4">
        {stages.map((stage, i) => (
          <div key={i} className="flex flex-col md:flex-row gap-4 p-4 border border-[var(--admin-border-subtle)] rounded-lg bg-[var(--admin-surface-alt)]">
            <div className="flex flex-col gap-3 flex-1">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-xs font-semibold text-[var(--admin-text-secondary)] uppercase tracking-wider">Unique Slug (ID)</label>
                  <input
                    type="text"
                    value={stage.slug}
                    onChange={(e) => updateStage(i, "slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    className="w-full mt-1 p-2 border border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] text-[var(--admin-text)] rounded text-sm focus:border-[var(--color-turquoise)] outline-none"
                    placeholder="e.g. stage1, main-hall"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-semibold text-[var(--admin-text-secondary)] uppercase tracking-wider">Name (EN)</label>
                  <input
                    type="text"
                    value={stage.name}
                    onChange={(e) => updateStage(i, "name", e.target.value)}
                    className="w-full mt-1 p-2 border border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] text-[var(--admin-text)] rounded text-sm focus:border-[var(--color-turquoise)] outline-none font-bold"
                    placeholder="e.g. Stage 1"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-semibold text-[var(--admin-text-secondary)] uppercase tracking-wider">Name (ML)</label>
                  <input
                    type="text"
                    value={stage.name_ml}
                    onChange={(e) => updateStage(i, "name_ml", e.target.value)}
                    className="w-full mt-1 p-2 border border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] text-[var(--admin-text)] rounded text-sm focus:border-[var(--color-turquoise)] outline-none"
                    placeholder="e.g. സ്റ്റേജ് 1"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--admin-text-secondary)] uppercase tracking-wider">Description</label>
                <input
                  type="text"
                  value={stage.description || ""}
                  onChange={(e) => updateStage(i, "description", e.target.value)}
                  className="w-full mt-1 p-2 border border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] text-[var(--admin-text)] rounded text-sm focus:border-[var(--color-turquoise)] outline-none"
                  placeholder="Optional description of the stage/venue"
                />
              </div>
            </div>
            
            <button
              onClick={() => removeStage(i)}
              className="p-2 self-start md:self-center rounded-lg text-[var(--admin-text-muted)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}
        
        {stages.length === 0 && (
          <div className="text-center p-8 text-[var(--admin-text-muted)]">
            No stages configured. Click the button below to add your first stage.
          </div>
        )}

        <button
          onClick={addStage}
          className="w-full py-3 border-2 border-dashed border-[var(--admin-input-border)] rounded-lg text-sm font-medium text-[var(--admin-text-secondary)] hover:text-[var(--admin-text)] hover:bg-[var(--admin-hover)] transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Stage / Venue
        </button>
      </div>
    </div>
  );
}
