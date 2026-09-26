import { getSessions, getStages, getLiveStreamsData } from "@/lib/data";
import { ScheduleContent } from "./ScheduleContent";

export default async function SchedulePage() {
  const [sessions, stages, liveStreams] = await Promise.all([
    getSessions(), 
    getStages(),
    getLiveStreamsData()
  ]);

  const activeEventIds = liveStreams
    .map(stream => stream.current_session_id)
    .filter(Boolean);

  return <ScheduleContent sessions={sessions} stages={stages} activeEventIds={activeEventIds} />;
}
