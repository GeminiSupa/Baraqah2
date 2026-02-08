import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

// Route segment config for App Router
export const runtime = 'nodejs'
export const maxDuration = 30

export async function POST(req: NextRequest) {
  try {
    // Verify Supabase configuration
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Supabase configuration missing')
      return NextResponse.json(
        { error: 'Server configuration error. Please contact support.' },
        { status: 500 }
      )
    }

    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await req.formData()
    const file = formData.get('file') as File

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

    // Validate file type (PDF, JPG, PNG) - check both MIME type and extension
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
    const fileName = file.name.toLowerCase()
    const fileExtension = fileName.split('.').pop()
    const allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png']
    
    // Camera photos might not have correct MIME type, so check extension too
    const isValidType = allowedTypes.includes(file.type) || 
                       (fileExtension && allowedExtensions.includes(fileExtension))
    
    if (!isValidType) {
      console.error('Invalid file type:', { type: file.type, name: file.name, extension: fileExtension })
      return NextResponse.json(
        { error: `Invalid file type. Only PDF, JPG, and PNG are allowed. Detected: ${file.type || 'unknown'}` },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 5MB limit.' },
        { status: 400 }
      )
    }

    // Generate unique filename - use extension from filename or infer from type
    const timestamp = Date.now()
    let extension = file.name.split('.').pop()?.toLowerCase()
    
    // Fallback: infer extension from MIME type if not in filename
    if (!extension || !['pdf', 'jpg', 'jpeg', 'png'].includes(extension)) {
      if (file.type === 'application/pdf') {
        extension = 'pdf'
      } else if (file.type.includes('jpeg') || file.type.includes('jpg')) {
        extension = 'jpg'
      } else if (file.type.includes('png')) {
        extension = 'png'
      } else {
        extension = 'jpg' // Default for camera photos
      }
    }
    
    const filename = `${session.user.id}-${timestamp}.${extension}`
    const filePath = `id-documents/${filename}`

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('uploads')
      .upload(filePath, buffer, {
        contentType: file.type || 'application/pdf',
        upsert: false,
      })

    if (uploadError) {
      console.error('Supabase upload error:', {
        message: uploadError.message,
        name: uploadError.name,
        filePath,
        bucket: 'uploads'
      })
      
      // Provide more specific error messages
      let errorMessage = 'Failed to upload ID document'
      if (uploadError.message?.includes('Bucket not found') || uploadError.message?.includes('not found')) {
        errorMessage = 'Storage bucket not configured. Please contact support.'
      } else if (uploadError.message?.includes('new row violates row-level security') || uploadError.message?.includes('permission')) {
        errorMessage = 'Storage permissions error. Please contact support.'
      } else if (uploadError.message) {
        errorMessage = `Upload failed: ${uploadError.message}`
      }
      
      return NextResponse.json(
        { 
          error: errorMessage,
          details: process.env.NODE_ENV === 'development' ? {
            message: uploadError.message,
            name: uploadError.name
          } : undefined
        },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('uploads')
      .getPublicUrl(filePath)

    const documentUrl = urlData.publicUrl

    if (process.env.NODE_ENV === 'development') {
      console.log('ID document uploaded successfully to Supabase:', filename)
    }
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        id_document_url: documentUrl,
        id_verified: false, // Reset until admin reviews
      })
      .eq('id', session.user.id)

    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update user record' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'ID document uploaded successfully', url: documentUrl },
      { status: 200 }
    )
  } catch (error) {
    console.error('ID document upload error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to upload ID document'
    return NextResponse.json(
      { error: errorMessage, details: error instanceof Error ? error.stack : undefined },
      { status: 500 }
    )
  }
}