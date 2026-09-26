-- Allow admin (and effectively public for this app structure) to manage live_streams
DROP POLICY IF EXISTS "Admin manage live_streams" ON public.live_streams;
CREATE POLICY "Admin manage live_streams" ON public.live_streams FOR ALL USING (true) WITH CHECK (true);
