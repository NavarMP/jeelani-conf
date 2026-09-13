import { getLiveStreams } from "@/lib/data";
import { LiveContent } from "./LiveContent";

export default async function LivePage() {
  const liveStreams = await getLiveStreams();
  return <LiveContent liveStreams={liveStreams} />;
}
