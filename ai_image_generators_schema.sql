CREATE TABLE IF NOT EXISTS public.ai_image_generators (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    admin_username TEXT NOT NULL,
    name TEXT NOT NULL,
    admin_name TEXT,
    description TEXT,
    theme_color TEXT DEFAULT '#7c3aed',
    bg_image_url TEXT,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS
ALTER TABLE public.ai_image_generators ENABLE ROW LEVEL SECURITY;

-- Policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ai_image_generators' AND policyname = 'Public select for ai_image_generators') THEN
        CREATE POLICY "Public select for ai_image_generators" ON public.ai_image_generators FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ai_image_generators' AND policyname = 'Users can insert their own ai_image_generators') THEN
        CREATE POLICY "Users can insert their own ai_image_generators" ON public.ai_image_generators FOR INSERT WITH CHECK (auth.uid() = profile_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ai_image_generators' AND policyname = 'Users can update their own ai_image_generators') THEN
        CREATE POLICY "Users can update their own ai_image_generators" ON public.ai_image_generators FOR UPDATE USING (auth.uid() = profile_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ai_image_generators' AND policyname = 'Users can delete their own ai_image_generators') THEN
        CREATE POLICY "Users can delete their own ai_image_generators" ON public.ai_image_generators FOR DELETE USING (auth.uid() = profile_id);
    END IF;
END $$;

-- RPC for views
CREATE OR REPLACE FUNCTION increment_ai_image_views(generator_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.ai_image_generators
  SET views_count = COALESCE(views_count, 0) + 1
  WHERE id = generator_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
