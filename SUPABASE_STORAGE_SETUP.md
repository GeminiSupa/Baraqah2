# Supabase Storage Setup Guide

This guide will help you set up Supabase Storage for file uploads, which is required for the app to work on Vercel (serverless functions have a read-only filesystem).

## Step 1: Create Storage Bucket

1. Go to your Supabase project dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **New bucket**
4. Name it: `uploads`
5. Make it **Public** (or set up proper policies)
6. Click **Create bucket**

## Step 2: Set Up Storage Policies (Optional but Recommended)

For better security, you can set up Row Level Security (RLS) policies:

### Policy 1: Allow authenticated users to upload
```sql
CREATE POLICY "Users can upload their own files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'uploads' AND (storage.foldername(name))[1] = auth.uid()::text);
```

### Policy 2: Allow authenticated users to read their files
```sql
CREATE POLICY "Users can read their own files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'uploads' AND (storage.foldername(name))[1] = auth.uid()::text);
```

### Policy 3: Allow authenticated users to delete their own files
```sql
CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'uploads' AND (storage.foldername(name))[1] = auth.uid()::text);
```

### Policy 4: Allow public read access (for profile photos)
```sql
CREATE POLICY "Public can read photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'uploads' AND (storage.foldername(name))[1] = 'photos');
```

## Step 3: Verify Environment Variables

Make sure these are set in your Vercel environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Step 4: Test Upload

After setting up the bucket, try uploading a photo. The files will now be stored in Supabase Storage instead of the local filesystem.

## File Structure in Storage

Files are organized as follows:
- `photos/[userId]-[timestamp].[ext]` - User profile photos
- `id-documents/[userId]-[timestamp].[ext]` - ID verification documents

## Migration from Local Storage

If you have existing files in `public/uploads/`, you'll need to:
1. Upload them to Supabase Storage manually, or
2. Create a migration script to move them, or
3. Users can re-upload their photos

The app will automatically use Supabase Storage URLs for new uploads.
