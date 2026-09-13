import { getSessions } from "@/lib/data";
import { ScheduleContent } from "./ScheduleContent";

export default async function SchedulePage() {
  const sessions = await getSessions();
  return <ScheduleContent sessions={sessions} />;
}
