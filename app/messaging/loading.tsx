import { MessageSkeleton } from '@/components/ui/Skeleton'

export default function MessagingLoading() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <MessageSkeleton key={i} />
      ))}
    </div>
  )
}
