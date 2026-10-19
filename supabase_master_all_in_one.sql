-- ==============================================================================
-- 🚀 MASTER SUPABASE ALL-IN-ONE SCHEMA SCRIPT
-- ==============================================================================
-- Idempotent & Non-Destructive: Safe to run multiple times without data loss.
-- Covers all 14 Tables, missing columns, RPC functions, RLS policies, and indexes.
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. PROFILES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    name TEXT,
    saved_email TEXT,
    saved_password TEXT,
    avatar_url TEXT,
    description TEXT,
    phone_number TEXT,
    social_facebook TEXT,
    social_youtube TEXT,
    social_whatsapp TEXT,
    social_github TEXT,
    social_telegram TEXT,
    social_instagram TEXT,
    social_twitter TEXT,
    social_tiktok TEXT,
    whatsapp_greeting TEXT,
    views_count BIGINT DEFAULT 0,
    followers_count BIGINT DEFAULT 0,
    popup_enabled BOOLEAN DEFAULT FALSE,
    popup_title TEXT,
    popup_description TEXT,
    popup_link TEXT,
    popup_button_text TEXT DEFAULT 'Join Now',
    popup_icon TEXT DEFAULT 'megaphone',
    popup_border_style TEXT DEFAULT 'purple_cyan',
    theme_profile_border BOOLEAN DEFAULT FALSE,
    theme_search_border BOOLEAN DEFAULT FALSE,
    theme_social_border BOOLEAN DEFAULT FALSE,
    theme_buttons_border BOOLEAN DEFAULT FALSE,
    theme_color_combo TEXT DEFAULT 'rgb',
    theme_font_family TEXT DEFAULT 'sans',
    theme_text_color TEXT DEFAULT '#F0F0F0',
    theme_username_color TEXT DEFAULT '#FFFFFF',
    bg_color TEXT DEFAULT '#0A0F1E',
    bg_image_url TEXT,
    bg_gradient TEXT,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_pin TEXT,
    seo_title TEXT,
    seo_description TEXT,
    seo_keywords TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure all columns exist even on pre-existing profiles table
DO $$ 
BEGIN
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS name TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS saved_email TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS saved_password TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS description TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone_number TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS social_facebook TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS social_youtube TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS social_whatsapp TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS social_github TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS social_telegram TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS social_instagram TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS social_twitter TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS social_tiktok TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS whatsapp_greeting TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS views_count BIGINT DEFAULT 0;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS followers_count BIGINT DEFAULT 0;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS popup_enabled BOOLEAN DEFAULT FALSE;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS popup_title TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS popup_description TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS popup_link TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS popup_button_text TEXT DEFAULT 'Join Now';
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS popup_icon TEXT DEFAULT 'megaphone';
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS popup_border_style TEXT DEFAULT 'purple_cyan';
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS theme_profile_border BOOLEAN DEFAULT FALSE;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS theme_search_border BOOLEAN DEFAULT FALSE;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS theme_social_border BOOLEAN DEFAULT FALSE;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS theme_buttons_border BOOLEAN DEFAULT FALSE;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS theme_color_combo TEXT DEFAULT 'rgb';
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS theme_font_family TEXT DEFAULT 'sans';
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS theme_text_color TEXT DEFAULT '#F0F0F0';
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS theme_username_color TEXT DEFAULT '#FFFFFF';
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bg_color TEXT DEFAULT '#0A0F1E';
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bg_image_url TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bg_gradient TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT FALSE;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS seo_title TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS seo_description TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS seo_keywords TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT FALSE;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ban_reason TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS banned_at TIMESTAMPTZ;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS login_count INT DEFAULT 0;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ DEFAULT now();
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
END $$;

-- ==============================================================================
-- 2. TOOLS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.tools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT,
    link_url TEXT NOT NULL,
    image_url TEXT,
    category TEXT DEFAULT 'Tools',
    is_media BOOLEAN DEFAULT FALSE,
    is_locked BOOLEAN DEFAULT FALSE,
    password TEXT,
    is_gated BOOLEAN DEFAULT FALSE,
    gate_url TEXT,
    gate_text TEXT DEFAULT 'Subscribe first to unlock',
    gate_icon TEXT DEFAULT 'youtube',
    video_urls TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

DO $$ 
BEGIN
    ALTER TABLE public.tools ADD COLUMN IF NOT EXISTS slug TEXT;
    ALTER TABLE public.tools ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Tools';
    ALTER TABLE public.tools ADD COLUMN IF NOT EXISTS is_media BOOLEAN DEFAULT FALSE;
    ALTER TABLE public.tools ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT FALSE;
    ALTER TABLE public.tools ADD COLUMN IF NOT EXISTS password TEXT;
    ALTER TABLE public.tools ADD COLUMN IF NOT EXISTS is_gated BOOLEAN DEFAULT FALSE;
    ALTER TABLE public.tools ADD COLUMN IF NOT EXISTS gate_url TEXT;
    ALTER TABLE public.tools ADD COLUMN IF NOT EXISTS gate_text TEXT DEFAULT 'Subscribe first to unlock';
    ALTER TABLE public.tools ADD COLUMN IF NOT EXISTS gate_icon TEXT DEFAULT 'youtube';
    ALTER TABLE public.tools ADD COLUMN IF NOT EXISTS video_urls TEXT[] DEFAULT '{}';
END $$;

-- ==============================================================================
-- 3. SHORT_LINKS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.short_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    slug TEXT NOT NULL,
    target_url TEXT NOT NULL,
    is_locked BOOLEAN DEFAULT FALSE,
    password TEXT,
    is_gated BOOLEAN DEFAULT FALSE,
    gated_social_url TEXT,
    gated_description TEXT,
    gated_button_text TEXT DEFAULT 'Follow & Unlock',
    gated_icon TEXT DEFAULT 'Users',
    created_at TIMESTAMPTZ DEFAULT now()
);

DO $$ 
BEGIN
    ALTER TABLE public.short_links ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT FALSE;
    ALTER TABLE public.short_links ADD COLUMN IF NOT EXISTS password TEXT;
    ALTER TABLE public.short_links ADD COLUMN IF NOT EXISTS is_gated BOOLEAN DEFAULT FALSE;
    ALTER TABLE public.short_links ADD COLUMN IF NOT EXISTS gated_social_url TEXT;
    ALTER TABLE public.short_links ADD COLUMN IF NOT EXISTS gated_description TEXT;
    ALTER TABLE public.short_links ADD COLUMN IF NOT EXISTS gated_button_text TEXT DEFAULT 'Follow & Unlock';
    ALTER TABLE public.short_links ADD COLUMN IF NOT EXISTS gated_icon TEXT DEFAULT 'Users';
END $$;

-- ==============================================================================
-- 4. PORTFOLIOS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.portfolios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    main_image_url TEXT,
    gallery_urls TEXT[] DEFAULT '{}',
    theme_color TEXT DEFAULT '#8b5cf6',
    quote TEXT,
    views_count BIGINT DEFAULT 0,
    social_whatsapp TEXT,
    social_instagram TEXT,
    social_tiktok TEXT,
    social_facebook TEXT,
    whatsapp_greeting TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

DO $$ 
BEGIN
    ALTER TABLE public.portfolios ADD COLUMN IF NOT EXISTS main_image_url TEXT;
    ALTER TABLE public.portfolios ADD COLUMN IF NOT EXISTS gallery_urls TEXT[] DEFAULT '{}';
    ALTER TABLE public.portfolios ADD COLUMN IF NOT EXISTS theme_color TEXT DEFAULT '#8b5cf6';
    ALTER TABLE public.portfolios ADD COLUMN IF NOT EXISTS quote TEXT;
    ALTER TABLE public.portfolios ADD COLUMN IF NOT EXISTS views_count BIGINT DEFAULT 0;
    ALTER TABLE public.portfolios ADD COLUMN IF NOT EXISTS social_whatsapp TEXT;
    ALTER TABLE public.portfolios ADD COLUMN IF NOT EXISTS social_instagram TEXT;
    ALTER TABLE public.portfolios ADD COLUMN IF NOT EXISTS social_tiktok TEXT;
    ALTER TABLE public.portfolios ADD COLUMN IF NOT EXISTS social_facebook TEXT;
    ALTER TABLE public.portfolios ADD COLUMN IF NOT EXISTS whatsapp_greeting TEXT;
END $$;

-- ==============================================================================
-- 5. SIM_DATABASES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.sim_databases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    admin_username TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    admin_name TEXT,
    channel_link TEXT,
    whatsapp_number TEXT,
    theme_color TEXT DEFAULT '#00f2fe',
    font_family TEXT DEFAULT 'sans',
    bg_image_url TEXT,
    main_website_link TEXT,
    views_count BIGINT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

DO $$ 
BEGIN
    ALTER TABLE public.sim_databases ADD COLUMN IF NOT EXISTS admin_name TEXT;
    ALTER TABLE public.sim_databases ADD COLUMN IF NOT EXISTS channel_link TEXT;
    ALTER TABLE public.sim_databases ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;
    ALTER TABLE public.sim_databases ADD COLUMN IF NOT EXISTS theme_color TEXT DEFAULT '#00f2fe';
    ALTER TABLE public.sim_databases ADD COLUMN IF NOT EXISTS font_family TEXT DEFAULT 'sans';
    ALTER TABLE public.sim_databases ADD COLUMN IF NOT EXISTS bg_image_url TEXT;
    ALTER TABLE public.sim_databases ADD COLUMN IF NOT EXISTS main_website_link TEXT;
    ALTER TABLE public.sim_databases ADD COLUMN IF NOT EXISTS views_count BIGINT DEFAULT 0;
END $$;

-- ==============================================================================
-- 6. SMS_BOMBERS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.sms_bombers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    admin_username TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    admin_name TEXT,
    channel_link TEXT,
    whatsapp_number TEXT,
    theme_color TEXT DEFAULT '#ff0055',
    font_family TEXT DEFAULT 'sans',
    main_website_link TEXT,
    bg_image_url TEXT,
    views_count BIGINT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

DO $$ 
BEGIN
    ALTER TABLE public.sms_bombers ADD COLUMN IF NOT EXISTS admin_name TEXT;
    ALTER TABLE public.sms_bombers ADD COLUMN IF NOT EXISTS channel_link TEXT;
    ALTER TABLE public.sms_bombers ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;
    ALTER TABLE public.sms_bombers ADD COLUMN IF NOT EXISTS theme_color TEXT DEFAULT '#ff0055';
    ALTER TABLE public.sms_bombers ADD COLUMN IF NOT EXISTS font_family TEXT DEFAULT 'sans';
    ALTER TABLE public.sms_bombers ADD COLUMN IF NOT EXISTS main_website_link TEXT;
    ALTER TABLE public.sms_bombers ADD COLUMN IF NOT EXISTS bg_image_url TEXT;
    ALTER TABLE public.sms_bombers ADD COLUMN IF NOT EXISTS views_count BIGINT DEFAULT 0;
END $$;

-- ==============================================================================
-- 7. CHATBOTS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.chatbots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    admin_username TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    bot_name TEXT,
    bot_avatar TEXT,
    admin_name TEXT,
    theme_color TEXT DEFAULT '#ff2d75',
    bg_image_url TEXT,
    views_count BIGINT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

DO $$ 
BEGIN
    ALTER TABLE public.chatbots ADD COLUMN IF NOT EXISTS bot_name TEXT;
    ALTER TABLE public.chatbots ADD COLUMN IF NOT EXISTS bot_avatar TEXT;
    ALTER TABLE public.chatbots ADD COLUMN IF NOT EXISTS admin_name TEXT;
    ALTER TABLE public.chatbots ADD COLUMN IF NOT EXISTS theme_color TEXT DEFAULT '#ff2d75';
    ALTER TABLE public.chatbots ADD COLUMN IF NOT EXISTS bg_image_url TEXT;
    ALTER TABLE public.chatbots ADD COLUMN IF NOT EXISTS views_count BIGINT DEFAULT 0;
END $$;

-- ==============================================================================
-- 8. AI_IMAGE_GENERATORS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.ai_image_generators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    admin_username TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    admin_name TEXT,
    description TEXT,
    theme_color TEXT DEFAULT '#00f2fe',
    bg_image_url TEXT,
    views_count BIGINT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

DO $$ 
BEGIN
    ALTER TABLE public.ai_image_generators ADD COLUMN IF NOT EXISTS admin_name TEXT;
    ALTER TABLE public.ai_image_generators ADD COLUMN IF NOT EXISTS description TEXT;
    ALTER TABLE public.ai_image_generators ADD COLUMN IF NOT EXISTS theme_color TEXT DEFAULT '#00f2fe';
    ALTER TABLE public.ai_image_generators ADD COLUMN IF NOT EXISTS bg_image_url TEXT;
    ALTER TABLE public.ai_image_generators ADD COLUMN IF NOT EXISTS views_count BIGINT DEFAULT 0;
END $$;

-- ==============================================================================
-- 9. TIKTOK_DOWNLOADERS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.tiktok_downloaders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    admin_username TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    admin_name TEXT,
    theme_color TEXT DEFAULT '#ff0050',
    bg_image_url TEXT,
    views_count BIGINT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

DO $$ 
BEGIN
    ALTER TABLE public.tiktok_downloaders ADD COLUMN IF NOT EXISTS admin_name TEXT;
    ALTER TABLE public.tiktok_downloaders ADD COLUMN IF NOT EXISTS theme_color TEXT DEFAULT '#ff0050';
    ALTER TABLE public.tiktok_downloaders ADD COLUMN IF NOT EXISTS bg_image_url TEXT;
    ALTER TABLE public.tiktok_downloaders ADD COLUMN IF NOT EXISTS views_count BIGINT DEFAULT 0;
END $$;

-- ==============================================================================
-- 10. PAGE_VISITORS TABLE (Followers & Visit Tracking)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.page_visitors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    visitor_hash TEXT NOT NULL,
    is_following BOOLEAN DEFAULT FALSE,
    last_visited TIMESTAMPTZ DEFAULT now(),
    UNIQUE (profile_id, visitor_hash)
);

DO $$ 
BEGIN
    ALTER TABLE public.page_visitors ADD COLUMN IF NOT EXISTS is_following BOOLEAN DEFAULT FALSE;
    ALTER TABLE public.page_visitors ADD COLUMN IF NOT EXISTS last_visited TIMESTAMPTZ DEFAULT now();
END $$;

-- ==============================================================================
-- 11. ANALYTICS_EVENTS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    event_type TEXT DEFAULT 'page_view',
    view_date DATE DEFAULT CURRENT_DATE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

DO $$ 
BEGIN
    ALTER TABLE public.analytics_events ADD COLUMN IF NOT EXISTS view_date DATE DEFAULT CURRENT_DATE;
    ALTER TABLE public.analytics_events ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;
END $$;

-- ==============================================================================
-- 12. GLOBAL_ANALYTICS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.global_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT DEFAULT 'page_view',
    path TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- 13. SUPER_ADMIN_AUTH TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.super_admin_auth (
    id INT PRIMARY KEY DEFAULT 1,
    username TEXT NOT NULL DEFAULT 'saqib',
    password TEXT NOT NULL DEFAULT 'saqibadmin',
    password_hash TEXT,
    salt TEXT,
    iterations INT DEFAULT 100000,
    last_password_change TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure cryptographic columns exist on pre-existing super_admin_auth table
DO $$ 
BEGIN
    ALTER TABLE public.super_admin_auth ADD COLUMN IF NOT EXISTS password_hash TEXT;
    ALTER TABLE public.super_admin_auth ADD COLUMN IF NOT EXISTS salt TEXT;
    ALTER TABLE public.super_admin_auth ADD COLUMN IF NOT EXISTS iterations INT DEFAULT 100000;
    ALTER TABLE public.super_admin_auth ADD COLUMN IF NOT EXISTS last_password_change TIMESTAMPTZ DEFAULT now();
EXCEPTION
    WHEN others THEN NULL;
END $$;

-- Seed default super admin credentials if not exists
INSERT INTO public.super_admin_auth (id, username, password, password_hash, salt, iterations)
VALUES (
    1, 
    'saqib', 
    'saqibadmin', 
    '6a91f60149e556d43359ac68266555719d6dbfa95eaf0d9cb46c0d984cbd10857825e12334035226ae1c239265d8055373929bd2f517bc9fb325b18dcbe7ebaa',
    'e737feb0aa30c50e88dbc4040a6836a5ac2ea176a5c2800d3e5e92f080df0486',
    100000
)
ON CONFLICT (id) DO UPDATE SET
    password_hash = COALESCE(super_admin_auth.password_hash, EXCLUDED.password_hash),
    salt = COALESCE(super_admin_auth.salt, EXCLUDED.salt),
    iterations = COALESCE(super_admin_auth.iterations, EXCLUDED.iterations);

-- ==============================================================================
-- 14. SUPER_ADMIN_MESSAGES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.super_admin_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure pre-existing table drops foreign key constraint before altering type
DO $$ 
BEGIN
    ALTER TABLE public.super_admin_messages 
    DROP CONSTRAINT IF EXISTS super_admin_messages_admin_id_fkey;

    ALTER TABLE public.super_admin_messages 
    ALTER COLUMN admin_id TYPE TEXT;
EXCEPTION
    WHEN others THEN NULL;
END $$;

-- ==============================================================================
-- 14.5 USER_LOGINS TABLE (AUDIT TRAIL & LOGIN SESSIONS)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.user_logins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    username TEXT,
    email TEXT,
    ip_address TEXT,
    user_agent TEXT,
    device_type TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- 15. RPC FUNCTIONS (High Speed Security Definer Increment Functions)
-- ==============================================================================

-- 1. Profile Views Counter
CREATE OR REPLACE FUNCTION public.increment_profile_views(profile_row_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.profiles
    SET views_count = COALESCE(views_count, 0) + 1
    WHERE id = profile_row_id;
END;
$$;

-- 2. Profile Followers Counter (Increment)
CREATE OR REPLACE FUNCTION public.increment_profile_followers(profile_row_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.profiles
    SET followers_count = COALESCE(followers_count, 0) + 1
    WHERE id = profile_row_id;
END;
$$;

-- 3. Profile Followers Counter (Decrement)
CREATE OR REPLACE FUNCTION public.decrement_profile_followers(profile_row_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.profiles
    SET followers_count = GREATEST(COALESCE(followers_count, 0) - 1, 0)
    WHERE id = profile_row_id;
END;
$$;

-- 4. Portfolio Views Counter
CREATE OR REPLACE FUNCTION public.increment_portfolio_views(portfolio_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.portfolios
    SET views_count = COALESCE(views_count, 0) + 1
    WHERE id = portfolio_id;
END;
$$;

-- 5. Sim Database Views Counter
CREATE OR REPLACE FUNCTION public.increment_sim_db_views(db_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.sim_databases
    SET views_count = COALESCE(views_count, 0) + 1
    WHERE id = db_id;
END;
$$;

-- 6. SMS Bomber Views Counter
CREATE OR REPLACE FUNCTION public.increment_sms_bomber_views(bomber_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.sms_bombers
    SET views_count = COALESCE(views_count, 0) + 1
    WHERE id = bomber_id;
END;
$$;

-- 7. Chatbot Views Counter
CREATE OR REPLACE FUNCTION public.increment_chatbot_views(bot_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.chatbots
    SET views_count = COALESCE(views_count, 0) + 1
    WHERE id = bot_id;
END;
$$;

-- 8. AI Image Generator Views Counter
CREATE OR REPLACE FUNCTION public.increment_ai_image_views(generator_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.ai_image_generators
    SET views_count = COALESCE(views_count, 0) + 1
    WHERE id = generator_id;
END;
$$;

-- 9. TikTok Downloader Views Counter
CREATE OR REPLACE FUNCTION public.increment_tiktok_downloader_views(downloader_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.tiktok_downloaders
    SET views_count = COALESCE(views_count, 0) + 1
    WHERE id = downloader_id;
END;
$$;

-- ==============================================================================
-- 16. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.short_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sim_databases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sms_bombers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_image_generators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tiktok_downloaders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.super_admin_auth ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.super_admin_messages ENABLE ROW LEVEL SECURITY;

-- Helper to safely drop and re-create policies
DO $$ 
BEGIN
    -- PROFILES
    DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
    DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
    CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
    CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
    CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

    -- TOOLS
    DROP POLICY IF EXISTS "Tools are viewable by everyone" ON public.tools;
    DROP POLICY IF EXISTS "Users can manage own tools" ON public.tools;
    CREATE POLICY "Tools are viewable by everyone" ON public.tools FOR SELECT USING (true);
    CREATE POLICY "Users can manage own tools" ON public.tools FOR ALL USING (auth.uid() = user_id);

    -- SHORT LINKS
    DROP POLICY IF EXISTS "Short links are viewable by everyone" ON public.short_links;
    DROP POLICY IF EXISTS "Users can manage own short links" ON public.short_links;
    CREATE POLICY "Short links are viewable by everyone" ON public.short_links FOR SELECT USING (true);
    CREATE POLICY "Users can manage own short links" ON public.short_links FOR ALL USING (auth.uid() = profile_id);

    -- PORTFOLIOS
    DROP POLICY IF EXISTS "Portfolios are viewable by everyone" ON public.portfolios;
    DROP POLICY IF EXISTS "Users can manage own portfolios" ON public.portfolios;
    CREATE POLICY "Portfolios are viewable by everyone" ON public.portfolios FOR SELECT USING (true);
    CREATE POLICY "Users can manage own portfolios" ON public.portfolios FOR ALL USING (auth.uid() = profile_id);

    -- SIM DATABASES
    DROP POLICY IF EXISTS "Sim databases are viewable by everyone" ON public.sim_databases;
    DROP POLICY IF EXISTS "Users can manage own sim databases" ON public.sim_databases;
    CREATE POLICY "Sim databases are viewable by everyone" ON public.sim_databases FOR SELECT USING (true);
    CREATE POLICY "Users can manage own sim databases" ON public.sim_databases FOR ALL USING (auth.uid() = profile_id);

    -- SMS BOMBERS
    DROP POLICY IF EXISTS "SMS bombers are viewable by everyone" ON public.sms_bombers;
    DROP POLICY IF EXISTS "Users can manage own sms bombers" ON public.sms_bombers;
    CREATE POLICY "SMS bombers are viewable by everyone" ON public.sms_bombers FOR SELECT USING (true);
    CREATE POLICY "Users can manage own sms bombers" ON public.sms_bombers FOR ALL USING (auth.uid() = profile_id);

    -- CHATBOTS
    DROP POLICY IF EXISTS "Chatbots are viewable by everyone" ON public.chatbots;
    DROP POLICY IF EXISTS "Users can manage own chatbots" ON public.chatbots;
    CREATE POLICY "Chatbots are viewable by everyone" ON public.chatbots FOR SELECT USING (true);
    CREATE POLICY "Users can manage own chatbots" ON public.chatbots FOR ALL USING (auth.uid() = profile_id);

    -- AI IMAGE GENERATORS
    DROP POLICY IF EXISTS "AI Image generators are viewable by everyone" ON public.ai_image_generators;
    DROP POLICY IF EXISTS "Users can manage own image generators" ON public.ai_image_generators;
    CREATE POLICY "AI Image generators are viewable by everyone" ON public.ai_image_generators FOR SELECT USING (true);
    CREATE POLICY "Users can manage own image generators" ON public.ai_image_generators FOR ALL USING (auth.uid() = profile_id);

    -- TIKTOK DOWNLOADERS
    DROP POLICY IF EXISTS "TikTok downloaders are viewable by everyone" ON public.tiktok_downloaders;
    DROP POLICY IF EXISTS "Users can manage own tiktok downloaders" ON public.tiktok_downloaders;
    CREATE POLICY "TikTok downloaders are viewable by everyone" ON public.tiktok_downloaders FOR SELECT USING (true);
    CREATE POLICY "Users can manage own tiktok downloaders" ON public.tiktok_downloaders FOR ALL USING (auth.uid() = profile_id);

    -- PAGE VISITORS
    DROP POLICY IF EXISTS "Page visitors select" ON public.page_visitors;
    DROP POLICY IF EXISTS "Page visitors insert" ON public.page_visitors;
    DROP POLICY IF EXISTS "Page visitors update" ON public.page_visitors;
    CREATE POLICY "Page visitors select" ON public.page_visitors FOR SELECT USING (true);
    CREATE POLICY "Page visitors insert" ON public.page_visitors FOR INSERT WITH CHECK (true);
    CREATE POLICY "Page visitors update" ON public.page_visitors FOR UPDATE USING (true);

    -- ANALYTICS EVENTS
    DROP POLICY IF EXISTS "Analytics events select" ON public.analytics_events;
    DROP POLICY IF EXISTS "Analytics events insert" ON public.analytics_events;
    CREATE POLICY "Analytics events select" ON public.analytics_events FOR SELECT USING (true);
    CREATE POLICY "Analytics events insert" ON public.analytics_events FOR INSERT WITH CHECK (true);

    -- GLOBAL ANALYTICS
    DROP POLICY IF EXISTS "Global analytics select" ON public.global_analytics;
    DROP POLICY IF EXISTS "Global analytics insert" ON public.global_analytics;
    CREATE POLICY "Global analytics select" ON public.global_analytics FOR SELECT USING (true);
    CREATE POLICY "Global analytics insert" ON public.global_analytics FOR INSERT WITH CHECK (true);

    -- SUPER ADMIN AUTH
    DROP POLICY IF EXISTS "Super admin auth full" ON public.super_admin_auth;
    CREATE POLICY "Super admin auth full" ON public.super_admin_auth FOR ALL USING (true);

    -- SUPER ADMIN MESSAGES
    DROP POLICY IF EXISTS "Super admin messages full" ON public.super_admin_messages;
    CREATE POLICY "Super admin messages full" ON public.super_admin_messages FOR ALL USING (true);

    -- USER LOGINS
    DROP POLICY IF EXISTS "User logins full" ON public.user_logins;
    CREATE POLICY "User logins full" ON public.user_logins FOR ALL USING (true);
END $$;

-- ==============================================================================
-- 17. PERFORMANCE INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_is_banned ON public.profiles(is_banned);
CREATE INDEX IF NOT EXISTS idx_user_logins_user_id ON public.user_logins(user_id);
CREATE INDEX IF NOT EXISTS idx_user_logins_created ON public.user_logins(created_at);
CREATE INDEX IF NOT EXISTS idx_tools_user_id ON public.tools(user_id);
CREATE INDEX IF NOT EXISTS idx_tools_category ON public.tools(category);
CREATE INDEX IF NOT EXISTS idx_short_links_profile_slug ON public.short_links(profile_id, slug);
CREATE INDEX IF NOT EXISTS idx_portfolios_slug ON public.portfolios(slug);
CREATE INDEX IF NOT EXISTS idx_sim_databases_slug ON public.sim_databases(admin_username);
CREATE INDEX IF NOT EXISTS idx_sms_bombers_slug ON public.sms_bombers(admin_username);
CREATE INDEX IF NOT EXISTS idx_chatbots_slug ON public.chatbots(admin_username);
CREATE INDEX IF NOT EXISTS idx_ai_image_generators_slug ON public.ai_image_generators(admin_username);
CREATE INDEX IF NOT EXISTS idx_tiktok_downloaders_slug ON public.tiktok_downloaders(admin_username);
CREATE INDEX IF NOT EXISTS idx_analytics_events_profile_date ON public.analytics_events(profile_id, view_date);
CREATE INDEX IF NOT EXISTS idx_global_analytics_created ON public.global_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_page_visitors_lookup ON public.page_visitors(profile_id, visitor_hash);

-- ==============================================================================
-- 18. REALTIME REPLICATION (For Live Push Notifications & Live Charts)
-- ==============================================================================
DO $$ 
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.super_admin_messages;
EXCEPTION
    WHEN others THEN NULL;
END $$;

DO $$ 
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.analytics_events;
EXCEPTION
    WHEN others THEN NULL;
END $$;

-- ==============================================================================
-- ✅ SUCCESS: Schema execution complete!
-- ==============================================================================
