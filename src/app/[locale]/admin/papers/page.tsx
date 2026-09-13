import React from "react";

export const metadata = {
  title: "Paper Review Queue | Admin",
};

export default function PaperReviewPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Paper Review Queue</h2>
          <p className="text-gray-500 text-sm mt-1">Review and manage paper presentation submissions</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium bg-white hover:bg-gray-50 text-gray-700 shadow-sm transition-colors">
            Export All
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Kanban Board style queue */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-200">
          
          {/* Column 1: Submitted (Pending) */}
          <div className="flex flex-col h-[700px] bg-gray-50/50">
            <div className="p-4 border-b border-gray-200 bg-white">
              <h3 className="font-semibold text-gray-800 flex items-center justify-between">
                Submitted
                <span className="bg-gray-200 text-gray-600 text-xs py-0.5 px-2 rounded-full">3</span>
              </h3>
            </div>
            
            <div className="flex-1 p-3 space-y-3 overflow-y-auto">
              {/* Paper Card */}
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm cursor-pointer hover:border-blue-300 transition-colors relative group">
                <div className="text-[10px] text-gray-400 font-mono mb-1">REG-2026-X8P</div>
                <h4 className="font-medium text-gray-900 text-sm leading-tight mb-2">Muhyiddin Mala and the Social Life of Malabar Muslims: A Study</h4>
                <p className="text-xs text-gray-500 mb-3 line-clamp-2">This paper explores the historical impact of the Muhyiddin Mala on the cultural and religious integration of Muslims in the Malabar region during the 17th century.</p>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <span className="text-xs font-medium text-gray-700">Abdul Rahman</span>
                  <a href="#" className="text-xs text-[var(--color-turquoise)] hover:underline">View PDF</a>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm cursor-pointer hover:border-blue-300 transition-colors relative group">
                <div className="text-[10px] text-gray-400 font-mono mb-1">REG-2026-Y9Q</div>
                <h4 className="font-medium text-gray-900 text-sm leading-tight mb-2">Sufi Networks and Trade Routes in Medieval Kerala</h4>
                <p className="text-xs text-gray-500 mb-3 line-clamp-2">An analysis of how spiritual networks aligned with maritime trade routes, establishing the foundations for the palli-dars system.</p>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <span className="text-xs font-medium text-gray-700">Dr. Fathima S</span>
                  <a href="#" className="text-xs text-[var(--color-turquoise)] hover:underline">View PDF</a>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm cursor-pointer hover:border-blue-300 transition-colors relative group">
                <div className="text-[10px] text-gray-400 font-mono mb-1">REG-2026-Z0R</div>
                <h4 className="font-medium text-gray-900 text-sm leading-tight mb-2">Architectural Symbolism in Ponnani Mosques</h4>
                <p className="text-xs text-gray-500 mb-3 line-clamp-2">A comparative study of indigenous Kerala woodwork and imported Persian motifs in early mosque architecture.</p>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <span className="text-xs font-medium text-gray-700">Ijaz Ahmed</span>
                  <a href="#" className="text-xs text-[var(--color-turquoise)] hover:underline">View PDF</a>
                </div>
              </div>
            </div>
          </div>
          
          {/* Column 2: Under Review */}
          <div className="flex flex-col h-[700px] bg-blue-50/30">
            <div className="p-4 border-b border-gray-200 bg-white">
              <h3 className="font-semibold text-gray-800 flex items-center justify-between">
                Under Review
                <span className="bg-blue-100 text-blue-700 text-xs py-0.5 px-2 rounded-full">1</span>
              </h3>
            </div>
            
            <div className="flex-1 p-3 space-y-3 overflow-y-auto">
              <div className="bg-white p-4 rounded-lg border border-blue-200 shadow-sm cursor-pointer ring-1 ring-blue-500 relative group">
                <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-blue-500"></div>
                <div className="text-[10px] text-gray-400 font-mono mb-1">REG-2026-W7O</div>
                <h4 className="font-medium text-gray-900 text-sm leading-tight mb-2">The Dars Curriculum: Evolution from 18th Century to Modern Day</h4>
                <p className="text-xs text-gray-500 mb-3 line-clamp-2">Tracing the foundational texts and pedagogical shifts in the traditional Islamic education system of Kerala.</p>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <span className="text-xs font-medium text-gray-700">M. Shafiq</span>
                  <a href="#" className="text-xs text-[var(--color-turquoise)] hover:underline">View PDF</a>
                </div>
                
                {/* Mock actions for active item */}
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button className="py-1 text-xs font-medium bg-red-50 text-red-600 rounded border border-red-100 hover:bg-red-100 transition-colors">Reject</button>
                  <button className="py-1 text-xs font-medium bg-green-50 text-green-700 rounded border border-green-200 hover:bg-green-100 transition-colors">Accept</button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Column 3: Accepted */}
          <div className="flex flex-col h-[700px] bg-green-50/30">
            <div className="p-4 border-b border-gray-200 bg-white">
              <h3 className="font-semibold text-gray-800 flex items-center justify-between">
                Accepted
                <span className="bg-green-100 text-green-700 text-xs py-0.5 px-2 rounded-full">2</span>
              </h3>
            </div>
            
            <div className="flex-1 p-3 space-y-3 overflow-y-auto">
              <div className="bg-white p-4 rounded-lg border border-green-200 shadow-sm cursor-pointer hover:border-green-300 transition-colors relative group opacity-75 hover:opacity-100">
                <div className="text-[10px] text-gray-400 font-mono mb-1">REG-2026-V6N</div>
                <h4 className="font-medium text-gray-900 text-sm leading-tight mb-2">Shaykh Jilani's Influence on Malabar Sufi Orders</h4>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <span className="text-xs font-medium text-gray-700">S. Hasan</span>
                  <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded">Scheduled: Stage 2</span>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-green-200 shadow-sm cursor-pointer hover:border-green-300 transition-colors relative group">
                <div className="text-[10px] text-gray-400 font-mono mb-1">REG-2026-U5M</div>
                <h4 className="font-medium text-gray-900 text-sm leading-tight mb-2">Manuscript Preservation in Ponnani Dars Libraries</h4>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <span className="text-xs font-medium text-gray-700">A. Nazeer</span>
                  <button className="text-[10px] px-2 py-0.5 bg-[var(--color-navy)] text-white rounded hover:bg-blue-800">Add to Schedule</button>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
