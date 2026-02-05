-- Quick SQL to check if omer@ska.com is an admin
-- Run this in Supabase SQL Editor

SELECT 
  id,
  email,
  is_admin,
  id_verified,
  profile_active,
  created_at
FROM users
WHERE email = 'omer@ska.com';

-- If you want to set this user as admin (if not already):
-- UPDATE users
-- SET is_admin = true
-- WHERE email = 'omer@ska.com';
