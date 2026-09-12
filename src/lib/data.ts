/* ═══════════════════════════════════════════════════════════════════════
   Schedule & Speaker Seed Data
   Grand Jeelani Conference — September 27
   ═══════════════════════════════════════════════════════════════════════ */

export interface Speaker {
  id: string;
  slug: string;
  name: string;
  honorific?: string;
  bio: string;
  photoUrl?: string;
  sessions: string[];
}

export interface Session {
  id: string;
  slug: string;
  stage: 1 | 2;
  startTime: string; // HH:mm format
  endTime: string;
  title: string;
  titleMl?: string;
  titleAr?: string;
  description: string;
  type: "talk" | "ceremony" | "meal" | "mawlid" | "meeting" | "paid_session" | "paper_presentation" | "closing";
  isPaid: boolean;
  price?: number;
  speakerIds: string[];
}

/* ── Speakers ──────────────────────────────────────────────────────── */
export const speakers: Speaker[] = [
  {
    id: "sp-1",
    slug: "sayyid-abdul-naser-hayy-shihab-thangal",
    name: "Sayyid Abdul Naser Hayy Shihab Thangal",
    honorific: "Panakkad",
    bio: "A distinguished spiritual leader from the Panakkad family, renowned for his scholarly contributions and spiritual guidance within the Sunni Muslim community of Kerala.",
    sessions: ["s1-2"],
  },
  {
    id: "sp-2",
    slug: "sayyid-fazal-shihab-thangal",
    name: "Sayyid Fazal Shihab Thangal",
    bio: "A respected figure in the Islamic scholarly tradition of Kerala, known for his participation in academic and spiritual gatherings across Malabar.",
    sessions: ["s1-2"],
  },
  {
    id: "sp-3",
    slug: "salim-faizy-kolathur",
    name: "Salim Faizy Kolathur",
    bio: "A prominent Islamic scholar and orator known for his deep understanding of Sufi thought and the life of Shaykh Abd al-Qadir al-Jilani.",
    sessions: ["s1-3"],
  },
  {
    id: "sp-4",
    slug: "shuhaibul-haithami",
    name: "Shuhaibul Haithami",
    bio: "An esteemed scholar specializing in the science of tasawwuf and spiritual purification (tazkiyat al-nafs).",
    sessions: ["s1-5"],
  },
  {
    id: "sp-5",
    slug: "hafiz-basheer-faizy-aripra",
    name: "Hafiz Basheer Faizy Aripra",
    bio: "A respected Hafiz and scholar known for his expertise in Quranic sciences and spiritual discourse.",
    sessions: ["s1-5"],
  },
  {
    id: "sp-6",
    slug: "ameer-hussain-hudawi",
    name: "Ameer Hussain Hudawi",
    bio: "A scholarly authority on traditional Islamic practices and their relevance in the modern context, known for articulate defense of orthodox positions.",
    sessions: ["s1-6"],
  },
  {
    id: "sp-7",
    slug: "shareef-faizy-kolathur",
    name: "Shareef Faizy Kolathur",
    bio: "A well-regarded Islamic scholar and speaker whose discourse bridges classical scholarship with contemporary understanding.",
    sessions: ["s1-6"],
  },
  {
    id: "sp-8",
    slug: "sayyid-sadiq-ali-shihab-thangal",
    name: "Sayyid Sadiq Ali Shihab Thangal",
    honorific: "Panakkad",
    bio: "A revered spiritual leader from the Panakkad family, embodying the tradition of scholarly excellence and spiritual guidance.",
    sessions: ["s1-8"],
  },
  {
    id: "sp-9",
    slug: "elamkulam-usthad",
    name: "Elamkulam Usthad",
    bio: "A senior scholar and respected teacher in the Dars tradition of Malabar, known for decades of dedicated service to Islamic education.",
    sessions: ["s1-8"],
  },
  {
    id: "sp-10",
    slug: "valiyudheen-faizy",
    name: "Valiyudheen Faizy",
    bio: "A distinguished scholar tasked with delivering the closing address, synthesizing the conference's themes and charting the path forward.",
    sessions: ["s1-9"],
  },
  {
    id: "sp-11",
    slug: "sayyid-muhammad-koya-thangal-jamalullaili",
    name: "Sayyid Muhammad Koya Thangal Jamalullaili",
    bio: "A respected scholar and community leader, central to the Dars Management dialogue about preserving and advancing the palli-dars tradition.",
    sessions: ["s2-1"],
  },
  {
    id: "sp-12",
    slug: "abdussamad-pookkottur",
    name: "Abdussamad Pookkottur",
    bio: "A scholar and organizer deeply committed to the continuity and evolution of the Dars educational system in Malabar.",
    sessions: ["s2-1"],
  },
  {
    id: "sp-13",
    slug: "abdussalam-faizy-cholode",
    name: "Abdussalam Faizy Cholode",
    bio: "A noted Islamic scholar and educator contributing to the intellectual discourse at the conference.",
    sessions: ["s2-2"],
  },
  {
    id: "sp-14",
    slug: "dr-musthafa-darimi-karippur",
    name: "Dr. Musthafa Darimi Karippur",
    bio: "A distinguished academic and Islamic scholar offering a specialized session that continues as an ongoing course, bridging conference learning with sustained study.",
    sessions: ["s2-3"],
  },
];

/* ── Sessions — Stage 01 ─────────────────────────────────────────── */
export const sessions: Session[] = [
  {
    id: "s1-1",
    slug: "grand-assembly",
    stage: 1,
    startTime: "10:00",
    endTime: "11:00",
    title: "Grand Assembly",
    titleMl: "മഹാ സമ്മേളനം",
    description: "The opening grand assembly bringing together students, scholars, and the community in a unified gathering to mark the beginning of the Jeelani Conference.",
    type: "ceremony",
    isPaid: false,
    speakerIds: [],
  },
  {
    id: "s1-2",
    slug: "inaugural-ceremony",
    stage: 1,
    startTime: "11:00",
    endTime: "11:30",
    title: "Inaugural Ceremony",
    titleMl: "ഉദ്ഘാടന ചടങ്ങ്",
    description: "The formal inauguration of the Grand Jeelani Conference, graced by distinguished spiritual leaders and scholars.",
    type: "ceremony",
    isPaid: false,
    speakerIds: ["sp-1", "sp-2"],
  },
  {
    id: "s1-3",
    slug: "shaykh-jilani-spirituality-life-vision",
    stage: 1,
    startTime: "11:30",
    endTime: "12:30",
    title: "Shaykh Jilani: Spirituality, Life and Vision",
    titleMl: "ശൈഖ് ജീലാനി: ആത്മീയത, ജീവിതം, ദർശനം",
    description: "An in-depth exploration of the spiritual philosophy, biographical milestones, and enduring vision of Shaykh Abd al-Qadir al-Jilani — the Sultan of Saints.",
    type: "talk",
    isPaid: false,
    speakerIds: ["sp-3"],
  },
  {
    id: "s1-4",
    slug: "lunch-prayer",
    stage: 1,
    startTime: "12:30",
    endTime: "13:30",
    title: "Lunch & Prayer",
    titleMl: "ഉച്ച ഭക്ഷണവും നമസ്കാരവും",
    description: "A break for communal lunch and Zuhr prayer.",
    type: "meal",
    isPaid: false,
    speakerIds: [],
  },
  {
    id: "s1-5",
    slug: "aesthetics-of-tazkiyat-al-nafs",
    stage: 1,
    startTime: "14:00",
    endTime: "15:30",
    title: "The Aesthetics of Tazkiyat al-Nafs (Purification of the Soul)",
    titleMl: "തസ്കിയത്തുന്നഫ്സിന്റെ സൗന്ദര്യശാസ്ത്രം",
    description: "A scholarly dialogue exploring the beauty and methodology of spiritual purification in the Islamic tradition, drawing from the Jilani school of thought.",
    type: "talk",
    isPaid: false,
    speakerIds: ["sp-4", "sp-5"],
  },
  {
    id: "s1-6",
    slug: "traditional-practices-modern-criticisms-bidah",
    stage: 1,
    startTime: "15:30",
    endTime: "17:00",
    title: "A Dialogue Between Traditional Practices and Modern Criticisms of Bid'ah",
    titleMl: "പാരമ്പര്യ ആചാരങ്ങളും ബിദ്അത്തിന്റെ ആധുനിക വിമർശനങ്ങളും",
    description: "A nuanced academic discourse examining the intersection of traditional Islamic practices and contemporary debates around innovation (bid'ah) in religious observance.",
    type: "talk",
    isPaid: false,
    speakerIds: ["sp-6", "sp-7"],
  },
  {
    id: "s1-7",
    slug: "jilani-jalsa",
    stage: 1,
    startTime: "17:00",
    endTime: "18:20",
    title: "Jilani Jalsa (Grand Mawlid Gathering)",
    titleMl: "ജീലാനി ജൽസ (മഹാ മൗലിദ് സമ്മേളനം)",
    description: "A grand spiritual gathering celebrating the blessed legacy of Shaykh al-Jilani through devotional recitations, poetry, and collective remembrance.",
    type: "mawlid",
    isPaid: false,
    speakerIds: [],
  },
  {
    id: "s1-8",
    slug: "jilani-conference-keynote",
    stage: 1,
    startTime: "20:00",
    endTime: "21:00",
    title: "Jilani Conference",
    titleMl: "ജീലാനി കോൺഫറൻസ്",
    description: "The keynote conference session featuring addresses by distinguished spiritual leaders on the contemporary relevance of the Jilani tradition.",
    type: "talk",
    isPaid: false,
    speakerIds: ["sp-8", "sp-9"],
  },
  {
    id: "s1-9",
    slug: "closing-ceremony",
    stage: 1,
    startTime: "21:00",
    endTime: "22:00",
    title: "Closing",
    titleMl: "സമാപനം",
    description: "The closing address and formal conclusion of the Grand Jeelani Conference.",
    type: "closing",
    isPaid: false,
    speakerIds: ["sp-10"],
  },

  /* ── Sessions — Stage 02 ─────────────────────────────────────────── */
  {
    id: "s2-1",
    slug: "dars-management-meet",
    stage: 2,
    startTime: "11:00",
    endTime: "13:00",
    title: "Dars Management Meet — \"Palli-dars: We Are the Successors of Tradition\"",
    titleMl: "ദർസ് മാനേജ്‌മെന്റ് മീറ്റ് — \"പള്ളിദർസ്: പാരമ്പര്യത്തിന്റെ അനന്തരാവകാശികൾ\"",
    description: "A strategic meeting focused on the governance, preservation, and evolution of the palli-dars educational tradition — asserting the role of this generation as custodians of a centuries-old knowledge system.",
    type: "meeting",
    isPaid: false,
    speakerIds: ["sp-11", "sp-12"],
  },
  {
    id: "s2-2",
    slug: "stage-2-session",
    stage: 2,
    startTime: "14:00",
    endTime: "15:00",
    title: "Session",
    description: "An academic session contributing to the broader scholarly discourse of the conference.",
    type: "talk",
    isPaid: false,
    speakerIds: ["sp-13"],
  },
  {
    id: "s2-3",
    slug: "musthafa-darimi-karippur-session",
    stage: 2,
    startTime: "15:00",
    endTime: "17:00",
    title: "Session (Paid, continues as a course)",
    titleMl: "സെഷൻ (പെയ്ഡ്, കോഴ്‌സായി തുടരുന്നു)",
    description: "A specialized academic session by Dr. Musthafa Darimi Karippur that serves as the entry point to a continuing course — setting the foundation for sustained, structured learning beyond the conference day.",
    type: "paid_session",
    isPaid: true,
    price: 0,
    speakerIds: ["sp-14"],
  },
  {
    id: "s2-4",
    slug: "paper-presentation",
    stage: 2,
    startTime: "17:00",
    endTime: "18:10",
    title: "Paper Presentation — \"Muhyiddin Mala and the Social Life of Malabar Muslims: A Study\"",
    titleMl: "പേപ്പർ പ്രസന്റേഷൻ — \"മുഹ്‌യിദ്ദീൻ മാല, മലബാർ മുസ്‌ലിംകളുടെ സാമൂഹിക ജീവിതം\"",
    description: "A research presentation session exploring the cultural and social significance of the Muhyiddin Mala in shaping the religious and communal life of Malabar Muslims.",
    type: "paper_presentation",
    isPaid: false,
    speakerIds: [],
  },
];

/* ── Live Stream Config ───────────────────────────────────────────── */
export const liveStreams = {
  stage1: {
    youtubeVideoId: "X7Xw7dRlGJo",
    isLive: false,
  },
  stage2: {
    youtubeVideoId: "Ycwr1oqQpv0",
    isLive: false,
  },
};

/* ── Site Settings ────────────────────────────────────────────────── */
export const siteSettings = {
  eventDate: "2026-09-27T10:00:00+05:30",
  eventEndDate: "2026-09-27T22:00:00+05:30",
  venue: "Alathoorpadi, Melmuri",
  tagline: "From Baghdad to Malabar — Persian Artistry. Malabar Soul.",
  taglineMl: "ബാഗ്ദാദിൽ നിന്ന് മലബാറിലേക്ക് — പേർഷ്യൻ കലാചാതുര്യം. മലബാർ ആത്മാവ്.",
  organizer: "Alathoorpadi Students Association",
  locationMapUrl: "https://maps.app.goo.gl/nCJ4g6Rx9B9Sn3c99",
  ambientAudioUrl: "/ambient-music.mp3",
  social: {
    website: "https://alathurpadidars.in/",
    email: "alathurpadidars@gmail.com",
    whatsappDirect: "https://api.whatsapp.com/send?phone=919074525205",
    whatsappChannel: "https://whatsapp.com/channel/0029VaEKsh01t90eFbaYwN1h",
    instagram: "https://www.instagram.com/alathurpadi_dars/",
    facebook: "https://www.facebook.com/alathurpadidars",
    twitter: "https://x.com/alathurpadidars",
    youtube: "https://www.youtube.com/alathurpadidars",
  },
};

/* ── Helper Functions ─────────────────────────────────────────────── */
export function getSessionById(id: string): Session | undefined {
  return sessions.find((s) => s.id === id);
}

export function getSessionsByStage(stage: 1 | 2): Session[] {
  return sessions.filter((s) => s.stage === stage);
}

export function getSpeakerById(id: string): Speaker | undefined {
  return speakers.find((s) => s.id === id);
}

export function getSpeakersForSession(sessionId: string): Speaker[] {
  const session = getSessionById(sessionId);
  if (!session) return [];
  return session.speakerIds
    .map((id) => getSpeakerById(id))
    .filter(Boolean) as Speaker[];
}
