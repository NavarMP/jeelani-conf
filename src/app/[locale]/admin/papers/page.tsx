import React from "react";
import PaperReviewBoard from "@/components/admin/PaperReviewBoard";

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

      <PaperReviewBoard />
    </div>
  );
}
