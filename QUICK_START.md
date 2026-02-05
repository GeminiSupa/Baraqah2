# Quick Start Guide - Supabase Setup

## Step 1: Create Database Tables

1. Open Supabase Dashboard: https://supabase.com/dashboard/project/gnyzefdmxlrhfmbaafln
2. Go to **SQL Editor** → **New Query**
3. Copy entire content from `supabase-migration.sql`
4. Click **Run** (or press Cmd/Ctrl + Enter)
5. Verify tables created in **Table Editor**

## Step 2: Configure Environment

Create `.env.local` file:

```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.gnyzefdmxlrhfmbaafln.supabase.co:5432/postgres"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"
NEXT_PUBLIC_SUPABASE_URL="https://gnyzefdmxlrhfmbaafln.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdueXplZmRteGxyaGZtYmFhZmxuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2OTAwNTMsImV4cCI6MjA4NDI2NjA1M30.6eT0lf5RoB1HoVcGwFpDZdDF7M119vX456PAO70oq8w"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdueXplZmRteGxyaGZtYmFhZmxuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODY5MDA1MywiZXhwIjoyMDg0MjY2MDUzfQ.IzqX0jnj5DW5iO6P1GFmvRoDFbDqWuaCNWw5ekl9hio"
```

**Get database password**: Supabase Dashboard → Settings → Database → Connection String

## Step 3: Start Development Server

```bash
npm run dev
```

## Step 4: Test the Application

1. Open http://localhost:3000
2. Register a new account at `/register`
3. Verify email/phone at `/verify`
4. Upload ID document at `/id-verification`
5. Create profile at `/profile/create`
6. Browse profiles at `/browse`
7. Test messaging at `/messaging`

## Troubleshooting

### Tables not found
- Run the migration SQL script again
- Check Table Editor to verify tables exist

### Authentication errors
- Verify `NEXTAUTH_SECRET` is set
- Check session cookies in browser DevTools

### Permission errors
- RLS policies may be blocking access
- Temporarily disable RLS for testing:
  ```sql
  ALTER TABLE users DISABLE ROW LEVEL SECURITY;
  ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
  ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
  ```

## Next Steps

- Review `TESTING_GUIDE.md` for detailed API testing
- Check `SUPABASE_TABLES.md` for table structure reference
- Adjust RLS policies as needed for production
