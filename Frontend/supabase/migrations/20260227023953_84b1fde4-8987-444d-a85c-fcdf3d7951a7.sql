
-- Drop existing product-related tables
DROP TABLE IF EXISTS public.product_images CASCADE;
DROP TABLE IF EXISTS public.product_options CASCADE;
DROP TABLE IF EXISTS public.product_variants CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;

-- 1. products
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  handle TEXT UNIQUE,
  title TEXT DEFAULT '',
  body_html TEXT DEFAULT '',
  vendor TEXT DEFAULT '',
  product_category TEXT DEFAULT '',
  product_type TEXT DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  published BOOLEAN DEFAULT false,
  gift_card BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products publicly readable" ON public.products FOR SELECT USING (true);
CREATE POLICY "Products insertable" ON public.products FOR INSERT WITH CHECK (true);
CREATE POLICY "Products updatable" ON public.products FOR UPDATE USING (true);
CREATE POLICY "Products deletable" ON public.products FOR DELETE USING (true);

-- 2. product_variants
CREATE TABLE public.product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  sku TEXT DEFAULT '',
  grams INTEGER DEFAULT 0,
  inventory_tracker TEXT DEFAULT '',
  inventory_quantity INTEGER DEFAULT 0,
  inventory_policy TEXT DEFAULT 'deny',
  fulfillment_service TEXT DEFAULT 'manual',
  price NUMERIC DEFAULT 0,
  compare_at_price NUMERIC DEFAULT 0,
  requires_shipping BOOLEAN DEFAULT true,
  taxable BOOLEAN DEFAULT true,
  unit_price_total_measure NUMERIC,
  unit_price_total_measure_unit TEXT DEFAULT '',
  unit_price_base_measure NUMERIC,
  unit_price_base_measure_unit TEXT DEFAULT '',
  barcode TEXT DEFAULT '',
  variant_image TEXT DEFAULT '',
  weight_unit TEXT DEFAULT 'kg',
  tax_code TEXT DEFAULT '',
  cost_per_item NUMERIC DEFAULT 0,
  option1_value TEXT DEFAULT '',
  option2_value TEXT DEFAULT '',
  option3_value TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Variants publicly readable" ON public.product_variants FOR SELECT USING (true);
CREATE POLICY "Variants insertable" ON public.product_variants FOR INSERT WITH CHECK (true);
CREATE POLICY "Variants updatable" ON public.product_variants FOR UPDATE USING (true);
CREATE POLICY "Variants deletable" ON public.product_variants FOR DELETE USING (true);

-- 3. product_options
CREATE TABLE public.product_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  option1_name TEXT DEFAULT '',
  option1_linked_to TEXT DEFAULT '',
  option2_name TEXT DEFAULT '',
  option2_linked_to TEXT DEFAULT '',
  option3_name TEXT DEFAULT '',
  option3_linked_to TEXT DEFAULT ''
);
ALTER TABLE public.product_options ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Options publicly readable" ON public.product_options FOR SELECT USING (true);
CREATE POLICY "Options insertable" ON public.product_options FOR INSERT WITH CHECK (true);
CREATE POLICY "Options updatable" ON public.product_options FOR UPDATE USING (true);
CREATE POLICY "Options deletable" ON public.product_options FOR DELETE USING (true);

-- 4. product_images
CREATE TABLE public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  src TEXT DEFAULT '',
  position INTEGER DEFAULT 0,
  alt_text TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Images publicly readable" ON public.product_images FOR SELECT USING (true);
CREATE POLICY "Images insertable" ON public.product_images FOR INSERT WITH CHECK (true);
CREATE POLICY "Images updatable" ON public.product_images FOR UPDATE USING (true);
CREATE POLICY "Images deletable" ON public.product_images FOR DELETE USING (true);

-- 5. product_seo
CREATE TABLE public.product_seo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  seo_title TEXT DEFAULT '',
  seo_description TEXT DEFAULT ''
);
ALTER TABLE public.product_seo ENABLE ROW LEVEL SECURITY;
CREATE POLICY "SEO publicly readable" ON public.product_seo FOR SELECT USING (true);
CREATE POLICY "SEO insertable" ON public.product_seo FOR INSERT WITH CHECK (true);
CREATE POLICY "SEO updatable" ON public.product_seo FOR UPDATE USING (true);
CREATE POLICY "SEO deletable" ON public.product_seo FOR DELETE USING (true);

-- 6. product_metafields
CREATE TABLE public.product_metafields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  age_group TEXT DEFAULT '',
  clothing_features TEXT DEFAULT '',
  color_pattern TEXT DEFAULT '',
  fabric TEXT DEFAULT '',
  size TEXT DEFAULT '',
  sleeve_length_type TEXT DEFAULT '',
  target_gender TEXT DEFAULT '',
  top_length_type TEXT DEFAULT ''
);
ALTER TABLE public.product_metafields ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Metafields publicly readable" ON public.product_metafields FOR SELECT USING (true);
CREATE POLICY "Metafields insertable" ON public.product_metafields FOR INSERT WITH CHECK (true);
CREATE POLICY "Metafields updatable" ON public.product_metafields FOR UPDATE USING (true);
CREATE POLICY "Metafields deletable" ON public.product_metafields FOR DELETE USING (true);

-- 7. import_logs
CREATE TABLE public.import_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name TEXT DEFAULT '',
  total_rows INTEGER DEFAULT 0,
  success_rows INTEGER DEFAULT 0,
  failed_rows INTEGER DEFAULT 0,
  errors JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
ALTER TABLE public.import_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Import logs publicly readable" ON public.import_logs FOR SELECT USING (true);
CREATE POLICY "Import logs insertable" ON public.import_logs FOR INSERT WITH CHECK (true);
