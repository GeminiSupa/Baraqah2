import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { unlink } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

// Route segment config for App Router
export const runtime = 'nodejs'
export const maxDuration = 30

// Set photo as primary
export async function PATCH(
  req: NextRequest,
  { params }: { params: { photoId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { photoId } = params
    const body = await req.json()
    const { action } = body

    if (action === 'set-primary') {
      // Get photo to verify ownership
      const { data: photo, error: photoError } = await supabaseAdmin
        .from('photos')
        .select('id, profile_id')
        .eq('id', photoId)
        .single()

      if (photoError || !photo) {
        console.error('Photo fetch error:', photoError)
        return NextResponse.json(
          { error: 'Photo not found' },
          { status: 404 }
        )
      }

      // Verify the photo belongs to the current user by checking the profile
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('user_id')
        .eq('id', photo.profile_id)
        .single()

      if (profileError || !profile) {
        console.error('Profile fetch error:', profileError)
        return NextResponse.json(
          { error: 'Profile not found' },
          { status: 404 }
        )
      }

      if (profile.user_id !== session.user.id) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        )
      }

      // Unset all other primary photos for this profile
      await supabaseAdmin
        .from('photos')
        .update({ is_primary: false })
        .eq('profile_id', photo.profile_id)
        .eq('is_primary', true)

      // Set this photo as primary
      const { data: updatedPhoto, error: updateError } = await supabaseAdmin
        .from('photos')
        .update({ is_primary: true })
        .eq('id', photoId)
        .select()
        .single()

      if (updateError) {
        console.error('Update error:', updateError)
        return NextResponse.json(
          { error: 'Failed to set photo as primary' },
          { status: 500 }
        )
      }

      return NextResponse.json(
        { 
          message: 'Photo set as primary successfully',
          photo: {
            id: updatedPhoto.id,
            url: updatedPhoto.url,
            isPrimary: updatedPhoto.is_primary,
          }
        },
        { status: 200 }
      )
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Set primary photo error:', error)
    return NextResponse.json(
      { error: 'Failed to update photo' },
      { status: 500 }
    )
  }
}

// Delete photo
export async function DELETE(
  req: NextRequest,
  { params }: { params: { photoId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { photoId } = params

    // Get photo to verify ownership and get file path
    const { data: photo, error: photoError } = await supabaseAdmin
      .from('photos')
      .select('id, url, profile_id')
      .eq('id', photoId)
      .single()

    if (photoError || !photo) {
      console.error('Photo fetch error:', photoError)
      return NextResponse.json(
        { error: 'Photo not found' },
        { status: 404 }
      )
    }

    // Verify the photo belongs to the current user by checking the profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('user_id')
      .eq('id', photo.profile_id)
      .single()

    if (profileError || !profile) {
      console.error('Profile fetch error:', profileError)
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    if (profile.user_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Delete photo record from database
    const { error: deleteError } = await supabaseAdmin
      .from('photos')
      .delete()
      .eq('id', photoId)

    if (deleteError) {
      console.error('Delete error:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete photo' },
        { status: 500 }
      )
    }

    // Delete physical file
    try {
      const filepath = join(process.cwd(), 'public', photo.url)
      if (existsSync(filepath)) {
        await unlink(filepath)
      }
    } catch (fileError) {
      console.error('Failed to delete file:', fileError)
      // Continue even if file deletion fails (file might already be deleted)
    }

    return NextResponse.json(
      { message: 'Photo deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Delete photo error:', error)
    return NextResponse.json(
      { error: 'Failed to delete photo' },
      { status: 500 }
    )
  }
}
