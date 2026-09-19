"use server";

import { createClient } from "@/lib/supabase/server";

export async function checkRegistrationStatus(identifier: string) {
  if (!identifier || identifier.trim() === "") {
    return { error: "Please provide a valid registration ID, phone number, or email." };
  }

  const supabase = await createClient();
  const searchStr = identifier.trim();

  // Search in Grand Assembly
  const { data: assemblyData, error: assemblyError } = await supabase
    .from("registrations_grand_assembly")
    .select("registration_id, name, status, created_at")
    .or(`registration_id.eq.${searchStr},phone.eq.${searchStr},email.ilike.${searchStr}`)
    .order('created_at', { ascending: false })
    .limit(1);

  if (assemblyData && assemblyData.length > 0) {
    const reg = assemblyData[0];
    return {
      success: true,
      data: {
        registration_id: reg.registration_id,
        name: reg.name,
        type: "Grand Assembly",
        status: reg.status || "pending",
        date: new Date(reg.created_at).toLocaleDateString()
      }
    };
  }

  // Search in Dynamic Registrations
  const { data: dynamicData, error: dynamicError } = await supabase
    .from("dynamic_registrations")
    .select("registration_id, name, session_slug, status, created_at, registration_sessions(title)")
    .or(`registration_id.eq.${searchStr},phone.eq.${searchStr},email.ilike.${searchStr}`)
    .order('created_at', { ascending: false })
    .limit(1);

  if (dynamicData && dynamicData.length > 0) {
    const reg: any = dynamicData[0];
    return {
      success: true,
      data: {
        registration_id: reg.registration_id,
        name: reg.name,
        type: reg.registration_sessions?.title || reg.session_slug || "Session",
        status: reg.status || "pending",
        date: new Date(reg.created_at).toLocaleDateString()
      }
    };
  }

  return { error: "No registration found matching the provided details." };
}
