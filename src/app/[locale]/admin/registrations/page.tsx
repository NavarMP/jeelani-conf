import React from "react";
import { getAllRegistrations } from "@/lib/data";
import RegistrationsManager from "@/components/admin/RegistrationsManager";

export const metadata = {
  title: "Registrations & Entries | Admin",
};

export default async function RegistrationsPage() {
  const registrations = await getAllRegistrations();

  return <RegistrationsManager initialRegistrations={registrations} />;
}
