import React from "react";
import { getAuditTrailData } from "@/lib/data";
import AuditTrailView from "@/components/admin/AuditTrailView";

export const metadata = {
  title: "Audit Trail | Admin",
};

export default async function AuditTrailPage() {
  const logs = await getAuditTrailData();

  return <AuditTrailView initialLogs={logs} />;
}
