import React from "react";
import { getAdminDashboardStats, getRecentRegistrations } from "@/lib/data";

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
          <p className="text-gray-500 text-sm mt-1">Live metrics and event status</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500 uppercase tracking-wide font-semibold mb-1">Time to Event</div>
          <div className="text-xl font-mono text-[var(--color-navy)] font-bold">14d 01h 59m</div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Registrations</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900">{stats.totalRegistrations}</span>
            <span className="text-xs text-green-500 font-medium">Active</span>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Dynamic Registrations</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900">{stats.dynamicRegistrations}</span>
            <span className="text-xs text-purple-500 font-medium">Burda, Astro & AI Fiqh, Dars</span>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden">
          <div className={`absolute top-0 right-0 w-2 h-full ${stats.isAnyLive ? 'bg-red-500' : 'bg-gray-300'}`}></div>
          <h3 className="text-sm font-medium text-gray-500 mb-2">Live Stream</h3>
          <div className="flex items-center gap-3">
            {stats.isAnyLive ? (
              <>
                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                <span className="text-lg font-bold text-gray-900">LIVE</span>
              </>
            ) : (
              <>
                <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                <span className="text-lg font-bold text-gray-400">OFFLINE</span>
              </>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-2">{stats.isAnyLive ? 'Active Streams' : 'Stage 1 & 2 idle'}</p>
        </div>
      </div>

      {/* Two column layout for recent activity and quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Registrations</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50">
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
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500">No registrations found</td>
                  </tr>
                ) : (
                  recentRegistrations.map((reg) => (
                    <tr key={reg.id} className="border-b border-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{reg.name}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          reg.type === 'Grand Assembly' ? 'bg-blue-50 text-blue-600' :
                          reg.type === 'Darimi Session' ? 'bg-purple-50 text-purple-600' :
                          'bg-amber-50 text-amber-600'
                        }`}>
                          {reg.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{reg.place}</td>
                      <td className="px-4 py-3 text-gray-400">{timeAgo(reg.created_at)}</td>
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
