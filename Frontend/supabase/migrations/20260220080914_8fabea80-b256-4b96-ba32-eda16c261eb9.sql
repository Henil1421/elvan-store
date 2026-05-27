
-- Products table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL DEFAULT '',
  handle TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  vendor TEXT NOT NULL DEFAULT '',
  product_type TEXT NOT NULL DEFAULT '',
  tags TEXT NOT NULL DEFAULT '',
  collection TEXT NOT NULL DEFAULT '',
  images TEXT NOT NULL DEFAULT '',
  seo_title TEXT NOT NULL DEFAULT '',
  seo_description TEXT NOT NULL DEFAULT '',
  published BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'Draft',
  options JSONB NOT NULL DEFAULT '[]',
  variants JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Public read (storefront needs to read products)
CREATE POLICY "Products are publicly readable"
  ON public.products FOR SELECT
  USING (true);

-- Anyone can insert/update/delete (admin app, no auth)
CREATE POLICY "Products can be inserted by anyone"
  ON public.products FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Products can be updated by anyone"
  ON public.products FOR UPDATE
  USING (true);

CREATE POLICY "Products can be deleted by anyone"
  ON public.products FOR DELETE
  USING (true);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_products_updated_at();

-- Storage: CSV imports bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-csvs', 'product-csvs', false)
ON CONFLICT (id) DO NOTHING;

-- Storage: Product images bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for product-csvs
CREATE POLICY "Allow csv uploads"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-csvs');

CREATE POLICY "Allow csv reads"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-csvs');

-- Storage policies for product-images
CREATE POLICY "Allow image uploads"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Allow image reads"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');
