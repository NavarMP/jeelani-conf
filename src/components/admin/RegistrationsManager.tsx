"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { fetchRegistrationsAction } from "@/app/[locale]/admin/actions";
import RegistrationDetailModal from "@/components/admin/RegistrationDetailModal";
import { RefreshCw, ArrowUpRight, Download, ChevronUp, ChevronDown, CheckSquare, Square, Trash2, CheckCircle, XCircle, ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  initialRegistrations: any[];
}

type SortField = "name" | "typeName" | "place" | "status" | "created_at";
type SortDirection = "asc" | "desc";

function RegistrationsContent({ initialRegistrations }: Props) {
  const searchParams = useSearchParams();
  const typeFilter = searchParams.get("type") || "all";
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  const [registrations, setRegistrations] = useState<any[]>(initialRegistrations);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedReg, setSelectedReg] = useState<any | null>(null);

  // Sorting
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const refreshRegistrations = async () => {
    setIsLoading(true);
    try {
      const data = await fetchRegistrationsAction();
      setRegistrations(data);
    } catch (error) {
      console.error("Failed to refresh registrations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalClose = () => {
    setSelectedReg(null);
    refreshRegistrations();
  };

  // Derive unique type slugs for dynamic tabs
  const typeGroups = registrations.reduce((acc: Record<string, { slug: string; name: string; count: number }>, r) => {
    const slug = r.typeSlug;
    if (!acc[slug]) {
      acc[slug] = { slug, name: r.typeName, count: 0 };
    }
    acc[slug].count++;
    return acc;
  }, {});

  // Filtered + sorted registrations
  const processedRegistrations = useMemo(() => {
    let filtered = registrations.filter((r) => {
      if (typeFilter !== "all" && r.typeSlug !== typeFilter) return false;
      if (statusFilter !== "all" && (r.status || "pending") !== statusFilter) return false;
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return (
          r.name?.toLowerCase().includes(term) ||
          r.registration_id?.toLowerCase().includes(term) ||
          r.phone?.toLowerCase().includes(term) ||
          r.place?.toLowerCase().includes(term) ||
          r.email?.toLowerCase().includes(term)
        );
      }
      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      let aVal = a[sortField] || "";
      let bVal = b[sortField] || "";
      if (sortField === "created_at") {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      } else {
        aVal = String(aVal).toLowerCase();
        bVal = String(bVal).toLowerCase();
      }
      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [registrations, typeFilter, statusFilter, searchTerm, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(processedRegistrations.length / pageSize);
  const paginatedRegistrations = processedRegistrations.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [typeFilter, statusFilter, searchTerm, sortField, sortDirection, pageSize]);

  // Sorting handler
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const SortIndicator = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronUp className="w-3 h-3 opacity-0 group-hover:opacity-30" />;
    return sortDirection === "asc" ? (
      <ChevronUp className="w-3 h-3 text-[var(--color-turquoise)]" />
    ) : (
      <ChevronDown className="w-3 h-3 text-[var(--color-turquoise)]" />
    );
  };

  // Bulk selection
  const toggleSelection = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleAll = () => {
    if (selectedIds.size === paginatedRegistrations.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedRegistrations.map((r) => r.id)));
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    const rows = processedRegistrations;
    const headers = ["Registration ID", "Name", "Type", "Place", "Phone", "Email", "Status", "Created At"];
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [
        headers.join(","),
        ...rows.map((r) =>
          [
            `"${r.registration_id || ""}"`,
            `"${(r.name || "").replace(/"/g, '""')}"`,
            `"${r.typeName || ""}"`,
            `"${(r.place || "").replace(/"/g, '""')}"`,
            `"${r.phone || ""}"`,
            `"${r.email || ""}"`,
            `"${r.status || "pending"}"`,
            `"${r.created_at || ""}"`,
          ].join(",")
        ),
      ].join("\n");

    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `registrations_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Color mapping for type badges
  const typeColorMap: Record<string, string> = {
    assembly: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    darimi: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
    "burda-qawwali": "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
    "astro-ai-fiqh": "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
    "dars-management-meet": "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/20",
  };

  const getTypeColor = (slug: string) => typeColorMap[slug] || "bg-[var(--admin-badge-bg)] text-[var(--admin-text-secondary)] border-[var(--admin-border)]";

  // Unique statuses for filter
  const allStatuses = useMemo(() => {
    const set = new Set(registrations.map((r) => r.status || "pending"));
    return Array.from(set);
  }, [registrations]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--admin-text)]">Registrations & Entries</h2>
          <p className="text-[var(--admin-text-secondary)] text-sm mt-1">
            Real-time management of all conference attendees, payments, and approvals
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 border border-[var(--admin-border)] rounded-xl text-xs font-medium bg-[var(--admin-surface)] hover:bg-[var(--admin-hover)] text-[var(--admin-text-secondary)] shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" strokeWidth={2} aria-hidden="true" /> CSV
          </button>
          <button
            onClick={refreshRegistrations}
            disabled={isLoading}
            className="px-3 py-2 border border-[var(--admin-border)] rounded-xl text-xs font-medium bg-[var(--admin-surface)] hover:bg-[var(--admin-hover)] text-[var(--admin-text-secondary)] shadow-sm transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} strokeWidth={2} aria-hidden="true" /> Refresh
          </button>
        </div>
      </div>

      {/* Tabs, Search & Filters */}
      <div className="bg-[var(--admin-surface)] p-4 rounded-2xl border border-[var(--admin-border)] shadow-sm space-y-3">
        {/* Type tabs */}
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/registrations"
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              typeFilter === "all"
                ? "bg-[var(--color-navy)] text-white"
                : "text-[var(--admin-text-secondary)] hover:bg-[var(--admin-hover)]"
            }`}
          >
            All Types ({registrations.length})
          </Link>
          {Object.values(typeGroups).map((group) => (
            <Link
              key={group.slug}
              href={`/admin/registrations?type=${group.slug}`}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                typeFilter === group.slug
                  ? "bg-[var(--color-navy)] text-white"
                  : "text-[var(--admin-text-secondary)] hover:bg-[var(--admin-hover)]"
              }`}
            >
              {group.name} ({group.count})
            </Link>
          ))}
        </div>

        {/* Search + Status filter */}
        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="text"
            placeholder="Search by name, ID, phone, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-3.5 py-2 border border-[var(--admin-input-border)] rounded-lg text-sm outline-none focus:border-[var(--color-turquoise)] bg-[var(--admin-input-bg)] text-[var(--admin-text)] placeholder:text-[var(--admin-text-muted)]"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-[var(--admin-input-border)] rounded-lg text-sm outline-none focus:border-[var(--color-turquoise)] bg-[var(--admin-input-bg)] text-[var(--admin-text)] w-full md:w-44"
          >
            <option value="all">All Statuses</option>
            {allStatuses.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bulk actions toolbar */}
      {selectedIds.size > 0 && (
        <div className="bg-[var(--color-turquoise)]/10 border border-[var(--color-turquoise)]/20 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm font-medium text-[var(--admin-text)]">
            {selectedIds.size} selected
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => {
                // Export selected only
                const selectedRegs = processedRegistrations.filter((r) => selectedIds.has(r.id));
                const headers = ["Registration ID", "Name", "Type", "Place", "Phone", "Email", "Status"];
                const csvContent =
                  "data:text/csv;charset=utf-8," +
                  [headers.join(","), ...selectedRegs.map((r) => [
                    `"${r.registration_id || ""}"`, `"${r.name || ""}"`, `"${r.typeName || ""}"`,
                    `"${r.place || ""}"`, `"${r.phone || ""}"`, `"${r.email || ""}"`, `"${r.status || "pending"}"`,
                  ].join(","))].join("\n");
                const link = document.createElement("a");
                link.href = encodeURI(csvContent);
                link.download = `selected_registrations.csv`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              className="text-xs px-3 py-1.5 bg-[var(--admin-surface)] text-[var(--admin-text-secondary)] font-medium rounded-lg hover:bg-[var(--admin-hover)] transition-colors border border-[var(--admin-border)] flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> Export Selected
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="text-xs px-3 py-1.5 text-[var(--admin-text-muted)] font-medium rounded-lg hover:bg-[var(--admin-hover)] transition-colors"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Registrations Table */}
      <div className="bg-[var(--admin-surface)] rounded-2xl border border-[var(--admin-border)] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-[var(--admin-text-secondary)] uppercase bg-[var(--admin-surface-alt)] border-b border-[var(--admin-border)]">
              <tr>
                <th className="px-4 py-4 w-10">
                  <button onClick={toggleAll} className="flex items-center text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] transition-colors">
                    {selectedIds.size === paginatedRegistrations.length && paginatedRegistrations.length > 0 ? (
                      <CheckSquare className="w-4 h-4" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-4 font-semibold">
                  <button onClick={() => handleSort("name")} className="group flex items-center gap-1 hover:text-[var(--admin-text)] transition-colors">
                    Attendee <SortIndicator field="name" />
                  </button>
                </th>
                <th className="px-4 py-4 font-semibold">
                  <button onClick={() => handleSort("typeName")} className="group flex items-center gap-1 hover:text-[var(--admin-text)] transition-colors">
                    Type <SortIndicator field="typeName" />
                  </button>
                </th>
                <th className="px-4 py-4 font-semibold">
                  <button onClick={() => handleSort("place")} className="group flex items-center gap-1 hover:text-[var(--admin-text)] transition-colors">
                    Location <SortIndicator field="place" />
                  </button>
                </th>
                <th className="px-4 py-4 font-semibold hidden lg:table-cell">Contact</th>
                <th className="px-4 py-4 font-semibold">
                  <button onClick={() => handleSort("status")} className="group flex items-center gap-1 hover:text-[var(--admin-text)] transition-colors">
                    Status <SortIndicator field="status" />
                  </button>
                </th>
                <th className="px-4 py-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--admin-border-subtle)]">
              {paginatedRegistrations.map((reg) => (
                <tr
                  key={reg.id}
                  onClick={() => setSelectedReg(reg)}
                  className={`hover:bg-[var(--admin-hover)] cursor-pointer transition-colors ${
                    selectedIds.has(reg.id) ? "bg-[var(--color-turquoise)]/5" : ""
                  }`}
                >
                  <td className="px-4 py-4">
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleSelection(reg.id); }}
                      className="text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] transition-colors"
                    >
                      {selectedIds.has(reg.id) ? (
                        <CheckSquare className="w-4 h-4 text-[var(--color-turquoise)]" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-bold text-[var(--admin-text)]">{reg.name}</div>
                    <div className="text-xs font-mono text-[var(--admin-text-muted)] mt-0.5">{reg.registration_id}</div>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getTypeColor(reg.typeSlug)}`}
                    >
                      {reg.typeName}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-[var(--admin-text-secondary)]">{reg.place || "-"}</td>
                  <td className="px-4 py-4 text-xs font-mono text-[var(--admin-text-secondary)] hidden lg:table-cell">
                    <div>{reg.phone}</div>
                    {reg.email && <div className="text-[var(--admin-text-muted)] font-sans mt-0.5">{reg.email}</div>}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col gap-1 items-start">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          reg.status === "confirmed" || reg.status === "approved"
                            ? "bg-green-500/10 text-green-700 dark:text-green-400"
                            : reg.status === "cancelled" || reg.status === "rejected"
                            ? "bg-red-500/10 text-red-700 dark:text-red-400"
                            : "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                        }`}
                      >
                        {reg.status || "Pending"}
                      </span>
                      {reg.payment_status && (
                        <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                          Payment: {reg.payment_status}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedReg(reg);
                      }}
                      className="px-3 py-1.5 text-xs font-semibold text-[var(--color-turquoise)] bg-[var(--admin-hover)] hover:bg-[var(--admin-border)] rounded-lg transition-colors"
                    >
                      Details <ArrowUpRight className="inline w-3 h-3" strokeWidth={2.25} aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              ))}

              {paginatedRegistrations.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-[var(--admin-text-secondary)]">
                    No registrations found matching the filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        {processedRegistrations.length > 0 && (
          <div className="px-4 py-3 border-t border-[var(--admin-border)] flex flex-col sm:flex-row items-center justify-between gap-3 bg-[var(--admin-surface-alt)]">
            <div className="flex items-center gap-3 text-xs text-[var(--admin-text-secondary)]">
              <span>
                Showing <span className="font-semibold text-[var(--admin-text)]">{(currentPage - 1) * pageSize + 1}</span>–
                <span className="font-semibold text-[var(--admin-text)]">{Math.min(currentPage * pageSize, processedRegistrations.length)}</span> of{" "}
                <span className="font-semibold text-[var(--admin-text)]">{processedRegistrations.length}</span>
              </span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="px-2 py-1 border border-[var(--admin-input-border)] rounded-lg text-xs outline-none bg-[var(--admin-input-bg)] text-[var(--admin-text)]"
              >
                <option value={25}>25 / page</option>
                <option value={50}>50 / page</option>
                <option value={100}>100 / page</option>
              </select>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-[var(--admin-border)] text-[var(--admin-text-secondary)] hover:bg-[var(--admin-hover)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                      currentPage === pageNum
                        ? "bg-[var(--color-navy)] text-white"
                        : "text-[var(--admin-text-secondary)] hover:bg-[var(--admin-hover)]"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-[var(--admin-border)] text-[var(--admin-text-secondary)] hover:bg-[var(--admin-hover)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Registration Details Modal */}
      {selectedReg && (
        <RegistrationDetailModal
          registration={selectedReg}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
}

export default function RegistrationsManager({ initialRegistrations }: Props) {
  return (
    <Suspense fallback={<div className="p-8 text-[var(--admin-text-secondary)]">Loading registrations...</div>}>
      <RegistrationsContent initialRegistrations={initialRegistrations} />
    </Suspense>
  );
}
