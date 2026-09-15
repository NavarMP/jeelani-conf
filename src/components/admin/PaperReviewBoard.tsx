"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { updateRegistrationStatus } from "@/app/[locale]/admin/actions";
import RegistrationDetailModal from "@/components/admin/RegistrationDetailModal";

export default function PaperReviewBoard() {
  const [papers, setPapers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPaper, setSelectedPaper] = useState<any | null>(null);

  const supabase = createClient();

  const fetchPapers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('registrations_paper_presentation')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Map to same format as getAllRegistrations for the modal
      if (data) {
        setPapers(data.map(p => ({
          ...p,
          tableName: 'registrations_paper_presentation',
          typeName: 'Paper Presentation'
        })));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPapers();
  }, []);

  const handleStatusChange = async (id: string, currentStatus: string, newReviewStatus: string) => {
    try {
      await updateRegistrationStatus('registrations_paper_presentation', id, currentStatus, newReviewStatus);
      setPapers(prev => prev.map(p => p.id === id ? { ...p, review_status: newReviewStatus } : p));
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const getPapersByStatus = (status: string) => papers.filter(p => p.review_status === status);

  const renderColumn = (title: string, status: string, bgColor: string, badgeBg: string, badgeText: string) => {
    const columnPapers = getPapersByStatus(status);
    
    return (
      <div className={`flex flex-col h-[700px] ${bgColor}`}>
        <div className="p-4 border-b border-gray-200 bg-white">
          <h3 className="font-semibold text-gray-800 flex items-center justify-between">
            {title}
            <span className={`${badgeBg} ${badgeText} text-xs py-0.5 px-2 rounded-full`}>{columnPapers.length}</span>
          </h3>
        </div>
        
        <div className="flex-1 p-3 space-y-3 overflow-y-auto">
          {columnPapers.map((paper) => (
            <div 
              key={paper.id} 
              onClick={() => setSelectedPaper(paper)}
              className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm cursor-pointer hover:border-[var(--color-turquoise)] transition-colors relative group"
            >
              <div className="text-[10px] text-gray-400 font-mono mb-1">{paper.registration_id || paper.id.slice(0, 8)}</div>
              <h4 className="font-medium text-gray-900 text-sm leading-tight mb-2">{paper.paper_title}</h4>
              <p className="text-xs text-gray-500 mb-3 line-clamp-2">{paper.abstract}</p>
              
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <span className="text-xs font-medium text-gray-700">{paper.name}</span>
                {paper.file_url && (
                  <a href={paper.file_url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="text-xs text-[var(--color-turquoise)] hover:underline">
                    View PDF
                  </a>
                )}
              </div>
              
              {/* Actions based on current status */}
              <div className="mt-3 grid grid-cols-2 gap-2" onClick={(e) => e.stopPropagation()}>
                {status === 'submitted' && (
                  <button onClick={() => handleStatusChange(paper.id, paper.status, 'under_review')} className="col-span-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded border border-blue-200 hover:bg-blue-100 transition-colors">Start Review</button>
                )}
                {status === 'under_review' && (
                  <>
                    <button onClick={() => handleStatusChange(paper.id, paper.status, 'rejected')} className="py-1 text-xs font-medium bg-red-50 text-red-600 rounded border border-red-100 hover:bg-red-100 transition-colors">Reject</button>
                    <button onClick={() => handleStatusChange(paper.id, paper.status, 'accepted')} className="py-1 text-xs font-medium bg-green-50 text-green-700 rounded border border-green-200 hover:bg-green-100 transition-colors">Accept</button>
                  </>
                )}
                {status === 'accepted' && (
                  <span className="col-span-2 py-1 text-center text-xs font-medium text-green-700">Accepted</span>
                )}
                {status === 'rejected' && (
                  <span className="col-span-2 py-1 text-center text-xs font-medium text-red-700">Rejected</span>
                )}
              </div>
            </div>
          ))}
          {columnPapers.length === 0 && (
            <div className="text-center p-4 text-xs text-gray-400">No papers</div>
          )}
        </div>
      </div>
    );
  };

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading papers...</div>;

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-200">
          {renderColumn('Submitted', 'submitted', 'bg-gray-50/50', 'bg-gray-200', 'text-gray-600')}
          {renderColumn('Under Review', 'under_review', 'bg-blue-50/30', 'bg-blue-100', 'text-blue-700')}
          {renderColumn('Accepted', 'accepted', 'bg-green-50/30', 'bg-green-100', 'text-green-700')}
          {renderColumn('Rejected', 'rejected', 'bg-red-50/30', 'bg-red-100', 'text-red-700')}
        </div>
      </div>

      {selectedPaper && (
        <RegistrationDetailModal 
          registration={selectedPaper} 
          onClose={() => {
            setSelectedPaper(null);
            fetchPapers();
          }} 
        />
      )}
    </>
  );
}
