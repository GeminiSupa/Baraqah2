# Troubleshooting Admin Login Issues

## Issue: "Invalid email or password" for admin account

If you've set `omer@ska.com` as an admin but can't log in, follow these steps:

### Step 1: Verify the User Exists

Check if the user exists in the database by visiting:
```
http://localhost:3000/api/admin/check-user?email=omer@ska.com
```

Or use this SQL query in Supabase:
```sql
SELECT id, email, is_admin, created_at 
FROM users 
WHERE email = 'omer@ska.com';
```

### Step 2: Check if User Has a Password

The user must have a password set. If you only set `is_admin = true` but the user doesn't exist or doesn't have a password, you need to:

**Option A: Create the user through registration**
1. Go to `/register`
2. Register with `omer@ska.com` and set a password
3. Then set admin status:
```sql
UPDATE users 
SET is_admin = true 
WHERE email = 'omer@ska.com';
```

**Option B: Create user directly in database (if you know the password hash)**
```sql
-- This requires you to hash the password first
-- Better to use Option A
```

### Step 3: Reset Password (if user exists but password is wrong)

If the user exists but you don't know the password, you can:

1. **Use the registration page** - If the email isn't taken, register again
2. **Or manually set password** (requires password hashing):
```sql
-- You'll need to hash the password using bcrypt
-- This is complex, so better to register through the app
```

### Step 4: Verify Admin Status

After ensuring the user exists and has a password, verify admin status:
```sql
SELECT email, is_admin, id_verified, profile_active 
FROM users 
WHERE email = 'omer@ska.com';
```

Should show:
- `is_admin = true`
- User has a password (not null)

### Step 5: Try Login Again

1. Make sure you're using the exact email: `omer@ska.com` (case doesn't matter now)
2. Use the password you set during registration
3. If still not working, check browser console for errors

## Quick Fix: Re-register as Admin

The easiest solution:

1. **Register the account**:
   - Go to `/register`
   - Email: `omer@ska.com`
   - Set a password you'll remember
   - Complete registration

2. **Set as admin**:
   ```sql
   UPDATE users 
   SET is_admin = true 
   WHERE email = 'omer@ska.com';
   ```

3. **Login**:
   - Go to `/login`
   - Use `omer@ska.com` and your password
   - You should now see the "Admin" link in navigation

## Common Issues

1. **User doesn't exist**: Setting `is_admin = true` on a non-existent user won't create the user
2. **No password**: User must have a password to log in
3. **Email case**: Now fixed - email matching is case-insensitive
4. **Wrong password**: Make sure you're using the correct password

## Need Help?

If still having issues, check:
- Browser console for errors
- Server logs for authentication errors
- Database to confirm user exists and has password
