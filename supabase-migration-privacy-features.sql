-- Migration: Privacy features (blocked users, granular privacy settings)
-- Run this in your Supabase SQL Editor

-- Blocked users table
CREATE TABLE IF NOT EXISTS blocked_users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  blocker_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blocked_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(blocker_id, blocked_id)
);

CREATE INDEX IF NOT EXISTS idx_blocked_users_blocker ON blocked_users(blocker_id);
CREATE INDEX IF NOT EXISTS idx_blocked_users_blocked ON blocked_users(blocked_id);

-- Privacy settings table
CREATE TABLE IF NOT EXISTS privacy_settings (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  profile_visibility TEXT DEFAULT 'public', -- 'public', 'private', 'verified-only'
  photo_privacy TEXT DEFAULT 'private', -- 'public', 'private', 'connections-only'
  questionnaire_privacy TEXT DEFAULT 'private', -- 'public', 'private', 'connections-only'
  hide_from_search BOOLEAN DEFAULT FALSE,
  show_online_status BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_privacy_settings_user ON privacy_settings(user_id);

-- Favorites table
CREATE TABLE IF NOT EXISTS favorites (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  favorite_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, favorite_user_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_favorite ON favorites(favorite_user_id);
