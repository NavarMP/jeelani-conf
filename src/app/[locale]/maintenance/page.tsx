import { MaintenanceMode } from "@/components/maintenance/MaintenanceMode";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Maintenance Mode | Upgrading Experience",
  description: "We are currently optimizing our platform to bring you a faster, smoother, and more advanced experience.",
};

export default function MaintenancePage() {
  return <MaintenanceMode />;
}
