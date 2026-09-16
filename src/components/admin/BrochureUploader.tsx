"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Upload, FileText, CheckCircle } from "lucide-react";

export function BrochureUploader() {
  const [isUploading, setIsUploading] = useState(false);
  const [brochureUrl, setBrochureUrl] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchBrochureUrl = async () => {
      const { data, error } = await supabase
        .from("global_settings")
        .select("value")
        .eq("key", "brochure_url")
        .single();
      
      if (data?.value?.url) {
        setBrochureUrl(data.value.url);
      }
    };
    fetchBrochureUrl();
  }, [supabase]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "pdf";
      const filePath = `brochure-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("documents")
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      const { error: updateError } = await supabase
        .from("global_settings")
        .upsert({ key: "brochure_url", value: { url: publicUrl }, updated_at: new Date().toISOString() });

      if (updateError) throw updateError;

      setBrochureUrl(publicUrl);
      alert("Brochure uploaded successfully!");
    } catch (err: any) {
      console.error("Upload failed:", err);
      alert(err.message ? `Upload failed: ${err.message}` : "Failed to upload brochure.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="sm:col-span-6 bg-gray-50 p-4 rounded-xl border border-gray-200">
      <label className="block text-sm font-medium text-gray-700 mb-3">Event Brochure (PDF)</label>
      <div className="flex items-center gap-4">
        <label className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isUploading ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-[var(--color-navy)] text-white hover:bg-[var(--color-navy)]/90"}`}>
          {isUploading ? <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Upload className="w-4 h-4" />}
          {isUploading ? "Uploading..." : "Upload Brochure"}
          <input 
            type="file" 
            accept="application/pdf" 
            className="hidden" 
            onChange={handleFileUpload} 
            disabled={isUploading} 
          />
        </label>
        
        {brochureUrl && (
          <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-1.5 rounded-lg border border-green-200">
            <CheckCircle className="w-4 h-4" />
            <a href={brochureUrl} target="_blank" rel="noopener noreferrer" className="hover:underline font-medium">
              View Current Brochure
            </a>
          </div>
        )}
      </div>
      <p className="text-gray-500 text-xs mt-2">
        Upload a PDF brochure. This will replace the "Watch Live" button in the hero section.
      </p>
    </div>
  );
}
