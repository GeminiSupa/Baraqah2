-- Migration: Add questionnaire fields and custom questionnaire system
-- Run this in your Supabase SQL Editor after the initial migration

-- Add questionnaire fields to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS marriage_understanding TEXT,
ADD COLUMN IF NOT EXISTS life_goals TEXT,
ADD COLUMN IF NOT EXISTS religious_practice_importance TEXT,
ADD COLUMN IF NOT EXISTS children_preference TEXT,
ADD COLUMN IF NOT EXISTS partner_traits TEXT,
ADD COLUMN IF NOT EXISTS marriage_roles TEXT,
ADD COLUMN IF NOT EXISTS work_life_balance TEXT,
ADD COLUMN IF NOT EXISTS conflict_resolution TEXT,
ADD COLUMN IF NOT EXISTS happy_home_vision TEXT,
ADD COLUMN IF NOT EXISTS deal_breakers TEXT,
ADD COLUMN IF NOT EXISTS spiritual_growth TEXT,
ADD COLUMN IF NOT EXISTS hobbies_interests TEXT;

-- Add connection_status to message_requests table
ALTER TABLE message_requests
ADD COLUMN IF NOT EXISTS connection_status TEXT DEFAULT 'pending';

-- Create custom_questionnaires table
CREATE TABLE IF NOT EXISTS custom_questionnaires (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  request_id TEXT NOT NULL REFERENCES message_requests(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for custom_questionnaires
CREATE INDEX IF NOT EXISTS idx_custom_questionnaires_request_id ON custom_questionnaires(request_id);
CREATE INDEX IF NOT EXISTS idx_custom_questionnaires_sender_id ON custom_questionnaires(sender_id);
CREATE INDEX IF NOT EXISTS idx_custom_questionnaires_receiver_id ON custom_questionnaires(receiver_id);
CREATE INDEX IF NOT EXISTS idx_message_requests_connection_status ON message_requests(connection_status);

-- Enable RLS for custom_questionnaires
ALTER TABLE custom_questionnaires ENABLE ROW LEVEL SECURITY;

-- Drop policy if it exists, then create it
DROP POLICY IF EXISTS "Custom questionnaires are viewable by participants" ON custom_questionnaires;

-- RLS policy for custom_questionnaires
CREATE POLICY "Custom questionnaires are viewable by participants" ON custom_questionnaires
  FOR SELECT USING (
    auth.uid()::text = sender_id OR 
    auth.uid()::text = receiver_id
  );
