import React from "react";
import { getLiveStreamsData } from "@/lib/data";
import LiveStreamControl from "@/components/admin/LiveStreamControl";

export const metadata = {
  title: "Live Stream Control | Admin",
};

export default async function LiveStreamPage() {
  const streams = await getLiveStreamsData();

  return <LiveStreamControl initialStreams={streams} />;
}
