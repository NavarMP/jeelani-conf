"use client";

import React, { useState, useMemo } from "react";
import { Download } from "lucide-react";
import { DateTimePicker } from "@/components/ui/DateTimePicker";
import { type ExportColumn, type ActiveFilter } from "@/lib/exportUtils";
import ExportModal from "@/components/admin/ExportModal";

export interface AuditLog {
  timestamp: string;
  admin: string;
  ip: string;
  category: string;
  color: string;
  action: string;
  details: string;
}

interface Props {
  initialLogs: AuditLog[];
}

export default function AuditTrailView({ initialLogs }: Props) {
  const [logs, setLogs] = useState<AuditLog[]>(initialLogs);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [showExportModal, setShowExportModal] = useState(false);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (selectedCategory !== "All" && log.category !== selectedCategory) return false;
      if (dateFilter && !log.timestamp.startsWith(dateFilter)) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          log.action.toLowerCase().includes(q) ||
          log.details.toLowerCase().includes(q) ||
          log.admin.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [logs, selectedCategory, searchQuery, dateFilter]);

  const categories = ["All", "Grand Assembly", "Astronomy & AI Fiqh", "Session Entry", "Live Stream"];

  // Export column definitions
  const exportColumns: ExportColumn[] = useMemo(() => [
    { key: "timestamp", label: "Timestamp", format: (v: any) => v ? new Date(v).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "" },
    { key: "admin", label: "Module / Actor" },
    { key: "ip", label: "IP Address" },
    { key: "category", label: "Category" },
    { key: "action", label: "Action" },
    { key: "details", label: "Details" },
  ], []);

  // Active filters for export
  const exportActiveFilters: ActiveFilter[] = useMemo(() => {
    const filters: ActiveFilter[] = [];
    if (selectedCategory !== "All") filters.push({ label: "Category", value: selectedCategory });
    if (searchQuery) filters.push({ label: "Search", value: searchQuery });
    if (dateFilter) filters.push({ label: "Date", value: dateFilter });
    return filters;
  }, [selectedCategory, searchQuery, dateFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--admin-text)]">System Audit Trail</h2>
          <p className="text-[var(--admin-text-secondary)] text-sm mt-1">
            Real-time chronological activity ledger across registrations, broadcasts, and submissions
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowExportModal(true)}
            className="px-4 py-2 border border-[var(--admin-input-border)] rounded-lg text-sm font-medium bg-[var(--admin-surface)] hover:bg-[var(--admin-surface-alt)] text-[var(--admin-text-secondary)] shadow-sm transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" strokeWidth={2} aria-hidden="true" /> Export
          </button>
        </div>
      </div>

      <div className="bg-[var(--admin-surface)] rounded-2xl border border-[var(--admin-border)] shadow-sm overflow-hidden">
        {/* Filter bar */}
        <div className="p-4 border-b border-[var(--admin-border-subtle)] flex flex-wrap gap-4 bg-[var(--admin-surface-alt)]/50 items-center justify-between">
          <div className="flex flex-wrap gap-3 items-center">
            <input
              type="text"
              placeholder="Search actions, IDs, or details..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-1.5 border border-[var(--admin-input-border)] rounded-lg text-sm outline-none focus:border-[var(--color-turquoise)] w-64 bg-[var(--admin-surface)]"
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 border border-[var(--admin-input-border)] rounded-lg text-sm outline-none focus:border-[var(--color-turquoise)] bg-[var(--admin-surface)]"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "All" ? "All Categories" : cat}
                </option>
              ))}
            </select>
            <div className="w-48">
              <DateTimePicker
                mode="date"
                value={dateFilter}
                onChange={(d) => setDateFilter(d)}
                placeholder="Filter by date..."
                clearable
              />
            </div>
          </div>

          <div className="text-xs text-[var(--admin-text-secondary)]">
            Showing <span className="font-semibold text-[var(--admin-text)]">{filteredLogs.length}</span> events
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-[var(--admin-text-secondary)] uppercase bg-[var(--admin-surface-alt)] border-b border-[var(--admin-border)]">
              <tr>
                <th className="px-6 py-4 font-semibold">Timestamp</th>
                <th className="px-6 py-4 font-semibold">Module / Actor</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">Action & Record</th>
                <th className="px-6 py-4 font-semibold">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLogs.map((log, idx) => (
                <tr key={idx} className="hover:bg-[var(--admin-surface-alt)]/80 transition-colors">
                  <td className="px-6 py-4 text-xs font-mono text-[var(--admin-text-secondary)] whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-[var(--admin-text)]">{log.admin}</div>
                    <div className="text-[10px] font-mono text-[var(--admin-text-muted)] mt-0.5">{log.ip}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                        log.color === "blue"
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : log.color === "emerald"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : log.color === "purple"
                          ? "bg-purple-50 text-purple-700 border-purple-200"
                          : log.color === "red"
                          ? "bg-red-50 text-red-700 border-red-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      {log.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-[var(--admin-text)]">{log.action}</td>
                  <td className="px-6 py-4 text-xs text-[var(--admin-text-secondary)] font-mono bg-[var(--admin-surface-alt)]/50">
                    {log.details}
                  </td>
                </tr>
              ))}

              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[var(--admin-text-secondary)]">
                    No activity logs match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        title="Audit Trail"
        allData={logs}
        filteredData={filteredLogs}
        columns={exportColumns}
        activeFilters={exportActiveFilters}
        defaultFilename="audit_trail"
      />
    </div>
  );
}
