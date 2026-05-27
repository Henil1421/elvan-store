
-- Create orders table to store user checkout info
CREATE TABLE public.orders (
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

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Public insert policy (no auth required for guest checkout)
CREATE POLICY "Orders can be inserted by anyone"
ON public.orders FOR INSERT WITH CHECK (true);

-- Public read policy
CREATE POLICY "Orders are publicly readable"
ON public.orders FOR SELECT USING (true);

-- Public update policy
CREATE POLICY "Orders can be updated by anyone"
ON public.orders FOR UPDATE USING (true);
