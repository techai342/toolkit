-- ⚠️ WARNING: THIS WILL WIPE ALL DATA AND USERS ⚠️
-- Run this in your Supabase SQL Editor to start completely fresh.

DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- 1. Wipe all data from existing tables in public schema
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'TRUNCATE public.' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;

    -- 2. Delete all Users from Auth (This removes all emails and logins)
    -- This allows you to re-register with the same email as a fresh user.
    DELETE FROM auth.users;
END $$;

-- 3. Success Message
SELECT 'DATABASE WIPED SUCCESSFULLY. All users and data removed.' as status;
