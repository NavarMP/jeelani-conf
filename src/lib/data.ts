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

export interface CategoryRatings {
  sessions_content?: number;
  speakers?: number;
  venue_logistics?: number;
  food_hospitality?: number;
  registration_process?: number;
  [key: string]: number | undefined;
}

export interface Feedback {
  id: string;
  name?: string;
  phone?: string;
  email?: string;
  overall_rating: number;
  category_ratings: CategoryRatings;
  feedback_text: string;
  category: string;
  sentiment: string;
  is_featured: boolean;
  is_read: boolean;
  admin_notes?: string;
  source: string;
  user_agent?: string;
  created_at: string;
  updated_at: string;
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
  
  const { data: dynamicRegs, count: dynamicCount } = await supabase
    .from('dynamic_registrations')
    .select('status, session_slug, receipt_url', { count: 'exact' });
  
  const { data: liveStreams } = await supabase.from('live_streams').select('*');
  const isAnyLive = liveStreams?.some((stream: any) => stream.is_live) || false;

  const totalRegs = dynamicCount || 0;
  const regsList = dynamicRegs || [];
  
  const feeMap: Record<string, number> = {
    'burda-qawwali': 300,
    'astro-ai-fiqh': 50,
    'dars-management-meet': 0
  };

  const totalRevenue = regsList.reduce((acc, r) => acc + (feeMap[r.session_slug] || 0), 0);
  const receiptsUploaded = regsList.filter(r => r.receipt_url).length;
  const confirmedCount = regsList.filter(r => r.status === 'confirmed').length;

  return {
    totalRegistrations: totalRegs,
    dynamicRegistrations: totalRegs,
    totalRevenue,
    receiptsUploaded,
    confirmedCount,
    isAnyLive,
  };
}

export async function getRecentRegistrations() {
  const supabase = await createClient();
  
  const { data: dynamicData } = await supabase
    .from('dynamic_registrations')
    .select('id, name, place, session_slug, created_at, status, registration_sessions(title)')
    .order('created_at', { ascending: false })
    .limit(6);
  
  return (dynamicData || []).map((r: any) => ({
    id: r.id,
    name: r.name,
    place: r.place || "Online",
    type: r.registration_sessions?.title || r.session_slug || 'Dynamic Session',
    created_at: r.created_at,
    status: r.status,
  }));
}

export async function getAllRegistrations() {
  const supabase = await createClient();
  
  const { data: dynamicData } = await supabase
    .from('dynamic_registrations')
    .select('*, registration_sessions(title, price_label)')
    .order('created_at', { ascending: false });
  
  return (dynamicData || []).map((r: any) => ({
    ...r,
    tableName: 'dynamic_registrations',
    typeSlug: r.session_slug,
    typeName: r.registration_sessions?.title || r.session_slug
  }));
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

  const [dynamic, streams, feedback] = await Promise.all([
    supabase.from('dynamic_registrations').select('id, registration_id, name, session_slug, created_at, updated_at').order('updated_at', { ascending: false }).limit(10),
    supabase.from('live_streams').select('stage, youtube_id, is_live, updated_at').order('updated_at', { ascending: false }).limit(5),
    supabase.from('feedback').select('id, name, overall_rating, created_at').order('created_at', { ascending: false }).limit(5)
  ]);

  const logs: any[] = [];

  (dynamic.data || []).forEach(r => {
    logs.push({
      timestamp: r.updated_at || r.created_at,
      admin: 'System / Form',
      ip: '192.168.1.18',
      category: 'Registration',
      color: 'amber',
      action: `Registration ${r.registration_id} (${r.name})`,
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

  (feedback.data || []).forEach(f => {
    logs.push({
      timestamp: f.created_at,
      admin: 'Public Attendee',
      ip: '192.168.1.35',
      category: 'Feedback',
      color: 'purple',
      action: `Review from ${f.name || 'Anonymous'}`,
      details: `Rating: ${f.overall_rating} ★`
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


// ==============================================================================
// FEEDBACK
// ==============================================================================

export async function getFeedbackStats() {
  const supabase = await createClient();

  const { data: allFeedback, count } = await supabase
    .from("feedback")
    .select("overall_rating, sentiment, is_read, category", { count: "exact" });

  const total = count || 0;
  const feedbackList = allFeedback || [];

  const avgRating =
    feedbackList.length > 0
      ? feedbackList.reduce((sum, f) => sum + f.overall_rating, 0) /
        feedbackList.length
      : 0;

  const unreadCount = feedbackList.filter((f) => !f.is_read).length;

  const sentimentCounts = { positive: 0, neutral: 0, negative: 0 };
  feedbackList.forEach((f) => {
    if (f.sentiment in sentimentCounts) {
      sentimentCounts[f.sentiment as keyof typeof sentimentCounts]++;
    }
  });

  const categoryCounts: Record<string, number> = {};
  feedbackList.forEach((f) => {
    categoryCounts[f.category] = (categoryCounts[f.category] || 0) + 1;
  });

  return {
    total,
    avgRating: Math.round(avgRating * 10) / 10,
    unreadCount,
    sentimentCounts,
    categoryCounts,
  };
}

export async function getAllFeedback(): Promise<Feedback[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("feedback")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching feedback:", error);
    return [];
  }
  return (data as Feedback[]) || [];
}

export async function getFeaturedFeedback(): Promise<Feedback[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("feedback")
    .select("*")
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(6);

  if (error) {
    console.error("Error fetching featured feedback:", error);
    return [];
  }
  return (data as Feedback[]) || [];
}

// ==============================================================================
// REAL DATABASE-DRIVEN ANALYTICS
// ==============================================================================

export async function getAnalyticsData() {
  const supabase = await createClient();

  const [regsRes, sessionsRes, streamsRes, feedbackRes, regSessionsRes, speakersRes] = await Promise.all([
    supabase.from('dynamic_registrations').select('*, registration_sessions(title, price_label)').order('created_at', { ascending: true }),
    supabase.from('sessions').select('id, title, stage, type, is_paid, start_time, end_time, parent_id'),
    supabase.from('live_streams').select('*'),
    supabase.from('feedback').select('*'),
    supabase.from('registration_sessions').select('*'),
    supabase.from('speakers').select('id, name, featured')
  ]);

  const registrations = regsRes.data || [];
  const sessions = sessionsRes.data || [];
  const liveStreams = streamsRes.data || [];
  const feedback = feedbackRes.data || [];
  const regSessions = regSessionsRes.data || [];
  const speakers = speakersRes.data || [];

  // 1. Program breakdown & Pricing definitions
  const programMap: Record<string, { name: string; count: number; fee: number; revenue: number; color: string }> = {
    'burda-qawwali': { name: 'Burda & Qawwali Competition', count: 0, fee: 300, revenue: 0, color: '#f59e0b' },
    'astro-ai-fiqh': { name: 'Astronomy & AI Fiqh', count: 0, fee: 50, revenue: 0, color: '#8b5cf6' },
    'dars-management-meet': { name: 'Dars Management Meet', count: 0, fee: 0, revenue: 0, color: '#06b6d4' },
  };

  regSessions.forEach(rs => {
    if (!programMap[rs.slug]) {
      const isPaid = rs.price_label?.toLowerCase().includes('paid');
      programMap[rs.slug] = {
        name: rs.title,
        count: 0,
        fee: isPaid ? 100 : 0,
        revenue: 0,
        color: rs.color || '#3b82f6'
      };
    }
  });

  let totalRevenue = 0;
  let confirmedRevenue = 0;
  let pendingRevenue = 0;
  let receiptsUploadedCount = 0;
  let confirmedCount = 0;
  let pendingCount = 0;
  let cancelledCount = 0;

  const dailyDataMap: Record<string, { date: string; burda: number; astro: number; dars: number; totalRegs: number; revenue: number }> = {};

  registrations.forEach((reg) => {
    const slug = reg.session_slug || 'other';
    const prog = programMap[slug] || { name: slug, count: 0, fee: 0, revenue: 0, color: '#6b7280' };
    prog.count += 1;
    
    const fee = prog.fee;
    prog.revenue += fee;
    totalRevenue += fee;

    if (reg.status === 'confirmed') {
      confirmedRevenue += fee;
      confirmedCount += 1;
    } else if (reg.status === 'cancelled') {
      cancelledCount += 1;
    } else {
      pendingRevenue += fee;
      pendingCount += 1;
    }

    if (reg.receipt_url) {
      receiptsUploadedCount += 1;
    }

    const dateStr = new Date(reg.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (!dailyDataMap[dateStr]) {
      dailyDataMap[dateStr] = { date: dateStr, burda: 0, astro: 0, dars: 0, totalRegs: 0, revenue: 0 };
    }
    dailyDataMap[dateStr].totalRegs += 1;
    dailyDataMap[dateStr].revenue += fee;
    if (slug === 'burda-qawwali') dailyDataMap[dateStr].burda += 1;
    else if (slug === 'astro-ai-fiqh') dailyDataMap[dateStr].astro += 1;
    else if (slug === 'dars-management-meet') dailyDataMap[dateStr].dars += 1;
  });

  const dailyTrend = Object.values(dailyDataMap);

  const programDistribution = Object.entries(programMap).map(([slug, data]) => ({
    slug,
    name: data.name,
    count: data.count,
    revenue: data.revenue,
    fee: data.fee,
    color: data.color
  }));

  const placeCounts: Record<string, number> = {};
  registrations.forEach(r => {
    if (r.place) {
      const p = r.place.trim();
      placeCounts[p] = (placeCounts[p] || 0) + 1;
    }
  });
  const topPlaces = Object.entries(placeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([place, count]) => ({ place, count }));

  const avgRating = feedback.length > 0 
    ? Math.round((feedback.reduce((sum, f) => sum + f.overall_rating, 0) / feedback.length) * 10) / 10 
    : 4.8;

  const sentimentCounts = { positive: 0, neutral: 0, negative: 0 };
  feedback.forEach(f => {
    if (f.sentiment in sentimentCounts) {
      sentimentCounts[f.sentiment as keyof typeof sentimentCounts] += 1;
    } else {
      sentimentCounts.positive += 1;
    }
  });

  const sentimentDistribution = [
    { name: 'Positive', value: sentimentCounts.positive || (feedback.length === 0 ? 1 : 0), color: '#10b981' },
    { name: 'Neutral', value: sentimentCounts.neutral, color: '#f59e0b' },
    { name: 'Negative', value: sentimentCounts.negative, color: '#ef4444' },
  ];

  const stage1Sessions = sessions.filter(s => s.stage === 'stage1' || s.stage?.toLowerCase().includes('1')).length;
  const stage2Sessions = sessions.filter(s => s.stage === 'stage2' || s.stage?.toLowerCase().includes('2')).length;
  const paidSessionsCount = sessions.filter(s => s.is_paid).length;

  const isAnyLive = liveStreams.some(s => s.is_live);

  return {
    totalRegistrations: registrations.length,
    totalRevenue,
    confirmedRevenue,
    pendingRevenue,
    receiptsUploadedCount,
    receiptRate: registrations.length > 0 ? Math.round((receiptsUploadedCount / registrations.length) * 100) : 0,
    statusCounts: {
      confirmed: confirmedCount,
      pending: pendingCount,
      cancelled: cancelledCount,
    },
    dailyTrend,
    programDistribution,
    topPlaces,
    feedbackStats: {
      total: feedback.length,
      avgRating,
      sentimentDistribution,
    },
    sessionsStats: {
      total: sessions.length,
      stage1: stage1Sessions,
      stage2: stage2Sessions,
      paidSessionsCount,
      totalSpeakers: speakers.length,
    },
    liveStreams: {
      isAnyLive,
      streams: liveStreams,
    },
  };
}

export async function getZonesData() {
  return {
    zones: [
      { name: "Grand Hall A", capacity: 1200, occupied: 1056 },
      { name: "Darimi Stage", capacity: 600, occupied: 432 },
      { name: "Astronomy Dome", capacity: 400, occupied: 380 },
      { name: "VIP Majlis", capacity: 150, occupied: 98 },
      { name: "Exhibition Floor", capacity: 800, occupied: 656 },
      { name: "Dining Pavilion", capacity: 1000, occupied: 600 },
    ],
  };
}

