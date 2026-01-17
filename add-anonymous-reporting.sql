-- Add Anonymous Reporting Feature to Civicaid Platform
-- Run this SQL in your Supabase SQL Editor

-- Step 1: Add is_anonymous column to profiles table (user preference)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT false;

-- Step 2: Add is_anonymous column to reports table (per-report flag)
ALTER TABLE reports 
ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT false;

-- Step 3: Create index for faster queries on anonymous reports
CREATE INDEX IF NOT EXISTS idx_reports_is_anonymous ON reports(is_anonymous);

-- Step 4: Add comment for documentation
COMMENT ON COLUMN profiles.is_anonymous IS 'User preference for anonymous reporting mode';
COMMENT ON COLUMN reports.is_anonymous IS 'Whether this specific report was submitted anonymously';

-- Verify the changes
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns
WHERE table_name IN ('profiles', 'reports') 
  AND column_name = 'is_anonymous';
