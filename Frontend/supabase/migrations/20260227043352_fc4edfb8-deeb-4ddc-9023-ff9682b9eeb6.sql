
-- Add collection_name column to products table
ALTER TABLE public.products ADD COLUMN collection_name text DEFAULT '';
