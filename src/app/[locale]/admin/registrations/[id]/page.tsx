import React from "react";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import EditRegistrationForm from "./EditRegistrationForm";

export const metadata = {
  title: "Edit Registration | Admin",
};

export default async function EditRegistrationPage(
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const supabase = await createClient();
  
  // Try to find the registration by registration_id
  const { data, error } = await supabase
    .from("dynamic_registrations")
    .select("*, registration_sessions(title)")
    .eq("registration_id", params.id)
    .single();

  if (error || !data) {
    return notFound();
  }

  // Fetch available sessions for the dropdown
  const { data: sessions } = await supabase
    .from("registration_sessions")
    .select("slug, title")
    .order("order_index");

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--admin-text)]">
          Edit Registration
        </h1>
      </div>
      
      <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-2xl p-6 shadow-sm">
        <EditRegistrationForm 
          registration={data} 
          sessions={sessions || []} 
        />
      </div>
    </div>
  );
}
