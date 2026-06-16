-- VIYEKO: ROLE-BASED ACCESS CONTROL MIGRATION
-- Adds the 'role' column to profiles to support strict UI routing

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS role TEXT CHECK (role IN ('driver', 'provider')) DEFAULT 'driver';

-- Force cache reload
NOTIFY pgrst, 'reload schema';
