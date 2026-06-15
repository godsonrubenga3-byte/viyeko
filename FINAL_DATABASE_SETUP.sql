-- ==========================================
-- VIYEKO: CONSOLIDATED DATABASE SETUP
-- ==========================================
-- This file contains EVERYTHING needed to set up the Supabase DB
-- Includes: Tables, Marketplace Columns, and RLS Policies

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. TABLES

-- Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT,
  is_online BOOLEAN DEFAULT false,
  rating DECIMAL(3,2) DEFAULT 5.0,
  total_jobs INTEGER DEFAULT 0,
  current_location JSONB,
  vehicles JSONB DEFAULT '[]'::jsonb, -- Added for Objective 3
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Assistance Requests Table (The Core Marketplace Ledger)
CREATE TABLE IF NOT EXISTS assistance_requests (
  id TEXT PRIMARY KEY,
  service_id TEXT NOT NULL,
  addon_ids JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'searching',
  location JSONB NOT NULL,
  timestamp BIGINT NOT NULL,
  vehicle_info TEXT,
  notes TEXT,
  estimated_arrival INTEGER DEFAULT 15,
  total_cost INTEGER DEFAULT 0,
  user_id UUID, -- References auth.users(id) but kept loose for Dev Mode
  provider_id UUID REFERENCES profiles(id),
  bids JSONB DEFAULT '[]'::jsonb,
  accepted_bid_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. REALTIME CONFIGURATION
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;

ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE assistance_requests;

-- 4. ROW LEVEL SECURITY (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE assistance_requests ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Assistance Requests Policies (Flexible for Marketplace + Dev Mode)
DROP POLICY IF EXISTS "Enable insert for all users" ON assistance_requests;
DROP POLICY IF EXISTS "Enable select for users and providers" ON assistance_requests;
DROP POLICY IF EXISTS "Enable update for owners and providers" ON assistance_requests;

-- Allow INSERT for everyone (Supports Dev Mode and Auth users)
CREATE POLICY "Enable insert for all users" 
ON assistance_requests FOR INSERT 
WITH CHECK (true); 

-- Allow SELECT for owners and garages
CREATE POLICY "Enable select for users and providers" 
ON assistance_requests FOR SELECT 
USING (
  auth.uid() = user_id 
  OR status = 'searching' 
  OR status = 'bidding'
  OR auth.uid() = provider_id
);

-- Allow UPDATE for owners and providers
CREATE POLICY "Enable update for owners and providers" 
ON assistance_requests FOR UPDATE 
USING (auth.uid() = user_id OR auth.uid() = provider_id)
WITH CHECK (auth.uid() = user_id OR auth.uid() = provider_id);

-- 5. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_requests_status ON assistance_requests(status);
CREATE INDEX IF NOT EXISTS idx_profiles_online ON profiles(is_online);

-- 6. FORCE SCHEMA CACHE RELOAD
NOTIFY pgrst, 'reload schema';

-- Verification Audit
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'assistance_requests';
