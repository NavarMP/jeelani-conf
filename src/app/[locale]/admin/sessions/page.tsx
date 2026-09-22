"use client";

import React, { useState } from "react";
import { useSessions, type Session } from "@/lib/useSessions";
import SessionStatusModal from "@/components/admin/SessionStatusModal";
import { Edit2, Calendar, Lock, Unlock, AlertTriangle } from "lucide-react";

export default function SessionsPage() {
  const { sessions, isLoaded, addSession, updateSessionAdvancedStatus, toggleArchive, deleteSession } = useSessions();
  const [newSessionName, setNewSessionName] = useState("");
  
  const [editingSession, setEditingSession] = useState<Session | null>(null);

  const handleAddSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSessionName.trim()) {
      addSession(newSessionName.trim());
      setNewSessionName("");
    }
  };

  const getStatusBadge = (session: Session) => {
    const status = session.status || (session.isRegistrationOpen ? 'open' : 'closed');
    switch (status) {
      case 'open':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-md text-xs font-medium border border-emerald-100"><Unlock className="w-3 h-3" /> Open</span>;
      case 'closed':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-700 rounded-md text-xs font-medium border border-red-100"><Lock className="w-3 h-3" /> Closed</span>;
      case 'temporarily_closed':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-orange-50 text-orange-700 rounded-md text-xs font-medium border border-orange-100"><AlertTriangle className="w-3 h-3" /> Temp. Closed</span>;
      case 'scheduled':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium border border-blue-100"><Calendar className="w-3 h-3" /> Scheduled</span>;
      default:
        return null;
    }
  };

  if (!isLoaded) return <div className="p-8 text-gray-500">Loading sessions...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[var(--admin-text)]">Sessions Management</h2>
          <p className="text-[var(--admin-text-secondary)] text-sm mt-1">Manage events, advanced registration status, and archive old sessions</p>
        </div>
      </div>

      {/* Create New Session */}
      <div className="bg-[var(--admin-surface)] p-6 rounded-xl border border-[var(--admin-border)] shadow-sm mb-6">
        <h3 className="text-lg font-semibold text-[var(--admin-text)] mb-4">Create New Session</h3>
        <form onSubmit={handleAddSession} className="flex gap-4">
          <input
            type="text"
            value={newSessionName}
            onChange={(e) => setNewSessionName(e.target.value)}
            placeholder="e.g. Workshop on AI, Panel Discussion"
            className="flex-1 px-4 py-2 bg-[var(--admin-input-bg)] border border-[var(--admin-input-border)] rounded-lg text-sm text-[var(--admin-text)] focus:ring-2 focus:ring-[var(--color-turquoise)]/50 focus:border-[var(--color-turquoise)] outline-none transition-all"
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
      <div className="bg-[var(--admin-surface)] rounded-xl border border-[var(--admin-border)] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-[var(--admin-text-secondary)] uppercase bg-[var(--admin-surface-alt)] border-b border-[var(--admin-border)]">
              <tr>
                <th className="px-6 py-4 font-semibold">Session Name (ID)</th>
                <th className="px-6 py-4 font-semibold">State</th>
                <th className="px-6 py-4 font-semibold">Registration Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--admin-border-subtle)]">
              {sessions.map((session) => (
                <tr key={session.id} className={`transition-colors ${session.isArchived ? 'bg-[var(--admin-surface-alt)] opacity-75' : 'hover:bg-[var(--admin-hover)]'}`}>
                  <td className="px-6 py-4">
                    <div className="font-medium text-[var(--admin-text)]">{session.label}</div>
                    <div className="text-[var(--admin-text-muted)] text-xs mt-0.5 font-mono">{session.id}</div>
                  </td>
                  <td className="px-6 py-4">
                    {session.isArchived ? (
                      <span className="px-2.5 py-1 bg-[var(--admin-surface-alt)] text-[var(--admin-text-muted)] rounded-md text-xs font-medium border border-[var(--admin-border)]">Archived</span>
                    ) : (
                      <span className="px-2.5 py-1 bg-green-500/10 text-green-700 dark:text-green-400 rounded-md text-xs font-medium border border-green-500/20">Active</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {getStatusBadge(session)}
                      <button
                        onClick={() => setEditingSession(session)}
                        className="text-[var(--admin-text-muted)] hover:text-[var(--color-turquoise)] transition-colors p-1"
                        title="Edit Registration Status"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <button 
                      onClick={() => toggleArchive(session.id, session.isArchived)}
                      className={`text-xs font-medium transition-colors ${session.isArchived ? 'text-[var(--color-turquoise)] hover:text-blue-500' : 'text-amber-600 hover:text-amber-800 dark:text-amber-500 dark:hover:text-amber-400'}`}
                    >
                      {session.isArchived ? 'Unarchive' : 'Archive'}
                    </button>
                    <button 
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete "${session.label}"?`)) {
                          deleteSession(session.id);
                        }
                      }}
                      className="text-xs font-medium text-red-600 hover:text-red-800 dark:text-red-500 dark:hover:text-red-400 transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {sessions.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-[var(--admin-text-muted)]">
                    No sessions found. Create one above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <SessionStatusModal
        isOpen={!!editingSession}
        onClose={() => setEditingSession(null)}
        session={editingSession}
        onSave={updateSessionAdvancedStatus}
      />
    </div>
  );
}
