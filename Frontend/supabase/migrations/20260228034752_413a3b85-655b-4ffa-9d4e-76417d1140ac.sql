
-- Collections table (persists collections created in admin)
CREATE TABLE public.collections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL DEFAULT '',
  handle TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  product_condition TEXT NOT NULL DEFAULT 'Manual',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Collections are publicly readable" ON public.collections FOR SELECT USING (true);
CREATE POLICY "Collections can be inserted by anyone" ON public.collections FOR INSERT WITH CHECK (true);
CREATE POLICY "Collections can be updated by anyone" ON public.collections FOR UPDATE USING (true);
CREATE POLICY "Collections can be deleted by anyone" ON public.collections FOR DELETE USING (true);

-- Featured collections settings table
CREATE TABLE public.featured_collections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  featured BOOLEAN NOT NULL DEFAULT false,
  products_to_show INTEGER NOT NULL DEFAULT 8,
  sort_order INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE public.featured_collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Featured collections are publicly readable" ON public.featured_collections FOR SELECT USING (true);
CREATE POLICY "Featured collections can be inserted by anyone" ON public.featured_collections FOR INSERT WITH CHECK (true);
CREATE POLICY "Featured collections can be updated by anyone" ON public.featured_collections FOR UPDATE USING (true);
CREATE POLICY "Featured collections can be deleted by anyone" ON public.featured_collections FOR DELETE USING (true);

-- Featured collections visibility setting (single row)
CREATE TABLE public.featured_collections_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  visible BOOLEAN NOT NULL DEFAULT true
);

ALTER TABLE public.featured_collections_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Featured settings readable" ON public.featured_collections_settings FOR SELECT USING (true);
CREATE POLICY "Featured settings insertable" ON public.featured_collections_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Featured settings updatable" ON public.featured_collections_settings FOR UPDATE USING (true);
