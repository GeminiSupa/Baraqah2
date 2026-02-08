-- Migration: Add religious_background field to profiles table
-- Run this in your Supabase SQL Editor

-- Add religious_background column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS religious_background TEXT;

-- Add comment to explain the field
COMMENT ON COLUMN profiles.religious_background IS 'Religious background: Muslim, Non-religious, Other, or NULL';

-- Create index for filtering
CREATE INDEX IF NOT EXISTS idx_profiles_religious_background ON profiles(religious_background);
