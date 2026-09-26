import React from "react";
import { createClient } from "@/lib/supabase/server";
import RefundsManager from "./RefundsManager";

export const metadata = {
  title: "Refunds Management | Admin",
};

export default async function RefundsPage() {
  const supabase = await createClient();
  
  // Fetch burda-qawwali teams that are strictly NOT selected (which is status = 'confirmed' for this context)
  const { data } = await supabase
    .from("dynamic_registrations")
    .select("id, registration_id, name, phone, place, session_slug, status, refund_status, refund_transaction_id, refund_notes, receipt_url, created_at")
    .eq("session_slug", "burda-qawwali")
    .eq("status", "confirmed")
    .order("created_at", { ascending: false });

  return <RefundsManager initialRefunds={data || []} />;
}
