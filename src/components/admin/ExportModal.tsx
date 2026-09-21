"use client";

import React, { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Download,
  Share2,
  FileSpreadsheet,
  FileText,
  FileImage,
  FileJson,
  FileType,
  Check,
  Loader2,
  Filter,
  Copy,
  CheckCircle2,
} from "lucide-react";
import {
  type ExportConfig,
  type ExportColumn,
  type ExportFormat,
  type ActiveFilter,
  performExport,
  shareExport,
  canShare,
} from "@/lib/exportUtils";

/* ── Types ────────────────────────────────────────────────────────────── */

export type ExportScope = "all" | "filtered" | "selected";

export interface ExportModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Close handler */
  onClose: () => void;
  /** Title for the export (e.g., "Registrations") */
  title: string;
  /** All data (unfiltered) */
  allData: Record<string, any>[];
  /** Filtered/processed data */
  filteredData: Record<string, any>[];
  /** Selected data (bulk-selected rows) */
  selectedData?: Record<string, any>[];
  /** Column definitions */
  columns: ExportColumn[];
  /** Currently active filters to display */
  activeFilters: ActiveFilter[];
  /** Default filename */
  defaultFilename?: string;
}

/* ── Format Definitions ──────────────────────────────────────────────── */

interface FormatOption {
  id: ExportFormat;
  label: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
}

const FORMAT_OPTIONS: FormatOption[] = [
  {
    id: "csv",
    label: "CSV",
    description: "Spreadsheet-compatible, universal format",
    icon: FileSpreadsheet,
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-500/10 group-hover:bg-emerald-500/20 border-emerald-500/20",
  },
  {
    id: "xlsx",
    label: "Excel",
    description: "Native Microsoft Excel workbook",
    icon: FileSpreadsheet,
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-500/10 group-hover:bg-green-500/20 border-green-500/20",
  },
  {
    id: "pdf",
    label: "PDF",
    description: "Formatted document with branding",
    icon: FileText,
    color: "text-red-500 dark:text-red-400",
    bgColor: "bg-red-500/10 group-hover:bg-red-500/20 border-red-500/20",
  },
  {
    id: "json",
    label: "JSON",
    description: "Structured data for developers",
    icon: FileJson,
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-500/10 group-hover:bg-amber-500/20 border-amber-500/20",
  },
  {
    id: "png",
    label: "Image",
    description: "Table screenshot as PNG image",
    icon: FileImage,
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-500/10 group-hover:bg-purple-500/20 border-purple-500/20",
  },
];

/* ── Component ───────────────────────────────────────────────────────── */

export default function ExportModal({
  isOpen,
  onClose,
  title,
  allData,
  filteredData,
  selectedData,
  columns,
  activeFilters,
  defaultFilename,
}: ExportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("csv");
  const [scope, setScope] = useState<ExportScope>(
    selectedData && selectedData.length > 0 ? "selected" : "filtered"
  );
  const [enabledColumns, setEnabledColumns] = useState<Set<string>>(
    () => new Set(columns.map((c) => c.key))
  );
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [customFilename, setCustomFilename] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [showColumnPicker, setShowColumnPicker] = useState(false);
  const [copied, setCopied] = useState(false);

  // Determine data based on scope
  const exportData = useMemo(() => {
    switch (scope) {
      case "all":
        return allData;
      case "selected":
        return selectedData || [];
      case "filtered":
      default:
        return filteredData;
    }
  }, [scope, allData, filteredData, selectedData]);

  // Active columns
  const activeColumns = useMemo(
    () => columns.filter((c) => enabledColumns.has(c.key)),
    [columns, enabledColumns]
  );

  // Build config
  const buildConfig = useCallback((): ExportConfig => {
    return {
      title,
      data: exportData,
      columns: activeColumns,
      activeFilters,
      totalCount: allData.length,
      filename: customFilename || defaultFilename,
      includeMetadata,
    };
  }, [
    title,
    exportData,
    activeColumns,
    activeFilters,
    allData.length,
    customFilename,
    defaultFilename,
    includeMetadata,
  ]);

  // Handle export
  const handleExport = async () => {
    setIsExporting(true);
    try {
      await performExport(buildConfig(), selectedFormat);
      setExportSuccess(true);
      setTimeout(() => {
        setExportSuccess(false);
        onClose();
      }, 1500);
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  // Handle share
  const handleShare = async () => {
    setIsSharing(true);
    try {
      const shared = await shareExport(buildConfig(), selectedFormat);
      if (!shared) {
        // Fallback: copy summary to clipboard
        const summary = `${title} — ${exportData.length} records exported`;
        await navigator.clipboard.writeText(summary);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // ignore
    } finally {
      setIsSharing(false);
    }
  };

  // Column toggle
  const toggleColumn = (key: string) => {
    const next = new Set(enabledColumns);
    if (next.has(key)) {
      if (next.size > 1) next.delete(key); // at least 1 column
    } else {
      next.add(key);
    }
    setEnabledColumns(next);
  };

  const toggleAllColumns = () => {
    if (enabledColumns.size === columns.length) {
      // Keep only first column
      setEnabledColumns(new Set([columns[0].key]));
    } else {
      setEnabledColumns(new Set(columns.map((c) => c.key)));
    }
  };

  const scopeOptions = [
    {
      id: "all" as ExportScope,
      label: "All Data",
      count: allData.length,
    },
    {
      id: "filtered" as ExportScope,
      label: "Filtered Results",
      count: filteredData.length,
    },
    ...(selectedData && selectedData.length > 0
      ? [
          {
            id: "selected" as ExportScope,
            label: "Selected Items",
            count: selectedData.length,
          },
        ]
      : []),
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="relative bg-[var(--admin-surface)] rounded-2xl border border-[var(--admin-border)] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-[var(--admin-border)] flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-lg font-bold text-[var(--admin-text)] flex items-center gap-2">
                  <Download className="w-5 h-5 text-[var(--color-turquoise)]" />
                  Export {title}
                </h3>
                <p className="text-xs text-[var(--admin-text-muted)] mt-1">
                  {exportData.length} records ready to export
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-[var(--admin-hover)] transition-colors text-[var(--admin-text-muted)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">
              {/* ── Active Filters Summary ── */}
              {activeFilters.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Filter className="w-3.5 h-3.5 text-[var(--color-turquoise)]" />
                    <span className="text-xs font-semibold text-[var(--admin-text-secondary)] uppercase tracking-wider">
                      Active Filters
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {activeFilters.map((filter, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-[var(--color-turquoise)]/10 text-[var(--color-turquoise)] border border-[var(--color-turquoise)]/20"
                      >
                        <span className="text-[var(--admin-text-muted)]">
                          {filter.label}:
                        </span>{" "}
                        {filter.value}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Scope Selector ── */}
              <div>
                <span className="text-xs font-semibold text-[var(--admin-text-secondary)] uppercase tracking-wider mb-2 block">
                  Export Scope
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {scopeOptions.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setScope(opt.id)}
                      className={`relative px-4 py-3 rounded-xl border text-left transition-all ${
                        scope === opt.id
                          ? "border-[var(--color-turquoise)] bg-[var(--color-turquoise)]/5 shadow-sm"
                          : "border-[var(--admin-border)] hover:border-[var(--admin-border-strong)] hover:bg-[var(--admin-hover)]"
                      }`}
                    >
                      <div className="text-sm font-semibold text-[var(--admin-text)]">
                        {opt.label}
                      </div>
                      <div className="text-xs text-[var(--admin-text-muted)] mt-0.5">
                        {opt.count} record{opt.count !== 1 ? "s" : ""}
                      </div>
                      {scope === opt.id && (
                        <motion.div
                          layoutId="scope-check"
                          className="absolute top-2 right-2"
                        >
                          <CheckCircle2 className="w-4 h-4 text-[var(--color-turquoise)]" />
                        </motion.div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Format Selector ── */}
              <div>
                <span className="text-xs font-semibold text-[var(--admin-text-secondary)] uppercase tracking-wider mb-2 block">
                  File Format
                </span>
                <div className="grid grid-cols-5 gap-2">
                  {FORMAT_OPTIONS.map((fmt) => {
                    const Icon = fmt.icon;
                    const isSelected = selectedFormat === fmt.id;
                    return (
                      <button
                        key={fmt.id}
                        onClick={() => setSelectedFormat(fmt.id)}
                        className={`group relative flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
                          isSelected
                            ? `border-[var(--color-turquoise)] bg-[var(--color-turquoise)]/5 shadow-sm`
                            : "border-[var(--admin-border)] hover:border-[var(--admin-border-strong)] hover:bg-[var(--admin-hover)]"
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center border transition-colors ${fmt.bgColor}`}
                        >
                          <Icon className={`w-5 h-5 ${fmt.color}`} />
                        </div>
                        <span className="text-xs font-bold text-[var(--admin-text)]">
                          {fmt.label}
                        </span>
                        {isSelected && (
                          <motion.div
                            layoutId="format-check"
                            className="absolute -top-1 -right-1 w-5 h-5 bg-[var(--color-turquoise)] rounded-full flex items-center justify-center"
                          >
                            <Check className="w-3 h-3 text-white" strokeWidth={3} />
                          </motion.div>
                        )}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-[var(--admin-text-muted)] mt-2 pl-1">
                  {FORMAT_OPTIONS.find((f) => f.id === selectedFormat)?.description}
                </p>
              </div>

              {/* ── Column Picker ── */}
              <div>
                <button
                  onClick={() => setShowColumnPicker(!showColumnPicker)}
                  className="flex items-center gap-2 text-xs font-semibold text-[var(--admin-text-secondary)] uppercase tracking-wider hover:text-[var(--admin-text)] transition-colors"
                >
                  <FileType className="w-3.5 h-3.5" />
                  Columns ({enabledColumns.size}/{columns.length})
                  <motion.span
                    animate={{ rotate: showColumnPicker ? 180 : 0 }}
                    className="text-[var(--admin-text-muted)]"
                  >
                    ▾
                  </motion.span>
                </button>

                <AnimatePresence>
                  {showColumnPicker && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 p-3 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface-alt)]">
                        <div className="flex items-center justify-between mb-2">
                          <button
                            onClick={toggleAllColumns}
                            className="text-xs text-[var(--color-turquoise)] font-medium hover:underline"
                          >
                            {enabledColumns.size === columns.length
                              ? "Deselect All"
                              : "Select All"}
                          </button>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                          {columns.map((col) => (
                            <label
                              key={col.key}
                              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-[var(--admin-hover)] transition-colors cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={enabledColumns.has(col.key)}
                                onChange={() => toggleColumn(col.key)}
                                className="rounded border-[var(--admin-border)] text-[var(--color-turquoise)] focus:ring-[var(--color-turquoise)]"
                              />
                              <span className="text-xs text-[var(--admin-text)]">
                                {col.label}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* ── Options ── */}
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Custom Filename */}
                <div className="flex-1">
                  <label className="text-xs font-semibold text-[var(--admin-text-secondary)] uppercase tracking-wider mb-1.5 block">
                    Filename
                  </label>
                  <input
                    type="text"
                    value={customFilename}
                    onChange={(e) => setCustomFilename(e.target.value)}
                    placeholder={
                      defaultFilename ||
                      title.toLowerCase().replace(/[^a-z0-9]+/g, "_")
                    }
                    className="w-full px-3 py-2 border border-[var(--admin-input-border)] rounded-lg text-sm bg-[var(--admin-input-bg)] text-[var(--admin-text)] placeholder:text-[var(--admin-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-turquoise)]/40"
                  />
                </div>

                {/* Include Metadata Toggle */}
                <div className="flex items-end">
                  <label className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--admin-input-border)] bg-[var(--admin-input-bg)] cursor-pointer hover:bg-[var(--admin-hover)] transition-colors">
                    <input
                      type="checkbox"
                      checked={includeMetadata}
                      onChange={(e) => setIncludeMetadata(e.target.checked)}
                      className="rounded border-[var(--admin-border)] text-[var(--color-turquoise)] focus:ring-[var(--color-turquoise)]"
                    />
                    <span className="text-xs text-[var(--admin-text)] whitespace-nowrap font-medium">
                      Include metadata
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* ── Footer Actions ── */}
            <div className="px-6 py-4 border-t border-[var(--admin-border)] bg-[var(--admin-surface-alt)] flex items-center justify-between shrink-0">
              {/* Share button */}
              <div>
                {canShare() ? (
                  <button
                    onClick={handleShare}
                    disabled={isSharing || isExporting || exportData.length === 0}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--admin-border)] text-sm font-medium text-[var(--admin-text-secondary)] hover:bg-[var(--admin-hover)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isSharing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : copied ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Share2 className="w-4 h-4" />
                    )}
                    {copied ? "Copied!" : "Share"}
                  </button>
                ) : (
                  <button
                    onClick={async () => {
                      const summary = `${title} — ${exportData.length} records`;
                      await navigator.clipboard.writeText(summary);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--admin-border)] text-sm font-medium text-[var(--admin-text-secondary)] hover:bg-[var(--admin-hover)] transition-colors"
                  >
                    {copied ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                    {copied ? "Copied!" : "Copy Summary"}
                  </button>
                )}
              </div>

              {/* Download button */}
              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium text-[var(--admin-text-secondary)] hover:bg-[var(--admin-hover)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExport}
                  disabled={isExporting || exportData.length === 0}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed ${
                    exportSuccess
                      ? "bg-emerald-500 text-white"
                      : "bg-[var(--color-navy)] text-white hover:opacity-90"
                  }`}
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Exporting...
                    </>
                  ) : exportSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Done!
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Download{" "}
                      {FORMAT_OPTIONS.find((f) => f.id === selectedFormat)?.label}
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
