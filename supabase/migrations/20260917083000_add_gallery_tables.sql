-- ==============================================================================
-- GALLERY TABLES
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.gallery_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) UNIQUE NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.gallery_media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    category_id UUID REFERENCES public.gallery_categories(id) ON DELETE CASCADE,
    url VARCHAR(1000) NOT NULL,
    aspect VARCHAR(50) DEFAULT '16/9',
    color VARCHAR(50),
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_gallery_cat_modtime ON public.gallery_categories;
CREATE TRIGGER update_gallery_cat_modtime BEFORE UPDATE ON public.gallery_categories FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

DROP TRIGGER IF EXISTS update_gallery_media_modtime ON public.gallery_media;
CREATE TRIGGER update_gallery_media_modtime BEFORE UPDATE ON public.gallery_media FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

ALTER TABLE public.gallery_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_media ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public select on gallery categories') THEN
        CREATE POLICY "Allow public select on gallery categories" ON public.gallery_categories FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admin manage gallery categories') THEN
        CREATE POLICY "Admin manage gallery categories" ON public.gallery_categories FOR ALL USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public select on published media') THEN
        CREATE POLICY "Allow public select on published media" ON public.gallery_media FOR SELECT USING (is_published = true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admin manage gallery media') THEN
        CREATE POLICY "Admin manage gallery media" ON public.gallery_media FOR ALL USING (true);
    END IF;
END $$;
