-- ==============================================================================
-- 🚀 PRO-TOOLKITS: COMPLETE OLD USERS & DATA WIPE (FRESH START)
-- ==============================================================================
-- Run this in your Supabase SQL Editor.
-- This cleans all old test users, toolkits, links, visits, and logins,
-- while safely preserving or initializing the Super Admin (/mradmin) credentials!
-- ==============================================================================

DO $$
BEGIN
    -- 1. Wipe all User-generated Content Tables (CASCADE cleans foreign key relations)
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'tools') THEN
        TRUNCATE TABLE public.tools CASCADE;
    END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'short_links') THEN
        TRUNCATE TABLE public.short_links CASCADE;
    END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'portfolios') THEN
        TRUNCATE TABLE public.portfolios CASCADE;
    END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'page_visitors') THEN
        TRUNCATE TABLE public.page_visitors CASCADE;
    END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'analytics_events') THEN
        TRUNCATE TABLE public.analytics_events CASCADE;
    END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'global_analytics') THEN
        TRUNCATE TABLE public.global_analytics CASCADE;
    END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_logins') THEN
        TRUNCATE TABLE public.user_logins CASCADE;
    END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'super_admin_messages') THEN
        TRUNCATE TABLE public.super_admin_messages CASCADE;
    END IF;

    -- Wipe tools tables if they exist
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'sim_databases') THEN
        TRUNCATE TABLE public.sim_databases CASCADE;
    END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'sms_bombers') THEN
        TRUNCATE TABLE public.sms_bombers CASCADE;
    END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'chatbots') THEN
        TRUNCATE TABLE public.chatbots CASCADE;
    END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'ai_image_generators') THEN
        TRUNCATE TABLE public.ai_image_generators CASCADE;
    END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'tiktok_downloaders') THEN
        TRUNCATE TABLE public.tiktok_downloaders CASCADE;
    END IF;

    -- 2. Wipe Profiles table
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
        TRUNCATE TABLE public.profiles CASCADE;
    END IF;

    -- 3. Delete all registered accounts from Supabase Auth (allows fresh signups)
    DELETE FROM auth.users;

    -- 4. Ensure Super Admin table & columns exist safely
    CREATE TABLE IF NOT EXISTS public.super_admin_auth (
        id integer PRIMARY KEY DEFAULT 1,
        username text NOT NULL DEFAULT 'saqib',
        password text NOT NULL DEFAULT 'saqibadmin'
    );

    ALTER TABLE public.super_admin_auth ADD COLUMN IF NOT EXISTS password_hash text;
    ALTER TABLE public.super_admin_auth ADD COLUMN IF NOT EXISTS salt text;
    ALTER TABLE public.super_admin_auth ADD COLUMN IF NOT EXISTS iterations integer DEFAULT 100000;
    ALTER TABLE public.super_admin_auth ADD COLUMN IF NOT EXISTS last_password_change timestamp with time zone DEFAULT timezone('utc'::text, now());
    ALTER TABLE public.super_admin_auth ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT timezone('utc'::text, now());

    -- Ensure Super Admin row 1 exists without failing
    INSERT INTO public.super_admin_auth (id, username, password)
    VALUES (1, 'saqib', 'saqibadmin')
    ON CONFLICT (id) DO NOTHING;

END $$;

-- 5. Status Confirmation
SELECT 'SUCCESS: All old users, profiles, tools, and auth data cleared. Super Admin is ready at /mradmin.' AS status;
