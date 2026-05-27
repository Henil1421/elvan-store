
CREATE TABLE public.google_reviews (
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

-- Settings table for widget config
CREATE TABLE public.google_reviews_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  show_on_homepage BOOLEAN NOT NULL DEFAULT false,
  show_on_product BOOLEAN NOT NULL DEFAULT true,
  average_rating NUMERIC NOT NULL DEFAULT 4.7,
  total_review_count INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.google_reviews_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Settings are publicly readable" ON public.google_reviews_settings FOR SELECT USING (true);
CREATE POLICY "Settings can be inserted by anyone" ON public.google_reviews_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Settings can be updated by anyone" ON public.google_reviews_settings FOR UPDATE USING (true);

-- Insert default settings row
INSERT INTO public.google_reviews_settings (show_on_homepage, show_on_product, average_rating, total_review_count)
VALUES (false, true, 4.7, 0);
