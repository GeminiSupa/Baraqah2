# How to Run the SQL Migration

## Important: Make sure you're copying SQL, not TypeScript!

The error you're seeing (`import { NextRequest, NextResponse }`) means you accidentally copied TypeScript code from an API route file instead of the SQL migration file.

## Step-by-Step Instructions

### Step 1: Open Supabase SQL Editor
1. Go to: https://supabase.com/dashboard/project/gnyzefdmxlrhfmbaafln
2. Click **SQL Editor** in the left sidebar
3. Click **New Query** button

### Step 2: Copy the Correct SQL File
**Option A: Use the simple version (recommended for first time)**
- Open the file: `supabase-migration-simple.sql` in your project folder
- Select ALL the content (Cmd/Ctrl + A)
- Copy it (Cmd/Ctrl + C)

**Option B: Use the full version with RLS policies**
- Open the file: `supabase-migration.sql` in your project folder
- Select ALL the content (Cmd/Ctrl + A)
- Copy it (Cmd/Ctrl + C)

### Step 3: Paste in Supabase SQL Editor
- Click in the SQL Editor text area
- Paste (Cmd/Ctrl + V)
- Make sure you see SQL statements like `CREATE TABLE`, not `import` statements

### Step 4: Run the SQL
- Click the **Run** button (or press Cmd/Ctrl + Enter)
- Wait for "Success" message

### Step 5: Verify Tables Were Created
1. Click **Table Editor** in the left sidebar
2. You should see 8 tables:
   - users
   - accounts
   - sessions
   - verification_tokens
   - profiles
   - photos
   - message_requests
   - messages

## What the SQL File Should Look Like

The file should START with:
```sql
-- Supabase Database Migration Script
-- Run this in your Supabase SQL Editor to create all tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

**NOT**:
```typescript
import { NextRequest, NextResponse } from 'next/server'
```

## Quick Check

Before pasting in Supabase, verify:
- ✅ File starts with `--` (SQL comments) or `CREATE`
- ❌ File does NOT start with `import` or `export`
- ✅ Contains words like `CREATE TABLE`, `ALTER TABLE`
- ❌ Does NOT contain `NextRequest`, `NextResponse`, `async function`

## If You Still Get Errors

1. Make sure you selected the **entire** SQL file content
2. Don't copy from a TypeScript file (.ts) - only from .sql file
3. Try using `supabase-migration-simple.sql` first (no RLS policies)
4. Run the SQL statements one section at a time if needed
