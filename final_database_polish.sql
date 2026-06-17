-- ==========================================
-- VIYEKO: FINAL DATABASE POLISH
-- ==========================================

-- 1. Remove redundant 'bids' column from assistance_requests
-- (Bids now live in the 'assistance_bids' table)
ALTER TABLE assistance_requests DROP COLUMN IF EXISTS bids;

-- 2. Add 'last_updated_by' if it doesn't exist
ALTER TABLE assistance_requests 
ADD COLUMN IF NOT EXISTS last_updated_by TEXT CHECK (last_updated_by IN ('driver', 'provider'));

-- 3. Ensure RLS for 'canceled' status
DROP POLICY IF EXISTS "Customers see own requests" ON assistance_requests;
CREATE POLICY "Customers see own requests" ON assistance_requests FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Providers see open or assigned requests" ON assistance_requests;
CREATE POLICY "Providers see open or assigned requests" ON assistance_requests FOR SELECT 
USING (
  (status IN ('searching', 'bidding') AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'provider'))
  OR (provider_id = auth.uid())
);

-- 4. Re-grant all permissions to ensure the app can update the new columns
GRANT ALL ON TABLE assistance_requests TO authenticated;
GRANT ALL ON TABLE assistance_bids TO authenticated;
GRANT ALL ON TABLE profiles TO authenticated;

-- 5. RELOAD SCHEMA
NOTIFY pgrst, 'reload schema';
