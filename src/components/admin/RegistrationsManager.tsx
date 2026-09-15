"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { fetchRegistrationsAction } from "@/app/[locale]/admin/actions";
import RegistrationDetailModal from "@/components/admin/RegistrationDetailModal";

interface Props {
  initialRegistrations: any[];
}

function RegistrationsContent({ initialRegistrations }: Props) {
  const searchParams = useSearchParams();
  const typeFilter = searchParams.get("type") || "all";
  const [searchTerm, setSearchTerm] = useState("");
  
  const [registrations, setRegistrations] = useState<any[]>(initialRegistrations);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedReg, setSelectedReg] = useState<any | null>(null);

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

  const filteredRegistrations = registrations.filter((r) => {
    if (typeFilter !== "all" && r.typeSlug !== typeFilter) return false;
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

  // Color mapping for type badges
  const typeColorMap: Record<string, string> = {
    assembly: "bg-blue-50 text-blue-700 border-blue-200",
    darimi: "bg-emerald-50 text-emerald-700 border-emerald-200",
    "burda-qawwali": "bg-amber-50 text-amber-700 border-amber-200",
    "darimi-academic": "bg-purple-50 text-purple-700 border-purple-200",
    "dars-management-meet": "bg-cyan-50 text-cyan-700 border-cyan-200",
  };

  const getTypeColor = (slug: string) => typeColorMap[slug] || "bg-gray-50 text-gray-700 border-gray-200";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Registrations & Entries</h2>
          <p className="text-gray-500 text-sm mt-1">
            Real-time management of all conference attendees, payments, and approvals
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={refreshRegistrations}
            disabled={isLoading}
            className="px-4 py-2 border border-gray-300 rounded-xl text-sm font-medium bg-white hover:bg-gray-50 text-gray-700 shadow-sm transition-colors flex items-center gap-2"
          >
            <span className={isLoading ? "animate-spin" : ""}>🔄</span> Refresh
          </button>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/registrations"
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              typeFilter === "all"
                ? "bg-[var(--color-navy)] text-white"
                : "text-gray-600 hover:bg-gray-100"
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
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {group.name} ({group.count})
            </Link>
          ))}
        </div>

        <div className="w-full md:w-72">
          <input
            type="text"
            placeholder="Search by name, ID, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3.5 py-1.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-[var(--color-turquoise)]"
          />
        </div>
      </div>

      {/* Registrations Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Attendee (ID)</th>
                <th className="px-6 py-4 font-semibold">Type & Program</th>
                <th className="px-6 py-4 font-semibold">Location / Place</th>
                <th className="px-6 py-4 font-semibold">Contact</th>
                <th className="px-6 py-4 font-semibold">Status / Details</th>
                <th className="px-6 py-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRegistrations.map((reg) => (
                <tr
                  key={reg.id}
                  onClick={() => setSelectedReg(reg)}
                  className="hover:bg-blue-50/40 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">{reg.name}</div>
                    <div className="text-xs font-mono text-gray-500 mt-0.5">{reg.registration_id}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getTypeColor(reg.typeSlug)}`}
                    >
                      {reg.typeName}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{reg.place || "-"}</td>
                  <td className="px-6 py-4 text-xs font-mono text-gray-600">
                    <div>{reg.phone}</div>
                    {reg.email && <div className="text-gray-400 font-sans mt-0.5">{reg.email}</div>}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1 items-start">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          reg.status === "confirmed" || reg.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : reg.status === "cancelled" || reg.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {reg.status || "Pending"}
                      </span>
                      {reg.payment_status && (
                        <span className="text-[10px] text-emerald-700 font-medium bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          Payment: {reg.payment_status}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedReg(reg);
                      }}
                      className="px-3 py-1.5 text-xs font-semibold text-[var(--color-navy)] bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      View Details ↗
                    </button>
                  </td>
                </tr>
              ))}

              {filteredRegistrations.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No registrations found matching the filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
    <Suspense fallback={<div className="p-8 text-gray-500">Loading registrations...</div>}>
      <RegistrationsContent initialRegistrations={initialRegistrations} />
    </Suspense>
  );
}
