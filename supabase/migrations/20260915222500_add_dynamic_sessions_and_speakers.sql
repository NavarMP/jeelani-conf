-- ==============================================================================
-- SEED DATA for Grand Jeelani Conference
-- Run this AFTER schema.sql or as ALTER TABLE additions to existing DB
-- ==============================================================================

-- Step 0: Add new columns if they don't exist (for existing DBs)
ALTER TABLE public.speakers ADD COLUMN IF NOT EXISTS name_ml VARCHAR(255);
ALTER TABLE public.speakers ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS slug VARCHAR(255) UNIQUE;
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS is_paid BOOLEAN DEFAULT false;
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS external_url VARCHAR(1000);
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS registration_session_slug VARCHAR(255);
ALTER TABLE public.registration_sessions ADD COLUMN IF NOT EXISTS title_ml VARCHAR(255);
ALTER TABLE public.registration_sessions ADD COLUMN IF NOT EXISTS description_ml TEXT;
ALTER TABLE public.registration_sessions ADD COLUMN IF NOT EXISTS icon VARCHAR(10);
ALTER TABLE public.registration_sessions ADD COLUMN IF NOT EXISTS color VARCHAR(50);
ALTER TABLE public.registration_sessions ADD COLUMN IF NOT EXISTS price_label VARCHAR(50);
ALTER TABLE public.registration_sessions ADD COLUMN IF NOT EXISTS form_type VARCHAR(50) DEFAULT 'standard';
ALTER TABLE public.registration_sessions ADD COLUMN IF NOT EXISTS href_override VARCHAR(500);
ALTER TABLE public.registration_sessions ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;
ALTER TABLE public.dynamic_registrations ADD COLUMN IF NOT EXISTS place VARCHAR(255);

-- Storage bucket for speaker photos
INSERT INTO storage.buckets (id, name, public) VALUES ('speaker-photos', 'speaker-photos', true) ON CONFLICT (id) DO NOTHING;

-- Step 1: Clear existing data (careful — this deletes all schedule/speaker data)
DELETE FROM public.session_speakers;
DELETE FROM public.sessions;
DELETE FROM public.speakers;

-- Step 2: Insert Speakers
INSERT INTO public.speakers (id, name, name_ml, slug, title, bio, description, featured, order_index) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Sayyid Abdunasir Hayy Shihab Thangal Panakkad', 'സയ്യിദ് അബ്ദുനാസ്വിർ ഹയ്യ് ശിഹാബ് തങ്ങൾ പാണക്കാട്', 'sayyid-abdunasir', 'Chief Guest', 'Esteemed spiritual leader and chief guest of the Inaugural Ceremony.', 'Chief guest presiding over the Grand Jeelani Conference Inaugural Ceremony.', true, 1),
  ('a1000000-0000-0000-0000-000000000002', 'Sayyid Fazal Shihab Thangal', 'സയ്യിദ് ഫസൽ ശിഹാബ് തങ്ങൾ', 'sayyid-fazal', 'Distinguished Guest', 'Respected spiritual figure and guest at the Inaugural Ceremony.', 'Guest of honor at the Jeelani Conference Inaugural Ceremony.', true, 2),
  ('a1000000-0000-0000-0000-000000000003', 'Hafiz Basheer Faizi Aripra', 'ഹാഫിള് ബഷീർ ഫൈസി അരിപ്ര', 'basheer-faizi', 'Scholar & Speaker', 'Renowned scholar speaking on the aesthetics of self-purification.', 'Speaker at the Inaugural Ceremony on Tazkiyatun Nafs.', true, 3),
  ('a1000000-0000-0000-0000-000000000004', 'Misbahuddin Karakkuṉṉ', 'മിസ്ബാഹുദ്ദീൻ കാരക്കുന്ന്', 'misbahuddin', 'Scholar & Speaker', 'Scholar presenting on the aesthetics of self-purification alongside Hafiz Basheer Faizi.', 'Co-speaker at the Inaugural Ceremony.', false, 4),
  ('a1000000-0000-0000-0000-000000000005', 'Salim Faizi Kolathoor', 'സാലിം ഫൈസി കൊളത്തൂർ', 'salim-faizi', 'Speaker', 'Scholar presenting on Shaykh Jilani — his spirituality, life, and philosophy.', 'Speaker on Shaykh Jilani: Spirituality, Life & Philosophy.', true, 5),
  ('a1000000-0000-0000-0000-000000000006', 'Sayyid Sadiq Ali Shihab Thangal Panakkad', 'സയ്യിദ് സാദിഖ് അലി ശിഹാബ് തങ്ങൾ പാണക്കാട്', 'sayyid-sadiq-ali', 'Keynote Speaker', 'Keynote speaker at the Jeelani Conference evening session.', 'Keynote address at the Grand Jeelani Conference.', true, 6),
  ('a1000000-0000-0000-0000-000000000007', 'Elamkulam Ustadh', 'ഏലംകുളം ഉസ്താദ്', 'elamkulam-ustadh', 'Scholar', 'Distinguished scholar at the Jeelani Conference.', 'Speaker at the Jeelani Conference evening session.', true, 7),
  ('a1000000-0000-0000-0000-000000000008', 'Valiyuddeen Faizi', 'വലിയുദ്ധീൻ ഫൈസി', 'valiyuddeen-faizi', 'Speaker', 'Closing address speaker at Stage 1.', 'Closing address after the Jeelani Conference.', false, 8),
  ('a1000000-0000-0000-0000-000000000009', 'Sayyid Muhammed Koya Thangal Jamalullaily', 'സയ്യിദ് മുഹമ്മദ് കോയ തങ്ങൾ ജമലുല്ലൈലി', 'sayyid-muhammed-koya', 'Presiding Chair', 'Presiding chair of the Dars Management Meet.', 'Leading the Dars Management Meet on Stage 2.', true, 9),
  ('a1000000-0000-0000-0000-000000000010', 'Abdusamad Pookkottur', 'അബ്ദുസമദ് പൂക്കോട്ടൂർ', 'abdusamad-pookkottur', 'Speaker', 'Speaker on "Palli Dars: We Are the Successors of Tradition."', 'Speaking on preserving the Dars tradition.', false, 10),
  ('a1000000-0000-0000-0000-000000000011', 'Shahul Hameed Master Melmuri', 'ശാഹുൽ ഹമീദ് മാസ്റ്റർ മേൽമുറി', 'shahul-hameed', 'Speaker', 'Expert on Astronomy and AI Fiqh.', 'Speaker on Astronomy and AI in Islamic Jurisprudence.', false, 11),
  ('a1000000-0000-0000-0000-000000000012', 'Dr. Musthafa Darimi Karippur', 'ഡോ. മുസ്തഫ ദാരിമി കരിപ്പൂർ', 'musthafa-darimi', 'Academic Speaker', 'Renowned academic delivering a specialized paid session.', 'Specialized academic session on Stage 2.', true, 12),
  ('a1000000-0000-0000-0000-000000000013', 'Ameer Husain Hudavi', 'അമീർ ഹുസൈൻ ഹുദവി', 'ameer-husain', 'Speaker', 'Scholar delivering the final session on Stage 2.', 'Concluding session on Stage 2.', false, 13);

-- Step 3: Insert Sessions — Stage 1
INSERT INTO public.sessions (id, slug, title, title_ml, description, start_time, end_time, stage, type, is_paid, external_url) VALUES
  ('b1000000-0000-0000-0000-000000000001', 'grand-assembly', 'Grand Assembly', 'മഹാ സമ്മേളനം', 'The grand opening assembly. Registration is handled on the external portal.', '2026-09-27T10:00:00+05:30', '2026-09-27T11:00:00+05:30', 'stage1', 'external_redirect', false, 'https://grand-jeelani-conference-2026.web.app/'),
  ('b1000000-0000-0000-0000-000000000002', 'inaugural-ceremony', 'Inaugural Ceremony', 'ഉദ്ഘാടന ചടങ്ങ്', 'Topic: The Aesthetics of Self-Purification (Tazkiyatun Nafs)', '2026-09-27T11:00:00+05:30', '2026-09-27T12:00:00+05:30', 'stage1', 'ceremony', false, NULL),
  ('b1000000-0000-0000-0000-000000000003', 'shaykh-jilani-talk', 'Shaykh Jilani: Spirituality, Life & Philosophy', 'ശൈഖ് ജീലാനി : ആത്മീയത, ജീവിതം, ദർശനം', 'A scholarly discourse on the life, spiritual teachings, and philosophy of Shaykh Abdul Qadir Jilani.', '2026-09-27T12:00:00+05:30', '2026-09-27T14:00:00+05:30', 'stage1', 'talk', false, NULL),
  ('b1000000-0000-0000-0000-000000000004', 'lunch-break', 'Lunch & Prayer Break', 'ഭക്ഷണം, നമസ്കാരം', 'Lunch and Dhuhr prayer break.', '2026-09-27T14:00:00+05:30', '2026-09-27T15:00:00+05:30', 'stage1', 'meal', false, NULL),
  ('b1000000-0000-0000-0000-000000000005', 'burda-qawwali', 'Burda & Qawwali Competition', 'ബുർദ & ഖവ്വാലി മത്സരം', 'Grand finale of the Burda & Qawwali Competition organized as part of the Rabi Campaign.', '2026-09-27T15:00:00+05:30', '2026-09-27T18:30:00+05:30', 'stage1', 'competition', false, NULL),
  ('b1000000-0000-0000-0000-000000000006', 'jeelani-jalsa', 'Jeelani Jalsa (Grand Mawlid Gathering)', 'ജീലാനി ജൽസ (ഗ്രാൻഡ് മൗലിദ് സദസ്സ്)', 'A grand spiritual gathering after Maghrib prayer.', '2026-09-27T18:45:00+05:30', '2026-09-27T20:00:00+05:30', 'stage1', 'mawlid', false, NULL),
  ('b1000000-0000-0000-0000-000000000007', 'jeelani-conference', 'Jeelani Conference', 'ജീലാനി കോൺഫറൻസ്', 'The main Jeelani Conference evening session with keynote addresses.', '2026-09-27T20:00:00+05:30', '2026-09-27T21:00:00+05:30', 'stage1', 'ceremony', false, NULL),
  ('b1000000-0000-0000-0000-000000000008', 'closing-address', 'Closing Address', 'സമാപന പ്രഭാഷണം', 'Closing address by Valiyuddeen Faizi.', '2026-09-27T21:00:00+05:30', '2026-09-27T22:00:00+05:30', 'stage1', 'talk', false, NULL);

-- Step 4: Insert Sessions — Stage 2
INSERT INTO public.sessions (id, slug, title, title_ml, description, start_time, end_time, stage, type, is_paid, registration_session_slug) VALUES
  ('b1000000-0000-0000-0000-000000000009', 'dars-management-meet', 'Dars Management Meet', 'ദർസ് മാനേജ്മെന്റ് മീറ്റ്', 'Palli Dars: We Are the Successors of Tradition. A meeting on managing and preserving the traditional Dars education system.', '2026-09-27T11:00:00+05:30', '2026-09-27T13:00:00+05:30', 'stage2', 'meeting', false, 'dars-management-meet'),
  ('b1000000-0000-0000-0000-000000000010', 'astronomy-ai-fiqh', 'Astronomy and AI Fiqh', 'അസ്ട്രോണമി ആൻഡ് AI ഫിഖ്ഹ്', 'An exploration of the intersection of Astronomy, Artificial Intelligence, and Islamic Jurisprudence.', '2026-09-27T14:00:00+05:30', '2026-09-27T15:00:00+05:30', 'stage2', 'paid_session', true, 'darimi-academic'),
  ('b1000000-0000-0000-0000-000000000011', 'darimi-session', 'Dr. Musthafa Darimi Session', 'ഡോ. മുസ്തഫ ദാരിമി സെഷൻ', 'A specialized paid session by Dr. Musthafa Darimi Karippur.', '2026-09-27T15:00:00+05:30', '2026-09-27T17:00:00+05:30', 'stage2', 'paid_session', true, 'darimi-academic'),
  ('b1000000-0000-0000-0000-000000000012', 'ameer-husain-session', 'Ameer Husain Hudavi Session', 'അമീർ ഹുസൈൻ ഹുദവി സെഷൻ', 'Session by Ameer Husain Hudavi.', '2026-09-27T17:00:00+05:30', '2026-09-27T18:30:00+05:30', 'stage2', 'talk', false, 'darimi-academic');

-- Step 5: Link Speakers to Sessions
INSERT INTO public.session_speakers (session_id, speaker_id) VALUES
  -- Inaugural Ceremony
  ('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001'), -- Abdunasir
  ('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000002'), -- Fazal
  ('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000003'), -- Basheer Faizi
  ('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000004'), -- Misbahuddin
  -- Shaykh Jilani talk
  ('b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000005'), -- Salim Faizi
  -- Jeelani Conference
  ('b1000000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000006'), -- Sadiq Ali
  ('b1000000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000007'), -- Elamkulam
  -- Closing Address
  ('b1000000-0000-0000-0000-000000000008', 'a1000000-0000-0000-0000-000000000008'), -- Valiyuddeen
  -- Dars Management Meet
  ('b1000000-0000-0000-0000-000000000009', 'a1000000-0000-0000-0000-000000000009'), -- Muhammed Koya
  ('b1000000-0000-0000-0000-000000000009', 'a1000000-0000-0000-0000-000000000010'), -- Abdusamad
  -- Astronomy and AI Fiqh
  ('b1000000-0000-0000-0000-000000000010', 'a1000000-0000-0000-0000-000000000011'), -- Shahul Hameed
  -- Darimi Session
  ('b1000000-0000-0000-0000-000000000011', 'a1000000-0000-0000-0000-000000000012'), -- Darimi
  -- Ameer Husain Session
  ('b1000000-0000-0000-0000-000000000012', 'a1000000-0000-0000-0000-000000000013'); -- Ameer Husain

-- Step 6: Insert Registration Sessions (for dynamic registration cards)
INSERT INTO public.registration_sessions (slug, title, title_ml, description, description_ml, icon, color, price_label, form_type, is_open, is_archived, order_index) VALUES
  ('burda-qawwali', 'Burda & Qawwali Competition', 'ബുർദ & ഖവ്വാലി മത്സരം', 'Register your team for the Burda & Qawwali Competition grand finale.', 'ബുർദ & ഖവ്വാലി മത്സരത്തിന്റെ ഗ്രാൻഡ് ഫിനാലെയ്ക്ക് നിങ്ങളുടെ ടീമിനെ രജിസ്റ്റർ ചെയ്യുക.', '🎤', 'var(--color-brass)', 'Paid', 'burda', true, false, 1),
  ('darimi-academic', 'Academic Sessions', 'അക്കാദമിക് സെഷനുകൾ', 'Register for the academic block: Astronomy & AI Fiqh, Dr. Musthafa Darimi Session, and Ameer Husain Hudavi Session.', 'അക്കാദമിക് ബ്ലോക്കിലേക്ക് രജിസ്റ്റർ ചെയ്യുക: അസ്ട്രോണമി & AI ഫിഖ്ഹ്, ഡോ. മുസ്തഫ ദാരിമി സെഷൻ, അമീർ ഹുസൈൻ ഹുദവി സെഷൻ.', '📚', 'var(--color-rose)', 'Paid', 'standard', true, false, 2),
  ('dars-management-meet', 'Dars Management Meet', 'ദർസ് മാനേജ്മെന്റ് മീറ്റ്', 'Register your mahall delegation for the Dars Management Meet. 1 to 5 members per mahall.', 'ദർസ് മാനേജ്മെന്റ് മീറ്റിലേക്ക് നിങ്ങളുടെ മഹല്ല് പ്രതിനിധി സംഘത്തെ രജിസ്റ്റർ ചെയ്യുക. ഒരു മഹല്ലിൽ നിന്ന് 1 മുതൽ 5 അംഗങ്ങൾ വരെ.', '🏛️', 'var(--color-navy)', 'Free', 'group', true, false, 3)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  title_ml = EXCLUDED.title_ml,
  description = EXCLUDED.description,
  description_ml = EXCLUDED.description_ml,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color,
  price_label = EXCLUDED.price_label,
  form_type = EXCLUDED.form_type,
  order_index = EXCLUDED.order_index;
