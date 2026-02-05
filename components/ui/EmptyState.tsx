import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Button } from './Button'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className
}: EmptyStateProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center py-12 px-4 text-center',
      className
    )}>
      {icon && (
        <div className="mb-4 text-iosGray-3">
          {icon}
        </div>
      )}
      <h3 className="text-ios-title3 font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-ios-body text-iosGray-1 max-w-md mb-6">
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  )
}

// Pre-built empty states
export function EmptyProfiles() {
  return (
    <EmptyState
      icon={
        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      }
      title="No profiles found"
      description="Try adjusting your filters or check back later for new matches."
    />
  )
}

export function EmptyMessages() {
  return (
    <EmptyState
      icon={
        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      }
      title="No messages yet"
      description="Start a conversation by sending a connection request to someone you're interested in."
      action={
        <Link href="/browse">
          <Button>Browse Profiles</Button>
        </Link>
      }
    />
  )
}

export function EmptyFavorites() {
  return (
    <EmptyState
      icon={
        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      }
      title="No favorites yet"
      description="Save profiles you're interested in by tapping the heart icon."
      action={
        <Link href="/browse">
          <Button>Browse Profiles</Button>
        </Link>
      }
    />
  )
}
