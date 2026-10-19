-- SUPER FAST INDEXING & PERFORMANCE QUERIES FOR SUPABASE
-- Run this in your Supabase SQL Editor to fix slow loading and errors.

-- 1. Ensure all columns are correct (Handling the 'profile_id' vs 'user_id' confusion)
DO $$ 
BEGIN
    -- Check for 'tools' table
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'tools') THEN
        -- Add index if not exists
        IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_tools_user_id') THEN
            CREATE INDEX idx_tools_user_id ON public.tools(user_id);
        END IF;
    END IF;

    -- Check for 'short_links' table
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'short_links') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_short_links_profile_id') THEN
            CREATE INDEX idx_short_links_profile_id ON public.short_links(profile_id);
        END IF;
    END IF;

    -- Check for 'portfolios' table
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'portfolios') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_portfolios_profile_id') THEN
            CREATE INDEX idx_portfolios_profile_id ON public.portfolios(profile_id);
        END IF;
    END IF;

    -- Check for 'profiles' table (most important)
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
        IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_profiles_username') THEN
            CREATE INDEX idx_profiles_username ON public.profiles(username);
        END IF;

        -- Add missing columns for credential tracking if they don't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='saved_email') THEN
            ALTER TABLE public.profiles ADD COLUMN saved_email text;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='saved_password') THEN
            ALTER TABLE public.profiles ADD COLUMN saved_password text;
        END IF;
    END IF;
END $$;

-- 2. Create Missing Tables (if they don't exist yet)
CREATE TABLE IF NOT EXISTS public.sim_database (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    admin_username text NOT NULL,
    name text NOT NULL,
    admin_name text,
    channel_link text,
    whatsapp_number text,
    theme_color text DEFAULT '#00ffc8',
    font_family text DEFAULT 'sans',
    bg_image_url text,
    main_website_link text,
    views_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.sms_bomber (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    admin_username text NOT NULL,
    name text NOT NULL,
    admin_name text,
    channel_link text,
    whatsapp_number text,
    theme_color text DEFAULT '#ff0055',
    font_family text DEFAULT 'sans',
    main_website_link text,
    bg_image_url text,
    views_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.chatbots (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    admin_username text NOT NULL,
    name text NOT NULL,
    bot_name text,
    bot_avatar text,
    admin_name text,
    theme_color text DEFAULT '#8b5cf6',
    bg_image_url text,
    views_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.ai_image_generators (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    admin_username text NOT NULL,
    name text NOT NULL,
    admin_name text,
    description text,
    theme_color text DEFAULT '#06b6d4',
    bg_image_url text,
    views_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.tiktok_downloaders (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    admin_username text NOT NULL,
    name text NOT NULL,
    admin_name text,
    theme_color text DEFAULT '#ffffff',
    bg_image_url text,
    views_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Add Indexes to new tables for Instant Loading
CREATE INDEX IF NOT EXISTS idx_sim_db_profile_id ON public.sim_database(profile_id);
CREATE INDEX IF NOT EXISTS idx_sim_db_admin_username ON public.sim_database(admin_username);

CREATE INDEX IF NOT EXISTS idx_sms_bomber_profile_id ON public.sms_bomber(profile_id);
CREATE INDEX IF NOT EXISTS idx_sms_bomber_admin_username ON public.sms_bomber(admin_username);

CREATE INDEX IF NOT EXISTS idx_chatbots_profile_id ON public.chatbots(profile_id);
CREATE INDEX IF NOT EXISTS idx_chatbots_admin_username ON public.chatbots(admin_username);

CREATE INDEX IF NOT EXISTS idx_ai_gen_profile_id ON public.ai_image_generators(profile_id);
CREATE INDEX IF NOT EXISTS idx_ai_gen_admin_username ON public.ai_image_generators(admin_username);

CREATE INDEX IF NOT EXISTS idx_tiktok_dl_profile_id ON public.tiktok_downloaders(profile_id);
CREATE INDEX IF NOT EXISTS idx_tiktok_dl_admin_username ON public.tiktok_downloaders(admin_username);

-- 4. Enable RLS and add public policies so apps don't crash
ALTER TABLE public.sim_database ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sms_bomber ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_image_generators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tiktok_downloaders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read sim_database" ON public.sim_database;
CREATE POLICY "Allow public read sim_database" ON public.sim_database FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public read sms_bomber" ON public.sms_bomber;
CREATE POLICY "Allow public read sms_bomber" ON public.sms_bomber FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public read chatbots" ON public.chatbots;
CREATE POLICY "Allow public read chatbots" ON public.chatbots FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public read ai_image_generators" ON public.ai_image_generators;
CREATE POLICY "Allow public read ai_image_generators" ON public.ai_image_generators FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public read tiktok_downloaders" ON public.tiktok_downloaders;
CREATE POLICY "Allow public read tiktok_downloaders" ON public.tiktok_downloaders FOR SELECT USING (true);

-- 5. Performance boost for Analytics
CREATE INDEX IF NOT EXISTS idx_global_analytics_path ON public.global_analytics(path);
CREATE INDEX IF NOT EXISTS idx_global_analytics_created ON public.global_analytics(created_at DESC);
