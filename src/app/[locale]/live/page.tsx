import { getLiveStreams, getAllSessionsFlat } from "@/lib/data";
import { LiveContent } from "./LiveContent";

export default async function LivePage() {
  const [liveStreams, sessions] = await Promise.all([
    getLiveStreams(),
    getAllSessionsFlat()
  ]);
  return <LiveContent liveStreams={liveStreams} sessions={sessions} />;
}
