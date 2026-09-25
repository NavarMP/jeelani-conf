-- ==============================================================================
-- SPOT REGISTRATION & ENHANCED SEARCH SUPPORT
-- ==============================================================================

-- 1. Enable pg_trgm extension for fuzzy name search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. Add trigram index for fast fuzzy name lookups
CREATE INDEX IF NOT EXISTS idx_dynamic_reg_name_trgm
    ON public.dynamic_registrations
    USING gin (name gin_trgm_ops);

-- 3. Add composite index for place/dars lookup
CREATE INDEX IF NOT EXISTS idx_dynamic_reg_place
    ON public.dynamic_registrations (place);

-- 4. Composite index for session + status filtering
CREATE INDEX IF NOT EXISTS idx_dynamic_reg_session_status
    ON public.dynamic_registrations (session_slug, status);

-- 5. Add spot registration tracking columns
ALTER TABLE public.dynamic_registrations
ADD COLUMN IF NOT EXISTS is_spot_registration BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS spot_registered_by VARCHAR(255),
ADD COLUMN IF NOT EXISTS spot_registered_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS registration_source VARCHAR(30) DEFAULT 'online';
-- registration_source values: 'online', 'spot', 'walk_in', 'committee'

-- 6. Add capacity and spot registration controls to registration_sessions
ALTER TABLE public.registration_sessions
ADD COLUMN IF NOT EXISTS max_capacity INTEGER,
ADD COLUMN IF NOT EXISTS spot_registration_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS spot_registration_fee DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS spot_fee_label VARCHAR(50);
