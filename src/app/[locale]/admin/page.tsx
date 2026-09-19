import React from "react";
import { getAdminDashboardStats, getRecentRegistrations, getFeedbackStats } from "@/lib/data";

export const metadata = {
  title: "Admin Dashboard | Grand Jeelani Conference",
};

// Helper to calculate relative time
function timeAgo(dateString: string) {
  const diff = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes} mins ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hours ago`;
  return `${Math.floor(hours / 24)} days ago`;
}

export default async function AdminDashboard() {
  const stats = await getAdminDashboardStats();
  const recentRegistrations = await getRecentRegistrations();
  const feedbackStats = await getFeedbackStats();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-[var(--admin-text)]">Dashboard Overview</h2>
          <p className="text-[var(--admin-text-secondary)] text-sm mt-1">Live metrics and event status</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-[var(--admin-text-secondary)] uppercase tracking-wide font-semibold mb-1">Time to Event</div>
          <div className="text-xl font-mono text-[var(--color-navy)] dark:text-[var(--color-turquoise)] font-bold">14d 01h 59m</div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[var(--admin-surface)] p-5 rounded-xl border border-[var(--admin-border)] shadow-sm">
          <h3 className="text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Total Registrations</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[var(--admin-text)]">{stats.totalRegistrations}</span>
            <span className="text-xs text-green-500 font-medium">Active</span>
          </div>
        </div>
        
        <div className="bg-[var(--admin-surface)] p-5 rounded-xl border border-[var(--admin-border)] shadow-sm">
          <h3 className="text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Dynamic Registrations</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[var(--admin-text)]">{stats.dynamicRegistrations}</span>
            <span className="text-xs text-purple-500 font-medium">Burda, Astro & AI Fiqh, Dars</span>
          </div>
        </div>
        
        <div className="bg-[var(--admin-surface)] p-5 rounded-xl border border-[var(--admin-border)] shadow-sm relative overflow-hidden">
          <div className={`absolute top-0 right-0 w-2 h-full ${stats.isAnyLive ? 'bg-red-500' : 'bg-[var(--admin-border)]'}`}></div>
          <h3 className="text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Live Stream</h3>
          <div className="flex items-center gap-3">
            {stats.isAnyLive ? (
              <>
                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                <span className="text-lg font-bold text-[var(--admin-text)]">LIVE</span>
              </>
            ) : (
              <>
                <div className="w-3 h-3 rounded-full bg-[var(--admin-border)]"></div>
                <span className="text-lg font-bold text-[var(--admin-text-muted)]">OFFLINE</span>
              </>
            )}
          </div>
          <p className="text-xs text-[var(--admin-text-muted)] mt-2">{stats.isAnyLive ? 'Active Streams' : 'Stage 1 & 2 idle'}</p>
        </div>

        <div className="bg-[var(--admin-surface)] p-5 rounded-xl border border-[var(--admin-border)] shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-sm font-medium text-[var(--admin-text-secondary)]">Feedback Received</h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400">
              Avg {feedbackStats.avgRating} ★
            </span>
          </div>
          <div className="flex justify-between items-baseline mt-1">
            <span className="text-3xl font-bold text-[var(--admin-text)]">{feedbackStats.total}</span>
            <a href="/admin/feedback" className="text-xs text-[var(--color-turquoise)] font-medium hover:underline">
              View All →
            </a>
          </div>
        </div>
      </div>

      {/* Two column layout for recent activity and quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[var(--admin-surface)] rounded-xl border border-[var(--admin-border)] shadow-sm p-6">
          <h3 className="text-lg font-bold text-[var(--admin-text)] mb-4">Recent Registrations</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-[var(--admin-text-secondary)] uppercase bg-[var(--admin-surface-alt)]">
                <tr>
                  <th className="px-4 py-3 rounded-tl-lg">Name</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Place</th>
                  <th className="px-4 py-3 rounded-tr-lg">Time</th>
                </tr>
              </thead>
              <tbody>
                {recentRegistrations.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-[var(--admin-text-secondary)]">No registrations found</td>
                  </tr>
                ) : (
                  recentRegistrations.map((reg) => (
                    <tr key={reg.id} className="border-b border-[var(--admin-border-subtle)]">
                      <td className="px-4 py-3 font-medium text-[var(--admin-text)]">{reg.name}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          reg.type === 'Grand Assembly' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' :
                          reg.type === 'Astronomy & AI Fiqh' ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400' :
                          'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        }`}>
                          {reg.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[var(--admin-text-secondary)]">{reg.place}</td>
                      <td className="px-4 py-3 text-[var(--admin-text-muted)]">{timeAgo(reg.created_at)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-[var(--color-navy)] rounded-xl border border-[var(--color-navy)] shadow-sm p-6 text-white relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-[var(--color-turquoise)] rounded-full opacity-20 blur-2xl"></div>
          
          <h3 className="text-lg font-bold mb-4 flex items-center">
            <span className="text-[var(--color-brass)] mr-2">✦</span>
            Quick Actions
          </h3>
          
          <div className="space-y-3 relative z-10">
            <button className="w-full text-left px-4 py-3 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors border border-white/5 flex justify-between items-center">
              Export Registration CSV
              <span>→</span>
            </button>
            <button className="w-full text-left px-4 py-3 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors border border-white/5 flex justify-between items-center">
              Generate Badges Batch
              <span>→</span>
            </button>
            <button className="w-full text-left px-4 py-3 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors border border-white/5 flex justify-between items-center">
              Send Reminder Emails
              <span>→</span>
            </button>
            <button className="w-full text-left px-4 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded-lg text-sm font-medium transition-colors border border-red-500/30 flex justify-between items-center mt-6">
              Manage Live Stream
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
