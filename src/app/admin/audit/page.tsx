import React from "react";

export const metadata = {
  title: "Audit Trail | Admin",
};

export default function AuditTrailPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Audit Trail</h2>
          <p className="text-gray-500 text-sm mt-1">System log of administrative actions</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium bg-white hover:bg-gray-50 text-gray-700 shadow-sm transition-colors">
            Export Logs
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex gap-4 bg-gray-50">
          <input type="date" className="p-2 border border-gray-300 rounded text-sm outline-none focus:border-[var(--color-turquoise)]" />
          <select className="p-2 border border-gray-300 rounded text-sm outline-none focus:border-[var(--color-turquoise)]">
            <option>All Admins</option>
            <option>Admin 1 (admin@example.com)</option>
          </select>
          <select className="p-2 border border-gray-300 rounded text-sm outline-none focus:border-[var(--color-turquoise)]">
            <option>All Action Types</option>
            <option>Authentication</option>
            <option>Content Update</option>
            <option>Registration Change</option>
            <option>Live Stream Status</option>
          </select>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-white border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-semibold">Timestamp</th>
                <th className="px-6 py-4 font-semibold">Admin / IP</th>
                <th className="px-6 py-4 font-semibold">Action</th>
                <th className="px-6 py-4 font-semibold">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                  2026-09-13 14:32:11
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">admin@example.com</div>
                  <div className="text-[10px] font-mono text-gray-400 mt-0.5">192.168.1.42</div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium border border-blue-100">Live Stream</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-gray-900">Updated Stage 1 broadcast status</span>
                  <div className="text-xs text-gray-500 mt-1 font-mono bg-gray-50 p-1 rounded inline-block">isLive: false → true</div>
                </td>
              </tr>
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                  2026-09-13 10:15:00
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">admin@example.com</div>
                  <div className="text-[10px] font-mono text-gray-400 mt-0.5">192.168.1.42</div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs font-medium border border-green-100">Content Update</span>
                </td>
                <td className="px-6 py-4 text-gray-900">
                  Published global site settings changes
                </td>
              </tr>
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                  2026-09-13 09:02:44
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">admin@example.com</div>
                  <div className="text-[10px] font-mono text-gray-400 mt-0.5">192.168.1.42</div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs font-medium border border-purple-100">Authentication</span>
                </td>
                <td className="px-6 py-4 text-gray-900">
                  Successful login
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
