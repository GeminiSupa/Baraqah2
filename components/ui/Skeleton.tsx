import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
}

export function Skeleton({ 
  className, 
  variant = 'rectangular',
  width,
  height 
}: SkeletonProps) {
  const baseStyles = 'animate-pulse bg-iosGray-6 dark:bg-iosGray-2'
  
  const variants = {
    text: 'rounded-ios h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-ios'
  }
  
  return (
    <div
      className={cn(baseStyles, variants[variant], className)}
      style={{ width, height }}
      aria-hidden="true"
    />
  )
}

// Profile Card Skeleton
export function ProfileCardSkeleton() {
  return (
    <div className="bg-white rounded-ios-lg shadow-ios overflow-hidden">
      <Skeleton className="aspect-square w-full" variant="rectangular" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" variant="text" />
        <Skeleton className="h-4 w-1/2" variant="text" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16" variant="rectangular" />
          <Skeleton className="h-6 w-16" variant="rectangular" />
        </div>
      </div>
    </div>
  )
}

// Message Skeleton
export function MessageSkeleton() {
  return (
    <div className="flex gap-3 p-4">
      <Skeleton className="w-10 h-10" variant="circular" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/4" variant="text" />
        <Skeleton className="h-16 w-full" variant="rectangular" />
      </div>
    </div>
  )
}
