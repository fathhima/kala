import { Star } from 'lucide-react'
import type { ReviewDto } from '@/api'
import { Card } from '../ui/Card'
import { Avatar } from '../ui/Avatar'
import { formatDate } from '../../lib/utils'

export type ReviewItem =
  | ReviewDto
  | {
      id: string
      rating: number
      comment?: string | null
      createdAt: string
      student?: {
        name: string
        imageUrl?: string | null
      }
      studentName?: string
    }

export function ReviewCard({ review }: { review: ReviewItem }) {
  const studentName =
    review.student?.name ?? (review as any).studentName ?? 'Anonymous Student'
  const studentImage =
    typeof review.student?.imageUrl === 'string'
      ? review.student.imageUrl
      : undefined
  const commentText =
    typeof review.comment === 'string' ? review.comment : null

  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <Avatar name={studentName} src={studentImage} size="sm" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-stone-800 truncate">{studentName}</p>
            <p className="text-xs text-stone-400 shrink-0">{formatDate(review.createdAt)}</p>
          </div>
          <div className="flex items-center gap-0.5 mt-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={13}
                className={
                  i < review.rating
                    ? 'text-kala-amber fill-kala-amber'
                    : 'text-stone-200 fill-stone-200'
                }
              />
            ))}
          </div>
          {commentText && (
            <p className="text-sm text-stone-600 mt-2 leading-relaxed break-words">
              {commentText}
            </p>
          )}
        </div>
      </div>
    </Card>
  )
}
