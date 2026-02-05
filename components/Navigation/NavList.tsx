'use client'

import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { getVisibleNavItems } from '@/lib/navigation-config'
import { cn } from '@/lib/utils'

interface NavListProps {
  variant?: 'horizontal' | 'mobile'
  className?: string
}

export function NavList({ variant = 'horizontal', className }: NavListProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const userRole = session?.user?.isAdmin ? 'admin' : 'user'
  const visibleItems = getVisibleNavItems(userRole)
  
  if (variant === 'mobile') {
    return (
      <nav className={cn('flex justify-around', className)}>
        {visibleItems.map(item => {
          const isActive = pathname?.startsWith(item.href)
          const Icon = item.icon
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-16 ios-press',
                isActive ? 'text-iosBlue' : 'text-iosGray-1'
              )}
            >
              <Icon className="w-6 h-6 mb-1" />
              <span className="text-ios-caption1">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    )
  }
  
  return (
    <nav className={cn('flex items-center space-x-2 md:space-x-8', className)}>
      {visibleItems.map(item => {
        const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'inline-flex items-center px-1 pt-1 border-b-2 text-ios-body font-medium transition-colors',
              isActive
                ? 'border-iosBlue text-gray-900'
                : 'border-transparent text-iosGray-1 hover:text-gray-700 hover:border-iosGray-3'
            )}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
