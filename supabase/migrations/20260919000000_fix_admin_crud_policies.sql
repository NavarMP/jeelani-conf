-- Migration to add missing Admin CRUD policies for registrations

CREATE POLICY "Admin manage grand assembly" ON public.registrations_grand_assembly FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin manage dynamic" ON public.dynamic_registrations FOR ALL USING (true) WITH CHECK (true);

