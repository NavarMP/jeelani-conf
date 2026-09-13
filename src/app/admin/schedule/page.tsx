import React from "react";

export const metadata = {
  title: "Schedule Builder | Admin",
};

export default function ScheduleBuilderPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Schedule Builder</h2>
          <p className="text-gray-500 text-sm mt-1">Manage events, times, and speakers for all stages</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium bg-white hover:bg-gray-50 text-gray-700 shadow-sm transition-colors">
            Preview
          </button>
          <button className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--color-navy)] text-white hover:bg-[var(--color-navy)]/90 shadow-sm transition-colors">
            Save Changes
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button className="px-6 py-4 text-sm font-medium text-[var(--color-navy)] border-b-2 border-[var(--color-navy)]">
            Stage 1 (Main)
          </button>
          <button className="px-6 py-4 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors">
            Stage 2
          </button>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {/* Timeline Item Mock */}
            <div className="flex gap-4 p-4 border border-gray-200 rounded-lg bg-gray-50 relative group">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gray-300 rounded-l-lg"></div>
              
              <div className="flex flex-col gap-2 w-32 shrink-0 border-r border-gray-200 pr-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Start</label>
                  <input type="time" defaultValue="10:00" className="w-full mt-1 p-1.5 border border-gray-300 rounded text-sm outline-none focus:border-[var(--color-turquoise)]" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">End</label>
                  <input type="time" defaultValue="11:00" className="w-full mt-1 p-1.5 border border-gray-300 rounded text-sm outline-none focus:border-[var(--color-turquoise)]" />
                </div>
              </div>
              
              <div className="flex-1 space-y-3">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Title (EN)</label>
                    <input type="text" defaultValue="Grand Assembly" className="w-full mt-1 p-1.5 border border-gray-300 rounded text-sm outline-none focus:border-[var(--color-turquoise)] font-bold text-gray-800" />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Title (ML)</label>
                    <input type="text" defaultValue="മഹാ സമ്മേളനം" className="w-full mt-1 p-1.5 border border-gray-300 rounded text-sm outline-none focus:border-[var(--color-turquoise)]" />
                  </div>
                  <div className="w-32">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</label>
                    <select className="w-full mt-1 p-1.5 border border-gray-300 rounded text-sm outline-none focus:border-[var(--color-turquoise)]">
                      <option>Ceremony</option>
                      <option>Talk</option>
                      <option>Meal</option>
                      <option>Meeting</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</label>
                  <textarea rows={2} className="w-full mt-1 p-2 border border-gray-300 rounded text-sm outline-none focus:border-[var(--color-turquoise)] resize-none" defaultValue="The opening grand assembly bringing together students, scholars, and the community in a unified gathering to mark the beginning of the Jeelani Conference."></textarea>
                </div>
                
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Speakers</label>
                  <div className="mt-1 flex flex-wrap gap-2">
                    <button className="px-2 py-1 text-xs border border-dashed border-gray-400 text-gray-500 rounded hover:bg-gray-100 transition-colors">
                      + Assign Speaker
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1.5 text-gray-400 hover:text-red-500 transition-colors" title="Remove Session">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Timeline Item Mock 2 */}
            <div className="flex gap-4 p-4 border border-gray-200 rounded-lg bg-white relative group">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[var(--color-turquoise)] rounded-l-lg"></div>
              
              <div className="flex flex-col gap-2 w-32 shrink-0 border-r border-gray-200 pr-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Start</label>
                  <input type="time" defaultValue="11:00" className="w-full mt-1 p-1.5 border border-gray-300 rounded text-sm outline-none focus:border-[var(--color-turquoise)]" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">End</label>
                  <input type="time" defaultValue="11:30" className="w-full mt-1 p-1.5 border border-gray-300 rounded text-sm outline-none focus:border-[var(--color-turquoise)]" />
                </div>
              </div>
              
              <div className="flex-1 space-y-3">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Title (EN)</label>
                    <input type="text" defaultValue="Inaugural Ceremony" className="w-full mt-1 p-1.5 border border-gray-300 rounded text-sm outline-none focus:border-[var(--color-turquoise)] font-bold text-gray-800" />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Title (ML)</label>
                    <input type="text" defaultValue="ഉദ്ഘാടന ചടങ്ങ്" className="w-full mt-1 p-1.5 border border-gray-300 rounded text-sm outline-none focus:border-[var(--color-turquoise)]" />
                  </div>
                  <div className="w-32">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</label>
                    <select className="w-full mt-1 p-1.5 border border-gray-300 rounded text-sm outline-none focus:border-[var(--color-turquoise)]">
                      <option>Ceremony</option>
                      <option>Talk</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</label>
                  <textarea rows={2} className="w-full mt-1 p-2 border border-gray-300 rounded text-sm outline-none focus:border-[var(--color-turquoise)] resize-none" defaultValue="The formal inauguration of the Grand Jeelani Conference, graced by distinguished spiritual leaders and scholars."></textarea>
                </div>
                
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Speakers</label>
                  <div className="mt-1 flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-[var(--color-turquoise)]/10 text-[var(--color-turquoise)] rounded-md text-xs font-medium flex items-center gap-1">
                      Sayyid Abdul Naser Hayy Shihab Thangal
                      <button className="hover:text-red-500"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                    </span>
                    <span className="px-2 py-1 bg-[var(--color-turquoise)]/10 text-[var(--color-turquoise)] rounded-md text-xs font-medium flex items-center gap-1">
                      Sayyid Fazal Shihab Thangal
                      <button className="hover:text-red-500"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                    </span>
                    <button className="px-2 py-1 text-xs border border-dashed border-gray-400 text-gray-500 rounded hover:bg-gray-100 transition-colors">
                      + Assign
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1.5 text-gray-400 hover:text-red-500 transition-colors" title="Remove Session">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>

            <button className="w-full py-4 border-2 border-dashed border-gray-300 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all">
              + Add New Session to Stage 1
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
