-- Add advanced registration status control columns to registration_sessions
ALTER TABLE public.registration_sessions
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'open',
ADD COLUMN IF NOT EXISTS scheduled_open_time TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS scheduled_close_time TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS custom_closed_message TEXT;

-- Migrate existing boolean 'is_open' to 'status' string
UPDATE public.registration_sessions
SET status = CASE
    WHEN is_open = true THEN 'open'
    ELSE 'closed'
END;
