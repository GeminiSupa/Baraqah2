import { ProfileCardSkeleton } from '@/components/ui/Skeleton'

export default function FavoritesLoading() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <ProfileCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
