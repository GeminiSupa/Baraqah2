# API Testing Guide

After creating tables in Supabase, test the API routes to ensure everything works correctly.

## Prerequisites

1. ✅ Tables created in Supabase (run `supabase-migration.sql`)
2. ✅ `.env.local` file configured with Supabase credentials
3. ✅ Development server running: `npm run dev`

## Testing Checklist

### 1. User Registration
**Endpoint**: `POST /api/auth/register`

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "phone": "+1234567890",
    "password": "testpassword123"
  }'
```

**Expected**: Returns 201 with user data (without password)

### 2. User Login (via NextAuth)
**Endpoint**: `POST /api/auth/signin` (handled by NextAuth)

Test via the UI at `/login` page.

### 3. Email Verification
**Endpoint**: `POST /api/auth/verify-email`

Requires authentication. Test after logging in.

### 4. ID Document Upload
**Endpoint**: `POST /api/upload/id-document`

Requires authentication. Test via `/id-verification` page.

### 5. Profile Creation
**Endpoint**: `POST /api/profile`

Requires authentication and ID verification.

```bash
curl -X POST http://localhost:3000/api/profile \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "age": 28,
    "gender": "male",
    "bio": "Looking for a life partner",
    "education": "Bachelor's Degree",
    "profession": "Software Engineer",
    "location": "New York, USA"
  }'
```

### 6. Profile Retrieval
**Endpoint**: `GET /api/profile`

Requires authentication. Should return user's profile.

### 7. Browse Profiles
**Endpoint**: `GET /api/profile/browse?gender=male&minAge=25&maxAge=35`

Requires authentication. Returns list of public profiles.

### 8. Message Request
**Endpoint**: `POST /api/messaging/request`

Requires authentication. Creates a message request.

```bash
curl -X POST http://localhost:3000/api/messaging/request \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{
    "receiverId": "USER_ID_HERE",
    "message": "Hello, I would like to connect with you"
  }'
```

### 9. Get Message Requests
**Endpoint**: `GET /api/messaging/requests?type=received`

Requires authentication. Returns pending/approved requests.

### 10. Approve Message Request
**Endpoint**: `PATCH /api/messaging/request/[requestId]`

Requires authentication. Approves a pending request.

### 11. Send Message
**Endpoint**: `POST /api/messaging/send`

Requires authentication and approved request.

```bash
curl -X POST http://localhost:3000/api/messaging/send \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{
    "receiverId": "USER_ID_HERE",
    "content": "Hello! How are you?"
  }'
```

### 12. Get Conversation
**Endpoint**: `GET /api/messaging/conversation/[userId]`

Requires authentication and approved request. Returns all messages.

## Common Issues & Fixes

### Issue: "relation does not exist"
**Fix**: Make sure you ran the migration SQL in Supabase SQL Editor

### Issue: "permission denied"
**Fix**: 
- Check RLS policies in Supabase
- For development, you can temporarily disable RLS:
  ```sql
  ALTER TABLE users DISABLE ROW LEVEL SECURITY;
  ```

### Issue: "column does not exist"
**Fix**: 
- Verify column names match (snake_case in database)
- Check the migration script was run correctly

### Issue: Authentication errors
**Fix**:
- Verify `NEXTAUTH_SECRET` is set in `.env.local`
- Check session cookies are being sent

## Testing via UI

1. **Register**: Go to `/register` and create an account
2. **Verify**: Go to `/verify` (currently auto-verifies for development)
3. **ID Upload**: Go to `/id-verification` and upload ID document
4. **Create Profile**: Go to `/profile/create` and fill out profile
5. **Browse**: Go to `/browse` to see other profiles
6. **Messaging**: Go to `/messaging` to see requests and conversations

## Database Verification

Check in Supabase Table Editor:
- ✅ `users` table has entries
- ✅ `profiles` table has entries
- ✅ `message_requests` table has entries
- ✅ `messages` table has entries

## Next Steps

After testing:
1. Fix any errors found
2. Adjust RLS policies as needed
3. Test with multiple users
4. Verify content filtering works in messages
