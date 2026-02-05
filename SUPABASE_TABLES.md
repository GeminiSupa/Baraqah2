# Supabase Database Setup Guide

## Step 1: Create Tables in Supabase

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/gnyzefdmxlrhfmbaafln
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the entire contents of `supabase-migration.sql`
5. Click **Run** to execute the SQL script

This will create all necessary tables:
- `users` - User accounts and authentication
- `accounts` - NextAuth account linking
- `sessions` - NextAuth sessions
- `verification_tokens` - NextAuth verification tokens
- `profiles` - User profiles/portfolios
- `photos` - Profile photos
- `message_requests` - Message request approval system
- `messages` - In-app messages

## Step 2: Verify Tables Created

After running the migration:
1. Go to **Table Editor** in Supabase Dashboard
2. You should see all 8 tables listed
3. Click on each table to verify the columns are correct

## Step 3: Configure Row Level Security (RLS)

The migration script includes basic RLS policies. You may need to adjust these based on your needs:

- **Users**: Can read their own data
- **Profiles**: Public profiles are viewable by authenticated users
- **Messages**: Only sender/receiver can view messages
- **Message Requests**: Only sender/receiver can view requests

## Step 4: Test Connection

Once tables are created, test the connection:
1. Make sure your `.env.local` has the correct `DATABASE_URL`
2. Run `npm run dev`
3. Try registering a new user at `/register`

## Troubleshooting

### "relation does not exist" error
- Make sure you ran the migration script in Supabase SQL Editor
- Check that all tables were created in Table Editor

### "permission denied" error
- Check RLS policies - you may need to adjust them
- For development, you can temporarily disable RLS on specific tables

### Column name errors
- Supabase uses snake_case (e.g., `user_id`, `first_name`)
- The code has been updated to use snake_case

## Table Structure Reference

### users
- id (TEXT, PRIMARY KEY)
- email (TEXT, UNIQUE)
- phone (TEXT, UNIQUE, nullable)
- password (TEXT)
- email_verified (BOOLEAN)
- phone_verified (BOOLEAN)
- id_verified (BOOLEAN)
- id_document_url (TEXT, nullable)
- profile_active (BOOLEAN)
- created_at, updated_at (TIMESTAMP)

### profiles
- id (TEXT, PRIMARY KEY)
- user_id (TEXT, UNIQUE, FOREIGN KEY → users.id)
- first_name, last_name (TEXT)
- age (INTEGER)
- gender (TEXT)
- bio, education, profession, location (TEXT, nullable)
- sect_preference, prayer_practice, hijab_preference (TEXT, nullable)
- photo_privacy, profile_visibility (TEXT)
- created_at, updated_at (TIMESTAMP)

### photos
- id (TEXT, PRIMARY KEY)
- profile_id (TEXT, FOREIGN KEY → profiles.id)
- url (TEXT)
- is_primary (BOOLEAN)
- privacy (TEXT)
- created_at (TIMESTAMP)

### message_requests
- id (TEXT, PRIMARY KEY)
- sender_id (TEXT, FOREIGN KEY → users.id)
- receiver_id (TEXT, FOREIGN KEY → users.id)
- status (TEXT) - 'pending', 'approved', 'rejected'
- message (TEXT, nullable)
- created_at, updated_at (TIMESTAMP)

### messages
- id (TEXT, PRIMARY KEY)
- sender_id (TEXT, FOREIGN KEY → users.id)
- receiver_id (TEXT, FOREIGN KEY → users.id)
- content (TEXT)
- is_read (BOOLEAN)
- created_at (TIMESTAMP)
