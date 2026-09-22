import React from "react";
import { getDashboardOverviewData } from "@/lib/data";
import DashboardClient from "@/components/admin/dashboard/DashboardClient";

export const metadata = {
  title: "Admin Dashboard | Grand Jeelani Conference",
};

export default async function AdminDashboard() {
  const initialData = await getDashboardOverviewData();

  return <DashboardClient initialData={initialData} />;
}

