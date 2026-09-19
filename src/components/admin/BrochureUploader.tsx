"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Upload, FileText, CheckCircle, Trash2, ExternalLink, AlertCircle, Plus } from "lucide-react";
import { saveConferenceDocumentsAction } from "@/app/[locale]/admin/actions";

export interface ConferenceDocument {
  id: string;
  title: string;
  url: string;
}

export function BrochureUploader() {
  const [isUploading, setIsUploading] = useState(false);
  const [documents, setDocuments] = useState<ConferenceDocument[]>([]);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);
  
  // Local state for the new document form
  const [newDocTitle, setNewDocTitle] = useState("");
  
  const supabase = createClient();

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const { data, error } = await supabase
          .from("global_settings")
          .select("value")
          .eq("key", "conference_documents")
          .maybeSingle();

        if (data?.value && Array.isArray(data.value)) {
          setDocuments(data.value);
        } else {
          // Backward compatibility check for old brochure url
          const { data: oldData } = await supabase
            .from("global_settings")
            .select("value")
            .eq("key", "brochure_url")
            .maybeSingle();
            
          if (oldData?.value?.url) {
            setDocuments([{ id: Date.now().toString(), title: "Brochure", url: oldData.value.url }]);
          }
        }
      } catch (err) {
        console.error("Error fetching documents:", err);
      }
    };
    fetchDocuments();
  }, [supabase]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!newDocTitle.trim()) {
      setStatusMessage({ type: "error", text: "Please enter a document title first." });
      e.target.value = "";
      return;
    }

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setStatusMessage({ type: "error", text: "Please select a valid PDF document." });
      e.target.value = "";
      return;
    }

    setIsUploading(true);
    setStatusMessage(null);

    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "pdf";
      const fileName = `doc-${Date.now()}.${ext}`;
      let targetBucket = "documents";
      let filePath = fileName;

      let { error: uploadError } = await supabase.storage
        .from(targetBucket)
        .upload(filePath, file, { upsert: true });

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

      const { data: urlData } = supabase.storage
        .from(targetBucket)
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      const newDoc: ConferenceDocument = {
        id: Date.now().toString(),
        title: newDocTitle.trim(),
        url: publicUrl,
      };

      const newDocuments = [...documents, newDoc];
      await saveConferenceDocumentsAction(newDocuments);

      setDocuments(newDocuments);
      setNewDocTitle("");
      setStatusMessage({
        type: "success",
        text: `Document uploaded successfully!`,
      });
    } catch (err: any) {
      console.error("Upload failed:", err);
      setStatusMessage({
        type: "error",
        text: err.message || "Failed to upload document.",
      });
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this document?")) return;
    setIsUploading(true);
    try {
      const newDocuments = documents.filter(d => d.id !== id);
      await saveConferenceDocumentsAction(newDocuments);
      setDocuments(newDocuments);
      setStatusMessage({ type: "info", text: "Document removed successfully." });
    } catch (err: any) {
      console.error("Delete failed:", err);
      setStatusMessage({ type: "error", text: "Failed to remove document." });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="sm:col-span-6 bg-[var(--admin-surface-alt)]/80 p-5 rounded-xl border border-[var(--admin-border)] shadow-sm space-y-5">
      <div>
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-[var(--color-navy)]" />
          <h4 className="text-sm font-bold text-[var(--admin-text)]">Conference Documents (PDF)</h4>
        </div>
        <p className="text-[var(--admin-text-secondary)] text-xs mt-1">
          Upload documents like the Theme Book, Brochure, Program Schedule, etc. These will appear in a dropdown on the Hero section.
        </p>
      </div>

      {documents.length > 0 && (
        <div className="space-y-3">
          {documents.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between p-3 bg-white/50 border border-[var(--admin-border)] rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-semibold text-[var(--admin-text)]">{doc.title}</span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md border border-emerald-200 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View
                </a>
                <button
                  type="button"
                  onClick={() => handleDelete(doc.id)}
                  disabled={isUploading}
                  className="p-1.5 text-[var(--admin-text-muted)] hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  title="Remove document"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="pt-2 border-t border-[var(--admin-border)]">
        <h5 className="text-xs font-semibold text-[var(--admin-text-secondary)] mb-3">Upload New Document</h5>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <input
            type="text"
            placeholder="e.g. Theme Book"
            value={newDocTitle}
            onChange={(e) => setNewDocTitle(e.target.value)}
            disabled={isUploading}
            className="flex-1 rounded-md border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] text-[var(--admin-text)] shadow-sm focus:border-[var(--color-turquoise)] focus:ring-[var(--color-turquoise)] sm:text-sm p-2 border outline-none min-w-[200px]"
          />
          <label
            className={`cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all shrink-0 ${
              isUploading || !newDocTitle.trim()
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-[var(--color-navy)] text-white hover:bg-[var(--color-navy)]/90 shadow-sm hover:shadow"
            }`}
          >
            {isUploading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            {isUploading ? "Uploading..." : "Select PDF & Upload"}
            <input
              type="file"
              accept="application/pdf,.pdf"
              className="hidden"
              onChange={handleFileUpload}
              disabled={isUploading || !newDocTitle.trim()}
            />
          </label>
        </div>
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
