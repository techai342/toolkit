-- Run this in your Supabase SQL Editor
CREATE TABLE IF NOT EXISTS public.portfolios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  main_image_url TEXT,
  gallery_urls TEXT[] DEFAULT '{}',
  theme_color TEXT DEFAULT '#007AFF',
  quote TEXT,
  views_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id, slug)
);

-- Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_portfolios_profile_slug ON public.portfolios(profile_id, slug);

-- Enable RLS
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;

-- Policy (Public read, Owner full access)
CREATE POLICY "Public read portfolios" ON public.portfolios FOR SELECT USING (true);
CREATE POLICY "Owner crud portfolios" ON public.portfolios FOR ALL USING (auth.uid() = profile_id) WITH CHECK (auth.uid() = profile_id);

-- RPC for incrementing views
CREATE OR REPLACE FUNCTION increment_portfolio_views(portfolio_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.portfolios
  SET views_count = views_count + 1
  WHERE id = portfolio_id;
END;
$$;
