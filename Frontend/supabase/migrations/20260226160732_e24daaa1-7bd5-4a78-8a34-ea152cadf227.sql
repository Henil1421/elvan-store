
-- Create product_variants table
CREATE TABLE public.product_variants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  sku TEXT NOT NULL DEFAULT '',
  price NUMERIC NOT NULL DEFAULT 0,
  compare_at_price NUMERIC NOT NULL DEFAULT 0,
  barcode TEXT NOT NULL DEFAULT '',
  weight NUMERIC NOT NULL DEFAULT 0,
  weight_unit TEXT NOT NULL DEFAULT 'kg',
  option1_value TEXT NOT NULL DEFAULT '',
  option2_value TEXT NOT NULL DEFAULT '',
  option3_value TEXT NOT NULL DEFAULT '',
  inventory_qty INTEGER NOT NULL DEFAULT 0,
  variant_image TEXT NOT NULL DEFAULT '',
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create product_images table
CREATE TABLE public.product_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  src TEXT NOT NULL DEFAULT '',
  alt_text TEXT NOT NULL DEFAULT '',
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create product_options table
CREATE TABLE public.product_options (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  position INTEGER NOT NULL DEFAULT 0,
  values TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_options ENABLE ROW LEVEL SECURITY;

-- RLS policies for product_variants
CREATE POLICY "Product variants are publicly readable" ON public.product_variants FOR SELECT USING (true);
CREATE POLICY "Product variants can be inserted by anyone" ON public.product_variants FOR INSERT WITH CHECK (true);
CREATE POLICY "Product variants can be updated by anyone" ON public.product_variants FOR UPDATE USING (true);
CREATE POLICY "Product variants can be deleted by anyone" ON public.product_variants FOR DELETE USING (true);

-- RLS policies for product_images
CREATE POLICY "Product images are publicly readable" ON public.product_images FOR SELECT USING (true);
CREATE POLICY "Product images can be inserted by anyone" ON public.product_images FOR INSERT WITH CHECK (true);
CREATE POLICY "Product images can be updated by anyone" ON public.product_images FOR UPDATE USING (true);
CREATE POLICY "Product images can be deleted by anyone" ON public.product_images FOR DELETE USING (true);

-- RLS policies for product_options
CREATE POLICY "Product options are publicly readable" ON public.product_options FOR SELECT USING (true);
CREATE POLICY "Product options can be inserted by anyone" ON public.product_options FOR INSERT WITH CHECK (true);
CREATE POLICY "Product options can be updated by anyone" ON public.product_options FOR UPDATE USING (true);
CREATE POLICY "Product options can be deleted by anyone" ON public.product_options FOR DELETE USING (true);

-- Indexes for performance
CREATE INDEX idx_product_variants_product_id ON public.product_variants(product_id);
CREATE INDEX idx_product_images_product_id ON public.product_images(product_id);
CREATE INDEX idx_product_options_product_id ON public.product_options(product_id);
