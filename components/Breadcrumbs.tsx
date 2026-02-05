'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[]
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const pathname = usePathname()

  // Auto-generate breadcrumbs from pathname if items not provided
  const breadcrumbs = items || (() => {
    const paths = pathname?.split('/').filter(Boolean) || []
    const result: BreadcrumbItem[] = [{ label: 'Home', href: '/' }]
    
    let currentPath = ''
    paths.forEach((path, index) => {
      currentPath += `/${path}`
      const label = path
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
      result.push({
        label,
        href: index === paths.length - 1 ? undefined : currentPath,
      })
    })
    
    return result
  })()

  return (
    <nav className="flex items-center space-x-2 text-ios-subhead text-iosGray-1 mb-4">
      {breadcrumbs.map((item, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && <span className="mx-2">/</span>}
          {item.href ? (
            <Link href={item.href} className="hover:text-iosBlue transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-900">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  )
}
