import React from "react";

export const metadata = {
  title: "Live Stream Control | Admin",
};

export default function LiveStreamPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Live Stream Control</h2>
          <p className="text-gray-500 text-sm mt-1">Manage YouTube broadcasts for the event stages</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Stage 1 Control */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="h-3 bg-[var(--color-navy)]"></div>
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900">Stage 1 (Main)</h3>
              <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                OFFLINE
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">YouTube Video ID</label>
                <div className="flex rounded-md shadow-sm">
                  <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500 sm:text-sm">
                    youtube.com/watch?v=
                  </span>
                  <input
                    type="text"
                    defaultValue="X7Xw7dRlGJo"
                    className="block w-full min-w-0 flex-1 rounded-none rounded-r-md border-gray-300 px-3 py-2 focus:border-[var(--color-turquoise)] focus:ring-[var(--color-turquoise)] sm:text-sm outline-none border"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Broadcast Status</h4>
                    <p className="text-xs text-gray-500 mt-0.5">Toggle to show the live player on the site.</p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--color-turquoise)] focus:ring-offset-2 bg-gray-200" role="switch" aria-checked="false">
                    <span aria-hidden="true" className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out translate-x-0"></span>
                  </button>
                </div>
              </div>

              <div className="pt-4">
                <button className="w-full bg-[var(--color-navy)] text-white rounded-md py-2 text-sm font-medium hover:bg-[var(--color-navy)]/90 transition-colors">
                  Update Stage 1
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stage 2 Control */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="h-3 bg-[var(--color-turquoise)]"></div>
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900">Stage 2</h3>
              <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full flex items-center gap-1.5">
                OFFLINE
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">YouTube Video ID</label>
                <div className="flex rounded-md shadow-sm">
                  <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500 sm:text-sm">
                    youtube.com/watch?v=
                  </span>
                  <input
                    type="text"
                    defaultValue="Ycwr1oqQpv0"
                    className="block w-full min-w-0 flex-1 rounded-none rounded-r-md border-gray-300 px-3 py-2 focus:border-[var(--color-turquoise)] focus:ring-[var(--color-turquoise)] sm:text-sm outline-none border"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Broadcast Status</h4>
                    <p className="text-xs text-gray-500 mt-0.5">Toggle to show the live player on the site.</p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--color-turquoise)] focus:ring-offset-2 bg-gray-200" role="switch" aria-checked="false">
                    <span aria-hidden="true" className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out translate-x-0"></span>
                  </button>
                </div>
              </div>

              <div className="pt-4">
                <button className="w-full bg-[var(--color-navy)] text-white rounded-md py-2 text-sm font-medium hover:bg-[var(--color-navy)]/90 transition-colors">
                  Update Stage 2
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
