-- VIYEKO: ADD PHONE COLUMN TO PROFILES
-- Fixes the 400 Bad Request when registering a new user

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;

-- Reload schema cache
NOTIFY pgrst, 'reload schema';
