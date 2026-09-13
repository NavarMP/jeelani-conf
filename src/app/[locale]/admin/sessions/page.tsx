"use client";

import React, { useState } from "react";
import { useSessions } from "@/lib/useSessions";

export default function SessionsPage() {
  const { sessions, isLoaded, addSession, toggleRegistration, toggleArchive, deleteSession } = useSessions();
  const [newSessionName, setNewSessionName] = useState("");

  const handleAddSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSessionName.trim()) {
      addSession(newSessionName.trim());
      setNewSessionName("");
    }
  };

  if (!isLoaded) return <div className="p-8 text-gray-500">Loading sessions...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sessions Management</h2>
          <p className="text-gray-500 text-sm mt-1">Manage events, toggle registrations, and archive old sessions</p>
        </div>
      </div>

      {/* Create New Session */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Session</h3>
        <form onSubmit={handleAddSession} className="flex gap-4">
          <input
            type="text"
            value={newSessionName}
            onChange={(e) => setNewSessionName(e.target.value)}
            placeholder="e.g. Workshop on AI, Panel Discussion"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[var(--color-turquoise)] focus:border-[var(--color-turquoise)] outline-none"
            required
          />
          <button
            type="submit"
            className="px-6 py-2 rounded-lg text-sm font-medium bg-[var(--color-navy)] text-white hover:bg-[var(--color-navy)]/90 shadow-sm transition-colors"
          >
            Create Session
          </button>
        </form>
      </div>

      {/* Sessions List */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-semibold">Session Name (ID)</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Registration</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sessions.map((session) => (
                <tr key={session.id} className={`transition-colors ${session.isArchived ? 'bg-gray-50/50 opacity-75' : 'hover:bg-gray-50'}`}>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{session.label}</div>
                    <div className="text-gray-500 text-xs mt-0.5 font-mono">{session.id}</div>
                  </td>
                  <td className="px-6 py-4">
                    {session.isArchived ? (
                      <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-medium border border-gray-200">Archived</span>
                    ) : (
                      <span className="px-2.5 py-1 bg-green-50 text-green-700 rounded-md text-xs font-medium border border-green-100">Active</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleRegistration(session.id, session.isRegistrationOpen)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${session.isRegistrationOpen ? 'bg-[var(--color-turquoise)]' : 'bg-gray-200'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${session.isRegistrationOpen ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                    <span className="ml-2 text-xs text-gray-500 align-middle">
                      {session.isRegistrationOpen ? 'Open' : 'Closed'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <button 
                      onClick={() => toggleArchive(session.id, session.isArchived)}
                      className={`text-xs font-medium transition-colors ${session.isArchived ? 'text-blue-600 hover:text-blue-800' : 'text-amber-600 hover:text-amber-800'}`}
                    >
                      {session.isArchived ? 'Unarchive' : 'Archive'}
                    </button>
                    <button 
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete "${session.label}"?`)) {
                          deleteSession(session.id);
                        }
                      }}
                      className="text-xs font-medium text-red-600 hover:text-red-800 transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {sessions.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    No sessions found. Create one above.
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
