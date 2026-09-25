"use client";

import React, { useState, useEffect, useRef } from "react";
import { fetchRegistrationsForPrinting } from "@/app/[locale]/admin/event-day-actions";
import { generateQRCodeDataURL } from "@/lib/qr";
import { Printer, Filter, Loader2, CheckCircle, RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface PrintableBadge {
  registration_id: string;
  name: string;
  place: string | null;
  qr_token: string | null;
  session: string;
  sessionColor: string;
  qrDataUrl?: string;
}

export default function BadgePrintPage() {
  const [sessions, setSessions] = useState<{slug: string, title: string}[]>([]);
  const [sessionFilter, setSessionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("confirmed");
  
  const [badges, setBadges] = useState<PrintableBadge[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);

  const printAreaRef = useRef<HTMLDivElement>(null);

  // Load sessions
  useEffect(() => {
    const loadSessions = async () => {
      const supabase = createClient();
      const { data } = await supabase.from("registration_sessions").select("slug, title").eq("is_archived", false);
      if (data) setSessions(data);
    };
    loadSessions();
  }, []);

  const handleFetch = async () => {
    setIsLoading(true);
    setBadges([]);
    try {
      const data = await fetchRegistrationsForPrinting(sessionFilter, statusFilter);
      setBadges(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateQRs = async () => {
    if (badges.length === 0) return;
    setIsGenerating(true);
    setGenerationProgress(0);

    const updatedBadges = [...badges];
    
    // Process in small batches so we don't freeze the browser
    const batchSize = 10;
    for (let i = 0; i < updatedBadges.length; i += batchSize) {
      const batch = updatedBadges.slice(i, i + batchSize);
      await Promise.all(
        batch.map(async (badge) => {
          if (badge.qr_token) {
            badge.qrDataUrl = await generateQRCodeDataURL(badge.qr_token);
          }
        })
      );
      setGenerationProgress(Math.min(100, Math.round(((i + batchSize) / updatedBadges.length) * 100)));
      // Yield to main thread
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    setBadges(updatedBadges);
    setIsGenerating(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const allReadyToPrint = badges.length > 0 && badges.every(b => !b.qr_token || b.qrDataUrl);

  return (
    <div className="space-y-6">
      {/* Hide controls when printing */}
      <div className="print:hidden space-y-6">
        <div>
          <h1 className="text-xl font-bold text-[var(--admin-text)] flex items-center gap-2">
            <Printer className="w-6 h-6 text-indigo-500" />
            Batch Badge Printing
          </h1>
          <p className="text-sm text-[var(--admin-text-secondary)] mt-1">
            Generate and print physical badges for attendees without devices.
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 space-y-1.5">
              <label className="text-xs font-semibold text-[var(--admin-text)]">Program / Session</label>
              <select
                value={sessionFilter}
                onChange={e => setSessionFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-input-bg)] text-[var(--admin-text)] text-sm outline-none"
              >
                <option value="all">All Programs</option>
                {sessions.map(s => <option key={s.slug} value={s.slug}>{s.title}</option>)}
              </select>
            </div>
            
            <div className="flex-1 space-y-1.5">
              <label className="text-xs font-semibold text-[var(--admin-text)]">Status</label>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-input-bg)] text-[var(--admin-text)] text-sm outline-none"
              >
                <option value="confirmed">Confirmed & Selected Only</option>
                <option value="all">All Statuses</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleFetch}
                disabled={isLoading}
                className="px-6 py-2 rounded-xl bg-[var(--color-navy)] text-white text-sm font-semibold hover:bg-[var(--color-navy)]/90 transition-all flex items-center gap-2 h-[42px]"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Filter className="w-4 h-4" />}
                Load Attendees
              </button>
            </div>
          </div>
        </div>

        {badges.length > 0 && (
          <div className="p-5 rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-card)] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-[var(--admin-text)]">Loaded {badges.length} Attendees</h3>
              <p className="text-sm text-[var(--admin-text-secondary)] mt-0.5">
                Approximately {Math.ceil(badges.length / 8)} A4 pages (8 badges per page).
              </p>
            </div>

            <div className="flex items-center gap-3">
              {!allReadyToPrint ? (
                <button
                  onClick={handleGenerateQRs}
                  disabled={isGenerating}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 text-white text-sm font-bold hover:bg-amber-600 transition-all flex items-center gap-2"
                >
                  {isGenerating ? (
                    <><RefreshCw className="w-4 h-4 animate-spin" /> Generating QRs ({generationProgress}%)</>
                  ) : (
                    <><RefreshCw className="w-4 h-4" /> Generate QR Codes</>
                  )}
                </button>
              ) : (
                <button
                  onClick={handlePrint}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-md"
                >
                  <Printer className="w-4 h-4" /> Print Badges Now
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* PRINT AREA - Only visible when printing, or visually previewed on screen */}
      {badges.length > 0 && (
        <div className="print:block print:p-0 bg-gray-200/50 p-4 rounded-xl border border-[var(--admin-border)] print:border-none print:bg-transparent overflow-auto max-h-[800px] print:max-h-none">
          <div className="mb-4 print:hidden text-center text-xs font-semibold text-gray-500 uppercase tracking-widest">
            Print Preview (A4 Size)
          </div>
          
          <div 
            ref={printAreaRef}
            className="w-[210mm] mx-auto bg-white print:w-full"
            style={{
              // CSS for print media defined in globals.css, this is just for preview
            }}
          >
            {/* We divide badges into chunks of 8 per page */}
            {Array.from({ length: Math.ceil(badges.length / 8) }).map((_, pageIndex) => {
              const pageBadges = badges.slice(pageIndex * 8, (pageIndex + 1) * 8);
              return (
                <div 
                  key={pageIndex} 
                  className="page-break-after-always w-[210mm] h-[297mm] p-[10mm] box-border grid grid-cols-2 grid-rows-4 gap-[5mm] print:w-auto print:h-[100vh] print:p-[5mm]"
                >
                  {pageBadges.map((badge, idx) => (
                    <div 
                      key={badge.registration_id} 
                      className="border-2 border-gray-300 rounded-lg overflow-hidden flex flex-col relative"
                      style={{ height: "100%" }}
                    >
                      {/* Badge Header */}
                      <div 
                        className="h-[12mm] flex items-center justify-center text-white font-bold text-xs px-2 truncate shrink-0"
                        style={{ backgroundColor: badge.sessionColor }}
                      >
                        {badge.session.toUpperCase()}
                      </div>
                      
                      {/* Badge Body */}
                      <div className="flex-1 flex flex-col items-center justify-center p-2 text-center bg-white relative">
                        <h2 className="font-bold text-gray-900 text-[16px] leading-tight max-w-[95%] truncate">
                          {badge.name}
                        </h2>
                        {badge.place && (
                          <p className="text-gray-600 text-[10px] mt-1 font-medium truncate max-w-[95%]">
                            {badge.place}
                          </p>
                        )}
                        
                        {/* QR Code Area */}
                        <div className="mt-2 w-[35mm] h-[35mm] flex items-center justify-center border-2 border-gray-100 rounded-lg overflow-hidden shrink-0">
                          {badge.qrDataUrl ? (
                            <img src={badge.qrDataUrl} alt="QR" className="w-full h-full object-contain" />
                          ) : (
                            <div className="text-[10px] text-gray-400 font-medium">No QR generated</div>
                          )}
                        </div>
                      </div>
                      
                      {/* Badge Footer */}
                      <div className="h-[8mm] bg-gray-50 flex items-center justify-center text-[10px] font-mono text-gray-500 font-bold border-t border-gray-200 shrink-0">
                        {badge.registration_id}
                      </div>

                      {/* Conference branding watermark */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
                        <div className="text-4xl font-black text-gray-900 whitespace-nowrap -rotate-45">JC26</div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Global styles for print media */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:block, .print\\:block * {
            visibility: visible;
          }
          .print\\:block {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .page-break-after-always {
            page-break-after: always;
            break-after: page;
          }
          @page {
            size: A4 portrait;
            margin: 0;
          }
        }
      `}} />
    </div>
  );
}
