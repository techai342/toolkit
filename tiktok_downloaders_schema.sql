CREATE TABLE IF NOT EXISTS public.tiktok_downloaders (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    admin_username TEXT NOT NULL,
    name TEXT NOT NULL,
    admin_name TEXT,
    theme_color TEXT DEFAULT '#4facfe',
    bg_image_url TEXT,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS
ALTER TABLE public.tiktok_downloaders ENABLE ROW LEVEL SECURITY;

-- Policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tiktok_downloaders' AND policyname = 'Public select for tiktok_downloaders') THEN
        CREATE POLICY "Public select for tiktok_downloaders" ON public.tiktok_downloaders FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tiktok_downloaders' AND policyname = 'Users can insert their own tiktok_downloaders') THEN
        CREATE POLICY "Users can insert their own tiktok_downloaders" ON public.tiktok_downloaders FOR INSERT WITH CHECK (auth.uid() = profile_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tiktok_downloaders' AND policyname = 'Users can update their own tiktok_downloaders') THEN
        CREATE POLICY "Users can update their own tiktok_downloaders" ON public.tiktok_downloaders FOR UPDATE USING (auth.uid() = profile_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tiktok_downloaders' AND policyname = 'Users can delete their own tiktok_downloaders') THEN
        CREATE POLICY "Users can delete their own tiktok_downloaders" ON public.tiktok_downloaders FOR DELETE USING (auth.uid() = profile_id);
    END IF;
END $$;

-- RPC for views
CREATE OR REPLACE FUNCTION increment_tiktok_downloader_views(downloader_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.tiktok_downloaders
  SET views_count = COALESCE(views_count, 0) + 1
  WHERE id = downloader_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
