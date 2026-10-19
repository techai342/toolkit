CREATE TABLE IF NOT EXISTS public.sim_databases (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    admin_username TEXT NOT NULL,
    name TEXT NOT NULL,
    channel_link TEXT,
    whatsapp_number TEXT,
    theme_color TEXT DEFAULT 'cyan',
    font_family TEXT DEFAULT 'sans',
    bg_image_url TEXT,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS
ALTER TABLE public.sim_databases ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public profiles are viewable by everyone." 
    ON public.sim_databases FOR SELECT 
    USING ( true );

CREATE POLICY "Users can insert their own sim databases." 
    ON public.sim_databases FOR INSERT 
    WITH CHECK ( auth.uid() = profile_id );

CREATE POLICY "Users can update their own sim databases." 
    ON public.sim_databases FOR UPDATE 
    USING ( auth.uid() = profile_id );

CREATE POLICY "Users can delete their own sim databases." 
    ON public.sim_databases FOR DELETE 
    USING ( auth.uid() = profile_id );

CREATE OR REPLACE FUNCTION increment_sim_db_views(db_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.sim_databases
  SET views_count = views_count + 1
  WHERE id = db_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
