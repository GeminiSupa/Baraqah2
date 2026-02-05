import { ProfileCardSkeleton } from '@/components/ui/Skeleton'

export default function BrowseLoading() {
  return (
    <div className="container mx-auto px-4 py-6">
      {/* Filter Skeleton */}
      <div className="mb-6 flex gap-4">
        <div className="h-10 w-32 bg-iosGray-6 rounded-ios animate-pulse" />
        <div className="h-10 w-32 bg-iosGray-6 rounded-ios animate-pulse" />
      </div>
      
      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProfileCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
