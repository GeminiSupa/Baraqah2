-- Migration: Add admin role support
-- Run this in your Supabase SQL Editor

-- Add is_admin field to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Create index for admin queries
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON users(is_admin);

-- Optional: Set a specific user as admin (replace 'your-admin-email@example.com' with actual admin email)
-- UPDATE users SET is_admin = true WHERE email = 'your-admin-email@example.com';
