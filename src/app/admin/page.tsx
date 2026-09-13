import React from "react";

export const metadata = {
  title: "Admin Dashboard | Grand Jeelani Conference",
};

export default function AdminDashboard() {
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Registrations</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900">2,541</span>
            <span className="text-xs text-green-500 font-medium">+12% this week</span>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Grand Assembly Zones</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900">84%</span>
            <span className="text-xs text-gray-400 font-medium">Capacity</span>
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-[var(--color-turquoise)] h-full w-[84%]"></div>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Paper Submissions</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900">142</span>
            <span className="text-xs text-amber-500 font-medium">38 pending review</span>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-2 h-full bg-red-500"></div>
          <h3 className="text-sm font-medium text-gray-500 mb-2">Live Stream</h3>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
            <span className="text-lg font-bold text-gray-900">OFFLINE</span>
          </div>
          <p className="text-xs text-gray-400 mt-2">Stage 1 & 2 idle</p>
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
                <tr className="border-b border-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">Abdullah K</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs font-medium">Grand Assembly</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">Malappuram</td>
                  <td className="px-4 py-3 text-gray-400">10 mins ago</td>
                </tr>
                <tr className="border-b border-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">Ibrahim Moulavi</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-purple-50 text-purple-600 rounded text-xs font-medium">Darimi Session</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">Kozhikode</td>
                  <td className="px-4 py-3 text-gray-400">1 hour ago</td>
                </tr>
                <tr className="border-b border-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">Mohammed Shafeeq</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-green-50 text-green-600 rounded text-xs font-medium">Paper Present.</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">Wayanad</td>
                  <td className="px-4 py-3 text-gray-400">2 hours ago</td>
                </tr>
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
              Go Live (Stage 1)
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
