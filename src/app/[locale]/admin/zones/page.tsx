import React from "react";
import { getZonesData } from "@/lib/data";
import ZoneManager from "@/components/admin/ZoneManager";

export const metadata = {
  title: "Zones & Slots | Admin",
};

export default async function ZonesPage() {
  const { zones, unseatedAttendees, allAttendees } = await getZonesData();

  return (
    <ZoneManager
      initialZones={zones}
      initialUnseated={unseatedAttendees}
      initialAttendees={allAttendees}
    />
  );
}
