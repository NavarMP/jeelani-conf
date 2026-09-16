-- ==============================================================================
-- FIX SPEAKER STORAGE BUCKET & RLS POLICIES
-- ==============================================================================

-- 1. Ensure storage bucket exists and is public
INSERT INTO storage.buckets (id, name, public) 
VALUES ('speaker-photos', 'speaker-photos', true) 
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Storage Policies for speaker-photos
-- Drop existing policies if any to prevent duplicate conflict errors
DROP POLICY IF EXISTS "Public can view speaker photos" ON storage.objects;
DROP POLICY IF EXISTS "Auth can upload speaker photos" ON storage.objects;
DROP POLICY IF EXISTS "Auth can delete speaker photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow public view speaker photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow upload speaker photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow update speaker photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow delete speaker photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow all for speaker-photos" ON storage.objects;

-- Allow public viewing/downloading of speaker photos
CREATE POLICY "Public can view speaker photos" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'speaker-photos');

-- Allow inserting photos (both authenticated users and service role)
CREATE POLICY "Allow upload speaker photos" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'speaker-photos');

-- Allow updating photos (critical for upsert = true)
CREATE POLICY "Allow update speaker photos" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'speaker-photos')
WITH CHECK (bucket_id = 'speaker-photos');

-- Allow deleting photos
CREATE POLICY "Allow delete speaker photos" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'speaker-photos');


-- 3. Ensure Table RLS policies on speakers, sessions, and session_speakers
-- Allow full management (INSERT, UPDATE, DELETE) for admin
DROP POLICY IF EXISTS "Admin manage speakers" ON public.speakers;
CREATE POLICY "Admin manage speakers" 
ON public.speakers FOR ALL 
USING (true) 
WITH CHECK (true);

DROP POLICY IF EXISTS "Admin manage sessions" ON public.sessions;
CREATE POLICY "Admin manage sessions" 
ON public.sessions FOR ALL 
USING (true) 
WITH CHECK (true);

DROP POLICY IF EXISTS "Admin manage session_speakers" ON public.session_speakers;
CREATE POLICY "Admin manage session_speakers" 
ON public.session_speakers FOR ALL 
USING (true) 
WITH CHECK (true);
