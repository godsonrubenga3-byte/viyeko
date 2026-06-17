-- ==========================================
-- VIYEKO: DATABASE ROBUSTNESS FIX
-- ==========================================

-- 1. Ensure user_id defaults to the current user
-- This allows the frontend to omit the user_id and let the DB handle it securely
ALTER TABLE assistance_requests ALTER COLUMN user_id SET DEFAULT auth.uid();

-- 2. Relax the INSERT policy slightly to ensure it works even if user_id is null in the request
-- (Since the default will be applied before the check)
DROP POLICY IF EXISTS "Customers can insert own requests" ON assistance_requests;
CREATE POLICY "Customers can insert own requests" ON assistance_requests FOR INSERT 
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- 3. Ensure last_updated_by exists (from previous step)
ALTER TABLE assistance_requests 
ADD COLUMN IF NOT EXISTS last_updated_by TEXT CHECK (last_updated_by IN ('driver', 'provider'));

-- 4. Fix profiles RLS to be more robust
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT 
WITH CHECK (auth.uid() = id OR id IS NULL);

ALTER TABLE profiles ALTER COLUMN id SET DEFAULT auth.uid();

-- 5. RELOAD SCHEMA
NOTIFY pgrst, 'reload schema';
