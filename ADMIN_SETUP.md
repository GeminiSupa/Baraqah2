# Admin Account Setup Guide

## Overview
The admin system allows designated administrators to review and approve/reject ID document verifications through a web interface.

## Setup Steps

### 1. Run Database Migration
First, run the admin migration SQL file in your Supabase SQL Editor:

```sql
-- File: supabase-migration-admin.sql
-- This adds the is_admin field to the users table
```

### 2. Set Up Your First Admin Account

You have two options to set up an admin account:

#### Option A: Direct SQL (Recommended for First Admin)
Run this SQL in Supabase SQL Editor, replacing the email with your admin email:

```sql
UPDATE users 
SET is_admin = true 
WHERE email = 'your-admin-email@example.com';
```

#### Option B: Using the API Endpoint
If you set an `ADMIN_SETUP_TOKEN` environment variable, you can use the API:

```bash
curl -X POST http://localhost:3000/api/admin/set-admin \
  -H "Content-Type: application/json" \
  -d '{
    "token": "your-admin-setup-token",
    "email": "admin@example.com",
    "isAdmin": true
  }'
```

Add to your `.env.local`:
```
ADMIN_SETUP_TOKEN=your-secret-token-here
```

### 3. Access Admin Dashboard
1. Log in with your admin account
2. Navigate to `/admin` or click the "Admin" link in the navigation (visible only to admins)
3. You'll see all pending ID verifications

### 4. Verify ID Documents
- View uploaded ID documents (images or PDFs)
- Review user information (email, phone, verification status)
- Click "Approve Verification" to approve
- Click "Reject Verification" to reject

## Security Notes

- Only users with `is_admin = true` can access the admin dashboard
- Admin API endpoints check for admin status before allowing access
- ID documents are only accessible to admins after upload
- Consider adding additional security measures in production:
  - IP whitelisting for admin routes
  - Two-factor authentication for admin accounts
  - Audit logging for admin actions

## Privacy Notice
ID documents are securely stored and only used for verification purposes. Once verified, access to documents is restricted to administrators only. All documents are handled in accordance with privacy regulations.
