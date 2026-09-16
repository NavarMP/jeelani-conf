-- ==============================================================================
-- CREATE DOCUMENTS STORAGE BUCKET & RLS POLICIES FOR BROCHURES
-- ==============================================================================

-- 1. Ensure storage bucket exists and is public
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documents', 'documents', true) 
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Storage Policies for documents bucket
DROP POLICY IF EXISTS "Public can view documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow update documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow delete documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow all for documents" ON storage.objects;

-- Allow public viewing/downloading of documents
CREATE POLICY "Public can view documents" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'documents');

-- Allow inserting documents (both authenticated users and service role)
CREATE POLICY "Allow upload documents" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'documents');

-- Allow updating documents (required for upsert)
CREATE POLICY "Allow update documents" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'documents') 
WITH CHECK (bucket_id = 'documents');

-- Allow deleting documents
CREATE POLICY "Allow delete documents" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'documents');


-- 3. Ensure RLS policies on global_settings table
DROP POLICY IF EXISTS "Allow public select on global_settings" ON public.global_settings;
CREATE POLICY "Allow public select on global_settings" 
ON public.global_settings FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Admin manage global_settings" ON public.global_settings;
CREATE POLICY "Admin manage global_settings" 
ON public.global_settings FOR ALL 
USING (true) 
WITH CHECK (true);
