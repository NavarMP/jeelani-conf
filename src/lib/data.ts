import { createClient } from "./supabase/server";

export interface Speaker {
  id: string;
  slug: string;
  name: string;
  name_ml?: string;
  title: string;
  bio: string;
  description?: string;
  image_url?: string;
  featured?: boolean;
  order_index?: number;
}

export interface Session {
  id: string;
  slug: string;
  stage: string;
  start_time: string;
  end_time: string;
  title: string;
  title_ml?: string;
  description: string;
  type: string;
  is_paid?: boolean;
  external_url?: string;
  registration_session_slug?: string;
  parent_id?: string;
  speakers?: Speaker[];
  programs?: Session[];
}

export interface RegistrationSession {
  id: string;
  slug: string;
  title: string;
  title_ml?: string;
  description: string;
  description_ml?: string;
  icon?: string;
  color?: string;
  price_label?: string;
  form_type?: string;
  href_override?: string;
  is_open: boolean;
  is_archived: boolean;
  order_index?: number;
}

export async function getSpeakers(): Promise<Speaker[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('speakers')
    .select('*')
    .order('order_index', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: true });
  if (error) {
    console.error("Error fetching speakers:", error);
    return [];
  }
  return data || [];
}

export async function getSpeakerBySlug(slug: string): Promise<Speaker | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('speakers').select('*').eq('slug', slug).single();
  if (error) return null;
  return data;
}

export async function getSessions(): Promise<Session[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('sessions').select('*, speakers(*)').order('start_time', { ascending: true });
  if (error) {
    console.error("Error fetching sessions:", error);
    return [];
  }
  
  if (!data) return [];
  
  const allSessions: Session[] = data;
  const topLevelSessions = allSessions.filter(s => !s.parent_id);
  const childSessions = allSessions.filter(s => s.parent_id);
  
  // Nest child sessions into their parents
  topLevelSessions.forEach(parent => {
    parent.programs = childSessions.filter(child => child.parent_id === parent.id);
  });
  
  return topLevelSessions;
}

/** Returns ALL sessions as a flat array (no nesting). Used by admin. */
export async function getAllSessionsFlat(): Promise<Session[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('sessions').select('*, speakers(*)').order('start_time', { ascending: true });
  if (error) {
    console.error("Error fetching all sessions flat:", error);
    return [];
  }
  return data || [];
}

export async function getSessionBySlug(slug: string): Promise<Session | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('sessions').select('*, speakers(*)').eq('slug', slug).single();
  if (error || !data) return null;

  const { data: childPrograms } = await supabase
    .from('sessions')
    .select('*, speakers(*)')
    .eq('parent_id', data.id)
    .order('start_time', { ascending: true });

  if (childPrograms && childPrograms.length > 0) {
    data.programs = childPrograms;
  }
  return data;
}

export async function getSessionsByStage(stage: string): Promise<Session[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('sessions').select('*, speakers(*)').eq('stage', stage).order('start_time', { ascending: true });
  if (error) {
    console.error("Error fetching sessions by stage:", error);
    return [];
  }
  if (!data) return [];
  
  const allSessions: Session[] = data;
  const topLevelSessions = allSessions.filter(s => !s.parent_id);
  const childSessions = allSessions.filter(s => s.parent_id);
  
  topLevelSessions.forEach(parent => {
    parent.programs = childSessions.filter(child => child.parent_id === parent.id);
  });
  
  return topLevelSessions;
}

export async function getRegistrationSessions(): Promise<RegistrationSession[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('registration_sessions')
    .select('*')
    .eq('is_archived', false)
    .order('order_index', { ascending: true });
  if (error) {
    console.error("Error fetching registration sessions:", error);
    return [];
  }
  return data || [];
}

export async function getSiteSettings(): Promise<any> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('global_settings').select('*');
  
  // Provide default fallback in case DB is empty or missing keys
  const defaultSettings = {
    eventDate: "2026-09-27T10:00:00+05:30",
    eventEndDate: "2026-09-27T22:00:00+05:30",
    venue: "Alathurpadi, Melmuri",
    tagline: "From Baghdad to Malabar — Persian Artistry. Malabar Soul.",
    organizer: "Alathurpadi Students Association",
    locationMapUrl: "https://maps.app.goo.gl/nCJ4g6Rx9B9Sn3c99",
  };

  if (error || !data) return defaultSettings;

  const settings: any = { ...defaultSettings };
  data.forEach((row) => {
    settings[row.key] = row.value;
  });

  return settings;
}

export async function getLiveStreams(): Promise<any> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('live_streams').select('*');
  if (error || !data) return {};
  
  const streams: any = {};
  data.forEach((row) => {
    streams[row.stage] = {
      youtubeVideoId: row.youtube_id,
      isLive: row.is_live
    };
  });
  return streams;
}

export async function getAdminDashboardStats() {
  const supabase = await createClient();
  
  const { count: grandAssemblyCount } = await supabase.from('registrations_grand_assembly').select('*', { count: 'exact', head: true });
  const { count: dynamicCount } = await supabase.from('dynamic_registrations').select('*', { count: 'exact', head: true });
  
  const { data: zones } = await supabase.from('zones').select('capacity');
  const totalZoneCapacity = zones?.reduce((sum, zone) => sum + zone.capacity, 0) || 1;
  const assemblyCapacityPercentage = Math.round(((grandAssemblyCount || 0) / totalZoneCapacity) * 100);

  const { data: liveStreams } = await supabase.from('live_streams').select('*');
  const isAnyLive = liveStreams?.some((stream: any) => stream.is_live) || false;

  return {
    totalRegistrations: (grandAssemblyCount || 0) + (dynamicCount || 0),
    assemblyCapacityPercentage: Math.min(assemblyCapacityPercentage, 100),
    dynamicRegistrations: dynamicCount || 0,
    isAnyLive,
  };
}

export async function getRecentRegistrations() {
  const supabase = await createClient();
  
  const { data: assemblyData } = await supabase.from('registrations_grand_assembly').select('id, name, place, created_at').order('created_at', { ascending: false }).limit(5);
  const { data: dynamicData } = await supabase.from('dynamic_registrations').select('id, name, place, session_slug, created_at').order('created_at', { ascending: false }).limit(5);
  
  const allRegistrations = [
    ...(assemblyData || []).map(r => ({ ...r, type: 'Grand Assembly' })),
    ...(dynamicData || []).map((r: any) => ({ ...r, type: r.session_slug || 'Dynamic' }))
  ];
  
  return allRegistrations.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5);
}

export async function getAllRegistrations() {
  const supabase = await createClient();
  
  // Fetch from all tables
  const { data: assemblyData } = await supabase.from('registrations_grand_assembly').select('*').order('created_at', { ascending: false });
  const { data: dynamicData } = await supabase.from('dynamic_registrations').select('*, registration_sessions(title)').order('created_at', { ascending: false });
  
  // Map them into a unified format
  const allRegistrations = [
    ...(assemblyData || []).map(r => ({ ...r, tableName: 'registrations_grand_assembly', typeSlug: 'assembly', typeName: 'Grand Assembly' })),
    ...(dynamicData || []).map((r: any) => ({ ...r, tableName: 'dynamic_registrations', typeSlug: r.session_slug, typeName: r.registration_sessions?.title || r.session_slug }))
  ];
  
  // Sort by created_at desc
  return allRegistrations.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function getZonesData() {
  const supabase = await createClient();
  
  // 1. Fetch zones
  const { data: dbZones } = await supabase
    .from('zones')
    .select('*')
    .order('id', { ascending: true });

  // 2. Fetch all Grand Assembly attendees to compute actual occupancy
  const { data: attendees } = await supabase
    .from('registrations_grand_assembly')
    .select('id, registration_id, name, phone, dars_name, place, zone, row_num, seat_num, status, created_at')
    .order('created_at', { ascending: true });

  // Default zones if database has none seeded yet
  const defaultZones = [
    { id: 'zone-a', name: 'Zone A - Front Right', capacity: 500, color: 'blue', layout_data: { rows: 10, seatsPerRow: 15 } },
    { id: 'zone-b', name: 'Zone B - Front Left', capacity: 500, color: 'turquoise', layout_data: { rows: 10, seatsPerRow: 15 } },
    { id: 'zone-c', name: 'Zone C - Mid Right', capacity: 300, color: 'amber', layout_data: { rows: 8, seatsPerRow: 12 } },
    { id: 'zone-d', name: 'Zone D - Mid Left', capacity: 300, color: 'emerald', layout_data: { rows: 8, seatsPerRow: 12 } },
  ];

  const zones = (dbZones && dbZones.length > 0) ? dbZones : defaultZones;

  // Calculate allocation per zone
  const zonesWithOccupancy = zones.map(z => {
    const assignedAttendees = (attendees || []).filter(a => a.zone === z.id || a.zone === z.name);
    return {
      ...z,
      allocatedCount: assignedAttendees.length,
      percentage: Math.min(100, Math.round((assignedAttendees.length / (z.capacity || 1)) * 100)),
      attendees: assignedAttendees
    };
  });

  const unseatedAttendees = (attendees || []).filter(a => !a.zone);

  return {
    zones: zonesWithOccupancy,
    totalAttendees: attendees?.length || 0,
    unseatedAttendees,
    allAttendees: attendees || [],
  };
}

export async function getLiveStreamsData() {
  const supabase = await createClient();
  const { data } = await supabase.from('live_streams').select('*');
  
  const defaultStreams = [
    { stage: 'Stage 1', youtube_id: 'X7Xw7dRlGJo', is_live: false },
    { stage: 'Stage 2', youtube_id: 'Ycwr1oqQpv0', is_live: false }
  ];

  if (!data || data.length === 0) {
    return defaultStreams;
  }

  const s1 = data.find(s => s.stage.toLowerCase().includes('1')) || defaultStreams[0];
  const s2 = data.find(s => s.stage.toLowerCase().includes('2')) || defaultStreams[1];

  return [s1, s2];
}

export async function getAuditTrailData() {
  const supabase = await createClient();

  const [assembly, dynamic, streams] = await Promise.all([
    supabase.from('registrations_grand_assembly').select('id, registration_id, name, created_at, updated_at, status').order('updated_at', { ascending: false }).limit(10),
    supabase.from('dynamic_registrations').select('id, registration_id, name, session_slug, created_at, updated_at').order('updated_at', { ascending: false }).limit(10),
    supabase.from('live_streams').select('stage, youtube_id, is_live, updated_at').order('updated_at', { ascending: false }).limit(5)
  ]);

  const logs: any[] = [];

  (assembly.data || []).forEach(r => {
    logs.push({
      timestamp: r.updated_at || r.created_at,
      admin: 'System / Attendee',
      ip: '192.168.1.10',
      category: 'Grand Assembly',
      color: 'blue',
      action: `Registration ${r.registration_id} (${r.name})`,
      details: `Status: ${r.status}`
    });
  });

  (dynamic.data || []).forEach(r => {
    logs.push({
      timestamp: r.updated_at || r.created_at,
      admin: 'System / Form',
      ip: '192.168.1.18',
      category: 'Session Entry',
      color: 'amber',
      action: `Dynamic Reg ${r.registration_id} (${r.name})`,
      details: `Program: ${r.session_slug}`
    });
  });

  (streams.data || []).forEach(s => {
    logs.push({
      timestamp: s.updated_at,
      admin: 'Broadcast Admin',
      ip: '192.168.1.20',
      category: 'Live Stream',
      color: 'red',
      action: `${s.stage} Stream Config`,
      details: `Live: ${s.is_live ? 'ON AIR' : 'OFFLINE'} • ID: ${s.youtube_id || 'None'}`
    });
  });

  return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export async function getPublishedGalleryMedia() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("gallery_media")
    .select("*, category:gallery_categories(*)")
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(12);

  if (error) {
    console.error("Error fetching gallery media:", error);
    return [];
  }
  return data || [];
}

