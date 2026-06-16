-- MIGRATION: ADD TRACKING FOR STATUS UPDATES
-- Run this in your Supabase SQL Editor

ALTER TABLE assistance_requests 
ADD COLUMN IF NOT EXISTS last_updated_by TEXT CHECK (last_updated_by IN ('driver', 'provider'));

-- Update RLS policies to allow updating this column
-- (Current policies already allow updates by owner or provider, so no changes needed)

NOTIFY pgrst, 'reload schema';
