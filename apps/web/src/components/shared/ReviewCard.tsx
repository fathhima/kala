import { Star } from 'lucide-react'
import type { Review } from '../../types'
import { Card } from '../ui/Card'
import { Avatar } from '../ui/Avatar'
import { formatDate } from '../../lib/utils'

export function ReviewCard({ review }: { review: Review }) {
  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <Avatar name={review.studentName} size="sm" />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-stone-800">{review.studentName}</p>
            <p className="text-xs text-stone-400">{formatDate(review.createdAt)}</p>
          </div>
          <div className="flex items-center gap-0.5 mt-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={13} className={i < review.rating ? 'text-kala-amber fill-kala-amber' : 'text-stone-200 fill-stone-200'} />
            ))}
          </div>
          {review.comment && <p className="text-sm text-stone-600 mt-2 leading-relaxed">{review.comment}</p>}
        </div>
      </div>
    </Card>
  )
}
