-- ==========================================
-- VIYEKO: CRITICAL SECURITY PATCH (STRICT PRIVACY)
-- ==========================================
-- This script fixes the data leak where users could see each other's requests and bids.
-- 1. Enables RLS on all tables.
-- 2. Restricts data visibility based on role (Customer vs Provider).
-- 3. Ensures only the request owner can see bids and accept them.

-- 1. ENSURE COLUMNS EXIST
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'driver';

-- 2. ENABLE ROW LEVEL SECURITY
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE assistance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE assistance_bids ENABLE ROW LEVEL SECURITY;

-- 3. DROP PERMISSIVE POLICIES
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Enable select for users and providers" ON assistance_requests;
DROP POLICY IF EXISTS "Enable insert for all users" ON assistance_requests;
DROP POLICY IF EXISTS "Enable update for owners and providers" ON assistance_requests;
DROP POLICY IF EXISTS "Enable read for all" ON assistance_bids;
DROP POLICY IF EXISTS "Enable insert for all" ON assistance_bids;
DROP POLICY IF EXISTS "Drivers can view bids on their requests" ON assistance_bids;
DROP POLICY IF EXISTS "Providers can view their own bids" ON assistance_bids;
DROP POLICY IF EXISTS "Providers can create bids" ON assistance_bids;
DROP POLICY IF EXISTS "Users can read connected profiles" ON profiles;
DROP POLICY IF EXISTS "Provider profiles are public" ON profiles;
DROP POLICY IF EXISTS "Providers can see current customer profile" ON profiles;
DROP POLICY IF EXISTS "Customers see own requests" ON assistance_requests;
DROP POLICY IF EXISTS "Providers see open or assigned requests" ON assistance_requests;
DROP POLICY IF EXISTS "Customers can insert own requests" ON assistance_requests;
DROP POLICY IF EXISTS "Update own or assigned requests" ON assistance_requests;
DROP POLICY IF EXISTS "Customers see bids for their requests" ON assistance_bids;
DROP POLICY IF EXISTS "Providers see own bids" ON assistance_bids;
DROP POLICY IF EXISTS "Providers can create own bids" ON assistance_bids;

-- 4. PROFILES POLICIES
-- Users can read their own profile
CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (auth.uid() = id);

-- Provider profiles are public (so customers can see who is bidding)
CREATE POLICY "Provider profiles are public" ON profiles FOR SELECT 
USING (role = 'provider');

-- Allow providers to see the profile of the customer they are currently bidding on or serving
CREATE POLICY "Providers can see current customer profile" ON profiles FOR SELECT 
USING (
  id IN (
    SELECT user_id FROM assistance_requests 
    WHERE provider_id = auth.uid() 
    OR (status IN ('searching', 'bidding') AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'provider'))
  )
);

-- Users can update/insert their own profile
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);


-- 5. ASSISTANCE REQUESTS POLICIES
-- Customers see ONLY their own requests
CREATE POLICY "Customers see own requests" ON assistance_requests FOR SELECT 
USING (auth.uid() = user_id);

-- Providers see open requests (searching/bidding) OR requests assigned to them
CREATE POLICY "Providers see open or assigned requests" ON assistance_requests FOR SELECT 
USING (
  (status IN ('searching', 'bidding') AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'provider'))
  OR (provider_id = auth.uid())
);

-- Only customers can create requests as themselves
CREATE POLICY "Customers can insert own requests" ON assistance_requests FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Requests can only be updated by the owner (customer) or the assigned provider
CREATE POLICY "Update own or assigned requests" ON assistance_requests FOR UPDATE 
USING (auth.uid() = user_id OR auth.uid() = provider_id)
WITH CHECK (auth.uid() = user_id OR auth.uid() = provider_id);


-- 6. ASSISTANCE BIDS POLICIES
-- Only the request owner can see bids for their request
CREATE POLICY "Customers see bids for their requests" ON assistance_bids FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM assistance_requests 
    WHERE assistance_requests.id = assistance_bids.request_id 
    AND assistance_requests.user_id = auth.uid()
  )
);

-- Providers see ONLY their own bids
CREATE POLICY "Providers see own bids" ON assistance_bids FOR SELECT 
USING (provider_id = auth.uid());

-- Only providers can create bids, and they must be the ones bidding
CREATE POLICY "Providers can create own bids" ON assistance_bids FOR INSERT 
WITH CHECK (
  provider_id = auth.uid() 
  AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'provider')
);

-- 7. FORCE SCHEMA RELOAD
NOTIFY pgrst, 'reload schema';

