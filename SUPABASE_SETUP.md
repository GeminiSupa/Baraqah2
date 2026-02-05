# Supabase Setup Guide

This guide will help you connect the Shadi Khana Abadi matrimony platform to your Supabase database.

## Supabase Project Information

- **Project ID**: `gnyzefdmxlrhfmbaafln`
- **Project URL**: `https://gnyzefdmxlrhfmbaafln.supabase.co`
- **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdueXplZmRteGxyaGZtYmFhZmxuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2OTAwNTMsImV4cCI6MjA4NDI2NjA1M30.6eT0lf5RoB1HoVcGwFpDZdDF7M119vX456PAO70oq8w`
- **Service Role Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdueXplZmRteGxyaGZtYmFhZmxuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODY5MDA1MywiZXhwIjoyMDg0MjY2MDUzfQ.IzqX0jnj5DW5iO6P1GFmvRoDFbDqWuaCNWw5ekl9hio`

## Step 1: Get Your Database Password

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/gnyzefdmxlrhfmbaafln
2. Navigate to **Settings** > **Database**
3. Under "Connection String", you'll see your connection string format
4. If you don't have the password or need to reset it:
   - Click "Reset Database Password" 
   - Copy the new password (you'll only see it once!)

## Step 2: Create Environment File

Create a `.env.local` file in the root directory of your project:

```env
# Database - Supabase PostgreSQL
# Replace [YOUR-DATABASE-PASSWORD] with the password from Step 1
DATABASE_URL="postgresql://postgres:[YOUR-DATABASE-PASSWORD]@db.gnyzefdmxlrhfmbaafln.supabase.co:5432/postgres"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-this-with: openssl rand -base64 32"

# Supabase Keys (already provided)
NEXT_PUBLIC_SUPABASE_URL="https://gnyzefdmxlrhfmbaafln.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdueXplZmRteGxyaGZtYmFhZmxuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2OTAwNTMsImV4cCI6MjA4NDI2NjA1M30.6eT0lf5RoB1HoVcGwFpDZdDF7M119vX456PAO70oq8w"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdueXplZmRteGxyaGZtYmFhZmxuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODY5MDA1MywiZXhwIjoyMDg0MjY2MDUzfQ.IzqX0jnj5DW5iO6P1GFmvRoDFbDqWuaCNWw5ekl9hio"

# File Upload
UPLOAD_DIR="./public/uploads"
MAX_FILE_SIZE=5242880
```

## Step 3: Generate NEXTAUTH_SECRET

Run this command in your terminal to generate a secure secret:

```bash
openssl rand -base64 32
```

Copy the output and use it as your `NEXTAUTH_SECRET` value.

## Step 4: Initialize Prisma with Supabase

1. Install dependencies:
```bash
npm install
```

2. Generate Prisma Client:
```bash
npx prisma generate
```

3. Push the schema to your Supabase database:
```bash
npx prisma db push
```

This will create all the necessary tables in your Supabase database.

## Step 5: Verify Database Connection

You can verify your connection by:

1. Running Prisma Studio:
```bash
npx prisma studio
```

This will open a web interface where you can view and manage your database.

2. Or check in Supabase Dashboard:
   - Go to **Table Editor** in your Supabase dashboard
   - You should see tables like: User, Profile, Photo, Message, MessageRequest

## Step 6: Start Development Server

```bash
npm run dev
```

Your application should now be connected to Supabase!

## Connection String Format

The Supabase PostgreSQL connection string follows this format:

```
postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres
```

For your project, it's:
```
postgresql://postgres:[YOUR-PASSWORD]@db.gnyzefdmxlrhfmbaafln.supabase.co:5432/postgres
```

## Troubleshooting

### "Connection refused" or "Authentication failed"
- Double-check your database password in `.env.local`
- Make sure there are no extra spaces in the connection string
- Try resetting your database password in Supabase Dashboard

### "Schema not found"
- Run `npx prisma db push` to create the schema
- Check that the connection string is correct

### "Table does not exist"
- Run `npx prisma db push` again
- Check Prisma schema file: `prisma/schema.prisma`

## Next Steps

Once connected:
1. Test user registration at `/register`
2. Upload ID documents at `/id-verification`
3. Create profiles at `/profile/create`
4. Browse profiles at `/browse`
5. Test messaging at `/messaging`

## Security Notes

- **Never commit `.env.local` to git** - it's already in `.gitignore`
- **Keep your database password secure**
- **Service Role Key** has admin access - never expose it in client-side code
- **Anon Key** is safe for client-side use