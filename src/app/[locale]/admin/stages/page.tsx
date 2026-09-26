import React from "react";
import { getLiveStreamsData, getAllSessionsFlat } from "@/lib/data";
import LiveStreamControl from "@/components/admin/LiveStreamControl";

export const metadata = {
  title: "Stages & Broadcasts | Admin",
};

export default async function StagesPage() {
  const [streams, sessions] = await Promise.all([
    getLiveStreamsData(),
    getAllSessionsFlat()
  ]);

  return <LiveStreamControl initialStreams={streams} allSessions={sessions} />;
}
