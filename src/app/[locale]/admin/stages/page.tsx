import React from "react";
import { getLiveStreamsData, getAllSessionsFlat, getSpeakers } from "@/lib/data";
import LiveStreamControl from "@/components/admin/LiveStreamControl";
import LiveEventDirector from "@/components/admin/LiveEventDirector";

export const metadata = {
  title: "Stages & Broadcasts | Admin",
};

export default async function StagesPage() {
  const [streams, sessions, speakers] = await Promise.all([
    getLiveStreamsData(),
    getAllSessionsFlat(),
    getSpeakers()
  ]);

  const stagesList = streams.map(s => s.stage);

  return (
    <div className="space-y-12">
      <LiveEventDirector stages={stagesList} allSessions={sessions} allSpeakers={speakers} />
      <LiveStreamControl initialStreams={streams} allSessions={sessions} />
    </div>
  );
}
