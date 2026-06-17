-- ======================================================
-- VIYEKO: RECURSION & PERMISSION EMERGENCY FIX
-- ======================================================

-- 1. Create a helper function to check request ownership
-- This avoids RLS recursion by using SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.check_is_request_owner(req_id text)
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

-- 2. Drop all conflicting policies on both tables
DROP POLICY IF EXISTS "Users can view their own or open requests" ON assistance_requests;
DROP POLICY IF EXISTS "Providers see open, assigned or bid-on requests" ON assistance_requests;
DROP POLICY IF EXISTS "view_requests" ON assistance_requests;
DROP POLICY IF EXISTS "Users can view bids for their requests" ON assistance_bids;
DROP POLICY IF EXISTS "Allow authenticated users to create bids" ON assistance_bids;
DROP POLICY IF EXISTS "view_bids" ON assistance_bids;

-- 3. APPLY CLEAN, NON-RECURSIVE POLICIES

-- ASSISTANCE REQUESTS
-- No dependency on assistance_bids table
CREATE POLICY "requests_select_policy" 
ON assistance_requests FOR SELECT USING (
  auth.uid() = user_id 
  OR status IN ('searching', 'bidding')
  OR provider_id = auth.uid()
);

-- ASSISTANCE BIDS
-- Uses the security definer function to check request ownership safely
CREATE POLICY "bids_select_policy" 
ON assistance_bids FOR SELECT USING (
  provider_id = auth.uid()
  OR check_is_request_owner(request_id)
);

CREATE POLICY "bids_insert_policy" 
ON assistance_bids FOR INSERT WITH CHECK (
  auth.uid() = provider_id
  AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'provider')
);

-- 4. FINAL PERMISSIONS & DEFAULTS
ALTER TABLE assistance_bids ALTER COLUMN provider_id SET DEFAULT auth.uid();
GRANT EXECUTE ON FUNCTION public.check_is_request_owner(text) TO authenticated;

NOTIFY pgrst, 'reload schema';
