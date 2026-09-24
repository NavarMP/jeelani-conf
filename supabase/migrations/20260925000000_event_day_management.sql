-- ==============================================================================
-- EVENT DAY MANAGEMENT — Core Tables
-- ==============================================================================

-- 1. Attendance tracking
CREATE TABLE IF NOT EXISTS public.attendance_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    registration_id UUID NOT NULL REFERENCES public.dynamic_registrations(id) ON DELETE CASCADE,
    session_slug VARCHAR(255),                -- NULL = general venue entry
    check_in_time TIMESTAMPTZ DEFAULT NOW(),
    check_out_time TIMESTAMPTZ,
    gate VARCHAR(50) DEFAULT 'main',          -- main, vip, stage2
    checked_in_by VARCHAR(255),               -- volunteer name/ID
    device_id VARCHAR(255),                   -- scanning device identifier
    method VARCHAR(20) DEFAULT 'qr_scan',     -- qr_scan, manual
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unique constraint: one check-in per person per session (NULL session = venue entry)
CREATE UNIQUE INDEX IF NOT EXISTS idx_attendance_unique_session
    ON public.attendance_logs (registration_id, session_slug)
    WHERE session_slug IS NOT NULL;

-- Only one venue-level check-in per person
CREATE UNIQUE INDEX IF NOT EXISTS idx_attendance_unique_venue
    ON public.attendance_logs (registration_id)
    WHERE session_slug IS NULL;

-- 2. Volunteer/staff accounts for scanning
CREATE TABLE IF NOT EXISTS public.event_staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    role VARCHAR(50) NOT NULL DEFAULT 'volunteer',  -- volunteer, gate_manager, judge, coordinator, admin
    assigned_gate VARCHAR(50),
    pin_code VARCHAR(6) NOT NULL,                    -- 6-digit PIN for quick auth
    is_active BOOLEAN DEFAULT true,
    permissions JSONB DEFAULT '["scan"]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Add QR token and check-in columns to dynamic_registrations
ALTER TABLE public.dynamic_registrations
ADD COLUMN IF NOT EXISTS qr_token VARCHAR(64) UNIQUE,
ADD COLUMN IF NOT EXISTS badge_generated_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS checked_in BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMPTZ;

-- 4. Competition entries (for Burda & Qawwali team management)
CREATE TABLE IF NOT EXISTS public.competition_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    registration_id UUID REFERENCES public.dynamic_registrations(id) ON DELETE CASCADE,
    competition_slug VARCHAR(100) NOT NULL DEFAULT 'burda-qawwali',
    team_name VARCHAR(255),
    performance_order INTEGER,
    is_present BOOLEAN DEFAULT false,
    marked_present_at TIMESTAMPTZ,
    stage_status VARCHAR(30) DEFAULT 'waiting',  -- waiting, on_stage, performed, disqualified
    total_score DECIMAL(5,2),
    judge_scores JSONB DEFAULT '[]'::jsonb,
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Competition judges
CREATE TABLE IF NOT EXISTS public.competition_judges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    designation VARCHAR(255),
    competition_slug VARCHAR(100) NOT NULL DEFAULT 'burda-qawwali',
    pin_code VARCHAR(6) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Scoring criteria
CREATE TABLE IF NOT EXISTS public.scoring_criteria (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    competition_slug VARCHAR(100) NOT NULL DEFAULT 'burda-qawwali',
    name VARCHAR(255) NOT NULL,
    name_ml VARCHAR(255),
    max_score INTEGER DEFAULT 10,
    weight DECIMAL(3,2) DEFAULT 1.00,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Announcements
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    body TEXT,
    type VARCHAR(30) DEFAULT 'info',         -- info, warning, emergency, schedule_change
    target_audience VARCHAR(50) DEFAULT 'all', -- all, burda, astro, dars, vip, staff
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 0,              -- 0=normal, 1=high, 2=urgent
    expires_at TIMESTAMPTZ,
    created_by VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- TRIGGERS
-- ==============================================================================

DROP TRIGGER IF EXISTS update_event_staff_modtime ON event_staff;
CREATE TRIGGER update_event_staff_modtime
    BEFORE UPDATE ON event_staff
    FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

DROP TRIGGER IF EXISTS update_competition_entries_modtime ON competition_entries;
CREATE TRIGGER update_competition_entries_modtime
    BEFORE UPDATE ON competition_entries
    FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- ==============================================================================
-- ROW LEVEL SECURITY
-- ==============================================================================

ALTER TABLE public.attendance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competition_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competition_judges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scoring_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Attendance: readable by all, writable by authenticated/service
CREATE POLICY "Allow public read attendance" ON public.attendance_logs FOR SELECT USING (true);
CREATE POLICY "Admin manage attendance" ON public.attendance_logs FOR ALL USING (true) WITH CHECK (true);

-- Staff: admin-only
CREATE POLICY "Admin manage staff" ON public.event_staff FOR ALL USING (true) WITH CHECK (true);

-- Competition: readable by all, writable by admin
CREATE POLICY "Allow public read competition" ON public.competition_entries FOR SELECT USING (true);
CREATE POLICY "Admin manage competition" ON public.competition_entries FOR ALL USING (true) WITH CHECK (true);

-- Judges: admin-only
CREATE POLICY "Admin manage judges" ON public.competition_judges FOR ALL USING (true) WITH CHECK (true);

-- Scoring: readable by all
CREATE POLICY "Allow public read scoring" ON public.scoring_criteria FOR SELECT USING (true);
CREATE POLICY "Admin manage scoring" ON public.scoring_criteria FOR ALL USING (true) WITH CHECK (true);

-- Announcements: readable by all, writable by admin
CREATE POLICY "Allow public read announcements" ON public.announcements FOR SELECT USING (is_active = true);
CREATE POLICY "Admin manage announcements" ON public.announcements FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- INDEXES
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_attendance_reg_id ON public.attendance_logs (registration_id);
CREATE INDEX IF NOT EXISTS idx_attendance_session ON public.attendance_logs (session_slug);
CREATE INDEX IF NOT EXISTS idx_attendance_time ON public.attendance_logs (check_in_time);
CREATE INDEX IF NOT EXISTS idx_dynamic_reg_qr ON public.dynamic_registrations (qr_token);
CREATE INDEX IF NOT EXISTS idx_dynamic_reg_status ON public.dynamic_registrations (status);
CREATE INDEX IF NOT EXISTS idx_dynamic_reg_session ON public.dynamic_registrations (session_slug);
CREATE INDEX IF NOT EXISTS idx_competition_slug ON public.competition_entries (competition_slug);
CREATE INDEX IF NOT EXISTS idx_announcements_active ON public.announcements (is_active, priority);

-- ==============================================================================
-- GENERATE QR TOKENS for all existing registrations that don't have one
-- ==============================================================================
UPDATE public.dynamic_registrations
SET qr_token = encode(gen_random_bytes(16), 'hex')
WHERE qr_token IS NULL;
