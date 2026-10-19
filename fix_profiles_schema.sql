-- COMPREHENSIVE PROFILES TABLE FIX
-- Run this in Supabase SQL Editor to ensure ALL used columns exist.

DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
        -- Basic Info
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='avatar_url') THEN
            ALTER TABLE public.profiles ADD COLUMN avatar_url text;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='description') THEN
            ALTER TABLE public.profiles ADD COLUMN description text;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='phone_number') THEN
            ALTER TABLE public.profiles ADD COLUMN phone_number text;
        END IF;

        -- Social Links
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='social_facebook') THEN
            ALTER TABLE public.profiles ADD COLUMN social_facebook text;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='social_youtube') THEN
            ALTER TABLE public.profiles ADD COLUMN social_youtube text;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='social_whatsapp') THEN
            ALTER TABLE public.profiles ADD COLUMN social_whatsapp text;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='social_github') THEN
            ALTER TABLE public.profiles ADD COLUMN social_github text;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='social_telegram') THEN
            ALTER TABLE public.profiles ADD COLUMN social_telegram text;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='social_instagram') THEN
            ALTER TABLE public.profiles ADD COLUMN social_instagram text;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='social_twitter') THEN
            ALTER TABLE public.profiles ADD COLUMN social_twitter text;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='social_tiktok') THEN
            ALTER TABLE public.profiles ADD COLUMN social_tiktok text;
        END IF;

        -- Themes
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='theme_profile_border') THEN
            ALTER TABLE public.profiles ADD COLUMN theme_profile_border boolean DEFAULT true;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='theme_search_border') THEN
            ALTER TABLE public.profiles ADD COLUMN theme_search_border boolean DEFAULT true;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='theme_social_border') THEN
            ALTER TABLE public.profiles ADD COLUMN theme_social_border boolean DEFAULT true;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='theme_buttons_border') THEN
            ALTER TABLE public.profiles ADD COLUMN theme_buttons_border boolean DEFAULT true;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='theme_color_combo') THEN
            ALTER TABLE public.profiles ADD COLUMN theme_color_combo text DEFAULT 'purple-indigo';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='theme_font_family') THEN
            ALTER TABLE public.profiles ADD COLUMN theme_font_family text DEFAULT 'sans';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='theme_username_color') THEN
            ALTER TABLE public.profiles ADD COLUMN theme_username_color text;
        END IF;

        -- Popup Settings
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='popup_enabled') THEN
            ALTER TABLE public.profiles ADD COLUMN popup_enabled boolean DEFAULT false;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='popup_title') THEN
            ALTER TABLE public.profiles ADD COLUMN popup_title text;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='popup_description') THEN
            ALTER TABLE public.profiles ADD COLUMN popup_description text;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='popup_link') THEN
            ALTER TABLE public.profiles ADD COLUMN popup_link text;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='popup_button_text') THEN
            ALTER TABLE public.profiles ADD COLUMN popup_button_text text;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='popup_icon') THEN
            ALTER TABLE public.profiles ADD COLUMN popup_icon text;
        END IF;

        -- 2FA Security
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='two_factor_enabled') THEN
            ALTER TABLE public.profiles ADD COLUMN two_factor_enabled boolean DEFAULT false;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='two_factor_pin') THEN
            ALTER TABLE public.profiles ADD COLUMN two_factor_pin text;
        END IF;

        -- Stats
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='views_count') THEN
            ALTER TABLE public.profiles ADD COLUMN views_count integer DEFAULT 0;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='followers_count') THEN
            ALTER TABLE public.profiles ADD COLUMN followers_count integer DEFAULT 0;
        END IF;
        
        -- Meta data
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='saved_email') THEN
            ALTER TABLE public.profiles ADD COLUMN saved_email text;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='saved_password') THEN
            ALTER TABLE public.profiles ADD COLUMN saved_password text;
        END IF;
    ELSE
        -- Create table if it doesn't exist at all
        CREATE TABLE public.profiles (
            id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
            username text UNIQUE NOT NULL,
            avatar_url text,
            description text,
            phone_number text,
            social_facebook text,
            social_youtube text,
            social_whatsapp text,
            social_github text,
            social_telegram text,
            social_instagram text,
            social_twitter text,
            social_tiktok text,
            theme_profile_border boolean DEFAULT true,
            theme_search_border boolean DEFAULT true,
            theme_social_border boolean DEFAULT true,
            theme_buttons_border boolean DEFAULT true,
            theme_color_combo text DEFAULT 'purple-indigo',
            theme_font_family text DEFAULT 'sans',
            theme_username_color text,
            popup_enabled boolean DEFAULT false,
            popup_title text,
            popup_description text,
            popup_link text,
            popup_button_text text,
            popup_icon text,
            two_factor_enabled boolean DEFAULT false,
            two_factor_pin text,
            views_count integer DEFAULT 0,
            followers_count integer DEFAULT 0,
            saved_email text,
            saved_password text,
            created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
        );
    END IF;
END $$;

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

