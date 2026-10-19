-- ==========================================
-- 🚀 10X PERFORMANCE OPTIMIZATION SCRIPT (FIXED)
-- ==========================================
-- This script adds critical indexes and performance tuning 
-- to your Supabase/PostgreSQL database.

-- 1. EXTENSIONS (Must be first)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. PROFILES OPTIMIZATION
-- Optimize profile lookups by ID and Username
CREATE INDEX IF NOT EXISTS idx_profiles_id_username ON public.profiles(id, username);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at DESC);

-- 3. TOOLS OPTIMIZATION
-- Add Full-Text Search index for tool names
CREATE INDEX IF NOT EXISTS idx_tools_name_trgm ON public.tools USING gin (name gin_trgm_ops);
-- Index for fetching a user's tools sorted by date
CREATE INDEX IF NOT EXISTS idx_tools_user_id_created_at ON public.tools(user_id, created_at DESC);

-- 4. PORTFOLIOS OPTIMIZATION
-- Composite index for profile and slug lookups (Extreme Fast lookup)
CREATE INDEX IF NOT EXISTS idx_portfolios_composite ON public.portfolios(profile_id, slug, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_portfolios_title_trgm ON public.portfolios USING gin (title gin_trgm_ops);

-- 5. SHORT LINKS OPTIMIZATION
CREATE INDEX IF NOT EXISTS idx_short_links_composite ON public.short_links(profile_id, slug, created_at DESC);

-- 6. SIM DATABASES & SMS BOMBERS (Supporting tables)
CREATE INDEX IF NOT EXISTS idx_sim_databases_profile_id ON public.sim_databases(profile_id);
CREATE INDEX IF NOT EXISTS idx_sms_bombers_profile_id ON public.sms_bombers(profile_id);

-- 7. PERFORMANCE TUNING
-- Updates table statistics for the query planner
ANALYZE; 
