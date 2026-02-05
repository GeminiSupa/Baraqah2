import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const searchParams = req.nextUrl.searchParams
    const type = searchParams.get('type') || 'received' // 'sent' or 'received'

    // Fetch message requests
    let query = supabaseAdmin
      .from('message_requests')
      .select('*')
      .order('created_at', { ascending: false })

    if (type === 'sent') {
      query = query.eq('sender_id', session.user.id)
    } else {
      query = query.eq('receiver_id', session.user.id)
    }

    const { data: requestsData, error } = await query

    if (error) {
      console.error('Fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch message requests', details: error.message },
        { status: 500 }
      )
    }

    // Get unique user IDs
    const userIds = [...new Set(
      (requestsData || []).map((req: any) => 
        type === 'sent' ? req.receiver_id : req.sender_id
      )
    )]

    let usersMap: any = {}
    let profilesMap: any = {}
    let photosMap: any = {}

    if (userIds.length > 0) {
      // Fetch users
      const { data: users } = await supabaseAdmin
        .from('users')
        .select('id, email')
        .in('id', userIds)

      if (users) {
        users.forEach((u: any) => {
          usersMap[u.id] = { id: u.id, email: u.email }
        })
      }

      // Fetch profiles
      const { data: profiles } = await supabaseAdmin
        .from('profiles')
        .select('id, user_id, first_name, last_name')
        .in('user_id', userIds)

      if (profiles) {
        profiles.forEach((p: any) => {
          profilesMap[p.user_id] = {
            id: p.id,
            firstName: p.first_name,
            lastName: p.last_name,
          }
        })
      }

      // Fetch photos
      const profileIds = profiles?.map((p: any) => p.id) || []
      if (profileIds.length > 0) {
        const { data: photos } = await supabaseAdmin
          .from('photos')
          .select('id, profile_id, url, is_primary')
          .in('profile_id', profileIds)
          .eq('is_primary', true)

        if (photos) {
          photos.forEach((photo: any) => {
            if (!photosMap[photo.profile_id]) {
              photosMap[photo.profile_id] = []
            }
            photosMap[photo.profile_id].push({
              url: photo.url,
              isPrimary: photo.is_primary,
            })
          })
        }
      }
    }

    // Format requests
    const requests = (requestsData || []).map((req: any) => {
      const userId = type === 'sent' ? req.receiver_id : req.sender_id
      const user = usersMap[userId]
      const profileId = profilesMap[userId]?.id
      const profile = profilesMap[userId]
      const photos = profileId ? (photosMap[profileId] || []) : []
      
      return {
        id: req.id,
        status: req.status,
        connectionStatus: req.connection_status || 'pending',
        message: req.message,
        createdAt: req.created_at,
        [type === 'sent' ? 'receiver' : 'sender']: {
          id: user?.id || '',
          email: user?.email || '',
          profile: profile ? {
            firstName: profile.firstName,
            lastName: profile.lastName,
            photos: photos,
          } : null,
        },
      }
    })

    return NextResponse.json({ requests }, { status: 200 })
  } catch (error) {
    console.error('Fetch requests error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch message requests' },
      { status: 500 }
    )
  }
}