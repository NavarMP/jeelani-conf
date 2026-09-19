"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Upload, FileText, CheckCircle, Trash2, ExternalLink, AlertCircle } from "lucide-react";
import { saveBrochureUrlAction, deleteBrochureUrlAction } from "@/app/[locale]/admin/actions";

export function BrochureUploader() {
  const [isUploading, setIsUploading] = useState(false);
  const [brochureUrl, setBrochureUrl] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchBrochureUrl = async () => {
      try {
        const { data, error } = await supabase
          .from("global_settings")
          .select("value")
          .eq("key", "brochure_url")
          .maybeSingle();

        if (data?.value?.url) {
          setBrochureUrl(data.value.url);
        }
      } catch (err) {
        console.error("Error fetching brochure URL:", err);
      }
    };
    fetchBrochureUrl();
  }, [supabase]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setStatusMessage({ type: "error", text: "Please select a valid PDF document." });
      return;
    }

    setIsUploading(true);
    setStatusMessage(null);

    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "pdf";
      const fileName = `brochure-${Date.now()}.${ext}`;
      let targetBucket = "documents";
      let filePath = fileName;

      // 1. Attempt upload to 'documents' bucket
      let { error: uploadError } = await supabase.storage
        .from(targetBucket)
        .upload(filePath, file, { upsert: true });

      // 2. If 'documents' bucket does not exist yet, fallback to 'receipts' bucket
      if (uploadError && (uploadError.message?.toLowerCase().includes("bucket not found") || (uploadError as any)?.statusCode === "404")) {
        console.warn("'documents' bucket not found on Supabase. Falling back to 'receipts' bucket...");
        targetBucket = "receipts";
        filePath = `brochures/${fileName}`;

        const fallbackResult = await supabase.storage
          .from(targetBucket)
          .upload(filePath, file, { upsert: true });

        uploadError = fallbackResult.error;
      }

      if (uploadError) {
        throw uploadError;
      }

      // 3. Get Public URL
      const { data: urlData } = supabase.storage
        .from(targetBucket)
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      // 4. Persist to global_settings via server action
      await saveBrochureUrlAction(publicUrl);

      setBrochureUrl(publicUrl);
      setStatusMessage({
        type: "success",
        text: `Brochure uploaded successfully to '${targetBucket}' storage! Hero button has been updated.`,
      });
    } catch (err: any) {
      console.error("Upload failed:", err);
      setStatusMessage({
        type: "error",
        text: err.message || "Failed to upload brochure document.",
      });
    } finally {
      setIsUploading(false);
      // Reset input
      e.target.value = "";
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to remove the current brochure?")) return;
    setIsUploading(true);
    try {
      await deleteBrochureUrlAction();
      setBrochureUrl(null);
      setStatusMessage({ type: "info", text: "Brochure removed successfully." });
    } catch (err: any) {
      console.error("Delete failed:", err);
      setStatusMessage({ type: "error", text: "Failed to remove brochure." });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="sm:col-span-6 bg-[var(--admin-surface-alt)]/80 p-5 rounded-xl border border-[var(--admin-border)] shadow-sm space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[var(--color-navy)]" />
            <h4 className="text-sm font-bold text-[var(--admin-text)]">Conference Brochure (PDF)</h4>
          </div>
          <p className="text-[var(--admin-text-secondary)] text-xs mt-1">
            Upload the official conference brochure. This updates the "Brochure" button in the hero section.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label
          className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            isUploading
              ? "bg-gray-300 text-[var(--admin-text-secondary)] cursor-not-allowed"
              : "bg-[var(--color-navy)] text-white hover:bg-[var(--color-navy)]/90 shadow-sm hover:shadow"
          }`}
        >
          {isUploading ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
          {isUploading ? "Uploading..." : brochureUrl ? "Replace Brochure" : "Upload Brochure (PDF)"}
          <input
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            onChange={handleFileUpload}
            disabled={isUploading}
          />
        </label>

        {brochureUrl && (
          <div className="flex items-center gap-2">
            <a
              href={brochureUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors"
            >
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>View Brochure</span>
              <ExternalLink className="w-3.5 h-3.5 ml-0.5 opacity-70" />
            </a>

            <button
              type="button"
              onClick={handleDelete}
              disabled={isUploading}
              className="p-2 text-[var(--admin-text-muted)] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Remove brochure"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {statusMessage && (
        <div
          className={`text-xs px-3.5 py-2.5 rounded-lg flex items-center gap-2 ${
            statusMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : statusMessage.type === "error"
              ? "bg-red-50 text-red-800 border border-red-200"
              : "bg-blue-50 text-blue-800 border border-blue-200"
          }`}
        >
          {statusMessage.type === "error" ? (
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          ) : (
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-500" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}
    </div>
  );
}
