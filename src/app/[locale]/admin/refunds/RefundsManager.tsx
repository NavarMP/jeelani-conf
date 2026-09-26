"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, ArrowUpRight, CheckCircle, Clock, XCircle, FileText } from "lucide-react";

export default function RefundsManager({ initialRefunds }: { initialRefunds: any[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = initialRefunds.filter(ref => {
    const matchesSearch = ref.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          ref.registration_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (ref.phone && ref.phone.includes(searchQuery));
    
    if (statusFilter === "all") return matchesSearch;
    return matchesSearch && ref.refund_status === statusFilter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <span className="px-2 py-1 bg-emerald-500/10 text-emerald-600 rounded-md text-xs font-semibold flex items-center gap-1"><CheckCircle className="w-3 h-3"/> Completed</span>;
      case "processing":
        return <span className="px-2 py-1 bg-amber-500/10 text-amber-600 rounded-md text-xs font-semibold flex items-center gap-1"><Clock className="w-3 h-3"/> Processing</span>;
      case "failed":
        return <span className="px-2 py-1 bg-red-500/10 text-red-600 rounded-md text-xs font-semibold flex items-center gap-1"><XCircle className="w-3 h-3"/> Failed</span>;
      case "eligible":
        return <span className="px-2 py-1 bg-blue-500/10 text-blue-600 rounded-md text-xs font-semibold flex items-center gap-1"><FileText className="w-3 h-3"/> Eligible</span>;
      default:
        return <span className="px-2 py-1 bg-gray-500/10 text-gray-600 rounded-md text-xs font-semibold">None</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[var(--admin-text)]">Refunds Management</h1>
          <p className="text-sm text-[var(--admin-text-secondary)] mt-1">Track and manage refunds for unselected competition teams.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 p-4 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)]">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--admin-text-secondary)]" />
          <input
            type="text"
            placeholder="Search by name, ID, or phone..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[var(--admin-input-bg)] border border-[var(--admin-input-border)] rounded-lg text-sm text-[var(--admin-text)] outline-none focus:border-[var(--color-turquoise)]"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-[var(--admin-input-bg)] border border-[var(--admin-input-border)] rounded-lg text-sm text-[var(--admin-text)] outline-none focus:border-[var(--color-turquoise)]"
        >
          <option value="all">All Statuses</option>
          <option value="eligible">Eligible</option>
          <option value="processing">Processing</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
          <option value="none">None</option>
        </select>
      </div>

      {/* Data Table */}
      <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--admin-surface)] border-b border-[var(--admin-border)] text-[var(--admin-text-secondary)]">
              <tr>
                <th className="px-4 py-3 font-medium">Registration</th>
                <th className="px-4 py-3 font-medium">Contact</th>
                <th className="px-4 py-3 font-medium">Refund Status</th>
                <th className="px-4 py-3 font-medium">Txn ID / Notes</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--admin-border)]">
              {filtered.length > 0 ? (
                filtered.map(ref => (
                  <tr key={ref.id} className="hover:bg-[var(--admin-hover)] transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-[var(--admin-text)]">{ref.name}</div>
                      <div className="text-xs text-[var(--admin-text-secondary)] font-mono">{ref.registration_id}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-[var(--admin-text)]">{ref.phone}</div>
                      <div className="text-xs text-[var(--admin-text-secondary)]">{ref.place || "N/A"}</div>
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(ref.refund_status)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs font-mono text-[var(--admin-text)] max-w-[150px] truncate" title={ref.refund_transaction_id}>
                        {ref.refund_transaction_id || "—"}
                      </div>
                      <div className="text-xs text-[var(--admin-text-secondary)] max-w-[150px] truncate" title={ref.refund_notes}>
                        {ref.refund_notes || "—"}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/registrations/${ref.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-[var(--admin-input-bg)] hover:bg-[var(--admin-border)] text-[var(--admin-text)] rounded-lg transition-colors border border-[var(--admin-border)]"
                      >
                        Manage <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-[var(--admin-text-secondary)]">
                    No refunds found.
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
