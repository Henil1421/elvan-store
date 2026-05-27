
-- Table to track visitor sessions
CREATE TABLE public.visitor_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id text NOT NULL,
  page_url text NOT NULL DEFAULT '/',
  referrer text DEFAULT '',
  user_agent text DEFAULT '',
  ip_hint text DEFAULT '',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  last_seen_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.visitor_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Visitor sessions publicly readable" ON public.visitor_sessions FOR SELECT USING (true);
CREATE POLICY "Visitor sessions insertable" ON public.visitor_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Visitor sessions updatable" ON public.visitor_sessions FOR UPDATE USING (true);
CREATE POLICY "Visitor sessions deletable" ON public.visitor_sessions FOR DELETE USING (true);

-- Index for quick "active now" queries
CREATE INDEX idx_visitor_sessions_last_seen ON public.visitor_sessions (last_seen_at DESC);
CREATE INDEX idx_visitor_sessions_created ON public.visitor_sessions (created_at DESC);
