-- Supabase Schema for Grand Jeelani Conference

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum for registration statuses
CREATE TYPE registration_status AS ENUM ('pending', 'confirmed', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');

-- 1. Grand Assembly Registrations (Private/Invite)
CREATE TABLE public.registrations_grand_assembly (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    registration_id VARCHAR(20) UNIQUE NOT NULL, -- e.g., REG-2026-X79M
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    dars_name VARCHAR(255) NOT NULL,
    place VARCHAR(255) NOT NULL,
    zone VARCHAR(10),
    row_num VARCHAR(10),
    seat_num VARCHAR(10),
    status registration_status DEFAULT 'confirmed',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Musthafa Darimi Session Registrations (Paid)
CREATE TABLE public.registrations_darimi_session (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    registration_id VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    place VARCHAR(255) NOT NULL,
    razorpay_order_id VARCHAR(255),
    razorpay_payment_id VARCHAR(255),
    payment_status payment_status DEFAULT 'pending',
    amount_paid DECIMAL(10,2) DEFAULT 0.00,
    status registration_status DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Paper Presentation Registrations (Free) — ARCHIVED, kept for historical data
CREATE TABLE public.registrations_paper_presentation (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    registration_id VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    place VARCHAR(255) NOT NULL,
    paper_title VARCHAR(500) NOT NULL,
    abstract TEXT NOT NULL,
    file_url VARCHAR(1000),
    review_status VARCHAR(50) DEFAULT 'submitted',
    status registration_status DEFAULT 'confirmed',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Speakers
CREATE TABLE public.speakers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    name_ml VARCHAR(255),
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    bio TEXT,
    description TEXT,
    image_url VARCHAR(1000),
    featured BOOLEAN DEFAULT false,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Sessions (Schedule)
CREATE TABLE public.sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(255) UNIQUE,
    title VARCHAR(255) NOT NULL,
    title_ml VARCHAR(255),
    description TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    stage VARCHAR(50) NOT NULL,
    type VARCHAR(50) NOT NULL,
    is_paid BOOLEAN DEFAULT false,
    external_url VARCHAR(1000),
    registration_session_slug VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Session Speakers (Many-to-Many)
CREATE TABLE public.session_speakers (
    session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
    speaker_id UUID REFERENCES public.speakers(id) ON DELETE CASCADE,
    PRIMARY KEY (session_id, speaker_id)
);

-- 7. Global Settings (Key-Value)
CREATE TABLE public.global_settings (
    key VARCHAR(255) PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Live Streams
CREATE TABLE public.live_streams (
    stage VARCHAR(50) PRIMARY KEY,
    youtube_id VARCHAR(255),
    is_live BOOLEAN DEFAULT false,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Zones
CREATE TABLE public.zones (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    capacity INTEGER NOT NULL,
    color VARCHAR(50),
    layout_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Automatic updated_at trigger function
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Attach triggers
CREATE TRIGGER update_reg_assembly_modtime
    BEFORE UPDATE ON registrations_grand_assembly
    FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_reg_darimi_modtime
    BEFORE UPDATE ON registrations_darimi_session
    FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_reg_paper_modtime
    BEFORE UPDATE ON registrations_paper_presentation
    FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_speakers_modtime
    BEFORE UPDATE ON speakers
    FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_sessions_modtime
    BEFORE UPDATE ON sessions
    FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- Row Level Security (RLS)
ALTER TABLE public.registrations_grand_assembly ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations_darimi_session ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations_paper_presentation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.speakers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_speakers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zones ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow public insert on assembly" ON public.registrations_grand_assembly FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert on darimi" ON public.registrations_darimi_session FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert on paper" ON public.registrations_paper_presentation FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public select on speakers" ON public.speakers FOR SELECT USING (true);
CREATE POLICY "Allow public select on sessions" ON public.sessions FOR SELECT USING (true);
CREATE POLICY "Allow public select on session_speakers" ON public.session_speakers FOR SELECT USING (true);
CREATE POLICY "Allow public select on global_settings" ON public.global_settings FOR SELECT USING (true);
CREATE POLICY "Allow public select on live_streams" ON public.live_streams FOR SELECT USING (true);
CREATE POLICY "Allow public select on zones" ON public.zones FOR SELECT USING (true);

-- ==============================================================================
-- DYNAMIC REGISTRATIONS
-- ==============================================================================

CREATE TABLE public.registration_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    title_ml VARCHAR(255),
    description TEXT,
    description_ml TEXT,
    icon VARCHAR(10),
    color VARCHAR(50),
    price_label VARCHAR(50),
    form_type VARCHAR(50) DEFAULT 'standard',
    href_override VARCHAR(500),
    is_open BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.dynamic_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    registration_id VARCHAR(50) UNIQUE NOT NULL,
    session_slug VARCHAR(255) REFERENCES public.registration_sessions(slug) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    place VARCHAR(255),
    status registration_status DEFAULT 'pending',
    form_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    receipt_url VARCHAR(1000),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_reg_sessions_modtime BEFORE UPDATE ON registration_sessions FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_dynamic_regs_modtime BEFORE UPDATE ON dynamic_registrations FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

ALTER TABLE public.registration_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dynamic_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select on active sessions" ON public.registration_sessions FOR SELECT USING (is_archived = false);
CREATE POLICY "Allow public insert on dynamic registrations" ON public.dynamic_registrations FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin manage sessions" ON public.registration_sessions FOR ALL USING (true);
CREATE POLICY "Admin read dynamic registrations" ON public.dynamic_registrations FOR SELECT USING (true);

-- ==============================================================================
-- STORAGE BUCKETS
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public) VALUES ('receipts', 'receipts', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('speaker-photos', 'speaker-photos', true) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can upload receipts" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'receipts');
CREATE POLICY "Public can view receipts" ON storage.objects FOR SELECT USING (bucket_id = 'receipts');
CREATE POLICY "Auth can upload speaker photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'speaker-photos');
CREATE POLICY "Public can view speaker photos" ON storage.objects FOR SELECT USING (bucket_id = 'speaker-photos');
CREATE POLICY "Auth can delete speaker photos" ON storage.objects FOR DELETE USING (bucket_id = 'speaker-photos');
