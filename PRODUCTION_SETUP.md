# Production Setup Guide - Email & SMS APIs

## Current Status

✅ **Development Mode**: Works perfectly - OTP shown in console/UI  
⚠️ **Production Mode**: Needs API keys to send real emails/SMS

## Quick Answer

**YES, you need APIs for production!** But it's easy to set up:

1. **Email**: Use **Resend** (FREE tier: 3,000 emails/month)
2. **SMS**: Use **Twilio** (FREE trial: $15.50 credit)

---

## Option 1: Email Only (Easiest - Recommended to Start)

### Step 1: Sign up for Resend (FREE)

1. Go to: https://resend.com
2. Sign up (free account)
3. Verify your email
4. Go to **API Keys** → **Create API Key**
5. Copy your API key

### Step 2: Add to `.env.local`

```env
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=onboarding@resend.dev
```

**Note**: `onboarding@resend.dev` works for testing. For production, verify your domain.

### Step 3: Install Package (Already Done)

```bash
npm install resend
```

### Step 4: Test It!

1. Restart your dev server
2. Register a new account
3. Check your email inbox - OTP should arrive!

**Cost**: FREE for 3,000 emails/month, then $0.30 per 1,000 emails

---

## Option 2: SMS Only (For Phone Verification)

### Step 1: Sign up for Twilio (FREE Trial)

1. Go to: https://www.twilio.com/try-twilio
2. Sign up (free trial with $15.50 credit)
3. Verify your phone number
4. Go to **Console** → **Get Started** → **Get a phone number**
5. Copy:
   - Account SID
   - Auth Token
   - Phone Number

### Step 2: Add to `.env.local`

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

### Step 3: Install Package (Already Done)

```bash
npm install twilio
```

### Step 4: Test It!

1. Restart your dev server
2. Register with phone number
3. Check your phone - SMS should arrive!

**Cost**: FREE trial ($15.50 credit), then ~$0.0075 per SMS

---

## Option 3: Both Email + SMS (Full Setup)

Follow both Option 1 and Option 2 above.

---

## How It Works Now

The code is **smart** - it automatically:

1. **Checks if API keys exist**
   - ✅ If keys exist → Sends real email/SMS
   - ⚠️ If no keys → Shows OTP in console/UI (development mode)

2. **No code changes needed!**
   - Just add API keys to `.env.local`
   - Restart server
   - Done!

---

## Complete `.env.local` Example

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://gnyzefdmxlrhfmbaafln.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_anon_key"
SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"

# Database
DATABASE_URL="postgresql://postgres:password@db.gnyzefdmxlrhfmbaafln.supabase.co:5432/postgres"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_secret_here"

# Email (Resend) - OPTIONAL but recommended
RESEND_API_KEY="re_your_api_key_here"
RESEND_FROM_EMAIL="onboarding@resend.dev"

# SMS (Twilio) - OPTIONAL
TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
TWILIO_AUTH_TOKEN="your_auth_token_here"
TWILIO_PHONE_NUMBER="+1234567890"

# File Upload
UPLOAD_DIR="./public/uploads"
MAX_FILE_SIZE=5242880
```

---

## Testing

### Test Email (with Resend):
1. Add `RESEND_API_KEY` to `.env.local`
2. Restart server: `npm run dev`
3. Register with email
4. Check inbox (and spam folder)
5. ✅ Should receive email with OTP

### Test SMS (with Twilio):
1. Add Twilio credentials to `.env.local`
2. Restart server: `npm run dev`
3. Register with phone number
4. Check phone
5. ✅ Should receive SMS with OTP

---

## Troubleshooting

### Email not sending?
- ✅ Check `RESEND_API_KEY` is correct
- ✅ Check email in spam folder
- ✅ Verify domain (if using custom domain)
- ✅ Check Resend dashboard for errors

### SMS not sending?
- ✅ Check Twilio credentials are correct
- ✅ Verify phone number format (+1234567890)
- ✅ Check Twilio console for errors
- ✅ Make sure trial account has credit

### Still showing in console?
- ✅ Make sure API keys are in `.env.local` (not `.env`)
- ✅ Restart dev server after adding keys
- ✅ Check server console for errors

---

## Production Deployment (Vercel)

When deploying to Vercel:

1. Go to **Vercel Dashboard** → **Your Project** → **Settings** → **Environment Variables**
2. Add all your API keys:
   - `RESEND_API_KEY`
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_PHONE_NUMBER`
   - All other `.env.local` variables
3. Redeploy

---

## Cost Summary

| Service | Free Tier | Paid |
|---------|-----------|------|
| **Resend (Email)** | 3,000/month | $0.30/1,000 |
| **Twilio (SMS)** | $15.50 trial | ~$0.0075/SMS |

**For a small matrimony site**: FREE tier should be enough to start!

---

## Next Steps

1. ✅ **Start with Email** (Resend) - easiest, free tier
2. ✅ **Add SMS later** (Twilio) - if needed
3. ✅ **Test thoroughly** before going live
4. ✅ **Monitor usage** in service dashboards

**The code is ready - just add API keys!** 🚀
