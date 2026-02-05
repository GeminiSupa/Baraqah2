import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if profile exists
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('user_id', session.user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profile not found. Please create your profile first.' },
        { status: 404 }
      )
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    const isPrimary = formData.get('isPrimary') === 'true'
    const privacy = formData.get('privacy') || 'private'

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type (images only)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPG, PNG, and WebP are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 5MB limit.' },
        { status: 400 }
      )
    }

    // Create upload directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'photos')
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const extension = file.name.split('.').pop()
    const filename = `${session.user.id}-${timestamp}.${extension}`
    const filepath = join(uploadDir, filename)

    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)

    // If this is primary, unset other primary photos
    if (isPrimary) {
      await supabaseAdmin
        .from('photos')
        .update({ is_primary: false })
        .eq('profile_id', profile.id)
        .eq('is_primary', true)
    }

    // Create photo record
    const photoUrl = `/uploads/photos/${filename}`
    const { data: photo, error: insertError } = await supabaseAdmin
      .from('photos')
      .insert({
        profile_id: profile.id,
        url: photoUrl,
        is_primary: isPrimary,
        privacy: privacy as string,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to upload photo' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { 
        message: 'Photo uploaded successfully', 
        photo: {
          id: photo.id,
          profileId: photo.profile_id,
          url: photo.url,
          isPrimary: photo.is_primary,
          privacy: photo.privacy,
        }
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Photo upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload photo' },
      { status: 500 }
    )
  }
}