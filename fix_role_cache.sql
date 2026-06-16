-- VIYEKO: FINAL ROLE COLUMN FIX
-- Fixes the 400 Bad Request on the profiles table by ensuring the role column exists.

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'driver';

-- Grant access to make sure the API can read it
GRANT SELECT, UPDATE, INSERT ON TABLE profiles TO authenticated, anon;

-- Force the API layer to reload the schema and recognize the new column
NOTIFY pgrst, 'reload schema';
