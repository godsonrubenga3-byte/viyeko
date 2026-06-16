-- VIYEKO: PROFILES RLS FIX
-- Fixes the 403 Forbidden and 406 Not Acceptable errors on the profiles table

-- 1. Ensure the table has RLS enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing restrictive policies to start fresh
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Enable select for authenticated users" ON profiles;

-- 3. Create flexible policies to allow the AuthContext fallback to work
-- Allow users to read their own profile (or all if you need public directory)
CREATE POLICY "Users can read own profile" 
ON profiles FOR SELECT 
USING (auth.uid() = id);

-- Allow authenticated users to INSERT their own profile
CREATE POLICY "Users can insert own profile" 
ON profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Allow authenticated users to UPDATE their own profile
CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id);

-- 4. Reload cache
NOTIFY pgrst, 'reload schema';
