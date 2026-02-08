-- Migration: Add language support to users table
-- Run this in your Supabase SQL Editor

-- Add preferred_language column to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'en';

-- Add constraint to ensure valid language codes
ALTER TABLE users
ADD CONSTRAINT check_preferred_language 
CHECK (preferred_language IN ('en', 'de', 'it', 'ur', 'ar'));

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_users_preferred_language ON users(preferred_language);

-- Update existing users to have default language
UPDATE users
SET preferred_language = 'en'
WHERE preferred_language IS NULL;
