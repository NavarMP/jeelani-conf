-- Migration to add live event state for stages

CREATE TABLE IF NOT EXISTS public.live_event_state (
    stage VARCHAR(255) PRIMARY KEY,
    current_session_id UUID REFERENCES public.sessions(id) ON DELETE SET NULL,
    mode VARCHAR(50) DEFAULT 'auto' CHECK (mode IN ('auto', 'manual')),
    current_speaker_id UUID REFERENCES public.speakers(id) ON DELETE SET NULL,
    subtitle_text TEXT,
    document_url VARCHAR(1000),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.live_event_state ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access on live_event_state"
    ON public.live_event_state
    FOR SELECT
    USING (true);

-- Allow authenticated admins to insert/update
CREATE POLICY "Allow admins to manage live_event_state"
    ON public.live_event_state
    FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Initialize state for existing stages
INSERT INTO public.live_event_state (stage, mode)
VALUES 
    ('stage1', 'auto'),
    ('stage2', 'auto')
ON CONFLICT (stage) DO NOTHING;

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_live_event_state_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_live_event_state_updated_at
    BEFORE UPDATE ON public.live_event_state
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_live_event_state_updated_at();

-- Add a Realtime publication setup for this table so frontend can listen
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_event_state;
