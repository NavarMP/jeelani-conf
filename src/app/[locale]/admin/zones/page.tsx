import React from "react";

export const metadata = {
  title: "Zones & Slots | Admin",
};

export default function ZonesPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Zones & Slots Manager</h2>
          <p className="text-gray-500 text-sm mt-1">Manage Grand Assembly layout and seat assignments</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium bg-white hover:bg-gray-50 text-gray-700 shadow-sm transition-colors">
            Map Settings
          </button>
          <button className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--color-navy)] text-white hover:bg-[var(--color-navy)]/90 shadow-sm transition-colors">
            Auto-Assign Unseated
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Zones List */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col h-[600px]">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">Assembly Zones</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2">
            {/* Zone Card */}
            <div className="p-3 mb-2 rounded-lg bg-blue-50 border border-blue-100 cursor-pointer">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-blue-900">Zone A - Front Right</span>
                <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">92% Full</span>
              </div>
              <div className="w-full bg-blue-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full w-[92%]"></div>
              </div>
              <p className="text-xs text-blue-600 mt-2">460 / 500 allocated</p>
            </div>
            
            <div className="p-3 mb-2 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-100 cursor-pointer transition-colors">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-gray-700">Zone B - Front Left</span>
                <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">85% Full</span>
              </div>
              <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-[var(--color-turquoise)] h-full w-[85%]"></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">425 / 500 allocated</p>
            </div>
            
            <div className="p-3 mb-2 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-100 cursor-pointer transition-colors">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-gray-700">Zone C - Mid Right</span>
                <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">100% Full</span>
              </div>
              <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-red-500 h-full w-full"></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">300 / 300 allocated</p>
            </div>
          </div>
          
          <div className="p-4 border-t border-gray-100">
            <button className="w-full py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
              + Add New Zone
            </button>
          </div>
        </div>

        {/* Right Column: Visual Editor Mock */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col h-[600px] overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-gray-800">Zone A Details</h3>
              <p className="text-xs text-gray-500">Row and slot assignments</p>
            </div>
            <div className="flex gap-2 text-xs">
              <span className="flex items-center gap-1 text-gray-600"><span className="w-3 h-3 rounded bg-blue-500 block"></span> Assigned</span>
              <span className="flex items-center gap-1 text-gray-600"><span className="w-3 h-3 rounded border border-gray-300 bg-gray-50 block"></span> Available</span>
            </div>
          </div>
          
          <div className="flex-1 bg-gray-50 p-6 flex items-center justify-center relative">
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url('/motifs/arabesque-tile-pattern.svg')", backgroundSize: "100px" }}></div>
            
            <div className="relative z-10 w-full max-w-lg">
              {/* Mock Stage */}
              <div className="w-full h-12 bg-[var(--color-navy)] rounded-t-xl mb-12 flex items-center justify-center text-white/50 text-sm font-semibold tracking-widest uppercase">
                Stage 1
              </div>
              
              {/* Mock Seating Rows */}
              <div className="space-y-3">
                {[1, 2, 3, 4, 5, 6].map((row) => (
                  <div key={row} className="flex gap-2 justify-center">
                    <div className="w-6 flex items-center justify-center text-xs font-bold text-gray-400 mr-2">R{row}</div>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((seat) => (
                      <div 
                        key={`${row}-${seat}`} 
                        className={`w-4 h-4 sm:w-5 sm:h-5 rounded-sm cursor-pointer transition-all ${Math.random() > 0.15 ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-100 border border-gray-300 hover:bg-gray-200'}`}
                        title={`Row ${row}, Seat ${seat}`}
                      ></div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
