-- # VIYEKO FULL SCHEMA MIGRATION (Marketplace Edition)
-- Copy and paste this into your Supabase SQL Editor

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. TABLES

-- Profiles Table (Users & Providers)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT,
  is_online BOOLEAN DEFAULT false,
  rating DECIMAL(3,2) DEFAULT 5.0,
  total_jobs INTEGER DEFAULT 0,
  current_location JSONB, -- { lat: number, lng: number }
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Assistance Requests Table (Dynamic Marketplace Ledger)
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
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  provider_id UUID REFERENCES profiles(id),
  bids JSONB DEFAULT '[]'::jsonb, -- Store live quotes here
  accepted_bid_id TEXT, -- The ID of the bid the driver selected
  last_updated_by TEXT, -- Tracks who made the latest change ('driver' or 'provider')
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
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

ALTER TABLE assistance_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own requests" ON assistance_requests FOR SELECT USING (auth.uid() = user_id OR auth.uid() = provider_id);
CREATE POLICY "Users can insert own requests" ON assistance_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Providers can view searching requests" ON assistance_requests FOR SELECT USING (status = 'searching' OR status = 'bidding');
CREATE POLICY "Users can update own requests" ON assistance_requests FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = provider_id);

-- 5. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_requests_user ON assistance_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON assistance_requests(status);
CREATE INDEX IF NOT EXISTS idx_profiles_online ON profiles(is_online);
