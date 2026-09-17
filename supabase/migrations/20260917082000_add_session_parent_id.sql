-- Add parent_id to allow nested session groupings
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE;
