-- ======================================================
-- VIYEKO: MASTER SYSTEM STABILITY & SECURITY PATCH
-- ======================================================
-- This script consolidates all fixes for RLS, permissions, 
-- and data integrity across all tables.

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLE UPDATES & DEFAULTS
-- Ensure last_updated_by exists and has correct constraints
ALTER TABLE assistance_requests ADD COLUMN IF NOT EXISTS last_updated_by TEXT;
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_last_updated_by') THEN
        ALTER TABLE assistance_requests ADD CONSTRAINT check_last_updated_by CHECK (last_updated_by IN ('driver', 'provider'));
    END IF;
END $$;

-- Set defaults to allow the frontend to omit these fields (handled by DB for security)
ALTER TABLE assistance_requests ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE assistance_bids ALTER COLUMN provider_id SET DEFAULT auth.uid();
ALTER TABLE profiles ALTER COLUMN id SET DEFAULT auth.uid();

-- Ensure 'bids' column is removed (since we use the relational table)
ALTER TABLE assistance_requests DROP COLUMN IF EXISTS bids;

-- 3. PERMISSIONS
GRANT ALL ON TABLE profiles TO authenticated;
GRANT ALL ON TABLE assistance_requests TO authenticated;
GRANT ALL ON TABLE assistance_bids TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- 4. ENABLE RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE assistance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE assistance_bids ENABLE ROW LEVEL SECURITY;

-- 5. DROP ALL OLD POLICIES
DO $$ 
DECLARE 
    pol record;
BEGIN
    FOR pol IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public') 
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, pol.tablename);
    END LOOP;
END $$;

-- 6. NEW ROBUST POLICIES

-- PROFILES
CREATE POLICY "Profiles are readable by authenticated users" 
ON profiles FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert their own profile" 
ON profiles FOR INSERT WITH CHECK (auth.uid() = id OR id IS NULL);

CREATE POLICY "Users can update their own profile" 
ON profiles FOR UPDATE USING (auth.uid() = id);

-- ASSISTANCE REQUESTS
CREATE POLICY "Users can view their own or open requests" 
ON assistance_requests FOR SELECT USING (
  auth.uid() = user_id 
  OR status IN ('searching', 'bidding')
  OR provider_id = auth.uid()
);

CREATE POLICY "Users can create requests" 
ON assistance_requests FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users and providers can update requests" 
ON assistance_requests FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = provider_id);

-- ASSISTANCE BIDS
CREATE POLICY "Users can view bids for their requests" 
ON assistance_bids FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM assistance_requests 
    WHERE assistance_requests.id = assistance_bids.request_id 
    AND assistance_requests.user_id = auth.uid()
  )
  OR provider_id = auth.uid()
);

CREATE POLICY "Providers can create bids" 
ON assistance_bids FOR INSERT WITH CHECK (
  (provider_id = auth.uid() OR provider_id IS NULL)
  AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'provider')
);

-- 7. RELOAD
NOTIFY pgrst, 'reload schema';
