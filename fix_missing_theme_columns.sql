-- FIXING MISSING THEME COLUMNS
-- Run this in Supabase SQL Editor

DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
        -- Theme Colors & Backgrounds
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='theme_text_color') THEN
            ALTER TABLE public.profiles ADD COLUMN theme_text_color text;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='bg_color') THEN
            ALTER TABLE public.profiles ADD COLUMN bg_color text;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='bg_gradient') THEN
            ALTER TABLE public.profiles ADD COLUMN bg_gradient text;
        END IF;

        -- Popup Styles
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='popup_border_style') THEN
            ALTER TABLE public.profiles ADD COLUMN popup_border_style text DEFAULT 'solid';
        END IF;
    END IF;
END $$;
