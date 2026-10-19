-- CREATE ANALYTICS TABLE
CREATE TABLE IF NOT EXISTS public.analytics_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    event_type TEXT DEFAULT 'page_view',
    view_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEX FOR FAST QUERYING
CREATE INDEX IF NOT EXISTS idx_analytics_profile_id_date ON public.analytics_events(profile_id, view_date);

-- Enable RLS
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all reads and writes for analytics" ON public.analytics_events FOR ALL USING (true) WITH CHECK (true);
