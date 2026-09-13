import { createClient } from "./supabase/server";

export interface Speaker {
  id: string;
  slug: string;
  name: string;
  title: string;
  bio: string;
  image_url?: string;
  featured?: boolean;
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
  speakers?: Speaker[];
}

export async function getSpeakers(): Promise<Speaker[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('speakers').select('*').order('order_index', { ascending: true });
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
  return data || [];
}

export async function getSessionBySlug(slug: string): Promise<Session | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('sessions').select('*, speakers(*)').eq('slug', slug).single();
  if (error) return null;
  return data;
}

export async function getSessionsByStage(stage: string): Promise<Session[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('sessions').select('*, speakers(*)').eq('stage', stage).order('start_time', { ascending: true });
  if (error) {
    console.error("Error fetching sessions by stage:", error);
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
    venue: "Alathoorpadi, Melmuri",
    tagline: "From Baghdad to Malabar — Persian Artistry. Malabar Soul.",
    organizer: "Alathoorpadi Students Association",
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
  const { count: darimiCount } = await supabase.from('registrations_darimi_session').select('*', { count: 'exact', head: true });
  const { count: paperCount } = await supabase.from('registrations_paper_presentation').select('*', { count: 'exact', head: true });
  
  const { count: pendingPaperCount } = await supabase.from('registrations_paper_presentation').select('*', { count: 'exact', head: true }).eq('review_status', 'submitted');
  
  const { data: zones } = await supabase.from('zones').select('capacity');
  const totalZoneCapacity = zones?.reduce((sum, zone) => sum + zone.capacity, 0) || 1;
  const assemblyCapacityPercentage = Math.round(((grandAssemblyCount || 0) / totalZoneCapacity) * 100);

  const { data: liveStreams } = await supabase.from('live_streams').select('*');
  const isAnyLive = liveStreams?.some((stream: any) => stream.is_live) || false;

  return {
    totalRegistrations: (grandAssemblyCount || 0) + (darimiCount || 0) + (paperCount || 0),
    assemblyCapacityPercentage: Math.min(assemblyCapacityPercentage, 100),
    totalPaperSubmissions: paperCount || 0,
    pendingPaperReviews: pendingPaperCount || 0,
    isAnyLive,
  };
}

export async function getRecentRegistrations() {
  const supabase = await createClient();
  
  const { data: assemblyData } = await supabase.from('registrations_grand_assembly').select('id, name, place, created_at').order('created_at', { ascending: false }).limit(5);
  const { data: darimiData } = await supabase.from('registrations_darimi_session').select('id, name, place, created_at').order('created_at', { ascending: false }).limit(5);
  const { data: paperData } = await supabase.from('registrations_paper_presentation').select('id, name, place, created_at').order('created_at', { ascending: false }).limit(5);
  
  const allRegistrations = [
    ...(assemblyData || []).map(r => ({ ...r, type: 'Grand Assembly' })),
    ...(darimiData || []).map(r => ({ ...r, type: 'Darimi Session' })),
    ...(paperData || []).map(r => ({ ...r, type: 'Paper Present.' }))
  ];
  
  return allRegistrations.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5);
}
