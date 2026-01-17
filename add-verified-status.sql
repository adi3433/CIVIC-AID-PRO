-- Add "verified" status to the reports table
-- Run this SQL in your Supabase SQL Editor

-- First, check the current constraint on the status column
-- Then alter it to include 'verified'

-- Drop the existing check constraint (if it exists)
ALTER TABLE reports DROP CONSTRAINT IF EXISTS reports_status_check;

-- Add new check constraint with 'verified' status
ALTER TABLE reports ADD CONSTRAINT reports_status_check 
  CHECK (status IN ('reported', 'in_progress', 'resolved', 'verified'));

-- Verify the change
SELECT constraint_name, check_clause 
FROM information_schema.check_constraints 
WHERE constraint_name = 'reports_status_check';
