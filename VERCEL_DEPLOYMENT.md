# Vercel Deployment Guide

This guide will help you deploy the Shadi Khana Abadi platform to Vercel.

## Prerequisites

1. A Vercel account (sign up at [vercel.com](https://vercel.com))
2. A Supabase project with all migrations run
3. All environment variables ready

## Step 1: Prepare Your Repository

1. Make sure your code is pushed to GitHub, GitLab, or Bitbucket
2. Ensure all migrations are documented in SQL files
3. Test your build locally:
   ```bash
   npm run build
   ```

## Step 2: Environment Variables

Set these environment variables in Vercel:

### Required Variables

```
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=https://your-domain.vercel.app

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Database (if using direct connection)
DATABASE_URL=your-postgres-connection-string

# Email (optional - for OTP)
RESEND_API_KEY=your-resend-api-key

# SMS (optional - for phone verification)
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=your-twilio-number
```

### Setting Environment Variables in Vercel

1. Go to your project in Vercel Dashboard
2. Navigate to Settings > Environment Variables
3. Add each variable for Production, Preview, and Development
4. Click "Save"

## Step 3: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your Git repository
3. Configure the project:
   - Framework Preset: Next.js
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
4. Add all environment variables
5. Click "Deploy"

### Option B: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. For production:
   ```bash
   vercel --prod
   ```

## Step 4: Run Database Migrations

After deployment, you need to run the SQL migrations in Supabase:

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Run these migrations in order:
   - `supabase-migration-admin.sql`
   - `supabase-migration-admin-features.sql`
   - `supabase-migration-privacy-features.sql`
   - `supabase-migration-registration-fields.sql`
   - `supabase-migration-questionnaire.sql` (if not already run)

## Step 5: Configure Custom Domain (Optional)

1. In Vercel Dashboard, go to Settings > Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update `NEXTAUTH_URL` environment variable with your custom domain

## Step 6: Post-Deployment Checklist

- [ ] Verify all environment variables are set
- [ ] Run all database migrations
- [ ] Test user registration
- [ ] Test admin login
- [ ] Test profile creation
- [ ] Test ID verification
- [ ] Test messaging functionality
- [ ] Verify email/SMS services (if configured)
- [ ] Check error logs in Vercel Dashboard

## Step 7: Set Up Admin Account

1. Register a user account through the app
2. In Supabase SQL Editor, run:
   ```sql
   UPDATE users
   SET is_admin = true
   WHERE email = 'your-admin@email.com';
   ```
3. Log in with that account to access admin dashboard

## Troubleshooting

### Build Errors

- Check build logs in Vercel Dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version (should be 18.x or higher)

### Database Connection Issues

- Verify `DATABASE_URL` is correct
- Check Supabase connection settings
- Ensure IP allowlist includes Vercel IPs (if using IP restrictions)

### Authentication Issues

- Verify `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your deployment URL
- Clear browser cookies and try again

### Image Upload Issues

- Configure Supabase Storage buckets
- Set up proper CORS settings
- Verify storage policies

## Performance Optimization

1. Enable Vercel Analytics (optional)
2. Configure Image Optimization domains in `next.config.js`
3. Set up caching headers for static assets
4. Monitor performance in Vercel Dashboard

## Support

For issues or questions:
- Check Vercel documentation: [vercel.com/docs](https://vercel.com/docs)
- Check Next.js documentation: [nextjs.org/docs](https://nextjs.org/docs)
- Check Supabase documentation: [supabase.com/docs](https://supabase.com/docs)
