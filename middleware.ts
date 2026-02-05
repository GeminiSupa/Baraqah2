import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default withAuth(
  function middleware(req: NextRequest) {
    // Handle /en/* locale prefix - redirect to base route
    if (req.nextUrl.pathname.startsWith('/en/')) {
      let pathWithoutLocale = req.nextUrl.pathname.replace(/^\/en/, '')
      
      // Redirect /en/settings/profile to /profile (since /settings/profile doesn't exist)
      if (pathWithoutLocale === '/settings/profile') {
        pathWithoutLocale = '/profile'
      }
      
      return NextResponse.redirect(new URL(pathWithoutLocale + req.nextUrl.search, req.url))
    }
    return NextResponse.next()
  },
  {
    pages: {
      signIn: '/login',
    },
  }
)

export const config = {
  matcher: ['/profile/:path*', '/messaging/:path*', '/browse/:path*', '/admin/:path*', '/en/:path*', '/settings/:path*'],
}