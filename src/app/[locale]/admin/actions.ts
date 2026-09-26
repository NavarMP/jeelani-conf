"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getAllRegistrations, getSessions, getAllSessionsFlat, getSpeakers } from "@/lib/data";

export async function fetchRegistrationsAction() {
  return await getAllRegistrations();
}

export async function fetchScheduleDataAction() {
  const [sessions, speakers, stages] = await Promise.all([
    getAllSessionsFlat(),
    getSpeakers(),
    import("@/lib/data").then(m => m.getStages())
  ]);
  return { sessions, speakers, stages };
}

export async function saveStagesAction(stages: any[]) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("global_settings")
    .upsert({
      key: "stages",
      value: stages,
      updated_at: new Date().toISOString(),
    });

  if (error) {
    console.error("Failed to save stages:", error);
    throw new Error("Failed to save stages: " + error.message);
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function fetchStagesAction() {
  return await import("@/lib/data").then(m => m.getStages());
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

export async function updateRegistrationDetails(table: string, id: string, data: Record<string, any>) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Unauthorized");

  const updatePayload: any = { 
    ...data,
    updated_at: new Date().toISOString() 
  };

  const { error } = await supabase.from(table).update(updatePayload).eq("id", id);
  if (error) throw new Error("Failed to update registration details");
  revalidatePath("/admin/registrations");
}

export async function updateRegistrationAdminNotes(table: string, id: string, notes: string) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Unauthorized");

  const { error } = await supabase
    .from(table)
    .update({ admin_notes: notes, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error("Failed to update registration notes");
  revalidatePath("/admin/registrations");
}

export async function updateRegistrationWhatsAppSent(table: string, id: string, is_sent: boolean) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Unauthorized");

  const { error } = await supabase
    .from(table)
    .update({ is_whatsapp_sent: is_sent, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error("Failed to update whatsapp sent status");
  revalidatePath("/admin/registrations");
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


// Live Stream Update Action
function extractYouTubeID(urlOrId: string) {
  if (!urlOrId) return "";
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = urlOrId.match(regExp);
  return (match && match[2].length === 11) ? match[2] : urlOrId;
}

export async function updateLiveStream(stage: string, youtubeId: string, isLive: boolean, currentSessionId: string | null = null) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Unauthorized");

  const parsedYoutubeId = extractYouTubeID(youtubeId);

  const { error } = await supabase.from("live_streams").upsert({
    stage,
    youtube_id: parsedYoutubeId,
    is_live: isLive,
    current_session_id: currentSessionId,
    updated_at: new Date().toISOString()
  });

  if (error) throw new Error("Failed to update live stream: " + error.message);
  revalidatePath("/admin/live");
  revalidatePath("/", "layout");
}

export async function createStage(stageData: {
  name: string;
  name_ml?: string;
  slug?: string;
  description?: string;
  location_address?: string;
  map_url?: string;
  embed_url?: string;
}) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Unauthorized");

  const slug = stageData.slug || stageData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  const { data: currentData } = await supabase.from('global_settings').select('value').eq('key', 'stages').single();
  const currentStages = currentData?.value || [];
  
  if (currentStages.some((s: any) => s.slug === slug)) {
    throw new Error("Stage slug already exists");
  }
  
  const newStage = {
    ...stageData,
    slug,
    name_ml: stageData.name_ml || stageData.name,
  };
  
  const { error } = await supabase.from('global_settings').upsert({ key: 'stages', value: [...currentStages, newStage], updated_at: new Date().toISOString() });
  
  if (error) throw new Error("Failed to add stage");
  
  revalidatePath("/admin/live");
  revalidatePath("/", "layout");
}

export async function updateAllStagesFull(updates: Array<{
  oldSlug: string;
  stageData: {
    name: string;
    name_ml?: string;
    slug: string;
    description?: string;
    location_address?: string;
    map_url?: string;
    embed_url?: string;
  };
  youtubeId: string;
  isLive: boolean;
  currentSessionId?: string | null;
}>) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Unauthorized");

  // We are overwriting the stages array entirely based on the new data
  // but we must preserve stages that might not be in the `updates` array if any?
  // Actually, the UI sends updates for all existing streams.
  
  const newStagesArray = updates.map(u => ({
    ...u.stageData,
    name_ml: u.stageData.name_ml || u.stageData.name
  }));

  // 1. Update global_settings with the new stages array
  await supabase.from('global_settings').upsert({ key: 'stages', value: newStagesArray, updated_at: new Date().toISOString() });

  // 2. Loop through and update foreign references and live_streams
  for (const update of updates) {
    if (update.oldSlug !== update.stageData.slug) {
      await supabase.from('live_streams').update({ stage: update.stageData.slug }).eq('stage', update.oldSlug);
      await supabase.from('sessions').update({ stage: update.stageData.slug }).eq('stage', update.oldSlug);
    }
    
    const parsedYoutubeId = extractYouTubeID(update.youtubeId);
    await supabase.from("live_streams").upsert({
      stage: update.stageData.slug,
      youtube_id: parsedYoutubeId,
      is_live: update.isLive,
      current_session_id: update.currentSessionId || null,
      updated_at: new Date().toISOString()
    });
  }

  revalidatePath("/admin/live");
  revalidatePath("/admin/schedule");
  revalidatePath("/", "layout");
}

export async function updateStageFull(oldSlug: string, stageData: {
  name: string;
  name_ml?: string;
  slug: string;
  description?: string;
  location_address?: string;
  map_url?: string;
  embed_url?: string;
}, youtubeId: string, isLive: boolean) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Unauthorized");

  // 1. Update global_settings
  const { data: currentData } = await supabase.from('global_settings').select('value').eq('key', 'stages').single();
  const currentStages = currentData?.value || [];
  
  if (oldSlug !== stageData.slug && currentStages.some((s: any) => s.slug === stageData.slug)) {
    throw new Error("New stage slug already exists");
  }
  
  const updatedStages = currentStages.map((s: any) => 
    s.slug === oldSlug ? { ...s, ...stageData } : s
  );
  
  await supabase.from('global_settings').upsert({ key: 'stages', value: updatedStages, updated_at: new Date().toISOString() });
  
  // 2. If slug changed, update foreign references
  if (oldSlug !== stageData.slug) {
    // Update live_streams table
    await supabase.from('live_streams').update({ stage: stageData.slug }).eq('stage', oldSlug);
    // Update sessions table
    await supabase.from('sessions').update({ stage: stageData.slug }).eq('stage', oldSlug);
  }

  // 3. Update youtube ID and live status
  const parsedYoutubeId = extractYouTubeID(youtubeId);
  await supabase.from("live_streams").upsert({
    stage: stageData.slug,
    youtube_id: parsedYoutubeId,
    is_live: isLive,
    updated_at: new Date().toISOString()
  });
  
  revalidatePath("/admin/live");
  revalidatePath("/admin/schedule");
  revalidatePath("/", "layout");
}

export async function updateStageProperties(slug: string, name: string, name_ml: string, location_address: string, description: string, map_url: string, embed_url: string) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Unauthorized");

  const { data: currentData } = await supabase.from('global_settings').select('value').eq('key', 'stages').single();
  const currentStages = currentData?.value || [];
  
  const updatedStages = currentStages.map((s: any) => 
    s.slug === slug ? { ...s, name, name_ml, location_address, description, map_url, embed_url } : s
  );
  
  const { error } = await supabase.from('global_settings').upsert({ key: 'stages', value: updatedStages, updated_at: new Date().toISOString() });
  
  if (error) throw new Error("Failed to update stage properties");
  
  revalidatePath("/admin/live");
  revalidatePath("/", "layout");
}

export async function removeStage(slug: string) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Unauthorized");

  const { data: currentData } = await supabase.from('global_settings').select('value').eq('key', 'stages').single();
  const currentStages = currentData?.value || [];
  
  const updatedStages = currentStages.filter((s: any) => s.slug !== slug);
  
  const { error } = await supabase.from('global_settings').upsert({ key: 'stages', value: updatedStages, updated_at: new Date().toISOString() });
  
  if (error) throw new Error("Failed to remove stage");
  
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

export async function saveGlobalSettingsAction(settings: Record<string, any>) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("global_settings")
    .upsert({
      key: "site_config",
      value: settings,
      updated_at: new Date().toISOString(),
    });

  if (error) {
    console.error("Failed to save global settings:", error);
    throw new Error("Failed to save global settings: " + error.message);
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function fetchGlobalSettingsAction() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("global_settings")
    .select("value")
    .eq("key", "site_config")
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Failed to fetch global settings:", error);
    return null;
  }
  
  return data?.value || {};
}


// ==============================================================================
// FEEDBACK
// ==============================================================================

/**
 * Public submission — no auth required.
 * Validates with Zod, auto-computes sentiment from rating.
 */
export async function submitFeedback(formData: {
  name?: string;
  phone?: string;
  email?: string;
  overall_rating: number;
  category_ratings?: Record<string, number>;
  feedback_text: string;
  category?: string;
  source?: string;
  user_agent?: string;
}) {
  const supabase = await createClient();

  // Auto-compute sentiment from overall_rating
  let sentiment = "neutral";
  if (formData.overall_rating >= 4) sentiment = "positive";
  else if (formData.overall_rating <= 2) sentiment = "negative";

  const insertData = {
    name: formData.name || null,
    phone: formData.phone || null,
    email: formData.email || null,
    overall_rating: formData.overall_rating,
    category_ratings: formData.category_ratings || {},
    feedback_text: formData.feedback_text,
    category: formData.category || "general",
    sentiment,
    source: formData.source || "web",
    user_agent: formData.user_agent || null,
  };

  const { error } = await supabase.from("feedback").insert(insertData);

  if (error) {
    console.error("Failed to submit feedback:", error);
    throw new Error("Failed to submit feedback");
  }

  revalidatePath("/admin/feedback");
  revalidatePath("/admin");
  return { success: true };
}

export async function fetchAllFeedbackAction() {
  const { getAllFeedback } = await import("@/lib/data");
  return await getAllFeedback();
}

export async function toggleFeedbackRead(id: string, isRead: boolean) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("feedback")
    .update({ is_read: isRead })
    .eq("id", id);

  if (error) throw new Error("Failed to update feedback read status");
  revalidatePath("/admin/feedback");
}

export async function toggleFeedbackFeatured(id: string, isFeatured: boolean) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("feedback")
    .update({ is_featured: isFeatured })
    .eq("id", id);

  if (error) throw new Error("Failed to update feedback featured status");
  revalidatePath("/admin/feedback");
}

export async function updateFeedbackNotes(id: string, notes: string) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("feedback")
    .update({ admin_notes: notes })
    .eq("id", id);

  if (error) throw new Error("Failed to update feedback notes");
  revalidatePath("/admin/feedback");
}

export async function deleteFeedback(id: string) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("feedback")
    .delete()
    .eq("id", id);

  if (error) throw new Error("Failed to delete feedback");
  revalidatePath("/admin/feedback");
  revalidatePath("/admin");
}

export async function saveConferenceDocumentsAction(documents: { id: string, title: string, url: string }[]) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("global_settings")
    .upsert({
      key: "conference_documents",
      value: documents,
      updated_at: new Date().toISOString(),
    });

  if (error) {
    console.error("Failed to save conference documents:", error);
    throw new Error("Failed to save conference documents: " + error.message);
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/content");
  return { success: true };
}
