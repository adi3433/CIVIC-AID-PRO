-- Report Interactions Table for Upvotes/Downvotes
-- Run this SQL in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS report_interactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('upvote', 'downvote')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Prevent duplicate interactions: one user can only have one type of interaction per report
  UNIQUE(report_id, user_id, interaction_type)
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_report_interactions_report_id ON report_interactions(report_id);
CREATE INDEX IF NOT EXISTS idx_report_interactions_user_id ON report_interactions(user_id);

-- RLS Policies
ALTER TABLE report_interactions ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert their own interactions
CREATE POLICY "Users can create their own interactions"
  ON report_interactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow everyone to view interactions (for vote counts)
CREATE POLICY "Anyone can view interactions"
  ON report_interactions
  FOR SELECT
  TO public
  USING (true);

-- Allow users to delete their own interactions (for changing votes)
CREATE POLICY "Users can delete their own interactions"
  ON report_interactions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_report_interactions_updated_at
  BEFORE UPDATE ON report_interactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
