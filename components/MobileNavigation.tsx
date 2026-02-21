'use client'

import { useSession } from 'next-auth/react'
import { NavList } from './Navigation/NavList'

export function MobileNavigation() {
  const { data: session } = useSession()

  if (!session?.user) return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-iosGray-4 md:hidden z-50 pb-[env(safe-area-inset-bottom)]">
      <NavList variant="mobile" />
    </nav>
  )
}
