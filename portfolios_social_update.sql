-- Run this in Supabase SQL Editor to update Portfolios with Social Links
ALTER TABLE public.portfolios 
ADD COLUMN IF NOT EXISTS social_whatsapp TEXT,
ADD COLUMN IF NOT EXISTS social_instagram TEXT,
ADD COLUMN IF NOT EXISTS social_tiktok TEXT,
ADD COLUMN IF NOT EXISTS social_facebook TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_greeting TEXT;
