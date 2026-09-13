import React from "react";

export const metadata = {
  title: "Gallery Manager | Admin",
};

export default function GalleryManagerPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gallery Manager</h2>
          <p className="text-gray-500 text-sm mt-1">Upload and organize media for the public gallery</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--color-navy)] text-white hover:bg-[var(--color-navy)]/90 shadow-sm transition-colors flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Upload Media
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex gap-2">
          <button className="px-3 py-1.5 rounded-md text-sm font-medium transition-colors bg-[var(--color-turquoise)]/10 text-[var(--color-turquoise)]">
            All
          </button>
          <button className="px-3 py-1.5 rounded-md text-sm font-medium transition-colors text-gray-600 hover:bg-gray-100">
            Event Day
          </button>
          <button className="px-3 py-1.5 rounded-md text-sm font-medium transition-colors text-gray-600 hover:bg-gray-100">
            Pre-Event
          </button>
          <button className="px-3 py-1.5 rounded-md text-sm font-medium transition-colors text-gray-600 hover:bg-gray-100">
            Dars Highlights
          </button>
        </div>
        
        <div className="flex gap-2 text-sm">
          <span className="text-gray-500 py-1.5">Sort by:</span>
          <select className="border border-gray-300 rounded-md px-2 py-1 outline-none focus:border-[var(--color-turquoise)]">
            <option>Newest First</option>
            <option>Oldest First</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Mock Gallery Item */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden group">
          <div className="aspect-square bg-gray-200 relative">
            {/* Placeholder Image */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-300 to-gray-400"></div>
            
            {/* Overlay Actions */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button className="p-2 bg-white/20 hover:bg-white/40 rounded-full text-white backdrop-blur-sm transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              </button>
              <button className="p-2 bg-red-500/80 hover:bg-red-500 rounded-full text-white backdrop-blur-sm transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          </div>
          <div className="p-3">
            <div className="flex justify-between items-start mb-1">
              <span className="text-xs font-semibold text-gray-500 uppercase">Event Day</span>
              <span className="flex items-center text-green-600 text-[10px] font-bold"><span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></span>Published</span>
            </div>
            <p className="text-sm font-medium text-gray-900 truncate">inauguration_stage1_001.jpg</p>
          </div>
        </div>

        {/* Mock Gallery Item 2 */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden group">
          <div className="aspect-square bg-gray-200 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-300 to-indigo-400"></div>
            
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button className="p-2 bg-white/20 hover:bg-white/40 rounded-full text-white backdrop-blur-sm transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              </button>
              <button className="p-2 bg-red-500/80 hover:bg-red-500 rounded-full text-white backdrop-blur-sm transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          </div>
          <div className="p-3">
            <div className="flex justify-between items-start mb-1">
              <span className="text-xs font-semibold text-gray-500 uppercase">Pre-Event</span>
              <span className="flex items-center text-amber-500 text-[10px] font-bold"><span className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-1"></span>Draft</span>
            </div>
            <p className="text-sm font-medium text-gray-900 truncate">venue_prep_timelapse.mp4</p>
          </div>
        </div>

      </div>
    </div>
  );
}
