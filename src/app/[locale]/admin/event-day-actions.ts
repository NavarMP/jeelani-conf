"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { generateQRToken } from "@/lib/qr";
import { formatForDatabase } from "@/lib/phoneUtils";

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

  // 3. Check if already checked in (for this checkpoint/gate)
  // Skip duplicate checking for Exit checkpoints
  if (!gate.toLowerCase().includes("exit")) {
    const checkQuery = supabase
      .from("attendance_logs")
      .select("id, check_in_time")
      .eq("registration_id", reg.id)
      .eq("gate", gate);

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

  // 5. Update the registration's checked_in flag (for venue entry) only if not already checked in
  if (!sessionSlug && !reg.checked_in) {
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
 * Batch check-in for syncing offline scans
 */
export async function batchCheckIn(
  scans: { token: string; gate: string; checkedInBy: string; timestamp: number }[]
) {
  const results = [];
  for (const scan of scans) {
    try {
      const result = await checkInByQRToken(scan.token, scan.gate, scan.checkedInBy);
      results.push({ token: scan.token, success: result.success || result.status === "already_checked_in" });
    } catch (err) {
      results.push({ token: scan.token, success: false });
    }
  }
  return results;
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

/**
 * Fetch registrations for batch badge printing
 */
export async function fetchRegistrationsForPrinting(
  sessionFilter: string,
  statusFilter: string
) {
  const supabase = await createClient();
  
  let query = supabase
    .from("dynamic_registrations")
    .select("registration_id, name, place, qr_token, session_slug, registration_sessions(title, title_ml, color, icon)")
    .order("name", { ascending: true });

  if (sessionFilter && sessionFilter !== "all") {
    query = query.eq("session_slug", sessionFilter);
  }

  if (statusFilter === "confirmed") {
    query = query.in("status", ["confirmed", "selected"]);
  } else if (statusFilter === "pending") {
    query = query.eq("status", "pending");
  }

  const { data, error } = await query;
  if (error) throw new Error("Failed to fetch registrations for printing: " + error.message);
  
  // Return formatted data
  return (data || []).map((d: any) => ({
    registration_id: d.registration_id,
    name: d.name,
    place: d.place,
    qr_token: d.qr_token,
    session: d.registration_sessions?.title || d.session_slug,
    sessionColor: d.registration_sessions?.color || "var(--color-navy)",
  }));
}

// ==============================================================================
// ENHANCED ATTENDEE SEARCH (for check-in without QR code)
// ==============================================================================

export interface AttendeeSearchResult {
  id: string;
  registration_id: string;
  name: string;
  phone: string;
  place: string;
  session_slug: string;
  typeName: string;
  status: string;
  checked_in: boolean;
  checked_in_at?: string;
  form_data: any;
  is_spot_registration?: boolean;
}

/**
 * Multi-criteria attendee search for check-in without QR code.
 * Searches by name (fuzzy), phone, registration ID, or place.
 * Designed for gate volunteers looking up students who have no device.
 */
export async function searchAttendeesForCheckIn(
  searchTerm: string,
  filters?: {
    sessionSlug?: string;
    place?: string;
    onlyUnchecked?: boolean;
  }
): Promise<AttendeeSearchResult[]> {
  const supabase = await createClient();
  const term = searchTerm.trim();

  if (!term && !filters?.sessionSlug && !filters?.place) {
    return [];
  }

  // Build query
  let query = supabase
    .from("dynamic_registrations")
    .select("*, registration_sessions(title)")
    .in("status", ["confirmed", "selected"])
    .order("name", { ascending: true })
    .limit(30);

  // Apply filters
  if (filters?.sessionSlug) {
    query = query.eq("session_slug", filters.sessionSlug);
  }
  if (filters?.place) {
    query = query.eq("place", filters.place);
  }
  if (filters?.onlyUnchecked) {
    query = query.eq("checked_in", false);
  }

  // Search by term if provided
  if (term) {
    // Check if it looks like a registration ID (e.g., REG-2026-... or SPOT-2026-...)
    if (/^(REG|SPOT|DYN)-\d{4}/i.test(term)) {
      query = query.ilike("registration_id", `${term}%`);
    }
    // Check if it looks like a phone number (digits only, 7+ chars)
    else if (/^\d{7,}$/.test(term.replace(/[\s\-+]/g, ""))) {
      const cleanPhone = term.replace(/[\s\-+]/g, "");
      query = query.or(`phone.eq.${cleanPhone},phone.ilike.%${cleanPhone}`);
    }
    // Otherwise search by name (case-insensitive prefix match)
    else {
      query = query.ilike("name", `%${term}%`);
    }
  }

  const { data, error } = await query;

  if (error) {
    console.error("Search error:", error);
    return [];
  }

  return (data || []).map((r: any) => ({
    id: r.id,
    registration_id: r.registration_id,
    name: r.name,
    phone: r.phone,
    place: r.place || "",
    session_slug: r.session_slug,
    typeName: (r.registration_sessions as any)?.title || r.session_slug,
    status: r.status,
    checked_in: r.checked_in || false,
    checked_in_at: r.checked_in_at,
    form_data: r.form_data || {},
    is_spot_registration: r.is_spot_registration || false,
  }));
}

/**
 * Get unique place values for the place filter dropdown
 */
export async function getUniquePlaces(): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("dynamic_registrations")
    .select("place")
    .not("place", "is", null)
    .not("place", "eq", "")
    .in("status", ["confirmed", "selected"]);

  if (error || !data) return [];

  const uniquePlaces = [...new Set(data.map((r: any) => r.place).filter(Boolean))];
  return uniquePlaces.sort();
}

/**
 * Check in by registration UUID (used from name search results)
 */
export async function checkInByRegistrationId(
  registrationUUID: string,
  gate: string = "main",
  checkedInBy: string = "System",
  sessionSlug?: string
): Promise<CheckInResult> {
  const supabase = await createClient();

  // 1. Look up the registration
  const { data: reg, error: lookupError } = await supabase
    .from("dynamic_registrations")
    .select("*, registration_sessions(title)")
    .eq("id", registrationUUID)
    .single();

  if (lookupError || !reg) {
    return {
      success: false,
      status: "not_found",
      message: "Registration not found.",
    };
  }

  // 2. Check status
  if (reg.status !== "confirmed" && reg.status !== "selected") {
    return {
      success: false,
      status: "not_confirmed",
      message: `Registration status is "${reg.status}".`,
      registration: {
        name: reg.name,
        registration_id: reg.registration_id,
        session_slug: reg.session_slug,
        typeName: (reg.registration_sessions as any)?.title || reg.session_slug,
        status: reg.status,
      },
    };
  }

  // 3. Check for existing check-in at this specific checkpoint
  // Skip duplicate checking for Exit checkpoints
  if (!gate.toLowerCase().includes("exit")) {
    const checkQuery = supabase
      .from("attendance_logs")
      .select("id, check_in_time")
      .eq("registration_id", reg.id)
      .eq("gate", gate);

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
  }

  // 4. Record the check-in
  const { error: insertError } = await supabase
    .from("attendance_logs")
    .insert({
      registration_id: reg.id,
      session_slug: sessionSlug || null,
      gate,
      checked_in_by: checkedInBy,
      method: "manual",
    });

  if (insertError) {
    return {
      success: false,
      status: "error",
      message: "Failed to record check-in: " + insertError.message,
    };
  }

  // 5. Update the registration's checked_in flag only if not already checked in
  if (!sessionSlug && !reg.checked_in) {
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

// ==============================================================================
// SPOT REGISTRATION
// ==============================================================================

export interface SpotRegistrationResult {
  success: boolean;
  registration?: {
    registration_id: string;
    qr_token: string;
    name: string;
    session_slug: string;
    typeName: string;
  };
  error?: string;
}

/**
 * Create a spot (walk-in) registration — registers, generates QR, and checks in.
 */
export async function createSpotRegistration(data: {
  name: string;
  phone: string;
  place?: string;
  sessionSlug: string;
  paymentMethod?: "cash" | "upi" | "waived" | "none";
  registeredBy: string;
  gate?: string;
}): Promise<SpotRegistrationResult> {
  const supabase = await createClient();

  // 1. Check if spot registration is enabled for this session
  const { data: session, error: sessionError } = await supabase
    .from("registration_sessions")
    .select("title, spot_registration_enabled, max_capacity, spot_registration_fee")
    .eq("slug", data.sessionSlug)
    .single();

  if (sessionError || !session) {
    return { success: false, error: "Session not found." };
  }

  if (!session.spot_registration_enabled) {
    return { success: false, error: "Spot registration is not open for this session." };
  }

  // 2. Check capacity
  if (session.max_capacity) {
    const { count } = await supabase
      .from("dynamic_registrations")
      .select("id", { count: "exact", head: true })
      .eq("session_slug", data.sessionSlug)
      .in("status", ["confirmed", "selected", "pending"]);

    if ((count || 0) >= session.max_capacity) {
      return { success: false, error: "This session has reached full capacity. No more spots available." };
    }
  }

  // 3. Check for duplicate phone in same session
  const { data: existing } = await supabase
    .from("dynamic_registrations")
    .select("id, name")
    .eq("phone", data.phone)
    .eq("session_slug", data.sessionSlug)
    .maybeSingle();

  if (existing) {
    return {
      success: false,
      error: `Phone number already registered for this session (${existing.name}).`,
    };
  }

  // 4. Generate registration ID
  const timestamp = Date.now().toString(36).toUpperCase().slice(-4);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  const registrationId = `SPOT-2026-${timestamp}${random}`;

  // 5. Generate QR token
  const qrToken = generateQRToken();

  // 6. Create the registration
  const { error: insertError } = await supabase
    .from("dynamic_registrations")
    .insert({
      registration_id: registrationId,
      session_slug: data.sessionSlug,
      name: data.name.trim(),
      phone: formatForDatabase(data.phone),
      place: data.place?.trim() || null,
      status: "confirmed",
      form_data: {
        payment_method: data.paymentMethod || "none",
        registered_by: data.registeredBy,
        spot_registration: true,
      },
      qr_token: qrToken,
      badge_generated_at: new Date().toISOString(),
      checked_in: true,
      checked_in_at: new Date().toISOString(),
      is_spot_registration: true,
      spot_registered_by: data.registeredBy,
      spot_registered_at: new Date().toISOString(),
      registration_source: "spot",
    });

  if (insertError) {
    return { success: false, error: "Failed to create registration: " + insertError.message };
  }

  // 7. Also create attendance log for the check-in
  // Get the new registration's UUID
  const { data: newReg } = await supabase
    .from("dynamic_registrations")
    .select("id")
    .eq("registration_id", registrationId)
    .single();

  if (newReg) {
    await supabase
      .from("attendance_logs")
      .insert({
        registration_id: newReg.id,
        gate: data.gate || "main",
        checked_in_by: data.registeredBy,
        method: "manual",
        notes: "Spot registration — auto checked in",
      });
  }

  revalidatePath("/admin/attendance");
  revalidatePath("/admin/registrations");

  return {
    success: true,
    registration: {
      registration_id: registrationId,
      qr_token: qrToken,
      name: data.name.trim(),
      session_slug: data.sessionSlug,
      typeName: session.title,
    },
  };
}

/**
 * Toggle spot registration for a session
 */
export async function toggleSpotRegistration(
  sessionSlug: string,
  enabled: boolean
) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("registration_sessions")
    .update({ spot_registration_enabled: enabled })
    .eq("slug", sessionSlug);

  if (error) throw new Error("Failed to update spot registration: " + error.message);
  revalidatePath("/admin/attendance");
  return { success: true };
}

/**
 * Update session capacity
 */
export async function updateSessionCapacity(
  sessionSlug: string,
  maxCapacity: number | null,
  spotFee?: number
) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Unauthorized");

  const update: any = { max_capacity: maxCapacity };
  if (spotFee !== undefined) {
    update.spot_registration_fee = spotFee;
    update.spot_fee_label = spotFee > 0 ? `₹${spotFee}` : "Free";
  }

  const { error } = await supabase
    .from("registration_sessions")
    .update(update)
    .eq("slug", sessionSlug);

  if (error) throw new Error("Failed to update capacity: " + error.message);
  revalidatePath("/admin/attendance");
  return { success: true };
}

/**
 * Get spot registration stats per session
 */
export async function fetchSpotRegistrationStats() {
  const supabase = await createClient();

  const { data: sessions } = await supabase
    .from("registration_sessions")
    .select("slug, title, max_capacity, spot_registration_enabled, spot_registration_fee, spot_fee_label")
    .eq("is_archived", false)
    .order("order_index", { ascending: true });

  if (!sessions) return [];

  const stats = [];
  for (const s of sessions) {
    const { count: totalRegistered } = await supabase
      .from("dynamic_registrations")
      .select("id", { count: "exact", head: true })
      .eq("session_slug", s.slug)
      .in("status", ["confirmed", "selected", "pending"]);

    const { count: spotCount } = await supabase
      .from("dynamic_registrations")
      .select("id", { count: "exact", head: true })
      .eq("session_slug", s.slug)
      .eq("is_spot_registration", true);

    stats.push({
      slug: s.slug,
      title: s.title,
      maxCapacity: s.max_capacity,
      spotEnabled: s.spot_registration_enabled || false,
      spotFee: s.spot_registration_fee || 0,
      spotFeeLabel: s.spot_fee_label || "Free",
      totalRegistered: totalRegistered || 0,
      spotRegistered: spotCount || 0,
      remainingSpots: s.max_capacity ? s.max_capacity - (totalRegistered || 0) : null,
    });
  }

  return stats;
}

// ==============================================================================
// OFFLINE SYNC API
// ==============================================================================

/**
 * Fetches all necessary data to populate the offline IndexedDB cache
 * for a seamless offline experience (search, checking in, spot reg).
 */
export async function fetchDataForOfflineSync() {
  const supabase = await createClient();
  
  const [attendeesResult, sessionsResult] = await Promise.all([
    supabase
      .from("dynamic_registrations")
      .select("id, name, phone, registration_id, session_slug, status, checked_in, checked_in_at, place, is_spot_registration")
      .in("status", ["confirmed", "selected"]),
    supabase
      .from("registration_sessions")
      .select("slug, title, max_capacity, spot_registration_enabled, spot_registration_fee, spot_fee_label")
      .eq("is_archived", false)
  ]);

  if (attendeesResult.error) throw new Error("Failed to fetch attendees for offline sync: " + attendeesResult.error.message);
  if (sessionsResult.error) throw new Error("Failed to fetch sessions for offline sync: " + sessionsResult.error.message);

  return {
    attendees: attendeesResult.data || [],
    sessions: sessionsResult.data || [],
    timestamp: Date.now()
  };
}
