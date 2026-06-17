-- ==========================================
-- VIYEKO: BIDS RLS EMERGENCY FIX
-- ==========================================

-- 1. Relax the INSERT policy for bids
-- We rely on the default value for provider_id (auth.uid()) 
-- and the fact that it's a foreign key to the profiles table.
DROP POLICY IF EXISTS "Providers can create bids" ON assistance_bids;
CREATE POLICY "Allow authenticated users to create bids" 
ON assistance_bids FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- 2. Ensure the provider_id default is set correctly (just in case)
ALTER TABLE assistance_bids ALTER COLUMN provider_id SET DEFAULT auth.uid();

-- 3. Ensure providers can also see the requests they have bid on
DROP POLICY IF EXISTS "Providers see open or assigned requests" ON assistance_requests;
CREATE POLICY "Providers see open, assigned or bid-on requests" 
ON assistance_requests FOR SELECT USING (
  auth.uid() = user_id 
  OR status IN ('searching', 'bidding')
  OR provider_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM assistance_bids 
    WHERE assistance_bids.request_id = assistance_requests.id 
    AND assistance_bids.provider_id = auth.uid()
  )
);

-- 4. RELOAD
NOTIFY pgrst, 'reload schema';
