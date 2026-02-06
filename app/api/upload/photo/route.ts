import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { writeFile, mkdir, unlink } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { access, constants } from 'fs/promises'

// Route segment config for App Router
export const runtime = 'nodejs'
export const maxDuration = 30

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
      console.error('No file in formData')
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // File received - log only in development
    if (process.env.NODE_ENV === 'development') {
      console.log('File received:', { name: file.name, type: file.type, size: file.size })
    }

    // Validate file type (images only) - check both MIME type and extension
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
    const fileName = file.name.toLowerCase()
    const fileExtension = fileName.split('.').pop()
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp']
    
    // Camera photos might not have correct MIME type, so check extension too
    const isValidType = allowedTypes.includes(file.type) || 
                       (fileExtension && allowedExtensions.includes(fileExtension))
    
    if (!isValidType) {
      console.error('Invalid file type:', { type: file.type, name: file.name, extension: fileExtension })
      return NextResponse.json(
        { error: `Invalid file type. Only JPG, PNG, and WebP are allowed. Detected: ${file.type || 'unknown'}` },
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

    // Check if directory is writable
    try {
      await access(uploadDir, constants.W_OK)
    } catch (error) {
      console.error('Upload directory is not writable:', uploadDir, error)
      return NextResponse.json(
        { error: 'Failed to create upload directory' },
        { status: 500 }
      )
    }

    // Generate unique filename
    const timestamp = Date.now()
    const extension = file.name.split('.').pop() || 'jpg'
    const filename = `${session.user.id}-${timestamp}.${extension}`
    const filepath = join(uploadDir, filename)

    // Save file
    try {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      await writeFile(filepath, buffer)
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Photo uploaded successfully:', filename)
      }
    } catch (writeError) {
      console.error('Failed to write file - Full error:', {
        error: writeError,
        message: writeError instanceof Error ? writeError.message : String(writeError),
        stack: writeError instanceof Error ? writeError.stack : undefined,
        filepath,
        uploadDir,
        dirExists: existsSync(uploadDir),
        fileSize: file.size,
      })
      return NextResponse.json(
        { 
          error: `Failed to save file: ${writeError instanceof Error ? writeError.message : 'Unknown error'}`,
          details: process.env.NODE_ENV === 'development' ? String(writeError) : undefined
        },
        { status: 500 }
      )
    }

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
      // Try to clean up the uploaded file if database insert fails
      try {
        if (existsSync(filepath)) {
          await unlink(filepath)
        }
      } catch (cleanupError) {
        console.error('Failed to cleanup file after insert error:', cleanupError)
      }
      return NextResponse.json(
        { 
          error: 'Failed to save photo record',
          details: process.env.NODE_ENV === 'development' ? insertError.message : undefined
        },
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
    const errorMessage = error instanceof Error ? error.message : 'Failed to upload photo'
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}