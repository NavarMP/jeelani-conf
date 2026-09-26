-- Migration to link live stream with current session

-- Add column current_session_id to live_streams table
ALTER TABLE public.live_streams ADD COLUMN IF NOT EXISTS current_session_id UUID REFERENCES public.sessions(id) ON DELETE SET NULL;

-- Make sure to allow public read access if not already handled
-- (Assuming live_streams already has correct policies, if needed add policy for the new column, but RLS applies to rows, so it's fine)
