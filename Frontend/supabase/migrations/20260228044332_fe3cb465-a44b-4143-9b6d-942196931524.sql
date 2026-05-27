
-- Create a public storage bucket for site assets (logo, favicon, hero images)
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-assets', 'site-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to view site assets (public bucket)
CREATE POLICY "Site assets are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'site-assets');

-- Allow anyone to upload site assets (admin-only in practice, no auth in this app)
CREATE POLICY "Anyone can upload site assets"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'site-assets');

-- Allow anyone to update site assets
CREATE POLICY "Anyone can update site assets"
ON storage.objects FOR UPDATE
USING (bucket_id = 'site-assets');

-- Allow anyone to delete site assets
CREATE POLICY "Anyone can delete site assets"
ON storage.objects FOR DELETE
USING (bucket_id = 'site-assets');
