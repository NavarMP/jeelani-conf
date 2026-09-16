import React from "react";
import ScheduleBuilder from "@/components/admin/ScheduleBuilder";
import { getSessions, getSpeakers } from "@/lib/data";
import { ArrowUpRight } from "lucide-react";

export const metadata = {
  title: "Schedule Builder | Admin",
};

export default async function ScheduleBuilderPage() {
  const [sessions, speakers] = await Promise.all([getSessions(), getSpeakers()]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Schedule Builder</h2>
          <p className="text-gray-500 text-sm mt-1">Manage events, times, and speakers for all stages</p>
        </div>
        <div className="flex gap-3">
          <a
            href="/schedule"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium bg-white hover:bg-gray-50 text-gray-700 shadow-sm transition-colors"
          >
            Preview on Site <ArrowUpRight className="inline w-3.5 h-3.5" strokeWidth={2.25} aria-hidden="true" />
          </a>
        </div>
      </div>

      <ScheduleBuilder initialSessions={sessions} initialSpeakers={speakers} />
    </div>
  );
}
