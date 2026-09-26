-- Migration: Conference Phases Management

DO $$ BEGIN
    CREATE TYPE conference_phase AS ENUM ('pre', 'on', 'post');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.conference_settings (
    id INTEGER PRIMARY KEY DEFAULT 1, -- Only one row will exist
    current_phase conference_phase DEFAULT 'pre',
    auto_switch_enabled BOOLEAN DEFAULT false,
    scheduled_start_time TIMESTAMPTZ,
    scheduled_end_time TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK (id = 1) -- Ensure singleton
);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_conference_settings_modtime ON conference_settings;
CREATE TRIGGER update_conference_settings_modtime
    BEFORE UPDATE ON conference_settings
    FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- Enable RLS
ALTER TABLE public.conference_settings ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Allow public select on conference_settings" ON public.conference_settings;
CREATE POLICY "Allow public select on conference_settings" ON public.conference_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin manage conference_settings" ON public.conference_settings;
CREATE POLICY "Admin manage conference_settings" ON public.conference_settings FOR ALL USING (true) WITH CHECK (true);

-- Insert default row if not exists
INSERT INTO public.conference_settings (id, current_phase, auto_switch_enabled)
VALUES (1, 'pre', false)
ON CONFLICT (id) DO NOTHING;

-- Enable Realtime for conference_settings
-- This requires altering the publication
ALTER PUBLICATION supabase_realtime ADD TABLE conference_settings;
