-- ============================================================
-- ELVAN STORE - Complete Database Setup
-- Run this entire script in Supabase SQL Editor
-- supabase.com → Project → SQL Editor → New Query → Paste → Run
-- ============================================================

-- ─── 1. PRODUCTS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.products (
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
  collection_name TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products publicly readable" ON public.products FOR SELECT USING (true);
CREATE POLICY "Products insertable" ON public.products FOR INSERT WITH CHECK (true);
CREATE POLICY "Products updatable" ON public.products FOR UPDATE USING (true);
CREATE POLICY "Products deletable" ON public.products FOR DELETE USING (true);

-- ─── 2. PRODUCT VARIANTS ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.product_variants (
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

-- ─── 3. PRODUCT OPTIONS ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.product_options (
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

-- ─── 4. PRODUCT IMAGES ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.product_images (
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

-- ─── 5. PRODUCT SEO ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.product_seo (
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

-- ─── 6. PRODUCT METAFIELDS ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.product_metafields (
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

-- ─── 7. IMPORT LOGS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.import_logs (
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

-- ─── 8. ORDERS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT NOT NULL DEFAULT 'ORD-' || substr(gen_random_uuid()::text, 1, 8),
  email TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  first_name TEXT NOT NULL DEFAULT '',
  last_name TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  apartment TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  state TEXT NOT NULL DEFAULT '',
  pin_code TEXT NOT NULL DEFAULT '',
  country TEXT NOT NULL DEFAULT 'India',
  save_info BOOLEAN NOT NULL DEFAULT false,
  shipping_method TEXT NOT NULL DEFAULT 'free',
  payment_method TEXT NOT NULL DEFAULT 'payu',
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal NUMERIC NOT NULL DEFAULT 0,
  discount NUMERIC NOT NULL DEFAULT 0,
  discount_label TEXT NOT NULL DEFAULT '',
  shipping_cost NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Orders can be inserted by anyone" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Orders are publicly readable" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Orders can be updated by anyone" ON public.orders FOR UPDATE USING (true);

-- ─── 9. PAYMENTS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  order_number TEXT NOT NULL DEFAULT '',
  txn_id TEXT NOT NULL DEFAULT '',
  payment_method TEXT NOT NULL DEFAULT 'payu',
  amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  payu_mihpayid TEXT DEFAULT '',
  payu_mode TEXT DEFAULT '',
  payu_status TEXT DEFAULT '',
  payu_unmappedstatus TEXT DEFAULT '',
  payu_error TEXT DEFAULT '',
  payu_bank_ref TEXT DEFAULT '',
  payu_bankcode TEXT DEFAULT '',
  response_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Payments are publicly readable" ON public.payments FOR SELECT USING (true);
CREATE POLICY "Payments can be inserted by anyone" ON public.payments FOR INSERT WITH CHECK (true);
CREATE POLICY "Payments can be updated by anyone" ON public.payments FOR UPDATE USING (true);

-- ─── 10. PAYMENT LOGS ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.payment_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  order_number TEXT NOT NULL DEFAULT '',
  payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
  event TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT '',
  method TEXT NOT NULL DEFAULT '',
  amount NUMERIC NOT NULL DEFAULT 0,
  error_message TEXT DEFAULT '',
  raw_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.payment_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Payment logs are publicly readable" ON public.payment_logs FOR SELECT USING (true);
CREATE POLICY "Payment logs can be inserted by anyone" ON public.payment_logs FOR INSERT WITH CHECK (true);

-- ─── 11. GOOGLE REVIEWS ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.google_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL DEFAULT '',
  rating NUMERIC NOT NULL DEFAULT 5,
  review_text TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 1000,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.google_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Google reviews are publicly readable" ON public.google_reviews FOR SELECT USING (true);
CREATE POLICY "Google reviews can be inserted by anyone" ON public.google_reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Google reviews can be updated by anyone" ON public.google_reviews FOR UPDATE USING (true);
CREATE POLICY "Google reviews can be deleted by anyone" ON public.google_reviews FOR DELETE USING (true);

CREATE TABLE IF NOT EXISTS public.google_reviews_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  show_on_homepage BOOLEAN NOT NULL DEFAULT false,
  show_on_product BOOLEAN NOT NULL DEFAULT true,
  average_rating NUMERIC NOT NULL DEFAULT 4.7,
  total_review_count INTEGER NOT NULL DEFAULT 0,
  max_reviews_to_show INTEGER NOT NULL DEFAULT 10,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.google_reviews_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Settings are publicly readable" ON public.google_reviews_settings FOR SELECT USING (true);
CREATE POLICY "Settings can be inserted by anyone" ON public.google_reviews_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Settings can be updated by anyone" ON public.google_reviews_settings FOR UPDATE USING (true);

INSERT INTO public.google_reviews_settings (show_on_homepage, show_on_product, average_rating, total_review_count, max_reviews_to_show)
VALUES (false, true, 4.7, 0, 10)
ON CONFLICT DO NOTHING;

-- ─── 12. COLLECTIONS ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.collections (
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

-- ─── 13. FEATURED COLLECTIONS ────────────────────────────────
CREATE TABLE IF NOT EXISTS public.featured_collections (
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

CREATE TABLE IF NOT EXISTS public.featured_collections_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  visible BOOLEAN NOT NULL DEFAULT true
);
ALTER TABLE public.featured_collections_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Featured settings readable" ON public.featured_collections_settings FOR SELECT USING (true);
CREATE POLICY "Featured settings insertable" ON public.featured_collections_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Featured settings updatable" ON public.featured_collections_settings FOR UPDATE USING (true);

-- ─── 14. SITE SETTINGS ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Site settings are publicly readable" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Site settings can be inserted by anyone" ON public.site_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Site settings can be updated by anyone" ON public.site_settings FOR UPDATE USING (true);

-- ─── 15. DISCOUNTS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.discounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL DEFAULT '',
  buy_qty INTEGER NOT NULL DEFAULT 0,
  get_qty INTEGER NOT NULL DEFAULT 0,
  collections TEXT NOT NULL DEFAULT 'All collections',
  uses INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Active',
  discount_value TEXT NOT NULL DEFAULT 'free',
  can_combine BOOLEAN NOT NULL DEFAULT false,
  max_per_order TEXT NOT NULL DEFAULT '',
  max_total TEXT NOT NULL DEFAULT '',
  priority INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.discounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Discounts are publicly readable" ON public.discounts FOR SELECT USING (true);
CREATE POLICY "Discounts can be inserted by anyone" ON public.discounts FOR INSERT WITH CHECK (true);
CREATE POLICY "Discounts can be updated by anyone" ON public.discounts FOR UPDATE USING (true);
CREATE POLICY "Discounts can be deleted by anyone" ON public.discounts FOR DELETE USING (true);

-- ─── 16. VISITOR SESSIONS ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.visitor_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id text NOT NULL,
  page_url text NOT NULL DEFAULT '/',
  referrer text DEFAULT '',
  user_agent text DEFAULT '',
  ip_hint text DEFAULT '',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  last_seen_at timestamp with time zone NOT NULL DEFAULT now()
);
ALTER TABLE public.visitor_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Visitor sessions publicly readable" ON public.visitor_sessions FOR SELECT USING (true);
CREATE POLICY "Visitor sessions insertable" ON public.visitor_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Visitor sessions updatable" ON public.visitor_sessions FOR UPDATE USING (true);
CREATE POLICY "Visitor sessions deletable" ON public.visitor_sessions FOR DELETE USING (true);
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_last_seen ON public.visitor_sessions (last_seen_at DESC);
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_created ON public.visitor_sessions (created_at DESC);

-- ─── 17. INDEXES ─────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON public.product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_options_product_id ON public.product_options(product_id);

-- ─── 18. STORAGE BUCKETS ─────────────────────────────────────
INSERT INTO storage.buckets (id, name, public) VALUES ('product-csvs', 'product-csvs', false) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('site-assets', 'site-assets', true) ON CONFLICT (id) DO NOTHING;

-- Storage policies for product-csvs
CREATE POLICY "Allow csv uploads" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-csvs');
CREATE POLICY "Allow csv reads" ON storage.objects FOR SELECT USING (bucket_id = 'product-csvs');

-- Storage policies for product-images
CREATE POLICY "Allow image uploads" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images');
CREATE POLICY "Allow image reads" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');

-- Storage policies for site-assets
CREATE POLICY "Site assets are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'site-assets');
CREATE POLICY "Anyone can upload site assets" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'site-assets');
CREATE POLICY "Anyone can update site assets" ON storage.objects FOR UPDATE USING (bucket_id = 'site-assets');
CREATE POLICY "Anyone can delete site assets" ON storage.objects FOR DELETE USING (bucket_id = 'site-assets');

-- ============================================================
-- ✅ DONE! All tables, policies, indexes and buckets created.
-- ============================================================
