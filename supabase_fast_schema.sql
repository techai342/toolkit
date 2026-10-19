-- Supabase Fast Database Schema & Indexes Setup --

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  bg_image_url TEXT,
  theme TEXT,
  layout TEXT,
  views_count INT DEFAULT 0,
  followers_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fast Profile Lookup
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);

-- 2. Tools Table
CREATE TABLE IF NOT EXISTS public.tools (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  file_url TEXT,
  downloads_count INT DEFAULT 0,
  total_rating_score INT DEFAULT 0,
  ratings_count INT DEFAULT 0,
  wishlist_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fast lookup for User Tools
CREATE INDEX IF NOT EXISTS idx_tools_user_id ON public.tools(user_id);
CREATE INDEX IF NOT EXISTS idx_tools_created_at ON public.tools(created_at DESC);

-- 3. Short Links Table
CREATE TABLE IF NOT EXISTS public.short_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  target_url TEXT NOT NULL,
  is_locked BOOLEAN DEFAULT false,
  password TEXT,
  is_gated BOOLEAN DEFAULT false,
  gated_social_url TEXT,
  gated_description TEXT,
  gated_button_text TEXT,
  gated_icon TEXT,
  clicks INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id, slug)
);

-- Faster lookup for short_links and profile relations
CREATE INDEX IF NOT EXISTS idx_short_links_profile_id ON public.short_links(profile_id);
CREATE INDEX IF NOT EXISTS idx_short_links_slug ON public.short_links(slug);

-- 4. Page Visitors (Tracks followers/views seamlessly)
CREATE TABLE IF NOT EXISTS public.page_visitors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  visitor_hash TEXT NOT NULL,
  is_following BOOLEAN DEFAULT false,
  last_visited TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id, visitor_hash)
);

-- High-speed index to verify follower status
CREATE INDEX IF NOT EXISTS idx_page_visitors_profile_hash ON public.page_visitors(profile_id, visitor_hash);

-- Chatbots Table
CREATE TABLE IF NOT EXISTS public.chatbots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  admin_username TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  bot_name TEXT,
  bot_avatar TEXT,
  admin_name TEXT,
  theme_color TEXT,
  bg_image_url TEXT,
  views_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id, admin_username)
);
CREATE INDEX IF NOT EXISTS idx_chatbots_profile_id ON public.chatbots(profile_id);
CREATE INDEX IF NOT EXISTS idx_chatbots_admin_username ON public.chatbots(admin_username);

-- Enable RLS for chatbots
ALTER TABLE public.chatbots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all reads and writes for chatbots" ON public.chatbots FOR ALL USING (true) WITH CHECK (true);

-- RPC for incrementing views
CREATE OR REPLACE FUNCTION public.increment_chatbot_views(bot_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.chatbots
  SET views_count = COALESCE(views_count, 0) + 1
  WHERE id = bot_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 5. RPC Methods (Improves Website Performance by saving transactions)
CREATE OR REPLACE FUNCTION public.increment_profile_views(profile_row_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.profiles
  SET views_count = COALESCE(views_count, 0) + 1
  WHERE id = profile_row_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.increment_profile_followers(profile_row_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.profiles
  SET followers_count = COALESCE(followers_count, 0) + 1
  WHERE id = profile_row_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.decrement_profile_followers(profile_row_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.profiles
  SET followers_count = GREATEST(COALESCE(followers_count, 0) - 1, 0)
  WHERE id = profile_row_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable Row Level Security (Important!)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.short_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_visitors ENABLE ROW LEVEL SECURITY;

-- Allow all read/write for now
CREATE POLICY "Enable all reads and writes for profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all reads and writes for tools" ON public.tools FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all reads and writes for short_links" ON public.short_links FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all reads and writes for page_visitors" ON public.page_visitors FOR ALL USING (true) WITH CHECK (true);
