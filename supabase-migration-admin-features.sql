-- Migration: Add admin features (reports, user suspension)
-- Run this in your Supabase SQL Editor

-- Reports table for user reports
CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  reporter_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reported_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'reviewed', 'resolved', 'dismissed'
  admin_notes TEXT,
  reviewed_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User suspension/status tracking
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS suspension_reason TEXT,
ADD COLUMN IF NOT EXISTS suspended_by TEXT REFERENCES users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS suspended_until TIMESTAMP WITH TIME ZONE;

-- Profile moderation status
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS moderation_status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
ADD COLUMN IF NOT EXISTS moderation_notes TEXT,
ADD COLUMN IF NOT EXISTS moderated_by TEXT REFERENCES users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMP WITH TIME ZONE;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_reports_reporter_id ON reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_reports_reported_user_id ON reports(reported_user_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_users_is_suspended ON users(is_suspended);
CREATE INDEX IF NOT EXISTS idx_profiles_moderation_status ON profiles(moderation_status);

-- Enable RLS for reports
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Drop policy if it exists, then create it
DROP POLICY IF EXISTS "Reports are viewable by admins and reporters" ON reports;

-- RLS policy for reports (admins can see all, users can see their own reports)
CREATE POLICY "Reports are viewable by admins and reporters" ON reports
  FOR SELECT USING (
    auth.uid()::text IN (
      SELECT id FROM users WHERE is_admin = true
    ) OR 
    auth.uid()::text = reporter_id
  );
