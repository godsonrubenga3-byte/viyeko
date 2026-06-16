-- VIYEKO: BIDS RACE CONDITION MITIGATION
-- Migrates bids from a JSONB array to a strict relational table.

-- 1. Create the dedicated bids table
CREATE TABLE IF NOT EXISTS assistance_bids (
  id TEXT PRIMARY KEY,
  request_id TEXT REFERENCES assistance_requests(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  provider_name TEXT NOT NULL,
  price INTEGER NOT NULL,
  eta INTEGER NOT NULL,
  rating DECIMAL(3,2) DEFAULT 5.0,
  timestamp BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Enable RLS
ALTER TABLE assistance_bids ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
-- Drivers can read bids for their own requests
CREATE POLICY "Drivers can view bids on their requests" 
ON assistance_bids FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM assistance_requests 
    WHERE assistance_requests.id = assistance_bids.request_id 
    AND assistance_requests.user_id = auth.uid()
  )
);

-- Providers can read their own bids
CREATE POLICY "Providers can view their own bids" 
ON assistance_bids FOR SELECT 
USING (provider_id = auth.uid());

-- Providers can insert bids
CREATE POLICY "Providers can create bids" 
ON assistance_bids FOR INSERT 
WITH CHECK (provider_id = auth.uid());

-- Allow Dev Mode/Anon testing (Temporary for testing)
CREATE POLICY "Enable read for all" ON assistance_bids FOR SELECT USING (true);
CREATE POLICY "Enable insert for all" ON assistance_bids FOR INSERT WITH CHECK (true);

-- 4. Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE assistance_bids;

-- 5. Reload Schema
NOTIFY pgrst, 'reload schema';
