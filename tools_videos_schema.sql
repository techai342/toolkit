-- Run this in your Supabase SQL Editor
ALTER TABLE public.tools ADD COLUMN IF NOT EXISTS video_urls TEXT[] DEFAULT '{}';
