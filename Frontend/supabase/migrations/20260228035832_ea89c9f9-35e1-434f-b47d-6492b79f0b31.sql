
-- Key-value store for all site configurations (store config, footer config, widget configs, admin config)
CREATE TABLE public.site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Site settings are publicly readable"
  ON public.site_settings FOR SELECT USING (true);

CREATE POLICY "Site settings can be inserted by anyone"
  ON public.site_settings FOR INSERT WITH CHECK (true);

CREATE POLICY "Site settings can be updated by anyone"
  ON public.site_settings FOR UPDATE USING (true);

-- Discounts table
CREATE TABLE public.discounts (
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

CREATE POLICY "Discounts are publicly readable"
  ON public.discounts FOR SELECT USING (true);

CREATE POLICY "Discounts can be inserted by anyone"
  ON public.discounts FOR INSERT WITH CHECK (true);

CREATE POLICY "Discounts can be updated by anyone"
  ON public.discounts FOR UPDATE USING (true);

CREATE POLICY "Discounts can be deleted by anyone"
  ON public.discounts FOR DELETE USING (true);
