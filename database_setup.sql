-- RUN THIS IN SUPABASE SQL EDITOR EXPERTLY:

CREATE TABLE IF NOT EXISTS super_admin_auth (
  id integer primary key default 1,
  username text not null default 'saqib',
  password text not null default 'saqibadmin'
);
INSERT INTO super_admin_auth (id, username, password) VALUES (1, 'saqib', 'saqibadmin') ON CONFLICT (id) DO NOTHING;
ALTER TABLE super_admin_auth ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read" ON super_admin_auth;
DROP POLICY IF EXISTS "Allow public update" ON super_admin_auth;
CREATE POLICY "Allow public read" ON super_admin_auth FOR SELECT USING (true);
CREATE POLICY "Allow public update" ON super_admin_auth FOR UPDATE USING (true);

CREATE TABLE IF NOT EXISTS global_analytics (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  event_type text not null,
  path text not null,
  metadata jsonb default '{}'::jsonb
);

-- ENABLE PERMISSIONS SO IT CAN TRACK ANONYMOUS USERS:
ALTER TABLE global_analytics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow inserts anyone" ON global_analytics;
DROP POLICY IF EXISTS "Allow reads anyone" ON global_analytics;
CREATE POLICY "Allow inserts anyone" ON global_analytics FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow reads anyone" ON global_analytics FOR SELECT USING (true);

-- ADD COLUMNS FOR ADMIN TRACKING
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS saved_password text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS saved_email text;
ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS metadata jsonb default '{}'::jsonb;

-- NEW FEATURE: SUPER ADMIN MESSAGES
CREATE TABLE IF NOT EXISTS super_admin_messages (
  id uuid default gen_random_uuid() primary key,
  admin_id uuid references profiles(id) on delete cascade not null,
  message text not null,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
ALTER TABLE super_admin_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read messages" ON super_admin_messages;
DROP POLICY IF EXISTS "Allow public update messages" ON super_admin_messages;
DROP POLICY IF EXISTS "Allow public insert messages" ON super_admin_messages;
CREATE POLICY "Allow public read messages" ON super_admin_messages FOR SELECT USING (true);
CREATE POLICY "Allow public update messages" ON super_admin_messages FOR UPDATE USING (true);
CREATE POLICY "Allow public insert messages" ON super_admin_messages FOR INSERT WITH CHECK (true);
