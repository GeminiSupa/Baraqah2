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

    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
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

    // Create upload directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'id-documents')
    try {
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true })
      }
    } catch (dirError) {
      console.error('Failed to create upload directory:', dirError)
      return NextResponse.json(
        { error: 'Failed to create upload directory. Please contact support.' },
        { status: 500 }
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
    const filepath = join(uploadDir, filename)

    // Save file
    try {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      await writeFile(filepath, buffer)
      console.log('File saved successfully:', filepath)
    } catch (writeError) {
      console.error('Failed to write file:', writeError)
      return NextResponse.json(
        { error: 'Failed to save file. Please try again or contact support.' },
        { status: 500 }
      )
    }

    // Update user record with document URL
    const documentUrl = `/uploads/id-documents/${filename}`
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