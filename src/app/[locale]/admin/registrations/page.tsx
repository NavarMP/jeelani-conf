"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";

import { useSearchParams } from "next/navigation";
import { useSessions } from "@/lib/useSessions";
import { createClient } from "@/lib/supabase/client";

function RegistrationsContent() {
  const searchParams = useSearchParams();
  const typeFilter = searchParams.get("type") || "all";
  const [searchTerm, setSearchTerm] = useState("");
  const { activeSessions, sessions } = useSessions();
  
  const [registrations, setRegistrations] = useState<any[]>([]);
  const supabase = createClient();

  React.useEffect(() => {
    const fetchRegistrations = async () => {
      const { data, error } = await supabase
        .from('dynamic_registrations')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (data) {
        setRegistrations(data);
      } else {
        console.error(error);
      }
    };
    fetchRegistrations();
  }, []);

  const filteredRegistrations = registrations.filter((r) => {
    if (typeFilter !== "all" && r.session_slug !== typeFilter) return false;
    if (searchTerm && !r.name?.toLowerCase().includes(searchTerm.toLowerCase()) && !r.registration_id?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <>
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Registrations</h2>
          <p className="text-gray-500 text-sm mt-1">Manage attendees across all events</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium bg-white hover:bg-gray-50 text-gray-700 shadow-sm transition-colors">
            Export CSV
          </button>
          <button className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--color-navy)] text-white hover:bg-[var(--color-navy)]/90 shadow-sm transition-colors">
            Add Attendee
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
        <div className="flex gap-2 flex-wrap">
          <Link
            href="/admin/registrations"
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${typeFilter === 'all' ? 'bg-[var(--color-turquoise)]/10 text-[var(--color-turquoise)]' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            All
          </Link>
          {activeSessions.map(event => (
            <Link
              key={event.id}
              href={`/admin/registrations?type=${event.id}`}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${typeFilter === event.id ? 'bg-[var(--color-turquoise)]/10 text-[var(--color-turquoise)]' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              {event.label}
            </Link>
          ))}
        </div>
        
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Search name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[var(--color-turquoise)] focus:border-[var(--color-turquoise)] outline-none"
          />
          <svg className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-semibold">Reg ID</th>
                <th className="px-6 py-4 font-semibold">Name / Contact</th>
                <th className="px-6 py-4 font-semibold">Place</th>
                <th className="px-6 py-4 font-semibold">Type</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRegistrations.map((reg) => (
                <tr key={reg.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-gray-600">
                    {reg.id}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{reg.name}</div>
                    <div className="text-gray-500 text-xs mt-0.5">{reg.phone} {reg.email && `• ${reg.email}`}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {reg.place}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-gray-50 text-gray-700 rounded-md text-xs font-medium border border-gray-200">
                      {sessions.find(e => e.id === reg.type)?.label || reg.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {reg.status === "confirmed" ? (
                      <span className="flex items-center text-green-600 text-xs font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></span> Confirmed
                      </span>
                    ) : (
                      <span className="flex items-center text-amber-600 text-xs font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span> Pending
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-gray-400 hover:text-[var(--color-turquoise)] p-1 transition-colors">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button className="text-gray-400 hover:text-red-500 p-1 ml-2 transition-colors">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
              {filteredRegistrations.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No registrations found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination mock */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-sm">
          <span className="text-gray-500">Showing 1 to {filteredRegistrations.length} of {filteredRegistrations.length} entries</span>
          <div className="flex gap-1">
            <button className="px-3 py-1 border border-gray-200 rounded text-gray-400 cursor-not-allowed">Previous</button>
            <button className="px-3 py-1 bg-[var(--color-navy)] text-white rounded">1</button>
            <button className="px-3 py-1 border border-gray-200 rounded text-gray-600 hover:bg-gray-50">Next</button>
          </div>
        </div>
      </div>
    </>
  );
}

export default function RegistrationsPage() {
  return (
    <div className="space-y-6">
      <Suspense fallback={<div>Loading registrations...</div>}>
        <RegistrationsContent />
      </Suspense>
    </div>
  );
}
