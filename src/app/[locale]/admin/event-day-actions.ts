"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { generateQRToken } from "@/lib/qr";

// ==============================================================================
// QR TOKEN MANAGEMENT
// ==============================================================================

/**
 * Generate QR tokens for all registrations that don't have one yet.
 * Called once or on-demand from admin panel.
 */
export async function generateQRTokensForAll() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Unauthorized");

  // Fetch registrations without QR tokens
  const { data: regs, error: fetchError } = await supabase
    .from("dynamic_registrations")
    .select("id")
    .is("qr_token", null);

  if (fetchError) throw new Error("Failed to fetch registrations: " + fetchError.message);
  if (!regs || regs.length === 0) return { generated: 0 };

  // Generate tokens and update
  let generated = 0;
  for (const reg of regs) {
    const token = generateQRToken();
    const { error } = await supabase
      .from("dynamic_registrations")
      .update({ qr_token: token, badge_generated_at: new Date().toISOString() })
      .eq("id", reg.id);
    if (!error) generated++;
  }

  revalidatePath("/admin/attendance");
  return { generated };
}

/**
 * Generate a QR token for a single registration
 */
export async function generateQRTokenForRegistration(registrationId: string) {
  const supabase = await createClient();
  const token = generateQRToken();

  const { error } = await supabase
    .from("dynamic_registrations")
    .update({ qr_token: token, badge_generated_at: new Date().toISOString() })
    .eq("id", registrationId);

  if (error) throw new Error("Failed to generate QR token: " + error.message);
  return { token };
}

// ==============================================================================
// CHECK-IN / ATTENDANCE
// ==============================================================================

export interface CheckInResult {
  success: boolean;
  status: "checked_in" | "already_checked_in" | "not_found" | "not_confirmed" | "error";
  message: string;
  registration?: {
    name: string;
    registration_id: string;
    session_slug: string;
    typeName: string;
    status: string;
    checked_in_at?: string;
  };
}

/**
 * Check in an attendee by QR token scan
 */
export async function checkInByQRToken(
  qrToken: string,
  gate: string = "main",
  checkedInBy: string = "System",
  sessionSlug?: string,
  deviceId?: string
): Promise<CheckInResult> {
  const supabase = await createClient();

  // 1. Look up the registration by QR token
  const { data: reg, error: lookupError } = await supabase
    .from("dynamic_registrations")
    .select("*, registration_sessions(title)")
    .eq("qr_token", qrToken)
    .single();

  if (lookupError || !reg) {
    return {
      success: false,
      status: "not_found",
      message: "Invalid QR code. No registration found.",
    };
  }

  // 2. Check registration status — must be confirmed or selected
  if (reg.status !== "confirmed" && reg.status !== "selected") {
    return {
      success: false,
      status: "not_confirmed",
      message: `Registration status is "${reg.status}". Only confirmed/selected attendees can check in.`,
      registration: {
        name: reg.name,
        registration_id: reg.registration_id,
        session_slug: reg.session_slug,
        typeName: (reg.registration_sessions as any)?.title || reg.session_slug,
        status: reg.status,
      },
    };
  }

  // 3. Check if already checked in (for this session or venue)
  const checkQuery = supabase
    .from("attendance_logs")
    .select("id, check_in_time")
    .eq("registration_id", reg.id);

  if (sessionSlug) {
    checkQuery.eq("session_slug", sessionSlug);
  } else {
    checkQuery.is("session_slug", null);
  }

  const { data: existing } = await checkQuery.maybeSingle();

  if (existing) {
    return {
      success: false,
      status: "already_checked_in",
      message: `Already checked in at ${new Date(existing.check_in_time).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`,
      registration: {
        name: reg.name,
        registration_id: reg.registration_id,
        session_slug: reg.session_slug,
        typeName: (reg.registration_sessions as any)?.title || reg.session_slug,
        status: reg.status,
        checked_in_at: existing.check_in_time,
      },
    };
  }

  // 4. Record the check-in
  const { error: insertError } = await supabase
    .from("attendance_logs")
    .insert({
      registration_id: reg.id,
      session_slug: sessionSlug || null,
      gate,
      checked_in_by: checkedInBy,
      device_id: deviceId,
      method: "qr_scan",
    });

  if (insertError) {
    return {
      success: false,
      status: "error",
      message: "Failed to record check-in: " + insertError.message,
    };
  }

  // 5. Update the registration's checked_in flag (for venue entry)
  if (!sessionSlug) {
    await supabase
      .from("dynamic_registrations")
      .update({ checked_in: true, checked_in_at: new Date().toISOString() })
      .eq("id", reg.id);
  }

  return {
    success: true,
    status: "checked_in",
    message: `✓ ${reg.name} checked in successfully!`,
    registration: {
      name: reg.name,
      registration_id: reg.registration_id,
      session_slug: reg.session_slug,
      typeName: (reg.registration_sessions as any)?.title || reg.session_slug,
      status: reg.status,
      checked_in_at: new Date().toISOString(),
    },
  };
}

/**
 * Manual check-in by registration ID or search term
 */
export async function manualCheckIn(
  searchTerm: string,
  gate: string = "main",
  checkedInBy: string = "System",
  sessionSlug?: string
): Promise<CheckInResult> {
  const supabase = await createClient();

  // Try to find by registration_id first
  let query = supabase
    .from("dynamic_registrations")
    .select("*, registration_sessions(title)")
    .or(`registration_id.eq.${searchTerm},phone.eq.${searchTerm}`)
    .limit(1);

  const { data: regs, error } = await query;
  if (error || !regs || regs.length === 0) {
    return {
      success: false,
      status: "not_found",
      message: "No registration found for this ID or phone number.",
    };
  }

  const reg = regs[0];

  // Delegate to the same check-in flow
  if (!reg.qr_token) {
    // Generate a token if missing
    const token = generateQRToken();
    await supabase
      .from("dynamic_registrations")
      .update({ qr_token: token })
      .eq("id", reg.id);
  }

  return checkInByQRToken(reg.qr_token!, gate, checkedInBy, sessionSlug);
}

/**
 * Undo a check-in (admin only)
 */
export async function undoCheckIn(attendanceLogId: string) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Unauthorized");

  // Get the attendance log to also reset the registration
  const { data: log } = await supabase
    .from("attendance_logs")
    .select("registration_id, session_slug")
    .eq("id", attendanceLogId)
    .single();

  if (log && !log.session_slug) {
    // Reset venue-level check-in flag
    await supabase
      .from("dynamic_registrations")
      .update({ checked_in: false, checked_in_at: null })
      .eq("id", log.registration_id);
  }

  const { error } = await supabase
    .from("attendance_logs")
    .delete()
    .eq("id", attendanceLogId);

  if (error) throw new Error("Failed to undo check-in: " + error.message);

  revalidatePath("/admin/attendance");
  return { success: true };
}

// ==============================================================================
// ATTENDANCE DATA
// ==============================================================================

export async function fetchAttendanceStats() {
  const supabase = await createClient();

  const [
    { count: totalRegistered },
    { count: totalCheckedIn },
    { data: bySession },
    { data: byGate },
    { data: recentLogs },
    { data: regSessions },
  ] = await Promise.all([
    supabase.from("dynamic_registrations").select("id", { count: "exact", head: true })
      .in("status", ["confirmed", "selected"]),
    supabase.from("attendance_logs").select("id", { count: "exact", head: true })
      .is("session_slug", null),
    supabase.from("attendance_logs").select("session_slug")
      .not("session_slug", "is", null),
    supabase.from("attendance_logs").select("gate")
      .is("session_slug", null),
    supabase.from("attendance_logs")
      .select("*, dynamic_registrations(name, registration_id, session_slug, registration_sessions(title))")
      .is("session_slug", null)
      .order("check_in_time", { ascending: false })
      .limit(20),
    supabase.from("registration_sessions").select("slug, title")
      .eq("is_archived", false),
  ]);

  // Count by session
  const sessionCounts: Record<string, number> = {};
  (bySession || []).forEach((log: any) => {
    sessionCounts[log.session_slug] = (sessionCounts[log.session_slug] || 0) + 1;
  });

  // Count by gate
  const gateCounts: Record<string, number> = {};
  (byGate || []).forEach((log: any) => {
    gateCounts[log.gate] = (gateCounts[log.gate] || 0) + 1;
  });

  // Get per-session registered counts
  const sessionRegisteredCounts: Record<string, number> = {};
  if (regSessions) {
    for (const rs of regSessions) {
      const { count } = await supabase
        .from("dynamic_registrations")
        .select("id", { count: "exact", head: true })
        .eq("session_slug", rs.slug)
        .in("status", ["confirmed", "selected"]);
      sessionRegisteredCounts[rs.slug] = count || 0;
    }
  }

  // Format recent logs
  const formattedLogs = (recentLogs || []).map((log: any) => ({
    id: log.id,
    name: log.dynamic_registrations?.name || "Unknown",
    registration_id: log.dynamic_registrations?.registration_id || "",
    program: log.dynamic_registrations?.registration_sessions?.title || log.dynamic_registrations?.session_slug || "",
    gate: log.gate,
    check_in_time: log.check_in_time,
    method: log.method,
    checked_in_by: log.checked_in_by,
  }));

  return {
    totalRegistered: totalRegistered || 0,
    totalCheckedIn: totalCheckedIn || 0,
    sessionCounts,
    sessionRegisteredCounts,
    gateCounts,
    recentLogs: formattedLogs,
    registrationSessions: regSessions || [],
  };
}

/**
 * Fetch absent list — confirmed/selected but not checked in
 */
export async function fetchAbsentList(sessionSlug?: string) {
  const supabase = await createClient();

  // Get all confirmed/selected registrations
  let query = supabase
    .from("dynamic_registrations")
    .select("id, name, phone, place, registration_id, session_slug, registration_sessions(title)")
    .in("status", ["confirmed", "selected"])
    .eq("checked_in", false)
    .order("name", { ascending: true });

  if (sessionSlug) {
    query = query.eq("session_slug", sessionSlug);
  }

  const { data, error } = await query;
  if (error) throw new Error("Failed to fetch absent list: " + error.message);

  return (data || []).map((r: any) => ({
    ...r,
    typeName: r.registration_sessions?.title || r.session_slug,
  }));
}

// ==============================================================================
// STAFF MANAGEMENT
// ==============================================================================

/**
 * Verify staff PIN for scanner authentication
 */
export async function verifyStaffPin(pin: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("event_staff")
    .select("id, name, role, assigned_gate, permissions")
    .eq("pin_code", pin)
    .eq("is_active", true)
    .single();

  if (error || !data) {
    return { valid: false, staff: null };
  }

  return { valid: true, staff: data };
}

export async function fetchAllStaff() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("event_staff")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error("Failed to fetch staff: " + error.message);
  return data || [];
}

export async function createStaffMember(staffData: {
  name: string;
  phone?: string;
  role: string;
  assigned_gate?: string;
  pin_code: string;
  permissions?: string[];
}) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Unauthorized");

  const { error } = await supabase.from("event_staff").insert({
    ...staffData,
    permissions: staffData.permissions || ["scan"],
  });

  if (error) throw new Error("Failed to create staff: " + error.message);
  revalidatePath("/admin/staff");
  return { success: true };
}

export async function updateStaffMember(id: string, staffData: {
  name: string;
  phone?: string;
  role: string;
  assigned_gate?: string;
  pin_code: string;
  permissions?: string[];
}) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Unauthorized");

  const { error } = await supabase.from("event_staff").update(staffData).eq("id", id);

  if (error) throw new Error("Failed to update staff: " + error.message);
  revalidatePath("/admin/staff");
  return { success: true };
}


export async function deleteStaffMember(id: string) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Unauthorized");

  const { error } = await supabase.from("event_staff").delete().eq("id", id);
  if (error) throw new Error("Failed to delete staff: " + error.message);
  revalidatePath("/admin/staff");
  return { success: true };
}

export async function toggleStaffActive(id: string, isActive: boolean) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Unauthorized");

  const { error } = await supabase.from("event_staff").update({ is_active: isActive }).eq("id", id);
  if (error) throw new Error("Failed to update staff: " + error.message);
  revalidatePath("/admin/staff");
  return { success: true };
}

// ==============================================================================
// ANNOUNCEMENTS
// ==============================================================================

export async function fetchActiveAnnouncements() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .eq("is_active", true)
    .order("priority", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) return [];
  return data || [];
}

export async function fetchAllAnnouncements() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error("Failed to fetch announcements: " + error.message);
  return data || [];
}

export async function createAnnouncement(announcementData: {
  title: string;
  body?: string;
  type?: string;
  target_audience?: string;
  priority?: number;
  expires_at?: string;
}) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Unauthorized");

  const { error } = await supabase.from("announcements").insert(announcementData);
  if (error) throw new Error("Failed to create announcement: " + error.message);
  revalidatePath("/admin/announcements");
  revalidatePath("/", "layout");
  return { success: true };
}

export async function toggleAnnouncement(id: string, isActive: boolean) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Unauthorized");

  const { error } = await supabase.from("announcements").update({ is_active: isActive }).eq("id", id);
  if (error) throw new Error("Failed to toggle announcement: " + error.message);
  revalidatePath("/admin/announcements");
  revalidatePath("/", "layout");
  return { success: true };
}

export async function deleteAnnouncement(id: string) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Unauthorized");

  const { error } = await supabase.from("announcements").delete().eq("id", id);
  if (error) throw new Error("Failed to delete announcement: " + error.message);
  revalidatePath("/admin/announcements");
  return { success: true };
}

// ==============================================================================
// COMPETITION MANAGEMENT
// ==============================================================================

/**
 * Populate competition entries from selected registrations
 */
export async function syncCompetitionEntries(competitionSlug: string = "burda-qawwali") {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Unauthorized");

  // Get all "selected" registrations for the competition
  const { data: selectedRegs, error: fetchError } = await supabase
    .from("dynamic_registrations")
    .select("id, name, form_data, session_slug")
    .eq("session_slug", competitionSlug)
    .eq("status", "selected");

  if (fetchError) throw new Error("Failed to fetch selected teams: " + fetchError.message);
  if (!selectedRegs || selectedRegs.length === 0) return { synced: 0 };

  // Check which ones already have competition entries
  const { data: existingEntries } = await supabase
    .from("competition_entries")
    .select("registration_id")
    .eq("competition_slug", competitionSlug);

  const existingIds = new Set((existingEntries || []).map((e: any) => e.registration_id));

  // Insert new entries
  const newEntries = selectedRegs
    .filter((r) => !existingIds.has(r.id))
    .map((r) => ({
      registration_id: r.id,
      competition_slug: competitionSlug,
      team_name: r.form_data?.team_name || r.form_data?.teamName || r.name,
    }));

  if (newEntries.length > 0) {
    const { error: insertError } = await supabase
      .from("competition_entries")
      .insert(newEntries);
    if (insertError) throw new Error("Failed to sync entries: " + insertError.message);
  }

  revalidatePath("/admin/competition");
  return { synced: newEntries.length };
}

/**
 * Fetch competition entries with registration details
 */
export async function fetchCompetitionEntries(competitionSlug: string = "burda-qawwali") {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("competition_entries")
    .select("*, dynamic_registrations(name, phone, place, registration_id, form_data, checked_in)")
    .eq("competition_slug", competitionSlug)
    .order("performance_order", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true });

  if (error) throw new Error("Failed to fetch entries: " + error.message);
  return data || [];
}

/**
 * Mark a competition team as present/absent
 */
export async function toggleCompetitionPresence(entryId: string, isPresent: boolean) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Unauthorized");

  const update: any = { is_present: isPresent };
  if (isPresent) update.marked_present_at = new Date().toISOString();

  const { error } = await supabase
    .from("competition_entries")
    .update(update)
    .eq("id", entryId);

  if (error) throw new Error("Failed to update presence: " + error.message);
  revalidatePath("/admin/competition");
  return { success: true };
}

/**
 * Draw lots — randomize performance order for present teams
 */
export async function drawPerformanceOrder(competitionSlug: string = "burda-qawwali") {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Unauthorized");

  // Get present teams
  const { data: presentTeams, error } = await supabase
    .from("competition_entries")
    .select("id")
    .eq("competition_slug", competitionSlug)
    .eq("is_present", true);

  if (error || !presentTeams) throw new Error("Failed to fetch present teams");

  // Shuffle using Fisher-Yates
  const shuffled = [...presentTeams];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // Update performance orders
  for (let i = 0; i < shuffled.length; i++) {
    await supabase
      .from("competition_entries")
      .update({ performance_order: i + 1 })
      .eq("id", shuffled[i].id);
  }

  revalidatePath("/admin/competition");
  return { totalTeams: shuffled.length, order: shuffled.map((t, i) => ({ id: t.id, order: i + 1 })) };
}

/**
 * Update stage status for a team
 */
export async function updateStageStatus(entryId: string, stageStatus: string) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("competition_entries")
    .update({ stage_status: stageStatus })
    .eq("id", entryId);

  if (error) throw new Error("Failed to update stage status: " + error.message);
  revalidatePath("/admin/competition");
  return { success: true };
}

/**
 * Fetch scoring criteria
 */
export async function fetchScoringCriteria(competitionSlug: string = "burda-qawwali") {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("scoring_criteria")
    .select("*")
    .eq("competition_slug", competitionSlug)
    .order("order_index", { ascending: true });

  if (error) return [];
  return data || [];
}

/**
 * Submit judge scores for a team
 */
export async function submitJudgeScore(
  entryId: string,
  judgeId: string,
  scores: Record<string, number>
) {
  const supabase = await createClient();

  // Get current scores
  const { data: entry, error: fetchError } = await supabase
    .from("competition_entries")
    .select("judge_scores")
    .eq("id", entryId)
    .single();

  if (fetchError || !entry) throw new Error("Entry not found");

  // Update or add this judge's scores
  const existingScores: any[] = entry.judge_scores || [];
  const judgeIndex = existingScores.findIndex((s: any) => s.judge_id === judgeId);
  const judgeScore = { judge_id: judgeId, scores, submitted_at: new Date().toISOString() };

  if (judgeIndex >= 0) {
    existingScores[judgeIndex] = judgeScore;
  } else {
    existingScores.push(judgeScore);
  }

  // Calculate total score (average of all judge totals)
  const judgeTotals = existingScores.map((js: any) => {
    const vals = Object.values(js.scores) as number[];
    return vals.reduce((a, b) => a + b, 0);
  });
  const totalScore = judgeTotals.length > 0
    ? Math.round((judgeTotals.reduce((a, b) => a + b, 0) / judgeTotals.length) * 100) / 100
    : 0;

  const { error: updateError } = await supabase
    .from("competition_entries")
    .update({ judge_scores: existingScores, total_score: totalScore })
    .eq("id", entryId);

  if (updateError) throw new Error("Failed to submit score: " + updateError.message);
  revalidatePath("/admin/competition");
  return { success: true, totalScore };
}

// ==============================================================================
// BADGE DATA
// ==============================================================================

/**
 * Fetch registration data for badge display
 */
export async function fetchBadgeData(registrationId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("dynamic_registrations")
    .select("*, registration_sessions(title, title_ml, color, icon)")
    .eq("registration_id", registrationId)
    .single();

  if (error || !data) return null;

  // Generate QR token if missing
  if (!data.qr_token) {
    const token = generateQRToken();
    await supabase
      .from("dynamic_registrations")
      .update({ qr_token: token, badge_generated_at: new Date().toISOString() })
      .eq("id", data.id);
    data.qr_token = token;
  }

  return {
    id: data.registration_id,
    name: data.name,
    phone: data.phone,
    place: data.place || "",
    session: data.registration_sessions?.title || data.session_slug,
    sessionMl: data.registration_sessions?.title_ml || "",
    sessionColor: data.registration_sessions?.color || "var(--color-navy)",
    sessionIcon: data.registration_sessions?.icon || "📋",
    status: data.status,
    qrToken: data.qr_token,
    formData: data.form_data || {},
    checkedIn: data.checked_in,
    checkedInAt: data.checked_in_at,
  };
}
