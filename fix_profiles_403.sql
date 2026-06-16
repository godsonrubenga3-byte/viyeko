-- ==========================================
-- VIYEKO: PROFILE PERMISSIONS & RLS FIX
-- ==========================================
-- This script ensures that authenticated users have the necessary permissions
-- to create and update their own profiles, fixing the 403 Forbidden error.

-- 1. GRANT BASIC PERMISSIONS
-- Even with RLS, the database roles need basic table permissions.
GRANT SELECT, INSERT, UPDATE ON TABLE profiles TO authenticated;
GRANT SELECT ON TABLE profiles TO anon;

-- 2. RE-ENABLE RLS (Just in case)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 3. DROP AND RE-CREATE POLICIES (With optimized logic)
-- We drop everything first to ensure a clean state
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Provider profiles are public" ON profiles;
DROP POLICY IF EXISTS "Providers can see current customer profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;

-- Allow users to see their own profile
CREATE POLICY "Users can read own profile" 
ON profiles FOR SELECT 
TO authenticated
USING (auth.uid() = id);

-- Allow public viewing of provider profiles
CREATE POLICY "Provider profiles are public" 
ON profiles FOR SELECT 
USING (role = 'provider');

-- Allow authenticated users to INSERT their own profile
-- This is critical for onboarding
CREATE POLICY "Users can insert own profile" 
ON profiles FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = id);

-- Allow users to UPDATE their own profile
CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE 
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 4. RELOAD SCHEMA CACHE
NOTIFY pgrst, 'reload schema';
