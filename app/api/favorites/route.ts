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

    // Fetch favorites
    const { data: favorites, error } = await supabaseAdmin
      .from('favorites')
      .select('id, favorite_user_id, created_at')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Favorites fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch favorites', details: error.message },
        { status: 500 }
      )
    }

    // Get unique user IDs
    const userIds = [...new Set((favorites || []).map((fav: any) => fav.favorite_user_id))]

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
        .select('id, user_id, first_name, last_name, age, gender, city')
        .in('user_id', userIds)

      if (profiles) {
        profiles.forEach((p: any) => {
          profilesMap[p.user_id] = {
            id: p.id,
            firstName: p.first_name,
            lastName: p.last_name,
            age: p.age,
            gender: p.gender,
            city: p.city,
          }
        })
      }

      // Fetch primary photos
      const profileIds = profiles?.map((p: any) => p.id) || []
      if (profileIds.length > 0) {
        const { data: photos } = await supabaseAdmin
          .from('photos')
          .select('id, profile_id, url, is_primary')
          .in('profile_id', profileIds)
          .eq('is_primary', true)

        if (photos) {
          photos.forEach((photo: any) => {
            photosMap[photo.profile_id] = photo.url
          })
        }
      }
    }

    const formattedFavorites = (favorites || []).map((fav: any) => {
      const user = usersMap[fav.favorite_user_id]
      const profile = profilesMap[fav.favorite_user_id]
      const photo = profile ? photosMap[profile.id] : null

      return {
        id: fav.id,
        userId: fav.favorite_user_id,
        createdAt: fav.created_at,
        profile: profile ? {
          id: profile.id,
          firstName: profile.firstName,
          lastName: profile.lastName,
          age: profile.age,
          gender: profile.gender,
          city: profile.city,
          photo: photo,
        } : null,
        user: user ? {
          id: user.id,
          email: user.email,
        } : null,
      }
    })

    return NextResponse.json({
      favorites: formattedFavorites,
    }, { status: 200 })
  } catch (error) {
    console.error('Favorites fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch favorites' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    if (userId === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot favorite yourself' },
        { status: 400 }
      )
    }

    // Check if already favorited
    const { data: existing } = await supabaseAdmin
      .from('favorites')
      .select('id')
      .eq('user_id', session.user.id)
      .eq('favorite_user_id', userId)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Already favorited' },
        { status: 400 }
      )
    }

    const { data: favorite, error } = await supabaseAdmin
      .from('favorites')
      .insert({
        user_id: session.user.id,
        favorite_user_id: userId,
      })
      .select()
      .single()

    if (error) {
      console.error('Favorite error:', error)
      return NextResponse.json(
        { error: 'Failed to add favorite' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Added to favorites',
      favorite,
    }, { status: 201 })
  } catch (error) {
    console.error('Favorite error:', error)
    return NextResponse.json(
      { error: 'Failed to add favorite' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const searchParams = req.nextUrl.searchParams
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    const { error } = await supabaseAdmin
      .from('favorites')
      .delete()
      .eq('user_id', session.user.id)
      .eq('favorite_user_id', userId)

    if (error) {
      console.error('Unfavorite error:', error)
      return NextResponse.json(
        { error: 'Failed to remove favorite' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Removed from favorites',
    }, { status: 200 })
  } catch (error) {
    console.error('Unfavorite error:', error)
    return NextResponse.json(
      { error: 'Failed to remove favorite' },
      { status: 500 }
    )
  }
}
