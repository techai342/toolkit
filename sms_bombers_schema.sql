CREATE TABLE IF NOT EXISTS public.sms_bombers (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    admin_username TEXT NOT NULL,
    name TEXT NOT NULL,
    admin_name TEXT,
    channel_link TEXT,
    whatsapp_number TEXT,
    theme_color TEXT DEFAULT '#FF3A3A',
    font_family TEXT DEFAULT 'sans',
    main_website_link TEXT,
    bg_image_url TEXT,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS
ALTER TABLE public.sms_bombers ENABLE ROW LEVEL SECURITY;

-- Policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sms_bombers' AND policyname = 'Public select for sms_bombers') THEN
        CREATE POLICY "Public select for sms_bombers" ON public.sms_bombers FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sms_bombers' AND policyname = 'Users can insert their own sms_bombers') THEN
        CREATE POLICY "Users can insert their own sms_bombers" ON public.sms_bombers FOR INSERT WITH CHECK (auth.uid() = profile_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sms_bombers' AND policyname = 'Users can update their own sms_bombers') THEN
        CREATE POLICY "Users can update their own sms_bombers" ON public.sms_bombers FOR UPDATE USING (auth.uid() = profile_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sms_bombers' AND policyname = 'Users can delete their own sms_bombers') THEN
        CREATE POLICY "Users can delete their own sms_bombers" ON public.sms_bombers FOR DELETE USING (auth.uid() = profile_id);
    END IF;
END $$;

-- RPC for views
CREATE OR REPLACE FUNCTION increment_sms_bomber_views(bomber_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.sms_bombers
  SET views_count = COALESCE(views_count, 0) + 1
  WHERE id = bomber_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
