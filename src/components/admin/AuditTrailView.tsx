"use client";

import React, { useState, useMemo } from "react";
import { Download } from "lucide-react";

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

  const categories = ["All", "Grand Assembly", "Darimi Session", "Paper Review", "Session Entry", "Live Stream"];

  const handleExportCSV = () => {
    const headers = ["Timestamp", "Module/Admin", "IP", "Category", "Action", "Details"];
    const rows = filteredLogs.map((l) => [
      `"${l.timestamp}"`,
      `"${l.admin}"`,
      `"${l.ip}"`,
      `"${l.category}"`,
      `"${l.action.replace(/"/g, '""')}"`,
      `"${l.details.replace(/"/g, '""')}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `audit_trail_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">System Audit Trail</h2>
          <p className="text-gray-500 text-sm mt-1">
            Real-time chronological activity ledger across registrations, broadcasts, and submissions
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium bg-white hover:bg-gray-50 text-gray-700 shadow-sm transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" strokeWidth={2} aria-hidden="true" /> Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Filter bar */}
        <div className="p-4 border-b border-gray-100 flex flex-wrap gap-4 bg-gray-50/50 items-center justify-between">
          <div className="flex flex-wrap gap-3 items-center">
            <input
              type="text"
              placeholder="Search actions, IDs, or details..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-[var(--color-turquoise)] w-64 bg-white"
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-[var(--color-turquoise)] bg-white"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "All" ? "All Categories" : cat}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-[var(--color-turquoise)] bg-white text-gray-700"
            />
          </div>

          <div className="text-xs text-gray-500">
            Showing <span className="font-semibold text-gray-900">{filteredLogs.length}</span> events
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
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
                <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-6 py-4 text-xs font-mono text-gray-500 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{log.admin}</div>
                    <div className="text-[10px] font-mono text-gray-400 mt-0.5">{log.ip}</div>
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
                  <td className="px-6 py-4 font-medium text-gray-900">{log.action}</td>
                  <td className="px-6 py-4 text-xs text-gray-600 font-mono bg-gray-50/50">
                    {log.details}
                  </td>
                </tr>
              ))}

              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No activity logs match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
