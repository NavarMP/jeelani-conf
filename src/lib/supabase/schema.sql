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
    parent_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
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


CREATE TRIGGER update_speakers_modtime
    BEFORE UPDATE ON speakers
    FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_sessions_modtime
    BEFORE UPDATE ON sessions
    FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- Row Level Security (RLS)
ALTER TABLE public.registrations_grand_assembly ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.speakers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_speakers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zones ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow public insert on assembly" ON public.registrations_grand_assembly FOR INSERT WITH CHECK (true);


CREATE POLICY "Allow public select on speakers" ON public.speakers FOR SELECT USING (true);
CREATE POLICY "Admin manage speakers" ON public.speakers FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public select on sessions" ON public.sessions FOR SELECT USING (true);
CREATE POLICY "Admin manage sessions" ON public.sessions FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public select on session_speakers" ON public.session_speakers FOR SELECT USING (true);
CREATE POLICY "Admin manage session_speakers" ON public.session_speakers FOR ALL USING (true) WITH CHECK (true);

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

-- Missing Admin CRUD policies added
CREATE POLICY "Admin manage grand assembly" ON public.registrations_grand_assembly FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Admin manage dynamic" ON public.dynamic_registrations FOR ALL USING (true) WITH CHECK (true);


-- ==============================================================================
-- GALLERY
-- ==============================================================================

CREATE TABLE public.gallery_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) UNIQUE NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.gallery_media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    category_id UUID REFERENCES public.gallery_categories(id) ON DELETE CASCADE,
    url VARCHAR(1000) NOT NULL,
    aspect VARCHAR(50) DEFAULT '16/9',
    color VARCHAR(50),
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_gallery_cat_modtime BEFORE UPDATE ON gallery_categories FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_gallery_media_modtime BEFORE UPDATE ON gallery_media FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

ALTER TABLE public.gallery_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select on gallery categories" ON public.gallery_categories FOR SELECT USING (true);
CREATE POLICY "Admin manage gallery categories" ON public.gallery_categories FOR ALL USING (true);

CREATE POLICY "Allow public select on published media" ON public.gallery_media FOR SELECT USING (is_published = true);
CREATE POLICY "Admin manage gallery media" ON public.gallery_media FOR ALL USING (true);


-- ==============================================================================
-- STORAGE BUCKETS
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public) VALUES ('receipts', 'receipts', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('speaker-photos', 'speaker-photos', true) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can upload receipts" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'receipts');
CREATE POLICY "Public can view receipts" ON storage.objects FOR SELECT USING (bucket_id = 'receipts');
CREATE POLICY "Public can view speaker photos" ON storage.objects FOR SELECT USING (bucket_id = 'speaker-photos');
CREATE POLICY "Allow upload speaker photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'speaker-photos');
CREATE POLICY "Allow update speaker photos" ON storage.objects FOR UPDATE USING (bucket_id = 'speaker-photos') WITH CHECK (bucket_id = 'speaker-photos');
CREATE POLICY "Allow delete speaker photos" ON storage.objects FOR DELETE USING (bucket_id = 'speaker-photos');
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', true) ON CONFLICT (id) DO NOTHING;
CREATE POLICY "Public can view documents" ON storage.objects FOR SELECT USING (bucket_id = 'documents');
CREATE POLICY "Allow upload documents" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'documents');
CREATE POLICY "Allow update documents" ON storage.objects FOR UPDATE USING (bucket_id = 'documents') WITH CHECK (bucket_id = 'documents');
CREATE POLICY "Allow delete documents" ON storage.objects FOR DELETE USING (bucket_id = 'documents');

INSERT INTO storage.buckets (id, name, public) VALUES ('gallery-media', 'gallery-media', true) ON CONFLICT (id) DO NOTHING;
CREATE POLICY "Public can view gallery media" ON storage.objects FOR SELECT USING (bucket_id = 'gallery-media');
CREATE POLICY "Allow upload gallery media" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'gallery-media');
CREATE POLICY "Allow update gallery media" ON storage.objects FOR UPDATE USING (bucket_id = 'gallery-media') WITH CHECK (bucket_id = 'gallery-media');
CREATE POLICY "Allow delete gallery media" ON storage.objects FOR DELETE USING (bucket_id = 'gallery-media');


-- ==============================================================================
-- FEEDBACK
-- ==============================================================================

CREATE TABLE public.feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Identity (optional for anonymous submissions)
    name VARCHAR(255),
    phone VARCHAR(50),
    email VARCHAR(255),
    -- Rating (1-5 stars)
    overall_rating INTEGER NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
    -- Category-specific ratings (JSONB for flexibility)
    -- e.g. {"sessions_content": 4, "speakers": 5, "venue": 3, "food": 4}
    category_ratings JSONB DEFAULT '{}'::jsonb,
    -- Text feedback
    feedback_text TEXT NOT NULL,
    -- Category tag
    category VARCHAR(50) DEFAULT 'general',
    -- Sentiment (auto-computed from rating or admin-set)
    sentiment VARCHAR(20) DEFAULT 'neutral',
    -- Admin fields
    is_featured BOOLEAN DEFAULT false,
    is_read BOOLEAN DEFAULT false,
    admin_notes TEXT,
    -- Metadata
    source VARCHAR(20) DEFAULT 'web',
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_feedback_modtime
    BEFORE UPDATE ON feedback
    FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Public can submit feedback (insert only)
CREATE POLICY "Allow public insert on feedback"
    ON public.feedback FOR INSERT WITH CHECK (true);

-- Admin can manage all feedback
CREATE POLICY "Admin manage feedback"
    ON public.feedback FOR ALL USING (true) WITH CHECK (true);
