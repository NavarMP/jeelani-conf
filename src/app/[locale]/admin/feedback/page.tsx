import React from "react";
import { getAllFeedback, getFeedbackStats } from "@/lib/data";
import FeedbackManager from "@/components/admin/FeedbackManager";

export const metadata = {
  title: "Feedback Manager | GJC Admin",
};

export default async function FeedbackAdminPage() {
  const [feedback, stats] = await Promise.all([
    getAllFeedback(),
    getFeedbackStats(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[var(--admin-text)]">
          Feedback Manager
        </h2>
        <p className="text-[var(--admin-text-secondary)] text-sm mt-1">
          Review, manage, and analyze attendee feedback
        </p>
      </div>

      <FeedbackManager initialFeedback={feedback} stats={stats} />
    </div>
  );
}
