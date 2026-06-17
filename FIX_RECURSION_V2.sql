-- ======================================================
-- VIYEKO: ULTIMATE RECURSION & PERMISSION FIX
-- ======================================================

-- 1. DROP ALL EXISTING POLICIES TO START FRESH
DO $$ 
DECLARE 
    pol record;
BEGIN
    FOR pol IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public') 
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, pol.tablename);
    END LOOP;
END $$;

-- 2. CREATE SECURITY DEFINER FUNCTIONS
-- These functions run with the privileges of the creator (postgres), 
-- bypassing RLS and thus preventing infinite recursion.

CREATE OR REPLACE FUNCTION public.is_request_owner(req_id text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM assistance_requests
    WHERE id = req_id AND user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_assigned_provider(req_id text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM assistance_requests
    WHERE id = req_id AND provider_id = auth.uid()
  );
$$;

-- 3. APPLY CLEAN, NON-RECURSIVE POLICIES

-- PROFILES
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- ASSISTANCE REQUESTS
CREATE POLICY "requests_select" ON assistance_requests FOR SELECT USING (
  auth.uid() = user_id 
  OR status IN ('searching', 'bidding')
  OR provider_id = auth.uid()
);
CREATE POLICY "requests_insert" ON assistance_requests FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "requests_update" ON assistance_requests FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = provider_id);

-- ASSISTANCE BIDS
-- Using the helper function to avoid recursion
CREATE POLICY "bids_select" ON assistance_bids FOR SELECT USING (
  provider_id = auth.uid()
  OR is_request_owner(request_id)
);
CREATE POLICY "bids_insert" ON assistance_bids FOR INSERT WITH CHECK (
  (provider_id = auth.uid() OR provider_id IS NULL)
  AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'provider')
);

-- 4. DEFAULTS & PERMISSIONS
ALTER TABLE assistance_requests ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE assistance_bids ALTER COLUMN provider_id SET DEFAULT auth.uid();
ALTER TABLE profiles ALTER COLUMN id SET DEFAULT auth.uid();

GRANT EXECUTE ON FUNCTION public.is_request_owner(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_assigned_provider(text) TO authenticated;

GRANT ALL ON TABLE profiles TO authenticated;
GRANT ALL ON TABLE assistance_requests TO authenticated;
GRANT ALL ON TABLE assistance_bids TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

NOTIFY pgrst, 'reload schema';
