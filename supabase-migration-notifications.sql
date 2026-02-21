-- Migration: Persistent in-app notifications
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'message', 'request', 'request_approved', 'request_rejected', 'questionnaire', 'questionnaire_answered'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  dedupe_key TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- If the table already existed from an older attempt, add any missing columns
ALTER TABLE notifications
  ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS dedupe_key TEXT,
  ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS read_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE UNIQUE INDEX IF NOT EXISTS idx_notifications_user_dedupe ON notifications(user_id, dedupe_key) WHERE dedupe_key IS NOT NULL;

-- Enable RLS (optional; API routes use service role anyway)
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Notifications are viewable by owner" ON notifications;
DROP POLICY IF EXISTS "Notifications are updatable by owner" ON notifications;

CREATE POLICY "Notifications are viewable by owner" ON notifications
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Notifications are updatable by owner" ON notifications
  FOR UPDATE USING (auth.uid()::text = user_id::text);

