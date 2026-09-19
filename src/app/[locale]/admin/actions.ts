"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getAllRegistrations, getSessions, getAllSessionsFlat, getSpeakers } from "@/lib/data";

export async function fetchRegistrationsAction() {
  return await getAllRegistrations();
}

export async function fetchScheduleDataAction() {
  const [sessions, speakers] = await Promise.all([getAllSessionsFlat(), getSpeakers()]);
  return { sessions, speakers };
}


/**
 * Toggles the live stream status of a specific stage
 */
export async function toggleLiveStream(stage: string, isLive: boolean) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("live_streams")
    .update({ is_live: isLive, updated_at: new Date().toISOString() })
    .eq("stage", stage);

  if (error) throw new Error("Failed to update live stream status");
  revalidatePath("/", "layout");
}

export async function updateRegistrationStatus(table: string, id: string, status: string, review_status?: string) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Unauthorized");

  const updatePayload: any = { updated_at: new Date().toISOString() };
  if (status) updatePayload.status = status;
  if (review_status) updatePayload.review_status = review_status;

  const { error } = await supabase.from(table).update(updatePayload).eq("id", id);
  if (error) throw new Error("Failed to update status");
  revalidatePath("/admin/registrations");
  revalidatePath("/admin/papers");
}

export async function deleteRegistration(table: string, id: string) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Unauthorized");

  // 1. Fetch the registration first to check for any associated storage files
  const { data: regData } = await supabase
    .from(table)
    .select("*")
    .eq("id", id)
    .single();

  if (regData) {
    // If it's a dynamic registration and has a receipt image
    if (table === "dynamic_registrations" && regData.receipt_url) {
      if (regData.receipt_url.includes("receipts")) {
        const fileName = regData.receipt_url.split("/").pop();
        if (fileName) {
          await supabase.storage.from("receipts").remove([fileName]);
        }
      }
    }
  }

  // 2. Delete the record from the database
  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) throw new Error("Failed to delete registration");
  revalidatePath("/admin/registrations");
}

// Session (Schedule) Management
export async function createSession(data: any) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Unauthorized");

  const { error } = await supabase.from("sessions").insert(data);
  if (error) {
    console.error("Error creating session:", error);
    throw new Error("Failed to create session: " + error.message);
  }
  revalidatePath("/admin/schedule");
}

export async function updateSession(id: string, data: any) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Unauthorized");

  data.updated_at = new Date().toISOString();
  const { error } = await supabase.from("sessions").update(data).eq("id", id);
  if (error) {
    console.error("Error updating session:", error);
    throw new Error("Failed to update session: " + error.message);
  }
  revalidatePath("/admin/schedule");
}

export async function deleteSession(id: string) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Unauthorized");

  const { error } = await supabase.from("sessions").delete().eq("id", id);
  if (error) {
    console.error("Error deleting session:", error);
    throw new Error("Failed to delete session: " + error.message);
  }
  revalidatePath("/admin/schedule");
}

export async function addSpeakerToSession(sessionId: string, speakerId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("session_speakers").insert({ session_id: sessionId, speaker_id: speakerId });
  if (error) {
    console.error("Error adding speaker to session:", error);
    throw new Error("Failed to add speaker: " + error.message);
  }
  revalidatePath("/admin/schedule");
}

export async function removeSpeakerFromSession(sessionId: string, speakerId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("session_speakers").delete().match({ session_id: sessionId, speaker_id: speakerId });
  if (error) {
    console.error("Error removing speaker from session:", error);
    throw new Error("Failed to remove speaker: " + error.message);
  }
  revalidatePath("/admin/schedule");
}

// Dynamic Registration Sessions Management
export async function toggleDynamicRegistration(slug: string, isOpen: boolean) {
  const supabase = await createClient();
  const { error } = await supabase.from("registration_sessions").update({ is_open: isOpen }).eq("slug", slug);
  if (error) throw new Error("Failed to toggle registration");
  revalidatePath("/admin/sessions");
}

export async function toggleArchiveDynamicSession(slug: string, isArchived: boolean) {
  const supabase = await createClient();
  const { error } = await supabase.from("registration_sessions").update({ is_archived: isArchived }).eq("slug", slug);
  if (error) throw new Error("Failed to archive session");
  revalidatePath("/admin/sessions");
}

// Zones & Seating Management
export async function saveZone(zone: { id: string; name: string; capacity: number; color?: string; layout_data?: any }) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Unauthorized");

  const { error } = await supabase.from("zones").upsert({
    id: zone.id,
    name: zone.name,
    capacity: zone.capacity,
    color: zone.color || "blue",
    layout_data: zone.layout_data || { rows: 10, seatsPerRow: 15 },
    updated_at: new Date().toISOString()
  });

  if (error) throw new Error("Failed to save zone: " + error.message);
  revalidatePath("/admin/zones");
  revalidatePath("/admin");
}

export async function deleteZone(id: string) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Unauthorized");

  // Unassign attendees first
  await supabase
    .from("registrations_grand_assembly")
    .update({ zone: null, row_num: null, seat_num: null })
    .eq("zone", id);

  const { error } = await supabase.from("zones").delete().eq("id", id);
  if (error) throw new Error("Failed to delete zone: " + error.message);
  revalidatePath("/admin/zones");
  revalidatePath("/admin");
}

export async function assignSeat(registrationId: string, zone: string | null, rowNum?: string | null, seatNum?: string | null) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("registrations_grand_assembly")
    .update({
      zone: zone || null,
      row_num: rowNum || null,
      seat_num: seatNum || null,
      updated_at: new Date().toISOString()
    })
    .eq("id", registrationId);

  if (error) throw new Error("Failed to assign seat: " + error.message);
  revalidatePath("/admin/zones");
  revalidatePath("/admin/registrations");
}

export async function autoAssignUnseated(targetZoneId?: string) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Unauthorized");

  // 1. Fetch unseated attendees
  const { data: unseated } = await supabase
    .from("registrations_grand_assembly")
    .select("id, name")
    .or("zone.is.null,zone.eq.")
    .order("created_at", { ascending: true });

  if (!unseated || unseated.length === 0) return { assignedCount: 0 };

  // 2. Fetch zones
  let zoneQuery = supabase.from("zones").select("*");
  if (targetZoneId) zoneQuery = zoneQuery.eq("id", targetZoneId);
  const { data: zones } = await zoneQuery;

  if (!zones || zones.length === 0) {
    // Fallback default zone if none exist yet
    await saveZone({ id: "zone-a", name: "Zone A - Front Right", capacity: 500, color: "blue" });
  }

  // Fetch already occupied seats in the target zones
  const { data: seated } = await supabase
    .from("registrations_grand_assembly")
    .select("zone, row_num, seat_num")
    .not("zone", "is", null);

  const occupiedSet = new Set((seated || []).map(s => `${s.zone}-${s.row_num || 1}-${s.seat_num || 1}`));

  const targetZone = targetZoneId || zones?.[0]?.id || "zone-a";
  const rows = 15;
  const seatsPerRow = 20;

  let assignedCount = 0;
  let currentRow = 1;
  let currentSeat = 1;

  for (const attendee of unseated) {
    // Find next free slot
    while (occupiedSet.has(`${targetZone}-${currentRow}-${currentSeat}`)) {
      currentSeat++;
      if (currentSeat > seatsPerRow) {
        currentSeat = 1;
        currentRow++;
      }
      if (currentRow > rows) break;
    }

    if (currentRow > rows) break; // Zone full

    const rowStr = `R${currentRow}`;
    const seatStr = `S${currentSeat}`;

    await supabase
      .from("registrations_grand_assembly")
      .update({
        zone: targetZone,
        row_num: rowStr,
        seat_num: seatStr,
        updated_at: new Date().toISOString()
      })
      .eq("id", attendee.id);

    occupiedSet.add(`${targetZone}-${currentRow}-${currentSeat}`);
    assignedCount++;
    currentSeat++;
    if (currentSeat > seatsPerRow) {
      currentSeat = 1;
      currentRow++;
    }
  }

  revalidatePath("/admin/zones");
  revalidatePath("/admin/registrations");
  return { assignedCount };
}

// Live Stream Update Action
export async function updateLiveStream(stage: string, youtubeId: string, isLive: boolean) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Unauthorized");

  const { error } = await supabase.from("live_streams").upsert({
    stage,
    youtube_id: youtubeId,
    is_live: isLive,
    updated_at: new Date().toISOString()
  });

  if (error) throw new Error("Failed to update live stream: " + error.message);
  revalidatePath("/admin/live");
  revalidatePath("/", "layout");
}

export async function revalidateGuestPages() {
  revalidatePath("/", "layout");
  revalidatePath("/admin/guests");
}

export async function reorderGuestsAction(payload: any[]) {
  const supabase = await createClient();

  if (!payload || payload.length === 0) return { success: true };

  // If full guest objects are passed, batch upsert directly (1 single roundtrip)
  const isObjectList = typeof payload[0] === "object" && payload[0] !== null;

  if (isObjectList) {
    const toUpsert = payload.map((g, index) => ({
      ...g,
      order_index: index + 1,
      updated_at: new Date().toISOString()
    }));

    const { error } = await supabase
      .from("speakers")
      .upsert(toUpsert, { onConflict: "id" });

    if (error) {
      console.error("Failed to batch upsert guest order:", error);
      throw new Error("Failed to update guest order: " + error.message);
    }
  } else {
    // If IDs are passed, fetch current guests and batch upsert
    const { data: currentGuests, error: fetchErr } = await supabase
      .from("speakers")
      .select("*");

    if (fetchErr || !currentGuests) {
      throw new Error("Failed to fetch speakers for reordering: " + (fetchErr?.message || ""));
    }

    const guestMap = new Map(currentGuests.map(g => [g.id, g]));
    const toUpsert: any[] = [];
    payload.forEach((id: string, index: number) => {
      const g = guestMap.get(id);
      if (g) {
        toUpsert.push({
          ...g,
          order_index: index + 1,
          updated_at: new Date().toISOString()
        });
      }
    });

    if (toUpsert.length > 0) {
      const { error } = await supabase
        .from("speakers")
        .upsert(toUpsert, { onConflict: "id" });

      if (error) {
        console.error("Failed to batch upsert guest order:", error);
        throw new Error("Failed to update guest order: " + error.message);
      }
    }
  }

  await revalidateGuestPages();
  return { success: true };
}

export async function saveBrochureUrlAction(url: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("global_settings")
    .upsert({
      key: "brochure_url",
      value: { url },
      updated_at: new Date().toISOString(),
    });

  if (error) {
    console.error("Failed to save brochure URL:", error);
    throw new Error("Failed to save brochure URL: " + error.message);
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/content");
  return { success: true };
}

export async function deleteBrochureUrlAction() {
  const supabase = await createClient();
  const { error } = await supabase
    .from("global_settings")
    .delete()
    .eq("key", "brochure_url");

  if (error) {
    console.error("Failed to delete brochure URL:", error);
    throw new Error("Failed to delete brochure URL: " + error.message);
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/content");
  return { success: true };
}

