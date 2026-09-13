"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Toggles the live stream status of a specific stage
 */
export async function toggleLiveStream(stage: string, isLive: boolean) {
  const supabase = await createClient();
  
  // Verify admin session
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase
    .from("live_streams")
    .update({ is_live: isLive, updated_at: new Date().toISOString() })
    .eq("stage", stage);

  if (error) {
    console.error("Error toggling live stream:", error);
    throw new Error("Failed to update live stream status");
  }

  revalidatePath("/", "layout");
}
