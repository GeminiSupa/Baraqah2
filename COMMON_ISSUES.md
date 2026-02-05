# Common Issues & Solutions

## Browser Console Errors (Can Ignore)

These errors are from browser extensions and don't affect your app:
- `serviceWorker.js` errors - from browser extensions
- `background.js` errors - from browser extensions  
- `content.js` errors - from browser extensions
- Content Security Policy font errors - from browser extensions
- `checkoutUrls` errors - from shopping extensions

**You can safely ignore these.** They're not from your application.

## Real Application Errors

### 500 Error on `/api/auth/register`

**Symptom**: Registration fails with 500 Internal Server Error

**Most Common Cause**: Database tables not created yet

**Solution**:
1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/gnyzefdmxlrhfmbaafln
2. Click **SQL Editor** → **New Query**
3. Copy ALL content from `supabase-migration-simple.sql`
4. Paste and click **Run**
5. Verify tables created in **Table Editor**
6. Restart dev server: `npm run dev`

**Check if tables exist**:
- Open Supabase Dashboard → Table Editor
- Should see: users, profiles, photos, messages, message_requests, accounts, sessions, verification_tokens

### "relation does not exist" Error

**Cause**: Tables haven't been created in Supabase

**Fix**: Run the SQL migration (see above)

### "supabaseUrl is required" Error

**Cause**: `.env.local` file missing or not loaded

**Fix**:
1. Make sure `.env.local` exists in project root
2. Contains `NEXT_PUBLIC_SUPABASE_URL="https://gnyzefdmxlrhfmbaafln.supabase.co"`
3. Restart dev server after creating/updating `.env.local`

### Connection Timeout / Database Errors

**Cause**: Database password not set or incorrect

**Fix**:
1. Edit `.env.local`
2. Replace `[YOUR-DATABASE-PASSWORD]` with actual password
3. Get password from: Supabase Dashboard → Settings → Database
4. Restart dev server

### Next.js Hydration Warning

**Warning**: `Prop 'lang' did not match. Server: "en-DE" Client: "en"`

**Cause**: Browser language settings vs server defaults

**Fix**: This is just a warning, can be ignored. Or set explicit `lang="en"` in `app/layout.tsx`

## How to Check What's Wrong

1. **Check server terminal** - Look for error messages there
2. **Check browser Network tab** - See actual API error responses
3. **Check Supabase Dashboard** - Verify tables exist
4. **Check `.env.local`** - Make sure all variables are set

## Still Having Issues?

1. Restart dev server: `npm run dev`
2. Clear browser cache / try incognito mode
3. Check terminal for detailed error messages
4. Verify `.env.local` file exists and has correct values
